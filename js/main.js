/* Jeu : monde 3D, interface, quêtes, voix. Les données sont dans js/data/. */

(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const rich=s=>esc(s).replace(/\*(.+?)\*/g,'<b>$1</b>');

/* ================= CONTENU DES LANGUES ================= */
const GROUPS=LCA.GROUPS,NUMFR=LCA.NUMFR,PK=LCA.PK,PKFR=LCA.PKFR,LANGS=LCA.langs;
Object.values(LANGS).forEach(L=>{L.W=L.words.map(a=>({g:a[0],wo:a[1],fr:a[2],k:a[3]}));
 if(!L.color)L.color=LCA.regionColors[L.region]||'#f59a2e';
 L.partial=L.W.length<30||!L.tales.length||!L.recipes.length;
 if(!L.names.hist)L.names.hist='Le gardien de la mémoire';if(!L.greet.hist)L.greet.hist=L.hello||''});
const REGION_BY_ID={};LCA.regions.forEach(r=>{REGION_BY_ID[r.id]=r});
const regionOf=L=>REGION_BY_ID[L.region]||LCA.regions[0];

/* ================= ÉTAT ================= */
const KEY='lca-v2';
const state=LCA.store.defaults();
/* Comptes locaux : « stor() » renvoie le stockage du profil actif (invité = clé historique lca-v2). */
let ACC=null;try{ACC=LCA.accounts.create({storage:localStorage})}catch(e){ACC=null}
const stor=()=>ACC?ACC.storage():localStorage;
function load(){try{Object.assign(state,LCA.store.load(stor()))}catch(e){}}
function save(){LCA.store.save(stor(),state)}
const heroName=()=>LCA.store.cleanName(state.name);
const who=()=>{const n=heroName();return n||'toi'}
const lang=()=>LANGS[state.lang||'wolof'];
function D(id0){const id=id0||state.lang||'wolof';if(!state.d[id])state.d[id]={done:{},flags:{},learned:{},items:{sac:1},got:{},picked:{},best:0};return state.d[id]}
const learnedCount=()=>Object.keys(D().learned).length;
let toastT=0;
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3000)}
const ITEMS={sac:['Sac à dos','Ton carnet de voyage','S'],memoire:['Mémoire de la langue','Histoire et personnalité honorée','M'],recette:['Recette du repas','Notée chez la cuisinière','R'],conte:['Conte écouté','Une histoire de chez nous','C'],rythme:['Rythme du tambour','Appris du musicien','T'],riviere:['Vue sur le fleuve','Contemplée depuis le ponton','F'],diplome:['Diplôme du village','Toutes les quêtes terminées','D']};
function give(id){const d=D();if(!d.items[id]){d.items[id]=1;save();toast('Ajouté à l’inventaire : '+ITEMS[id][0])}}
function flag(k){const d=D();if(!d.flags[k]){d.flags[k]=1;save();check()}}
function learn(i){const d=D();if(!d.learned[i]){d.learned[i]=1;save();check()}}

/* ================= QUÊTES ================= */
const gotTypes=()=>PK.filter(k=>D().got[k]>0).length;
const wordOf=k=>lang().W.find(w=>w.k===k)||{wo:'—',fr:PKFR[k]||k,k:k,miss:1};
const frWord=re=>lang().W.findIndex(w=>re.test(w.fr));
function questList(L,d){
 const n=L.names,W=L.W.length,ln=Math.min(8,W),qn=Math.min(6,W),qt=Math.max(1,Math.round(qn*2/3)),out=[];
 out.push({id:'q1',t:'Salue '+n.awa,ds:'Va dire bonjour à '+n.awa+', près de la Maison des contes.',cond:()=>d.flags.talkAwa,tg:()=>npcPos('awa')});
 out.push({id:'q2',t:'Rassemble 4 ingrédients',ds:'Ramasse un poisson, du riz, de l’eau et de la viande. Quand le mot existe dans le vocabulaire de '+L.name+', tu l’apprends en le ramassant.',cond:()=>gotTypes()>=4,tg:()=>pickTarget(),pr:()=>gotTypes()+' sur 4'});
 out.push({id:'q3',t:'Apporte-les à '+n.fatou,ds:'Rends-toi à l’étal de '+n.fatou+' pour préparer le repas ensemble.',cond:()=>d.flags.delivered,tg:()=>npcPos('fatou')});
 if(W>0)out.push({id:'q4',t:'Apprends '+ln+' mot'+(ln>1?'s':''),ds:'Retourne les cartes de l’onglet Apprendre, ou ramasse des objets. '+n.ibou+' t’aide.',cond:()=>learnedCount()>=ln,tg:()=>npcPos('ibou'),pr:()=>Math.min(ln,learnedCount())+' sur '+ln});
 if(L.tales.length)out.push({id:'q5',t:L.tales[0].kind==='proverbes'?'Lis les proverbes':'Écoute un conte',ds:'Ouvre l’onglet Contes, lis ou écoute, puis touche le bouton de fin.',cond:()=>d.flags.tale,tg:()=>npcPos('awa')});
 out.push({id:'q6',t:'Joue le rythme du '+L.drum.name,ds:'Va voir '+n.drum+', ouvre Traditions et touche « Jouer le rythme ».',cond:()=>d.flags.drum,tg:()=>npcPos('drum')});
 if(W>=4)out.push({id:'q7',t:'Réussis le quiz',ds:'Termine une leçon à l’école avec au moins '+qt+' bonnes réponses sur '+qn+' (en proportion).',cond:()=>d.best>=qt,tg:()=>npcPos('ibou'),pr:()=>'meilleur score '+d.best+' sur '+qn});
 if(W>=4)out.push({id:'q10',t:'Enchaîne 5 bonnes réponses',ds:'Utilise les mots appris : réponds juste à 5 questions d’affilée dans une leçon avec '+n.ibou+'.',cond:()=>(state.learn&&state.learn.stats&&state.learn.stats.bestStreak>=5),tg:()=>npcPos('ibou'),pr:()=>'meilleure série : '+Math.min(5,(state.learn&&state.learn.stats&&state.learn.stats.bestStreak)||0)+' sur 5'});
 if(W>=4)out.push({id:'q11',t:'Deviens Explorateur',ds:'Gagne 100 XP en répondant aux leçons de l’école.',cond:()=>(state.learn&&state.learn.xp>=100),tg:()=>npcPos('ibou'),pr:()=>Math.min(100,(state.learn&&state.learn.xp)||0)+' XP sur 100'});
 out.push({id:'q8',t:'Contemple le fleuve',ds:'Marche jusqu’au ponton, au nord du village.',cond:()=>d.flags.river,tg:()=>({x:0,z:-55})});
 if(L.history.length||L.figure)out.push({id:'q9',t:'Écoute '+n.hist,ds:'Va voir '+n.hist+', au nord du village, près du chemin du fleuve. Il raconte l’histoire de la langue et d’une personnalité honorée.',cond:()=>d.flags.histDone,tg:()=>npcPos('hist')});
 return out}
const quests=()=>questList(lang(),D());
const questCount=L=>questList(L,{done:{},flags:{},learned:{},got:{},best:0}).length;
const curQuest=()=>quests().find(q=>!D().done[q.id]);
function check(){
 const d=D();let guard=0;
 for(;;){const q=curQuest();if(!q||guard++>12)break;if(q.cond()){d.done[q.id]=1;save();toast('Quête terminée : '+q.t)}else break}
 if(!curQuest()&&!d.flags.finished){d.flags.finished=1;give('diplome');save();setTimeout(openFinale,900)}
 renderTracker();if(tab==='quetes'||tab==='inventaire')renderPanel();
}
let curTarget=null;
function renderTracker(){
 const qs=quests(),d=D(),done=qs.filter(q=>d.done[q.id]).length,q=curQuest();
 $('#qbar').style.width=(done/qs.length*100)+'%';
 if(q){$('#qnum').textContent='Quête '+(done+1)+' sur '+qs.length;$('#qtitle').textContent=q.t;curTarget=q.tg}
 else{$('#qnum').textContent='Bravo !';$('#qtitle').textContent='Toutes les quêtes sont terminées';curTarget=null}
}
$('#quest').onclick=()=>openPanel('quetes');

/* ================= PANNEAUX ================= */
const TABS=[['perso','Personnage'],['quetes','Quêtes'],['inventaire','Inventaire'],['contes','Contes'],['recettes','Recettes'],['traditions','Traditions'],['apprentissage','Apprendre']];
let tab=null,servings=6,learnMode='cartes',quiz=null,speaking=false,taleIdx=0,recIdx=0,confirmReset=false;
const panel=$('#panel'),pbody=$('#panelBody');
const fmtQty=n=>String(n>=100?Math.round(n/10)*10:Math.round(n*2)/2).replace('.',',');

function tQuetes(){
 const qs=quests(),d=D(),done=qs.filter(q=>d.done[q.id]).length,cur=curQuest(),L=lang();
 let h='<h2>Tes quêtes en '+esc(L.name)+'</h2><p class="sub">'+done+' sur '+qs.length+' terminées. Suis la flèche orange en haut à gauche pour trouver où aller.</p><div class="bar"><i style="width:'+(done/qs.length*100)+'%"></i></div><ul class="ql">';
 qs.forEach((q,i)=>{const isDone=d.done[q.id],isCur=cur&&cur.id===q.id;
  h+='<li class="'+(isDone?'done':isCur?'cur':'lock')+'"><span class="ck">'+(isDone?'✓':(i+1))+'</span><div><b>'+esc(q.t)+'</b>'+(isCur||isDone?'<p>'+esc(q.ds)+'</p>':'')+(isCur&&q.pr?'<p><b style="color:var(--accent);display:inline">'+esc(q.pr())+'</b></p>':'')+
  (isCur&&q.id==='q2'?'<div class="chips">'+PK.map(k=>{const w=wordOf(k);return '<span class="chip'+(d.got[k]?' have':'')+'"><b>'+esc(w.wo)+'</b> '+esc(w.fr)+'</span>'}).join('')+'</div>':'')+'</div></li>'});
 h+='</ul>';
 if(!cur)h+='<div class="dip"><b>Diplôme du village</b><span>Tu as parcouru le village en '+esc(L.name)+'. Essaie maintenant une autre langue avec le bouton en haut à droite.</span></div>';
 h+='<p class="note">Orthographe et traductions à faire relire par un locuteur natif avant toute diffusion.</p><div class="row"><button class="btn ghost sm" data-act="reset">'+(confirmReset?'Confirmer : tout effacer pour '+esc(L.name):'Recommencer cette langue')+'</button></div>';
 return h}
function tInventaire(){
 const d=D(),n=learnedCount(),tot=lang().W.length,totd=tot||1;
 let h='<h2>Ton inventaire</h2><p class="sub">Ce que tu as trouvé et appris en '+esc(lang().name)+'.</p><div class="slots">';
 Object.keys(ITEMS).forEach(k=>{const has=d.items[k],it=ITEMS[k];h+='<div class="slot'+(has?'':' lock')+'"><div class="ic">'+(has?it[2]:'?')+'</div><b>'+(has?esc(it[0]):'À découvrir')+'</b><span>'+(has?esc(it[1]):'Verrouillé')+'</span></div>'});
 h+='</div><h3>Ingrédients</h3><div class="chips">'+PK.map(k=>{const w=wordOf(k);return '<span class="chip'+(d.got[k]?' have':'')+'"><b>'+esc(w.wo)+'</b> '+esc(w.fr)+(d.got[k]>1?' ×'+d.got[k]:'')+'</span>'}).join('')+'</div>';
 h+='<h3>Carnet de mots</h3><p class="sub">'+n+' mot'+(n>1?'s':'')+' appris sur '+tot+'</p><div class="bar"><i style="width:'+Math.round(n/totd*100)+'%"></i></div><button class="btn warm sm" data-go="apprentissage">Continuer d’apprendre</button>';
 return h}
const todo=(t,w)=>'<h2>'+t+'</h2><span class="vr st-prep">Contenu à compléter</span><p class="sub">'+w+' Rien n’a été inventé pour combler ce vide : ce contenu attend un locuteur ou une source fiable.</p><p class="note">Pour contribuer, voir docs/AJOUTER_UNE_LANGUE.md dans le projet.</p>';
function tContes(){
 if(!lang().tales.length)return todo('Contes et proverbes','Aucun conte ni proverbe n’est documenté pour '+esc(lang().name)+'.');
 const L=lang(),T=L.tales[taleIdx%L.tales.length];
 let h='<div class="seg">'+L.tales.map((t,i)=>'<button data-tale="'+i+'" aria-pressed="'+(i===taleIdx)+'">Conte '+(i+1)+'</button>').join('')+'</div>';
 h+='<div class="tale"><h2>'+esc(T.title)+'</h2>'+'<span class="vr">Validation requise</span>'+'<div class="chips">'+(T.vocab||[]).map(v=>'<span class="chip"><b>'+esc(v[0])+'</b> '+esc(v[1])+'</span>').join('')+'</div>';
 h+='<div class="row" style="margin-bottom:12px"><button class="btn warm sm" id="speakBtn">'+(speaking?'Arrêter la lecture':'Écouter le conte')+'</button></div>';
 T.paras.forEach(p=>{h+='<p>'+rich(p)+'</p>'});
 h+=(T.moral?'<div class="moral"><b>Ce que dit le conte.</b> '+esc(T.moral)+'</div>':'')+'<div class="row"><button class="btn sm '+(D().flags.tale?'ghost':'warm')+'" data-act="tale">'+(D().flags.tale?'Conte déjà terminé':'J’ai terminé ce conte')+'</button></div></div>';
 h+='<p class="note">La lecture vocale se fait en français : aucune voix '+esc(L.name)+' n’est disponible dans le navigateur. Contes écrits pour ce prototype, sans source documentée : contenu à faire valider avant publication.</p>';
 return h}
function tRecettes(){
 if(!lang().recipes.length)return todo('Recettes','Aucune recette n’est documentée pour '+esc(lang().name)+'.');
 const L=lang(),R=L.recipes[recIdx%L.recipes.length],k=servings/R.base;
 let h='<div class="seg">'+L.recipes.map((r,i)=>'<button data-rec="'+i+'" aria-pressed="'+(i===recIdx)+'">'+esc(r.name)+'</button>').join('')+'</div>';
 h+='<h2>'+esc(R.name)+'</h2>'+'<span class="vr">Validation requise</span>'+'<p class="sub">'+esc(R.intro)+'</p><div class="serv"><span>Pour</span><button data-sv="-1" aria-label="Moins de parts">−</button><output>'+servings+'</output><button data-sv="1" aria-label="Plus de parts">+</button><span>personnes</span></div><h3>Ingrédients</h3><ul class="ing">';
 R.ing.forEach(g=>{h+='<li><span>'+esc(g[0])+(g[3]?'<em>'+esc(g[3])+'</em>':'')+'</span><span>'+esc(fmtQty(g[1]*k)+(g[2]?' '+g[2]:''))+'</span></li>'});
 h+='</ul><h3>Préparation</h3><ol class="steps">'+R.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>';
 h+='<p class="note">Les mots en orange sont à retenir en '+esc(L.name)+'. Recette courante non sourcée, quantités indicatives : contenu à faire valider.</p>';
 return h}
let PAT='B.S.BSS.';
function tTraditions(){
 const L=lang();PAT=L.drum.pat;
 let h='<h2>Traditions</h2>'+'<span class="vr">Validation requise</span>'+'<p class="sub">Ce que les gens du village te diraient en premier.</p>';
 if(L.history.length||L.figure){h+='<h3>Histoire de la langue</h3>'+STYLIZED('histoire')+L.history.map(x=>'<p>'+esc(x)+'</p>').join('');if(L.figure){const f=L.figure;h+='<div class="tcard"><b>'+esc(f.name)+'<em>'+esc(f.years+' · '+f.role)+'</em></b><p>'+esc(f.bio)+'</p></div>'}h+='<p class="note">Textes de synthèse rédigés pour ce prototype, sans source citée : à vérifier avant diffusion.</p>'}
 if(!L.trad.length)h+=todo('Traditions','Aucune tradition documentée.');
 L.trad.forEach(t=>{h+='<div class="tcard"><b>'+esc(t[0])+'<em>'+esc(t[1])+'</em></b><p>'+esc(t[2])+'</p></div>'});
 h+='<h3>Le rythme du '+esc(L.drum.name)+'</h3><p class="sub">Les ronds bordés de bleu sont les frappes graves, les autres des frappes claires.</p><div class="dots">';
 for(let i=0;i<8;i++)h+='<span class="dot'+(PAT[i]==='B'?' b':'')+'"'+(PAT[i]==='.'?' style="opacity:.3"':'')+'></span>';
 h+='</div><button class="btn warm sm" id="drumBtn">'+(drumTimer?'Arrêter':'Jouer le rythme')+'</button><p class="note">Rythme d’exemple, simplifié pour ce prototype. Il ne remplace pas un vrai musicien.</p>';
 return h}
function tApprendre(){
 const W=lang().W;
 if(!W.length)return todo('Apprendre : '+esc(lang().name),'Aucun mot n’est documenté pour cette langue.');
 let h='<h2>Apprendre le '+esc(lang().name)+'</h2>'+'<span class="vr">'+(lang().rv&&lang().rv.reviewed?'Relecture : '+lang().rv.reviewed+'/'+lang().rv.total+' mots':'À vérifier : brouillon')+'</span>'+'<p class="sub">'+learnedCount()+' mot(s) appris sur '+W.length+'</p><div class="seg"><button data-mode="cartes" aria-pressed="'+(learnMode==='cartes')+'">Cartes</button>'+(W.length>=4?'<button data-mode="quiz" aria-pressed="'+(learnMode==='quiz')+'">Quiz</button>':'')+'</div>';
 if(learnMode==='cartes'){
  h+='<p class="sub">Touche une carte pour voir la traduction.</p>';
  Object.keys(GROUPS).forEach(g=>{h+='<h3>'+GROUPS[g]+'</h3><div class="wgrid">';
   W.forEach((w,i)=>{if(w.g===g)h+='<div class="wc"><button class="wcard'+(D().learned[i]?' got rev':'')+'" data-w="'+i+'"><span class="w">'+esc(w.wo)+'</span><span class="f">'+esc(w.fr)+'</span></button><button class="spk" data-say="'+i+'" aria-label="Écouter '+esc(w.wo)+'">'+SPK_SVG+'</button></div>'});h+='</div>'});
 }else h+=tQuiz();
 return h}
function newQuiz(){
 const W=lang().W,idx=shuffle(W.map((_,i)=>i)).slice(0,Math.min(6,W.length));
 quiz={i:0,score:0,picked:null,qs:idx.map(i=>{
  const same=shuffle(W.map((_,k)=>k).filter(k=>k!==i&&W[k].g===W[i].g)),rest=shuffle(W.map((_,k)=>k).filter(k=>k!==i&&W[k].g!==W[i].g));
  return {i,toFr:Math.random()<.5,opts:shuffle([i].concat(same.concat(rest).slice(0,3)))}})};
}
function tQuiz(){
 const p=state.learn,lv=LCA.progress.levelFor(p.xp),nrev=Object.keys(p.review).length;
 return '<div class="lcta"><div class="lvh"><b>'+esc(lv.level.name)+'</b><span>'+p.xp+' XP</span></div><div class="bar"><i style="width:'+lv.pct+'%"></i></div>'+
  '<p class="sub">Les leçons et quiz se passent à l’école du village avec '+esc(lang().names.ibou)+', ou directement ici.</p>'+
  '<div class="row"><button class="btn warm" data-act="lessons">Commencer une leçon</button><button class="btn ghost" data-act="dash">Mon parcours</button>'+(nrev?'<button class="btn ghost" data-act="lessons">Réviser ('+nrev+')</button>':'')+'</div></div>'}
function quizSay(){}
function renderPanel(){
 const keep=pbody.scrollTop;panel.classList.toggle('half',tab==='perso');
 $('#tabs').innerHTML=TABS.map(t=>'<button role="tab" data-tab="'+t[0]+'" aria-selected="'+(t[0]===tab)+'">'+t[1]+'</button>').join('');
 pbody.innerHTML=({perso:tPerso,quetes:tQuetes,inventaire:tInventaire,contes:tContes,recettes:tRecettes,traditions:tTraditions,apprentissage:tApprendre})[tab]();
 pbody.scrollTop=keep;
}
function markDock(){$$('#dock button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)))}
function openPanel(t){closeDialog();if(tab!==t){stopAudio();pbody.scrollTop=0}tab=t;panel.hidden=false;renderPanel();markDock();hideHint()}
function closePanel(){tab=null;panel.hidden=true;stopAudio();markDock();confirmReset=false}
$('#closeP').onclick=closePanel;
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)openPanel(b.dataset.tab)});
$('#dock').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;if(tab===b.dataset.tab)closePanel();else openPanel(b.dataset.tab)});

/* audio */
let actx=null,drumTimer=null,step=0,noiseBuf=null;
const ac=()=>{if(!actx){const A=window.AudioContext||window.webkitAudioContext;actx=new A()}if(actx.state==='suspended')actx.resume();return actx};
function bass(a,t){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(60,t+.3);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.38);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.4)}
function slap(a,t){if(!noiseBuf){noiseBuf=a.createBuffer(1,Math.floor(a.sampleRate*.1),a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)}
 const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;f.type='highpass';f.frequency.value=1800;g.gain.value=.55;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}
function drumTick(){const a=ac(),t=a.currentTime+.02,k=PAT[step%8];if(k==='B')bass(a,t);else if(k==='S')slap(a,t);$$('.dot').forEach((d,i)=>d.classList.toggle('on',i===step%8));step++;if(step>=32)stopDrum()}
function startDrum(){PAT=lang().drum.pat;if(state.settings&&!state.settings.sound){toast('Le son est désactivé dans les paramètres');return}try{step=0;drumTick();drumTimer=setInterval(drumTick,170);flag('drum');give('rythme')}catch(e){drumTimer=null;toast('Le son n’est pas disponible ici')}const b=$('#drumBtn');if(b)b.textContent=drumTimer?'Arrêter':'Jouer le rythme'}
function stopDrum(){if(drumTimer){clearInterval(drumTimer);drumTimer=null}$$('.dot').forEach(d=>d.classList.remove('on'));const b=$('#drumBtn');if(b)b.textContent='Jouer le rythme'}
function speak(){try{const s=window.speechSynthesis;if(!s)throw 0;s.cancel();const L=lang(),T=L.tales[taleIdx%L.tales.length];const u=new SpeechSynthesisUtterance(T.title+'. '+T.paras.join(' ').replace(/\*/g,'')+' '+(T.moral||''));u.lang='fr-FR';u.rate=.95;u.onend=()=>{speaking=false;if(tab==='contes'){renderPanel()}};s.speak(u);speaking=true}catch(e){toast('La lecture vocale n’est pas disponible ici')}}
function stopAudio(){stopDrum();try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}speaking=false}

pbody.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='heroName'){e.preventDefault();setName(e.target.value,'#nameMsg')}});
pbody.addEventListener('change',e=>{if(e.target.id==='heroName')setName(e.target.value,'#nameMsg')});
pbody.addEventListener('click',e=>{
 const t=e.target;
 let b;
 if((b=t.closest('[data-av]'))){const kv=b.dataset.av.split(':');setAv(kv[0],kv[1]);return}
 if((b=t.closest('[data-go]'))){openPanel(b.dataset.go);return}
 if(t.closest('#speakBtn')){if(speaking)stopAudio();else speak();renderPanel();return}
 if(t.closest('#drumBtn')){if(drumTimer)stopDrum();else startDrum();return}
 if((b=t.closest('[data-sv]'))){servings=Math.max(2,Math.min(12,servings+(+b.dataset.sv)));renderPanel();return}
 if((b=t.closest('[data-tale]'))){taleIdx=+b.dataset.tale;stopAudio();renderPanel();pbody.scrollTop=0;return}
 if((b=t.closest('[data-rec]'))){recIdx=+b.dataset.rec;renderPanel();pbody.scrollTop=0;return}
 if((b=t.closest('[data-mode]'))){learnMode=b.dataset.mode;if(learnMode==='quiz')newQuiz();renderPanel();pbody.scrollTop=0;if(learnMode==='quiz')quizSay();return}
 if((b=t.closest('[data-say]'))){say(lang().W[+b.dataset.say].wo);return}
 if((b=t.closest('[data-sayq]'))){say(lang().W[+b.dataset.sayq].wo);return}
 if((b=t.closest('[data-w]'))){const i=+b.dataset.w;say(lang().W[i].wo);b.classList.add('rev','got');if(!D().learned[i]){D().learned[i]=1;save();check();const s=$('.sub',pbody);if(s&&tab==='apprentissage')s.textContent=learnedCount()+' mot(s) appris sur '+lang().W.length}return}
 if(false&&(b=t.closest('[data-opt]'))&&quiz&&quiz.picked===null){const o=+b.dataset.opt,q=quiz.qs[quiz.i];quiz.picked=o;if(o===q.i){quiz.score++;D().learned[q.i]=1}save();renderPanel();return}
 if((b=t.closest('[data-act]'))){const a=b.dataset.act;
  if(a==='closeperso'){closePanel();return}
  if(a==='savename'){const i=$('#heroName');setName(i?i.value:'','#nameMsg');return}
  if(a==='lessons'){closePanel();LCA.learn.openHub();return}
  if(a==='dash'){closePanel();LCA.learn.openDash();return}
  if(a==='next'){quiz.i++;quiz.picked=null;if(quiz.i>=quiz.qs.length){const d=D();d.best=Math.max(d.best,quiz.score);save();check()}renderPanel();pbody.scrollTop=0;quizSay()}
  else if(a==='restart'){newQuiz();renderPanel();quizSay()}
  else if(a==='tale'){flag('tale');give('conte');renderPanel()}
  else if(a==='reset'){if(!confirmReset){confirmReset=true;renderPanel()}else{delete state.d[state.lang];confirmReset=false;save();quiz=null;if(R&&R.syncPickups)R.syncPickups();check();toast('Progression effacée pour '+lang().name)}}}
});


/* ================= PERSONNAGE ================= */
const AV_SKIN=[['#f1d3b5',0xf1d3b5],['#d9a77a',0xd9a77a],['#b9774a',0xb9774a],['#8a5532',0x8a5532],['#6b4430',0x6b4430],['#4a2f22',0x4a2f22],['#2f1d15',0x2f1d15]];
const AV_HAIRC=[['#111111',0x111111],['#3a2414',0x3a2414],['#7a4a22',0x7a4a22],['#9a9a9a',0x9a9a9a],['#b5331f',0xb5331f]];
const AV_COL=[['#e8a317',0xe8a317],['#d4513b',0xd4513b],['#2f9e8f',0x2f9e8f],['#3b8bd9',0x3b8bd9],['#f4efe4',0xf4efe4],['#7a2e65',0x7a2e65],['#39506b',0x39506b],['#232f47',0x232f47],['#2e8b4a',0x2e8b4a],['#111111',0x111111]];
const AV_HAIR=[['court','Courts'],['afro','Afro'],['tresses','Tresses'],['chignon','Chignon'],['longs','Longs'],['rase','Rasés']];
const AV_HAT=[['none','Aucun'],['bonnet','Bonnet'],['paille','Chapeau de paille'],['foulard','Foulard'],['casquette','Casquette']];
const AV_OUT=[['simple','Tenue simple'],['jupe','Jupe'],['pagne','Pagne à motifs'],['boubou','Boubou']];
const AV_DEF={sex:'m',skin:4,hair:'afro',hairC:0,out:'simple',top:6,bottom:7,motif:0,hat:'none',hatC:0,glasses:0,jewel:0,beard:0,pack:1};
function av(){return Object.assign({},AV_DEF,state.avatar||{})}
function avOpts(){const a=av(),f=a.sex==='f',top=AV_COL[a.top][1],bot=AV_COL[a.bottom][1];
 const o={fem:f,skin:AV_SKIN[a.skin][1],hs:a.hair,hairCol:AV_HAIRC[a.hairC][1],hat:a.hat,hatCol:AV_COL[a.hatC][1],glasses:a.glasses,beard:a.beard&&!f,jewel:a.jewel||f&&0,top,bottom:bot,shoe:0xf2f2f2,pack:a.pack?0x2a2a2a:undefined};
 if(a.out==='simple'){o.sleeve=true}
 else if(a.out==='jupe'){o.skirt=1;o.sleeve=true}
 else if(a.out==='pagne'){o.skirt=1;o.pat=a.motif;o.sleeve=true}
 else{o.boubou=top;o.sleeve=true;o.bottom=bot}
 return o}
function tPerso(){
 const a=av();
 const pills=(key,list,cur)=>'<div class="pills">'+list.map(x=>'<button data-av="'+key+':'+x[0]+'" aria-pressed="'+(cur===x[0])+'">'+x[1]+'</button>').join('')+'</div>';
 const sw=(key,list,cur,label)=>'<div class="sw2" role="group" aria-label="'+label+'">'+list.map((x,i)=>'<button data-av="'+key+':'+i+'" aria-pressed="'+(cur===i)+'" style="background:'+x[0]+'" aria-label="'+label+' '+(i+1)+'"></button>').join('')+'</div>';
 const tg=(key,label,on)=>'<button data-av="'+key+':'+(on?0:1)+'" aria-pressed="'+!!on+'">'+label+'</button>';
 let h='<h2>Mon personnage</h2><p class="sub">Les changements s’affichent tout de suite dans le monde. Ils sont gardés dans ce navigateur.</p>'+STYLIZED('perso');
 h+='<h3>Nom</h3><div class="namerow"><input id="heroName" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Comment t’appelles-tu ?" value="'+esc(heroName())+'" aria-label="Nom du personnage"><button class="btn warm sm" data-act="savename">Valider</button></div><p class="sub" id="nameMsg" style="margin:4px 0 0">16 caractères au plus : lettres, chiffres, espace, apostrophe, tiret.</p>';
 h+='<h3>Sexe</h3>'+pills('sex',[['f','Féminin'],['m','Masculin']],a.sex);
 h+='<h3>Couleur de peau</h3>'+sw('skin',AV_SKIN,a.skin,'Peau');
 h+='<h3>Coiffure</h3>'+pills('hair',AV_HAIR,a.hair)+'<p class="sub" style="margin:8px 0 4px">Couleur des cheveux</p>'+sw('hairC',AV_HAIRC,a.hairC,'Cheveux');
 h+='<h3>Tenue</h3>'+pills('out',AV_OUT,a.out)+'<p class="sub" style="margin:8px 0 4px">'+(a.out==='boubou'?'Couleur du boubou':'Couleur du haut')+'</p>'+sw('top',AV_COL,a.top,'Haut')+
  (a.out==='pagne'?'<p class="sub" style="margin:8px 0 4px">Motif du pagne</p><div class="pills">'+[0,1,2,3,4].map(i=>'<button data-av="motif:'+i+'" aria-pressed="'+(a.motif===i)+'">Motif '+(i+1)+'</button>').join('')+'</div>':'<p class="sub" style="margin:8px 0 4px">Couleur du bas</p>'+sw('bottom',AV_COL,a.bottom,'Bas'));
 h+='<h3>Couvre-chef</h3>'+pills('hat',AV_HAT,a.hat)+(a.hat!=='none'?'<p class="sub" style="margin:8px 0 4px">Couleur</p>'+sw('hatC',AV_COL,a.hatC,'Couvre-chef'):'');
 h+='<h3>Accessoires</h3><div class="pills">'+tg('glasses','Lunettes',a.glasses)+tg('jewel','Bijoux',a.jewel)+(a.sex==='m'?tg('beard','Barbe',a.beard):'')+tg('pack','Sac à dos',a.pack)+'</div>';
 h+='<div class="row" style="margin-top:14px"><button class="btn ghost sm" data-av="reset:1">Réinitialiser</button><button class="btn warm sm" data-act="closeperso">Terminé</button></div>';
 h+='<p class="note">Personnage provisoire, volontairement stylisé. Les tenues et coiffures proposées ne représentent aucune communauté en particulier.</p>';
 return h}
/* Nom du personnage : nettoyé puis gardé dans la sauvegarde du profil actif. */
function setName(v,msgSel){
 const raw=String(v||'').trim(),c=LCA.store.cleanName(raw);
 state.name=c;save();if(R&&R.setHeroName)R.setHeroName();updateWho();
 const m=msgSel&&$(msgSel);
 if(m){m.textContent=c?(c!==raw?'Nom enregistré (caractères non permis retirés) : '+c:'Nom enregistré : '+c):'Nom effacé.';m.setAttribute('role','status')}
 return c}
function updateWho(){
 const b=$('#who');if(!b)return;const a=ACC&&ACC.current(),n=heroName();
 b.hidden=false;b.innerHTML='<b>'+esc(n||(a?a.pseudo:'Invité'))+'</b><small>'+(a?'Compte local':'Invité')+'</small>'}
function setAv(k,v){
 if(k==='reset'){state.avatar=null}
 else{const a=av();const num=['skin','hairC','top','bottom','motif','hatC','glasses','jewel','beard','pack'].indexOf(k)>-1;a[k]=num?+v:v;
  if(k==='sex'){a.beard=0;if(v==='f'&&a.hair==='court')a.hair='longs';if(v==='m'&&a.hair==='longs')a.hair='court';if(v==='f'&&a.out==='simple')a.out='pagne';if(v==='m'&&(a.out==='jupe'||a.out==='pagne'))a.out='simple';if(v==='f')a.jewel=1}
  state.avatar=a}
 save();if(R&&R.rebuildPlayer)R.rebuildPlayer();renderPanel()}
$('#persoBtn').onclick=()=>{if(tab==='perso')closePanel();else{setPause(false);openPanel('perso')}};


/* ================= VOIX ================= */
const SPK_SVG='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
let voiceList=[];
function loadVoices(){try{voiceList=(window.speechSynthesis&&speechSynthesis.getVoices())||[]}catch(e){voiceList=[]}}
loadVoices();try{if(window.speechSynthesis&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',loadVoices)}catch(e){}
const VOICE_PREF={wolof:['fr'],dioula:['fr'],bambara:['fr'],lingala:['sw','fr'],kikongo:['sw','fr'],swahili:['sw','fr'],zoulou:['zu','fr'],xhosa:['xh','zu','fr'],shona:['sw','fr'],somali:['so','fr'],amharique:['am','fr'],sango:['fr'],tamazight:['fr'],copte:['fr'],nubien:['fr']};
function pickVoice(id){
 const pref=state.settings&&state.settings.voice;
 if(pref){const v=voiceList.find(x=>x.voiceURI===pref);if(v)return v}
 const cands=VOICE_PREF[id]||['fr'];
 for(const p of cands){const fr=voiceList.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(p));if(fr.length){return fr.find(v=>/natural|neural|google|online/i.test(v.name))||fr[0]}}
 return null}
/* Respelling : rapproche l’écriture de la prononciation attendue par la voix choisie. Approximation, non validée. */
function respell(t,id,vl){
 let s=t.toLowerCase().replace(/[?!«»]/g,' ').replace(/\s+/g,' ').trim();
 const sw=vl&&/^(sw|zu|xh|so|am|af)/.test(vl);
 s=s.replace(/ɛ/g,sw?'e':'è').replace(/ɔ/g,'o').replace(/ɲ|ñ/g,sw?'ny':'gn').replace(/ŋ/g,'ng');
 if(sw)return s;
 s=s.replace(/ë/g,'e').replace(/[óò]/g,'o').replace(/à/g,'a').replace(/q/g,'k');
 s=s.replace(/u/g,'ou').replace(/c/g,'tch').replace(/j/g,'dj');
 if(id==='wolof')s=s.replace(/x/g,'kh');
 s=s.replace(/g(?=[eiè])/g,'gu');
 s=s.replace(/e(?=\s|$)/g,'é');
 return s}
let speakingWord=false;
function say(text,id){
 if(state.settings&&!state.settings.sound){toast('Le son est désactivé dans les paramètres');return}
 const lid=id||state.lang||'wolof';
 try{
  if(!window.speechSynthesis)throw 0;
  loadVoices();speechSynthesis.cancel();
  const v=pickVoice(lid),vl=v?v.lang.toLowerCase():'fr-fr';
  const u=new SpeechSynthesisUtterance(respell(text,lid,vl));
  if(v){u.voice=v;u.lang=v.lang}else u.lang='fr-FR';
  u.rate=(state.settings&&state.settings.slow)?.6:.82;u.pitch=1;
  speechSynthesis.speak(u)}
 catch(e){toast('La voix n’est pas disponible dans ce navigateur')}}

/* ================= LANGUE ================= */
/* Carte de l’Afrique : remplace l’ancien menu déroulant. Contour schématique, positions approximatives des régions où chaque langue est parlée. */
const MAP={W:380,H:392,lon0:-19,lon1:53,lat0:38.5,lat1:-36};
const mxp=lon=>(lon-MAP.lon0)/(MAP.lon1-MAP.lon0)*MAP.W,myp=lat=>(MAP.lat0-lat)/(MAP.lat0-MAP.lat1)*MAP.H;
const geoPath=r=>{let d='';for(let i=0;i<r.length;i+=2)d+=(i?'L':'M')+mxp(r[i]/100).toFixed(1)+' '+myp(r[i+1]/100).toFixed(1);return d};
const outlinePath=a=>'M'+a.map(p=>mxp(p[0]).toFixed(1)+' '+myp(p[1]).toFixed(1)).join('L')+'Z';
let mapBorders=true;
function mapLand(){const G=LCA.mapGeo;
 if(G&&G.land&&G.land.length)return '<path d="'+G.land.map(r=>geoPath(r)+'Z').join('')+'" fill="#d9b779" fill-opacity=".95" stroke="#fff2cf" stroke-width="1.1" stroke-linejoin="round"/>'+(mapBorders?'<path class="mbord" d="'+G.borders.map(geoPath).join('')+'" fill="none" stroke="#8a6a2e" stroke-width=".7" stroke-dasharray="3 2" stroke-opacity=".75" pointer-events="none"/>':'');
 return '<path d="'+outlinePath(LCA.mapOutline.africa)+'" fill="#d9b779" fill-opacity=".92" stroke="#fff2cf" stroke-width="1.6" stroke-linejoin="round"/><path d="'+outlinePath(LCA.mapOutline.madagascar)+'" fill="#d9b779" fill-opacity=".92" stroke="#fff2cf" stroke-width="1.4"/>'}
function mapPins(){const dense=Object.keys(LANGS).length>24;
 const pts=Object.values(LANGS).map(L=>({id:L.id,x:mxp(L.geo.lon),y:myp(L.geo.lat)}));
 const res=LCA.mapLayout?LCA.mapLayout.spread(pts,{minDist:dense?15:23,W:MAP.W,H:MAP.H}):pts.map(p=>({id:p.id,x:p.x,y:p.y,ox:p.x,oy:p.y,shift:0}));
 const m={};res.forEach(r=>m[r.id]=r);return m}
let mapSel=null,mapOpen=false,mapReg=null;
/* Mentions de stylisation : personnages et décors sont des représentations imaginées, pas des reconstitutions historiques. */
const STYLE_MSG={perso:'Les personnages sont des figures stylisées créées pour le jeu : leurs tenues, coiffures et couleurs sont inspirées de traditions variées mais ne représentent aucun peuple précis ni aucune personne réelle.',
 decor:'Le décor de chaque région est une ambiance stylisée (végétation, architecture, couleurs) : il ne reproduit pas fidèlement un lieu ou une époque et n’a pas été validé par des historiens.',
 histoire:'Les repères historiques sont des résumés généraux, non validés par des historiens ni des locuteurs ; à vérifier avant tout usage scolaire.'};
const STYLIZED=k=>'<p class="stylenote" role="note"><b>Stylisé, non historique.</b> '+esc(STYLE_MSG[k])+'</p>';
const THEME_NAMES={ouest:'Savane sahélienne, baobabs et villages ocre',nord:'Dunes, oasis, palmiers-dattiers et maisons de pierre claire',est:'Savane dorée, acacias, girafes et côte blanche',centrale:'Forêt dense, fougères et brume du grand fleuve',australe:'Terre rouge, rochers, aloès et montagne à sommet plat'};
function mapSvg(sel,reg){
 let h='<svg viewBox="0 0 '+MAP.W+' '+MAP.H+'" role="group" aria-label="Carte de l’Afrique avec les langues du jeu"><defs><linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12335c"/><stop offset="1" stop-color="#0b2142"/></linearGradient></defs><rect width="'+MAP.W+'" height="'+MAP.H+'" rx="18" fill="url(#seaG)"/>';
 h+=mapLand();
 if(LCA.mapGeo&&LCA.mapGeo.land)h=h.replace('</defs>','<clipPath id="landClip"><path d="'+LCA.mapGeo.land.map(r=>geoPath(r)+'Z').join('')+'"/></clipPath></defs>');
 LCA.regions.forEach(r=>{const ls=r.langs.map(i=>LANGS[i]).filter(Boolean);if(!ls.length)return;const cx=ls.reduce((a,L)=>a+mxp(L.geo.lon),0)/ls.length,cy=ls.reduce((a,L)=>a+myp(L.geo.lat),0)/ls.length;
  h+='<ellipse cx="'+cx.toFixed(0)+'" cy="'+cy.toFixed(0)+'" rx="46" ry="52" fill="'+LCA.regionColors[r.id]+'" fill-opacity=".2" clip-path="url(#landClip)" pointer-events="none"/>';
  h+='<text x="'+cx.toFixed(0)+'" y="'+(cy+(r.id==='nord'?-38:r.id==='australe'?34:r.id==='ouest'?-30:44)).toFixed(0)+'" class="mreg" text-anchor="middle">'+esc(r.name.replace('Afrique ','').replace('de l’','').replace('du ','').replace('de ',''))+'</text>'});
 const dense=Object.keys(LANGS).length>24,PM=mapPins();
 Object.values(LANGS).forEach(L=>{const pm=PM[L.id],x=pm.x,y=pm.y;if(pm.shift>3)h+='<g class="mlead" pointer-events="none"><line x1="'+pm.ox.toFixed(1)+'" y1="'+pm.oy.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/><circle cx="'+pm.ox.toFixed(1)+'" cy="'+pm.oy.toFixed(1)+'" r="1.4" fill="#fff"/></g>';
 const c=LCA.regionColors[L.region],on=L.id===sel,left=L.geo.lab==='l';
  h+='<g class="mdot'+(on?' on':'')+(dense?' dn':'')+(reg&&L.region!==reg?' dim':'')+'" data-map="'+L.id+'" tabindex="0" role="button" aria-pressed="'+on+'" aria-label="'+esc(L.name+', '+L.geo.zone)+'"><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="17" fill="transparent"/><circle class="pulse" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="10.5" fill="none" stroke="'+c+'"/><circle class="dc" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="9.5" fill="'+c+'"/><text x="'+x.toFixed(1)+'" y="'+(y+3).toFixed(1)+'" class="mcode" text-anchor="middle">'+esc(L.code)+'</text><text x="'+(x+(left?-14:14)).toFixed(1)+'" y="'+(y+4).toFixed(1)+'" class="mname" text-anchor="'+(left?'end':'start')+'">'+esc(L.name)+'</text></g>'});
 return h+'</svg>'}
function mapInfo(id,ctx){
 const L=LANGS[id];if(!L)return '<p class="sub">Touche une pastille de la carte pour découvrir une langue.</p>';
 const r=regionOf(L);
 return '<div class="mi"><span class="sw" style="background:'+L.color+'">'+esc(L.code)+'</span><div><b>'+esc(L.name)+'</b><small>'+esc(r.name)+' · '+esc(L.geo.zone)+'</small></div></div><p class="sub" style="margin:8px 0">'+esc(L.where)+'. Décor (stylisé, non historique) : '+esc(THEME_NAMES[L.region]||'')+'.</p>'+
  '<div class="chips"><span class="chip"><b>'+L.W.length+'</b> mots</span><span class="chip"><b>'+L.tales.length+'</b> conte(s)</span><span class="chip"><b>'+L.recipes.length+'</b> recette(s)</span>'+stBadge(L)+(L.partial?'<span class="vr st-prep">Contenu partiel</span>':'')+'</div>'+
  '<div class="row" style="margin-top:10px">'+(ctx==='menu'?'<button class="btn warm" data-pick="'+L.id+'">Choisir cette langue</button>':'<button class="btn warm" data-golang="'+L.id+'">'+(L.id===state.lang?'Rester dans ce village':'Voyager vers ce village')+'</button>')+'</div>'}
function mapBlock(ctx,sel,reg){
 return '<div class="amap" data-ctx="'+ctx+'">'+mapSvg(sel,reg)+'<div class="minfo">'+mapInfo(sel,ctx)+'</div><p class="note">Carte indicative (contours Natural Earth simplifiés). Les frontières en pointillés sont indicatives et ne tranchent aucun différend. Chaque pastille marque une zone où la langue est parlée, pas un territoire ; un trait fin relie une pastille décalée à son emplacement réel. Les langues s’étendent souvent bien au-delà.</p></div>'}
function selectMap(root,id){mapSel=id;const ctx=root.dataset.ctx;$$('.mdot',root).forEach(g=>{const on=g.dataset.map===id;g.classList.toggle('on',on);g.setAttribute('aria-pressed',String(on))});$('.minfo',root).innerHTML=mapInfo(id,ctx)}
function openMap(){closeDialog();closePanel();setPause(false);mapOpen=true;mapSel=mapSel||state.lang;$('#mapBody').innerHTML=mapBlock('game',mapSel);$('#mapov').hidden=false;$('#langBtn').setAttribute('aria-expanded','true')}
function closeMap(){mapOpen=false;$('#mapov').hidden=true;$('#langBtn').setAttribute('aria-expanded','false')}
$('#langBtn').onclick=()=>{mapOpen?closeMap():openMap()};
$('#mapClose').onclick=closeMap;
function mapClicks(e,root){const g=e.target.closest('[data-map]');if(!g||!root.contains(g))return false;selectMap(root,g.dataset.map);return true}
$('#mapov').addEventListener('click',e=>{if(mapClicks(e,$('#mapBody')))return;const b=e.target.closest('[data-golang]');if(b){const id=b.dataset.golang;closeMap();if(id!==state.lang)setLang(id,true)}else if(e.target.id==='mapov')closeMap()});
$('#mapov').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-map]')){e.preventDefault();selectMap($('#mapBody'),e.target.dataset.map)}});
const renderLangMenu=()=>{const L=lang();$('#langName').textContent=L.name;$('#langDot').style.background=L.color};
function flashFade(){const f=$('#fade');if(!f)return;f.style.transition='none';f.style.opacity='1';void f.offsetWidth;f.style.transition='opacity .7s ease';f.style.opacity='0'}
function setLang(id,announce){
 closeDialog();closePanel();state.lang=id;D();save();quiz=null;taleIdx=0;recIdx=0;learnMode='cartes';
 renderLangMenu();if(R&&R.applyLang)R.applyLang();check();renderTracker();flashFade();if(typeof ONL!=='undefined')ONL.sync();
 if(announce)toast('Langue : '+lang().name+(lang().hello?'. '+lang().hello+' !':''));
}

/* ================= DIALOGUE ================= */
let dlg=null;
const portrait=o=>'<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="'+o.bg+'"/><path d="M8 64c2-14 12-18 24-18s22 4 24 18z" fill="'+o.top+'"/><circle cx="32" cy="28" r="12" fill="'+o.skin+'"/>'+(o.wrap?'<path d="M19 26c0-12 8-16 14-16s13 4 13 16c-6-4-20-4-27 0z" fill="'+o.wrap+'"/><circle cx="32" cy="9" r="5" fill="'+o.wrap+'"/>':'<path d="M20 26c0-10 6-13 12-13s12 3 12 13c-5-3-19-3-24 0z" fill="#1b1b1b"/>')+'<circle cx="27.5" cy="29" r="1.3" fill="#1b1b1b"/><circle cx="36.5" cy="29" r="1.3" fill="#1b1b1b"/><path d="M28 35q4 3 8 0" stroke="#1b1b1b" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>';
const WATER_SVG='<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1d5f86"/><path d="M0 28q8-6 16 0t16 0 16 0 16 0v8q-8-6-16 0t-16 0-16 0-16 0z" fill="#7fd0ff"/><path d="M0 44q8-6 16 0t16 0 16 0 16 0v8q-8-6-16 0t-16 0-16 0-16 0z" fill="#4fb0e8"/></svg>';
const NPC_DATA=[
 {id:'awa',role:'Gardienne des contes',pos:[-19,-10.5],kind:{top:0xe8a317,bottom:0x1e5f8a,skirt:1,wrap:0x2f9e8f,pat:0,skin:0x6b4430,old:1,jewel:1},por:{bg:'#7a3b1d',top:'#e8a317',skin:'#6b4430',wrap:'#2f9e8f'}},
 {id:'fatou',role:'Marchande et cuisinière',pos:[-22,6.4],kind:{top:0xd4513b,bottom:0x3b4a8c,skirt:1,wrap:0xe6b422,pat:1,skin:0x5a3a28,jewel:1},por:{bg:'#2b4a6b',top:'#d4513b',skin:'#5a3a28',wrap:'#e6b422'}},
 {id:'drum',role:'Joueur de tambour',pos:[24,1.2],kind:{top:0xc24a2b,bottom:0x3a2a55,boubou:0xb5532a,cap:0xd97a1f,skin:0x4a2f22,drum:1},por:{bg:'#5b2a1a',top:'#c24a2b',skin:'#4a2f22',wrap:'#d97a1f'}},
 {id:'hist',role:'Gardien de la mémoire',pos:[4,-44],kind:{top:0x2f6a5a,bottom:0x3a2a55,boubou:0x2f6a5a,cap:0xf0e6d0,old:1,skin:0x4a2f22,staff:1},por:{bg:'#3b2a55',top:'#2f6a5a',skin:'#4a2f22',wrap:'#f0e6d0'}},
 {id:'ibou',role:'Enseignant du village',pos:[30,-22],kind:{top:0xf2efe6,bottom:0x2b3a55,hair:0x151515,skin:0x4f3426,shirt:1},por:{bg:'#27415f',top:'#f2efe6',skin:'#4f3426',wrap:null}}
];
const SPOTS=[{id:'river',name:'Le fleuve',role:'Le grand fleuve du village',pos:[0,-55],r:6,wat:true}];
const npcName=n=>n.wat?n.name:lang().names[n.id];
function npcPos(id){const n=NPC_DATA.find(x=>x.id===id);return {x:n.pos[0],z:n.pos[1]}}
function needList(){const L=lang();return PK.filter(k=>!D().got[k]).map(k=>{const w=wordOf(k);return w.wo+' ('+w.fr.toLowerCase()+')'}).join(', ')}
function dialogFor(n){
 const L=lang(),d=D(),wo=n.wat?L.river.wo:(L.greet[n.id]||'');
 if(n.id==='hist'){const pg=[{wo,fr:'Je garde la mémoire du '+L.name+' ('+L.where+'). Écoute son histoire, puis je te parlerai de quelqu’un que l’on honore.'}];
  L.history.forEach(x=>pg.push({wo:'',fr:x}));
  if(L.figure){const f=L.figure;pg.push({wo:'',fr:'Une personnalité honorée : '+f.name+' ('+f.years+'), '+f.role+'. '+f.bio})}
  pg.push({wo:'',fr:'Ces récits sont des synthèses écrites pour ce prototype, sans source citée : ils doivent être vérifiés avec des sources fiables avant diffusion.'});
  return {wo:pg[0].wo,fr:pg[0].fr,pages:pg,go:'Suivant',on(){flag('histDone');give('memoire')}}}
 if(n.wat)return {wo,fr:L.river.fr,go:'Garder ce souvenir',on(){flag('river');give('riviere')}};
 if(n.id==='awa')return {wo,fr:'Bonjour ! Je peux te raconter un conte de chez nous. Veux-tu l’écouter ?',go:'Écouter un conte',on(){openPanel('contes')}};
 if(n.id==='fatou'){
  if(!d.flags.delivered){
   if(gotTypes()<4)return {wo,fr:'Bienvenue à mon étal ! Pour préparer le plat du jour, il me manque : '+needList()+'. Ramasse-les dans le village, ils brillent d’un anneau bleu.',go:'Je m’en occupe',on(){}};
   return {wo,fr:'Tu as tout rapporté, merci ! Cuisinons ensemble : je te montre la recette.',go:'Donner les ingrédients',on(){flag('delivered');give('recette');openPanel('recettes')}}}
  return {wo,fr:'Le repas est prêt, assieds-toi avec nous ! Veux-tu revoir la recette ?',go:'Voir la recette',on(){openPanel('recettes')}}}
 if(n.id==='drum')return {wo,fr:'Écoute le '+L.drum.name+' : chaque rythme porte une histoire. Viens découvrir nos traditions et jouer avec moi.',go:'Découvrir',on(){openPanel('traditions')}};
 return {wo,fr:'Bienvenue à l’école du village ! Aujourd’hui, nous allons découvrir de nouveaux mots. Es-tu prêt'+(heroName()?', '+heroName():'')+' à relever le défi ?',go:'Commencer la leçon',later:'Revenir plus tard',on(){LCA.learn.startRecommended()}}}
function openDialog(n){
 closePanel();dlg=n;const dd=dialogFor(n);dlg.cur=dd;
 $('#dlgName').textContent=npcName(n);$('#dlgRole').textContent=n.role;$('#dlgLater').textContent=dd.later||'Plus tard';
 $('#dlgAvatar').innerHTML=n.wat?WATER_SVG:portrait(n.por);
 dd.pi=0;showPage(dd);$('#dialog').hidden=false;hideHint();
 if(n.id==='awa')flag('talkAwa');
}
function showPage(dd){const pg=dd.pages?dd.pages[dd.pi]:dd;$('#dlgWo').textContent=pg.wo||'';$('#dlgWo').parentNode.style.display=pg.wo?'flex':'none';$('#dlgFr').textContent=pg.fr;
 $('#dlgGo').textContent=dd.pages?(dd.pi<dd.pages.length-1?'Suivant ('+(dd.pi+1)+'/'+dd.pages.length+')':'J’ai écouté'):dd.go;$('#dlgFr').scrollTop=0}
function closeDialog(){dlg=null;$('#dialog').hidden=true}
$('#dlgLater').onclick=closeDialog;$('#dlgSay').innerHTML=SPK_SVG;$('#dlgSay').onclick=()=>{if(dlg&&dlg.cur)say($('#dlgWo').textContent)};
$('#dlgGo').onclick=()=>{const n=dlg;if(!n)return;const c=n.cur;if(c.pages&&c.pi<c.pages.length-1){c.pi++;showPage(c);return}closeDialog();c.on()};
LCA.learn=LCA.learnUI.create({$,esc,state:()=>state,save,lang,langs:()=>LANGS,say,toast,
 learnWord(L,q){const i=L.W.findIndex(w=>w.wo===q.text||w.fr===q.text);if(i<0)return;const d=D(L.id);if(!d.learned[i]){d.learned[i]=1;if(L.id===state.lang)check()}},
 onFinish(sm){const d=D(sm.lang),qn=6;d.best=Math.max(d.best||0,Math.round((sm.total?sm.score/sm.total:0)*qn));if(sm.lang===state.lang)check()},
 onOpen(){closeDialog();closePanel();stopAudio()}});
function openFinale(){
 closePanel();dlg={id:'fin',cur:{on(){openPanel('quetes')}}};
 $('#dlgName').textContent='Diplôme du village';$('#dlgRole').textContent='Toutes les quêtes sont terminées';
 $('#dlgAvatar').innerHTML=WATER_SVG;$('#dlgWo').textContent=lang().hello?lang().hello+' !':'';$('#dlgWo').parentNode.style.display='flex';
 $('#dlgFr').textContent='Bravo ! Tu as salué, cuisiné, écouté, joué et appris en '+lang().name+'. Essaie une autre langue avec la carte de l’Afrique (bouton en haut à droite).';
 $('#dlgGo').textContent='Voir mes quêtes';$('#dialog').hidden=false;
}
function hideHint(){$('#hint').classList.add('off')}
setTimeout(hideHint,20000);

/* ================= MENU PRINCIPAL ================= */
let welcomeOpen=false,menuScreen='home',menuMode='new',menuLang=null,menuConfirm=null,worldReady=false;
const STATUS={brouillon:['Brouillon','Contenu rédigé pour ce prototype, sans validation linguistique.'],verification:['En vérification','Relecture en cours.'],valide:['Validé','Relu par un locuteur ou une source.'],publie:['Publié','Validé et diffusé.']};
const REGIONS=LCA.regions;
Object.values(LANGS).forEach(L=>{L.status='brouillon';L.sources=[];L.contributors=[]});
function validateData(){
 const err=[],warn=[],ids={};let words=0;
 Object.keys(LANGS).forEach(k=>{const L=LANGS[k];
  if(L.id!==k)err.push(k+' : identifiant incohérent');if(ids[L.id])err.push('Identifiant en double : '+L.id);ids[L.id]=1;
  if(!L.name)err.push(k+' : nom manquant');if(!STATUS[L.status])err.push(k+' : statut invalide');
  const seen={};L.W.forEach((w,i)=>{words++;if(!w.wo||!w.fr)err.push(k+' : mot incomplet n°'+(i+1));const key=w.wo.toLowerCase();if(seen[key])warn.push(k+' : mot en double « '+w.wo+' »');seen[key]=1;if(!GROUPS[w.g])err.push(k+' : catégorie inconnue '+w.g)});
  PK.forEach(p=>{if(!L.W.some(w=>w.k===p))(L.partial?warn:err).push(k+' : ingrédient « '+p+' » absent du vocabulaire')});
  if(L.W.filter(w=>w.g==='c').length!==10)(L.partial?warn:err).push(k+' : les nombres de 1 à 10 sont incomplets');
  if(!L.region||!REGION_BY_ID[L.region])err.push(k+' : région inconnue');if(!L.geo||typeof L.geo.lon!=='number'||typeof L.geo.lat!=='number')err.push(k+' : position sur la carte manquante');
  if(L.partial)warn.push(k+' : contenu partiel (à compléter)');
  if(!L.tales.length)warn.push(k+' : aucun conte');if(!L.recipes.length)warn.push(k+' : aucune recette');
  L.tales.forEach(t=>{if(!t.paras.length||(!t.moral&&t.kind!=='proverbes'))err.push(k+' : conte incomplet « '+t.title+' »')});
  L.recipes.forEach(r=>{if(!r.ing.length||!r.steps.length)err.push(k+' : recette incomplète « '+r.name+' »')});
  if(!L.sources.length)warn.push(k+' : aucune source renseignée');});
 REGIONS.forEach(r=>r.langs.forEach(l=>{if(!LANGS[l])err.push('Région '+r.id+' : langue inconnue '+l)}));
 return {err,warn,words,langs:Object.keys(LANGS).length}}
const DATA_CHECK=validateData();
const hasProgress=id=>{const d=state.d&&state.d[id];return !!d&&(Object.keys(d.done||{}).length+Object.keys(d.flags||{}).length+Object.keys(d.learned||{}).length+Object.keys(d.got||{}).length)>0};
const anyProgress=()=>Object.keys(LANGS).some(hasProgress);
const ID_ICONS=[['Langues','<path d="M5 6h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-8l-5 4v-4H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><circle cx="8" cy="12" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="16" cy="12" r=".9" fill="currentColor"/>'],['Cultures','<path d="M5 5h14M6 5c0 4 1 6 3 9l2 7M18 5c0 4-1 6-3 9l-2 7M9 14h6M8.2 9l3.8 4 3.8-4"/><ellipse cx="12" cy="5" rx="7" ry="2"/>'],['Exploration','<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2"/>'],['Patrimoine','<path d="M12 3c2 2 2 4 0 6 2-2 4-2 6 0-2 2-4 2-6 0 2 2 2 4 0 6 0-2-2-4-4-4 2 0 4-2 4-4-2 2-4 2-6 0 2-2 4-2 6 0z"/><circle cx="12" cy="9" r="1.2"/><path d="M12 15c-1 2-1 4 0 6 1-2 1-4 0-6zM8 18c-2 0-3 1-4 3M16 18c2 0 3 1 4 3"/>'],['Apprentissage','<path d="M12 6c-2-1.6-5-2-9-1.5v14c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5v-14C17 4 14 4.4 12 6zM12 6v14"/>']];
const idRow=()=>'<div class="idrow" aria-hidden="true">'+ID_ICONS.map(i=>'<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+i[1]+'</svg><small>'+i[0]+'</small></span>').join('')+'</div>';
const stBadge=L=>'<span class="vr st-'+L.status+'">'+STATUS[L.status][0]+'</span>';
let fallbackMsg='';
function gl3d(){try{if(!window.THREE)return false;const c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'))}catch(e){return false}}
const QL=LCA.quality;let autoQ=null;
function devEnv(){const n=navigator,c=(()=>{try{const g=document.createElement('canvas').getContext('webgl'),x=g&&g.getExtension('WEBGL_debug_renderer_info');return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):''}catch(e){return ''}})();
 return {cores:n.hardwareConcurrency||0,mem:n.deviceMemory||0,dpr:window.devicePixelRatio||1,mobile:/Android|iPhone|iPad|Mobile/i.test(n.userAgent||'')||('ontouchstart' in window&&innerWidth<820),w:innerWidth,h:innerHeight,saveData:!!(n.connection&&n.connection.saveData),renderer:c}}
const autoOn=s=>s.auto!==0&&s.auto!==false;
const manualQ=s=>[0,1,2].includes(s.quality)?s.quality:(s.low?0:1);
const qualityOf=s=>{if(!autoOn(s))return manualQ(s);if(autoQ===null)autoQ=QL?QL.detect(devEnv()):manualQ(s);return autoQ};
function applySettings(){
 const s=state.settings||(state.settings={sound:1,shadows:1,low:0});
 if(!R)return;
 if(R.is2d){R.resize&&R.resize();return}
 const q=qualityOf(s),pf=QL.profile(q,window.devicePixelRatio),sh=!!s.shadows&&pf.shadows;
 R.renderer.shadowMap.enabled=sh;R.sun.castShadow=sh;if(R.sun.shadow&&R.sun.shadow.mapSize.x!==pf.shadowMap){R.sun.shadow.mapSize.set(pf.shadowMap,pf.shadowMap);if(R.sun.shadow.map){R.sun.shadow.map.dispose();R.sun.shadow.map=null}}
 R.renderer.setPixelRatio(pf.pixelRatio);R.adapt&&R.adapt(pf);
 R.scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true})}});
 window.dispatchEvent(new Event('resize'))}
function enterGame(id,panelTab){
 setLang(id,false);state.started=1;save();welcomeOpen=false;$('#stage').classList.remove('menu');$('#welcome').hidden=true;renderTracker();ONL.sync();
 if(panelTab)openPanel(panelTab);else if(!state.avatar&&menuMode==='new'){openPanel('perso');if(!heroName())setTimeout(()=>{const i=$('#heroName');if(i)i.focus()},60)}
 else{const q=curQuest();toast((heroName()?'Bienvenue, '+heroName()+' ! ':'')+(q?'Quête en cours : '+q.t:'')) }}
const back=(to,label)=>'<button class="back" data-m="'+to+'">← '+(label||'Retour')+'</button>';
function langCard(L,extra){return '<button class="lcard" data-pick="'+L.id+'"><span class="sw" style="background:'+L.color+'">'+L.code+'</span><span style="min-width:0"><b>'+L.name+'</b><small>'+L.where+'</small>'+stBadge(L)+(extra||'')+'</span></button>'}
function voiceBox(){loadVoices();const cur=(state.settings&&state.settings.voice)||'';const opts='<option value="">Automatique (français, ou swahili pour les langues bantoues proches)</option>'+voiceList.map(v=>'<option value="'+esc(v.voiceURI)+'"'+(v.voiceURI===cur?' selected':'')+'>'+esc(v.name)+' ('+esc(v.lang)+')</option>').join('');
 return '<div class="trow" style="display:block"><b>Voix</b><small>Aucune voix native pour la plupart de ces langues dans le navigateur : on utilise une voix existante avec une écriture phonétique approchée. La prononciation reste approximative et non validée.</small><select id="voiceSel" style="width:100%;margin-top:8px;min-height:44px;border-radius:12px;background:var(--ink2);color:var(--fg);border:1px solid var(--line);padding:0 10px">'+opts+'</select><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-m="testvoice">Tester : '+esc(lang().hello)+'</button></div>'+(voiceList.length?'':'<small style="display:block;margin-top:6px;color:var(--bad)">Aucune voix détectée sur ce navigateur.</small>')+'</div>'}
/* ---- Profil et connexion (comptes locaux) ---- */
let accTab='login',accMsg='',accBusy=false,accConfirm=false;
const ACC_ERR={bad:'Pseudo ou mot de passe incorrect.',short:'Trop court.',exists:'Ce pseudo existe déjà sur cet appareil.',storage:'Impossible d’écrire dans le stockage du navigateur (mode privé ou espace plein ?).',nocrypto:'Les mots de passe ne sont pas disponibles ici (navigateur sans chiffrement). Crée le profil sans mot de passe.',long:'Mot de passe trop long (64 caractères au plus).',unknown:'Profil introuvable.'};
const accErr=r=>r.error==='locked'?'Trop d’essais. Réessaie dans '+r.wait+' s.':(r.error==='short'&&r.field==='pseudo'?'Pseudo : 3 caractères au moins (lettres, chiffres, espace, apostrophe, tiret).':r.error==='short'&&r.field==='pw'?'Mot de passe : 6 caractères au moins (ou laisse vide).':(ACC_ERR[r.error]||'Échec.'));
function accCard(){
 if(!ACC)return '';
 const a=ACC.current(),n=heroName();
 return '<div class="acard">'+(a?'<span><b>'+esc(n||a.pseudo)+'</b><small>Profil local « '+esc(a.pseudo)+' » · progression séparée</small></span><button class="btn ghost sm" data-m="account">Mon profil</button>'
  :'<span><b>'+(n?esc(n)+' · ':'')+'Mode invité</b><small>Ta progression est gardée sur cet appareil. Crée un profil pour en avoir plusieurs.</small></span><button class="btn ghost sm" data-m="account">Se connecter</button>')+'</div>'}
function accountScreen(){
 if(!ACC)return back('home')+'<h2>Profil</h2><p class="note">Le stockage du navigateur est indisponible : pas de profils ici. Le jeu fonctionne mais ne sauvegarde pas.</p>';
 const a=ACC.current(),nm='<h3 class="sh">Nom du personnage</h3><div class="namerow"><input id="accName" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Comment t’appelles-tu ?" value="'+esc(heroName())+'" aria-label="Nom du personnage"><button class="btn warm sm" data-acc="name">Valider</button></div>';
 const msg='<p class="sub" id="accMsg" role="status" aria-live="polite">'+esc(accMsg)+'</p>';
 const lim='<p class="note">Ces profils sont <b>locaux</b> : ils vivent dans ce navigateur, sur cet appareil, sans serveur. Ils ne se synchronisent pas entre appareils, et un mot de passe n’empêche pas quelqu’un qui utilise ton navigateur de lire les données. Vider les données du site efface les profils.</p>';
 if(a)return back('home')+'<h2>Mon profil</h2><div class="acard"><span><b>'+esc(a.pseudo)+'</b><small>Connecté · '+(a.hasPassword?'protégé par mot de passe':'sans mot de passe')+'</small></span></div>'+nm+msg+
  '<div class="row" style="margin:12px 0"><button class="btn warm" data-acc="logout">Se déconnecter</button></div>'+
  '<h3 class="sh">Supprimer ce profil</h3>'+(accConfirm?'<div class="warnbox" role="alert"><b>Le profil et toute sa progression seront effacés.</b> La sauvegarde « invité » n’est pas touchée.'+(a.hasPassword?'<input id="accDelPw" type="password" autocomplete="current-password" placeholder="Mot de passe" aria-label="Mot de passe" style="margin-top:8px">':'')+'<div class="row"><button class="btn warm sm" data-acc="remove">Supprimer définitivement</button><button class="btn ghost sm" data-acc="cancel">Annuler</button></div></div>':'<div class="row"><button class="btn ghost sm" data-acc="confirmremove">Supprimer ce profil…</button></div>')+lim;
 const list=ACC.list();
 const tabs='<div class="seg" role="group" aria-label="Connexion ou création"><button data-acc="tab:login" aria-pressed="'+(accTab==='login')+'">Se connecter</button><button data-acc="tab:register" aria-pressed="'+(accTab==='register')+'">Créer un profil</button></div>';
 const known=list.length&&accTab==='login'?'<p class="sub" style="margin:10px 0 4px">Profils sur cet appareil :</p><div class="pills">'+list.map(x=>'<button data-acc="pick:'+esc(x.pseudo)+'">'+esc(x.pseudo)+(x.hasPassword?' 🔒':'')+'</button>').join('')+'</div>':'';
 const form=accTab==='login'
  ?'<div class="accform"><label>Pseudo<input id="accPseudo" type="text" maxlength="20" autocomplete="username" spellcheck="false"></label><label>Mot de passe <small>(laisse vide si le profil n’en a pas)</small><input id="accPw" type="password" autocomplete="current-password"></label><div class="row"><button class="btn warm" data-acc="login">Se connecter</button></div></div>'+known
  :'<div class="accform"><label>Pseudo <small>(3 à 20 caractères, sert à te reconnaître)</small><input id="accPseudo" type="text" maxlength="20" autocomplete="username" spellcheck="false"></label><label>Mot de passe <small>(facultatif, 6 caractères au moins)</small><input id="accPw" type="password" autocomplete="new-password"></label><label>Confirmer le mot de passe<input id="accPw2" type="password" autocomplete="new-password"></label>'+(ACC.guestHasData()?'<label class="chk"><input id="accImport" type="checkbox" checked> Reprendre ma progression d’invité dans ce profil <small>(la sauvegarde invité reste intacte)</small></label>':'')+'<div class="row"><button class="btn warm" data-acc="register">Créer le profil</button></div></div>';
 return back('home')+'<h2>Profil</h2><div class="acard"><span><b>Mode invité</b><small>Tu joues sans profil. Tout est gardé sur cet appareil.</small></span></div>'+nm+tabs+form+msg+lim}
async function accAction(act){
 if(!ACC||accBusy)return;
 const v=id=>{const e=$(id);return e?e.value:''};
 const say2=t=>{accMsg=t;const m=$('#accMsg');if(m)m.textContent=t};
 if(act==='name'){setName(v('#accName'),'#accMsg');accMsg=($('#accMsg')||{}).textContent||'';return}
 if(act.indexOf('tab:')===0){accTab=act.slice(4);accMsg='';showWelcome('account');return}
 if(act.indexOf('pick:')===0){accTab='login';showWelcome('account');$('#accPseudo').value=act.slice(5);$('#accPw').focus();return}
 if(act==='confirmremove'){accConfirm=true;showWelcome('account');return}
 if(act==='cancel'){accConfirm=false;showWelcome('account');return}
 if(act==='logout'){save();ACC.logout();location.reload();return}
 accBusy=true;
 try{
  if(act==='login'){save();/* enregistre le profil actuel AVANT de changer de profil */
   const r=await ACC.login(v('#accPseudo'),v('#accPw'));if(!r.ok){say2(accErr(r));return}location.reload();return}
  if(act==='register'){
   const ps=v('#accPseudo'),pw=v('#accPw');
   if(pw!==v('#accPw2')){say2('Les deux mots de passe ne sont pas identiques.');return}
   const e1=ACC.checkPseudo(ps);if(e1){say2(accErr({error:e1,field:'pseudo'}));return}
   const e2=ACC.checkPassword(pw);if(e2){say2(accErr({error:e2,field:'pw'}));return}
   const imp=$('#accImport');
   if(imp&&imp.checked)save();
   const r=await ACC.register({pseudo:ps,password:pw,importGuest:!!(imp&&imp.checked)});
   if(!r.ok){say2(accErr(r));return}
   /* nouveau profil vierge : le nom est celui de la sauvegarde importée, sinon vide */
   location.reload();return}
  if(act==='remove'){const a=ACC.current();const r=await ACC.remove(a.id,v('#accDelPw'));if(!r.ok){say2(accErr(r));return}location.reload();return}
 }finally{accBusy=false}
}
/* ---- Patrimoine oral (récits enregistrés, transcription et traduction écrites à la main) ---- */
let oralStore=null,oralMemAd=null,oralMem=false,oralItems=[],oralCur=null,oralDraft=null,oralRec=null,oralMsg='',oralConfirm=false,oralBusy=false;
function oralStoreGet(){
 const a=ACC&&ACC.current(),pid=a?a.id:'guest';
 if(!oralStore||oralStore.pid!==pid){let ad=null;try{ad=LCA.oral.idbAdapter('nzassa-oral')}catch(e){ad=null}oralMem=!ad;if(!ad)ad=oralMemAd||(oralMemAd=LCA.oral.memAdapter());oralStore={pid,s:LCA.oral.create({adapter:ad,profile:pid,langs:LANGS})}}
 return oralStore.s}
const fmtDur=s=>{s=Math.max(0,Math.round(s||0));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const fmtDate=t=>{try{return new Date(t).toLocaleDateString('fr-FR')}catch(e){return ''}};
const ORAL_ERR={title:'Donne un titre au récit.',lang:'Choisis la langue du récit.',consent:'Coche la case : la personne qui raconte doit être d’accord pour l’enregistrement.',audio:'Enregistre un récit ou choisis un fichier audio.',reviewer:'Indique le nom du locuteur qui a relu le texte.',toobig:'Fichier trop lourd (25 Mo au plus).',storage:'Impossible d’enregistrer ici (stockage plein ou bloqué).',unknown:'Récit introuvable.'};
const oralErr=e=>(e||[]).map(x=>ORAL_ERR[x]||'Échec.')[0]||'Échec.';
const oralSay=t=>{oralMsg=t;const m=$('#oralMsg');if(m)m.textContent=t};
function oralLeave(sc){
 if(oralRec&&sc!=='oralnew')recAbort();
 if(sc!=='oralnew'&&oralDraft){try{URL.revokeObjectURL(oralDraft.url)}catch(e){}oralDraft=null}
 if(sc!=='oralview'&&oralCur){try{if(oralCur.url)URL.revokeObjectURL(oralCur.url)}catch(e){}oralCur=null}}
function oralRecHtml(){
 if(oralRec)return '<div class="orec on"><span class="rdot" aria-hidden="true"></span><b id="oralTime">'+fmtDur((Date.now()-oralRec.t0)/1000)+'</b><span>Enregistrement en cours…</span><button class="btn warm sm" data-oral="stop">Arrêter</button></div>';
 if(oralDraft)return '<div class="orec"><audio controls preload="metadata" src="'+oralDraft.url+'" aria-label="Écouter l’enregistrement"></audio><small>'+(oralDraft.dur?fmtDur(oralDraft.dur)+' · ':'')+'prêt à être enregistré</small><button class="btn ghost sm" data-oral="redo">Recommencer</button></div>';
 return '<div class="orec"><button class="btn warm" data-oral="rec">● Démarrer l’enregistrement</button><label class="filebtn">Ou choisir un fichier audio<input id="oralFile" type="file" accept="audio/*"></label></div>'}
function renderOralRec(){const e=$('#oralRec');if(e)e.innerHTML=oralRecHtml()}
function recAbort(){if(oralRec){oralRec.abort=true;try{if(oralRec.rec.state!=='inactive')oralRec.rec.stop();else oralRec.stream.getTracks().forEach(t=>t.stop())}catch(e){}clearInterval(oralRec.timer);oralRec=null}}
function recStop(){if(oralRec&&oralRec.rec.state!=='inactive')oralRec.rec.stop()}
async function recStart(){
 oralSay('');
 if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)||typeof MediaRecorder==='undefined'){oralSay('L’enregistrement n’est pas disponible dans ce navigateur. Choisis plutôt un fichier audio.');return}
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){oralSay('Micro refusé ou introuvable. Autorise le micro dans le navigateur, ou choisis un fichier audio.');return}
 let mime='';for(const t of ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus']){try{if(MediaRecorder.isTypeSupported(t)){mime=t;break}}catch(_){}}
 let rec;try{rec=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)}catch(e){stream.getTracks().forEach(t=>t.stop());oralSay('Impossible de démarrer l’enregistrement.');return}
 const chunks=[],t0=Date.now();
 oralRec={rec,stream,t0,timer:null,abort:false};
 const me=oralRec;
 rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
 rec.onstop=()=>{clearInterval(me.timer);stream.getTracks().forEach(t=>t.stop());if(oralRec===me)oralRec=null;if(me.abort)return;
  const type=rec.mimeType||mime||'audio/webm',blob=new Blob(chunks,{type});
  if(!blob.size){oralSay('Rien n’a été enregistré.');renderOralRec();return}
  oralDraft={blob,type,dur:Math.min(LCA.oral.MAX_SEC,Math.round((Date.now()-t0)/1000)),url:URL.createObjectURL(blob)};renderOralRec()};
 rec.start(500);
 me.timer=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000),el=$('#oralTime');if(el)el.textContent=fmtDur(s);if(s>=LCA.oral.MAX_SEC)recStop()},250);
 renderOralRec()}
function oralFileChosen(f){
 if(!f)return;
 if(!(/^audio\//.test(f.type)||/\.(mp3|m4a|wav|ogg|oga|webm|aac|opus)$/i.test(f.name))){oralSay('Ce fichier n’est pas un fichier audio.');return}
 if(f.size>LCA.oral.MAX_BYTES){oralSay(ORAL_ERR.toobig);return}
 const url=URL.createObjectURL(f);oralDraft={blob:f,type:f.type||'audio/mpeg',dur:0,url};
 try{const a=new Audio(url);a.onloadedmetadata=()=>{if(isFinite(a.duration)&&oralDraft&&oralDraft.url===url){oralDraft.dur=Math.round(a.duration);renderOralRec()}}}catch(e){}
 oralSay('');renderOralRec()}
const langOpts=cur=>Object.values(LANGS).slice().sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(L=>'<option value="'+L.id+'"'+(L.id===cur?' selected':'')+'>'+esc(L.name)+'</option>').join('');
const oralNote='<p class="note">Rien n’est transcrit ni traduit automatiquement : ces outils fonctionnent mal pour la plupart de ces langues. Le texte est écrit à la main, et le statut « Relu par un locuteur » est déclaré par toi. Les récits restent sur cet appareil (profil actif) ; il n’y a pas de partage en ligne.</p>';
function oralScreen(sc){
 const msg='<p class="sub" id="oralMsg" role="status" aria-live="polite">'+esc(oralMsg)+'</p>';
 if(sc==='oral'){
  const items=oralItems.map(m=>{const L=LANGS[m.lang];return '<button class="lcard" data-oral="open:'+m.id+'"><span class="sw" style="background:'+(L?L.color:'#888')+'">'+esc(L?L.code:'?')+'</span><span style="min-width:0"><b>'+esc(m.title)+'</b><small>'+esc(L?L.name:m.lang)+' · '+fmtDate(m.created)+(m.duration?' · '+fmtDur(m.duration):'')+'</small><em class="obadge '+m.status+'">'+LCA.oral.STATUS[m.status]+'</em></span></button>'}).join('');
  return back('home')+'<h2>Patrimoine oral</h2><p class="sub">Enregistre un récit, écris sa transcription et sa traduction, puis réécoute-le.</p>'+
   (oralMem?'<div class="warnbox" role="alert"><b>Stockage indisponible.</b> Les récits seront perdus quand tu fermeras la page.</div>':'')+
   '<div class="row" style="margin:10px 0"><button class="btn warm" data-oral="new">● Enregistrer un récit</button></div>'+msg+
   (items?'<div class="lcards">'+items+'</div>':'<p class="sub">Aucun récit pour le moment.</p>')+oralNote}
 if(sc==='oralnew')return back('oral','Mes récits')+'<h2>Nouveau récit</h2><div class="accform oform">'+
   '<label>Titre<input id="oTitle" type="text" maxlength="80" autocomplete="off"></label>'+
   '<label>Langue du récit<select id="oLang">'+langOpts(state.lang)+'</select></label>'+
   '<label>Qui raconte ? <small>(facultatif)</small><input id="oNar" type="text" maxlength="60" autocomplete="off"></label>'+
   '<label>Lieu <small>(facultatif)</small><input id="oPlace" type="text" maxlength="80" autocomplete="off"></label>'+
   '<label class="chk"><input id="oConsent" type="checkbox"> La personne qui raconte est d’accord pour être enregistrée, et sait que l’enregistrement reste sur cet appareil. <small>Obligatoire. Demande toujours avant d’enregistrer quelqu’un.</small></label>'+
   '<div id="oralRec">'+oralRecHtml()+'</div>'+
   '<label>Transcription <small>(dans la langue du récit, à écrire à la main, tu peux la faire plus tard)</small><textarea id="oTr" rows="5" maxlength="20000"></textarea></label>'+
   '<label>Traduction en français <small>(à écrire à la main)</small><textarea id="oTl" rows="5" maxlength="20000"></textarea></label>'+
   '<div class="row"><button class="btn warm" data-oral="save">Enregistrer le récit</button><button class="btn ghost" data-m="oral">Annuler</button></div></div>'+msg+oralNote;
 if(sc==='oralview'&&oralCur){const m=oralCur.meta,L=LANGS[m.lang];
  return back('oral','Mes récits')+'<h2>'+esc(m.title)+'</h2><p class="sub">'+esc(L?L.name:m.lang)+' · enregistré le '+fmtDate(m.created)+(m.duration?' · '+fmtDur(m.duration):'')+' · <em class="obadge '+m.status+'">'+LCA.oral.STATUS[m.status]+'</em></p>'+
   (oralCur.url?'<audio controls preload="metadata" src="'+oralCur.url+'" style="width:100%" aria-label="Écouter le récit"></audio>':'<p class="note">Audio introuvable.</p>')+
   '<div class="accform oform">'+
   '<label>Titre<input id="oTitle" type="text" maxlength="80" value="'+esc(m.title)+'"></label>'+
   '<label>Langue du récit<select id="oLang">'+langOpts(m.lang)+'</select></label>'+
   '<label>Qui raconte ?<input id="oNar" type="text" maxlength="60" value="'+esc(m.narrator)+'"></label>'+
   '<label>Lieu<input id="oPlace" type="text" maxlength="80" value="'+esc(m.place)+'"></label>'+
   '<label>Transcription<textarea id="oTr" rows="6" maxlength="20000">'+esc(m.transcript)+'</textarea></label>'+
   '<label>Traduction en français<textarea id="oTl" rows="6" maxlength="20000">'+esc(m.translation)+'</textarea></label>'+
   '<label class="chk"><input id="oRelu" type="checkbox"'+(m.status==='relu'?' checked':'')+'> Un locuteur de cette langue a relu la transcription et la traduction.</label>'+
   '<label>Nom du locuteur qui a relu <small>(obligatoire si la case est cochée)</small><input id="oRev" type="text" maxlength="60" value="'+esc(m.reviewer)+'"></label>'+
   '<div class="row"><button class="btn warm" data-oral="update">Enregistrer les modifications</button><button class="btn ghost" data-oral="speak">Écouter la traduction (voix de synthèse)</button></div>'+
   '<div class="row"><button class="btn ghost sm" data-oral="dlaudio">Télécharger l’audio</button><button class="btn ghost sm" data-oral="dltext">Télécharger le texte</button></div></div>'+msg+
   '<p class="sub">Accord de la personne qui raconte : déclaré à l’enregistrement.</p>'+
   (oralConfirm?'<div class="warnbox" role="alert"><b>Le récit et son audio seront effacés de cet appareil.</b><div class="row"><button class="btn warm sm" data-oral="remove">Supprimer définitivement</button><button class="btn ghost sm" data-oral="cancel">Annuler</button></div></div>':'<div class="row"><button class="btn ghost sm" data-oral="confirmremove">Supprimer ce récit…</button></div>')+oralNote}
 return back('oral','Mes récits')+'<p class="sub">Récit introuvable.</p>'}
async function oralShow(sc){oralMsg='';oralConfirm=false;if(sc==='oral'){try{oralItems=await oralStoreGet().list()}catch(e){oralItems=[]}}showWelcome(sc)}
async function oralOpen(id,msg){
 let r=null;try{r=await oralStoreGet().get(id)}catch(e){}
 if(!r){oralMsg=ORAL_ERR.unknown;await oralShow('oral');return}
 oralLeave('oral');oralConfirm=false;
 oralCur={meta:r.meta,type:r.audio&&r.audio.type||r.meta.mime,url:r.audio&&r.audio.blob?URL.createObjectURL(r.audio.blob):'',blob:r.audio&&r.audio.blob};
 oralMsg=msg||'';showWelcome('oralview')}
const oralFields=()=>{const v=id=>($(id)||{}).value||'';return {title:v('#oTitle'),lang:v('#oLang'),narrator:v('#oNar'),place:v('#oPlace'),transcript:v('#oTr'),translation:v('#oTl')}};
const slugT=t=>String(t||'recit').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,40)||'recit';
async function oralDownload(blob,name){
 /* Dans une page hébergée, seul « downloads » permet d’enregistrer un fichier (extensions limitées) ; ailleurs, lien classique. */
 let dl=null;try{if(window.claude&&claude.use)dl=await claude.use('downloads')}catch(e){dl=null}
 if(dl){try{await dl.save({filename:name,data:blob});oralSay('Fichier proposé au téléchargement.')}catch(e){oralSay(e&&e.code==='rejected_extension'?'Ce format audio ne peut pas être téléchargé depuis cette page. Utilise la version installée sur ton ordinateur.':e&&e.code==='declined'?'Téléchargement annulé.':'Téléchargement indisponible ici.')}return}
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
async function oralAction(act){
 if(act==='new'){oralDraft&&oralLeave('x');oralMsg='';showWelcome('oralnew');return}
 if(act==='rec'){recStart();return}
 if(act==='stop'){recStop();return}
 if(act==='redo'){if(oralDraft){try{URL.revokeObjectURL(oralDraft.url)}catch(e){}oralDraft=null}renderOralRec();return}
 if(act.indexOf('open:')===0){oralOpen(act.slice(5));return}
 if(act==='confirmremove'){oralConfirm=true;showWelcome('oralview');return}
 if(act==='cancel'){oralConfirm=false;showWelcome('oralview');return}
 if(oralBusy)return;oralBusy=true;
 try{
  if(act==='save'){
   const f=oralFields();f.consent=!!($('#oConsent')||{}).checked;f.duration=oralDraft?oralDraft.dur:0;
   const r=await oralStoreGet().create(f,oralDraft?{blob:oralDraft.blob,type:oralDraft.type}:null);
   if(!r.ok){oralSay(oralErr(r.errors));return}
   if(oralDraft){try{URL.revokeObjectURL(oralDraft.url)}catch(e){}oralDraft=null}
   await oralOpen(r.meta.id,'Récit enregistré.');return}
  if(!oralCur)return;
  if(act==='update'){
   const f=oralFields();f.status=($('#oRelu')||{}).checked?'relu':'brouillon';f.reviewer=($('#oRev')||{}).value||'';
   const r=await oralStoreGet().update(oralCur.meta.id,f);
   if(!r.ok){oralSay(oralErr(r.errors));return}
   oralCur.meta=r.meta;oralSay('Modifications enregistrées.');return}
  if(act==='remove'){const ok=await oralStoreGet().remove(oralCur.meta.id);oralMsg=ok?'Récit supprimé.':ORAL_ERR.storage;await oralShow('oral');return}
  if(act==='speak'){
   const t=($('#oTl')||{}).value||oralCur.meta.translation;if(!t.trim()){oralSay('Écris d’abord la traduction.');return}
   try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.slice(0,2000));u.lang='fr-FR';u.rate=state.settings&&state.settings.slow?.75:.95;speechSynthesis.speak(u);oralSay('Lecture de la traduction par une voix de synthèse française (ce n’est pas la voix du conteur).')}catch(e){oralSay('La synthèse vocale n’est pas disponible ici.')}
   return}
  if(act==='dlaudio'){if(!oralCur.blob){oralSay('Audio introuvable.');return}const ext=({'audio/webm':'webm','audio/ogg':'ogg','audio/mp4':'m4a','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/aac':'aac'})[String(oralCur.type).split(';')[0]]||'audio';oralDownload(oralCur.blob,slugT(oralCur.meta.title)+'.'+ext);return}
  if(act==='dltext'){const m=Object.assign({},oralCur.meta,oralFields());m.status=($('#oRelu')||{}).checked?'relu':'brouillon';m.reviewer=($('#oRev')||{}).value||'';const L=LANGS[m.lang];oralDownload(new Blob([LCA.oral.exportText(LCA.oral.sanitize(m),L&&L.name)],{type:'text/plain;charset=utf-8'}),slugT(m.title)+'.txt');return}
 }finally{oralBusy=false}
}
/* ---- Relecture par des locuteurs (validation déclarative, voir js/review/review.js) ---- */
const RV=LCA.review;
let rvLang=null,rvPage=0,rvMsg='',rvFilter='all',rvDirty=0;
const RV_PER=12;
const rvStore=()=>{if(!state.review||!state.review.items)state.review=RV.empty();return state.review};
const RV_ERR={reviewer:'Renseigne d’abord ton nom de relecteur.',native:'Seules les personnes qui se déclarent locutrices de la langue peuvent donner un avis.',decision:'Avis invalide.',suggestion:'Écris ta proposition de correction.',name:'Écris ton nom (ou un pseudo).',format:'Fichier non reconnu : ce n’est pas un fichier de relecture N’Zassa.',reviewer2:'Le fichier ne contient pas de relecteur valide.',toomany:'Fichier trop gros.'};
function applyReviewStatus(){
 Object.values(LANGS).forEach(L=>{const sm=RV.summary(rvStore(),L.id,L.words);L.status=sm.language;L.rv=sm});
}
const rvChip=st=>'<em class="rvchip '+st.status+'">'+esc(st.label)+(st.ok?' · '+st.ok+' ✓':'')+(st.bad?' · '+st.bad+' ✗':'')+'</em>';
function rvWords(L){
 const idx=[];L.words.forEach((w,i)=>{const st=RV.statusOf(rvStore(),L.id,w[1],w[2]);
  if(rvFilter==='all'||(rvFilter==='todo'&&st.status==='a_verifier')||(rvFilter==='conteste'&&st.status==='conteste'))idx.push(i)});
 return idx}
function rvRow(L,i){
 const w=L.words[i],st=RV.statusOf(rvStore(),L.id,w[1],w[2]),m=RV.mine(rvStore(),L.id,w[1],w[2]);
 return '<div class="rvrow" data-wi="'+i+'"><div class="rvw"><b>'+esc(w[1])+'</b><span>'+esc(w[2])+'</span>'+rvChip(st)+'</div>'+
  (st.suggestions.length?'<p class="sub" style="margin:2px 0">Propositions : '+st.suggestions.map(x=>esc(x.text)+' ('+esc(x.by)+')').join(' ; ')+'</p>':'')+
  '<div class="rvact"><input type="text" maxlength="200" placeholder="Correction proposée (si besoin)" value="'+esc(m&&m.s||'')+'" aria-label="Correction proposée pour '+esc(w[1])+'">'+
  '<button class="btn ghost sm'+(m&&m.d==='ok'?' on':'')+'" data-rv="d:ok:'+i+'">✓ Correct</button><button class="btn ghost sm'+(m&&m.d==='bad'?' on':'')+'" data-rv="d:bad:'+i+'">✗ Incorrect</button><button class="btn ghost sm'+(m&&m.d==='fix'?' on':'')+'" data-rv="d:fix:'+i+'">✎ Corriger</button></div></div>'}
function rvSummaryHtml(L){const sm=RV.summary(rvStore(),L.id,L.words);
 return '<div class="rvsum" id="rvSum"><div class="bar"><i style="width:'+sm.pct+'%"></i></div><small>'+sm.reviewed+' mot(s) relu(s) sur '+sm.total+' · '+sm.valide+' validé(s) (déclaratif) · '+sm.conteste+' en discussion · '+(sm.total-sm.reviewed)+' à vérifier</small></div>'}
function reviewScreen(){
 const rs=rvStore(),rv=rs.reviewer,L=LANGS[rvLang||state.lang]||Object.values(LANGS)[0];rvLang=L.id;
 const msg='<p class="sub" id="rvMsg" role="status" aria-live="polite">'+esc(rvMsg)+'</p>';
 let h=back('home')+'<h2>Relecture par des locuteurs</h2><p class="sub">Tous les mots de N’Zassa sont des <b>brouillons non vérifiés</b>. Si tu parles une de ces langues, tu peux confirmer, contester ou corriger chaque mot. Un mot devient « validé (déclaratif) » quand '+RV.REQUIRED+' relecteurs différents le confirment et qu’aucun ne le conteste.</p>';
 h+='<p class="note"><b>Limite :</b> ton identité et ta qualité de locuteur sont <b>déclaratives</b> : le jeu ne peut pas les vérifier. Les corrections ne modifient jamais le contenu toutes seules : envoie ton fichier d’avis à l’équipe, qui les reprendra avec des sources. Le statut officiel d’une langue ne passe pas à « validé » sans cette étape.</p>';
 h+='<h3 class="sh">Relecteur</h3><div class="accform oform"><label>Ton nom ou pseudo<input id="rvName" type="text" maxlength="60" autocomplete="off" value="'+esc(rv?rv.name:'')+'"></label>'+
  '<label>Qualité <small>(facultatif : langue maternelle, ville, rôle…)</small><input id="rvQual" type="text" maxlength="120" autocomplete="off" value="'+esc(rv?rv.qualification:'')+'"></label>'+
  '<label class="chk"><input id="rvNative" type="checkbox"'+(rv&&rv.native?' checked':'')+'> Je me déclare locuteur ou locutrice de la langue que je relis.</label>'+
  '<div class="row"><button class="btn warm sm" data-rv="who">Enregistrer</button></div></div>';
 h+='<h3 class="sh">Langue à relire</h3><div class="accform oform"><label>Langue<select id="rvLang">'+langOpts(L.id)+'</select></label></div>'+rvSummaryHtml(L);
 h+='<div class="seg" role="group" aria-label="Filtre">'+[['all','Tous'],['todo','À vérifier'],['conteste','En discussion']].map(f=>'<button data-rv="f:'+f[0]+'" aria-pressed="'+(rvFilter===f[0])+'">'+f[1]+'</button>').join('')+'</div>';
 const idx=rvWords(L),pages=Math.max(1,Math.ceil(idx.length/RV_PER));if(rvPage>=pages)rvPage=pages-1;
 if(!L.words.length)h+='<p class="note">Aucun mot n’est encore documenté pour cette langue : il n’y a rien à relire. Tu peux proposer du vocabulaire à l’équipe.</p>';
 else h+='<div class="rvlist">'+(idx.slice(rvPage*RV_PER,(rvPage+1)*RV_PER).map(i=>rvRow(L,i)).join('')||'<p class="sub">Aucun mot dans ce filtre.</p>')+'</div>'+
  '<div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-rv="p:-1"'+(rvPage<=0?' disabled':'')+'>← Précédent</button><small>Page '+(rvPage+1)+' / '+pages+'</small><button class="btn ghost sm" data-rv="p:1"'+(rvPage>=pages-1?' disabled':'')+'>Suivant →</button></div>';
 h+=msg+'<h3 class="sh">Envoyer ou recevoir des avis</h3><div class="row"><button class="btn warm sm" data-rv="export">Exporter mes avis (fichier JSON)</button><label class="filebtn">Importer un fichier d’avis<input id="rvFile" type="file" accept=".json,application/json"></label></div>'+
  '<p class="sub">L’importation sert aux mainteneurs : elle ajoute les avis du fichier, sans toucher au contenu des langues.</p>';
 return h}
async function rvAction(act){
 const say2=t=>{rvMsg=t;const m=$('#rvMsg');if(m)m.textContent=t};
 const v=id=>($(id)||{}).value||'';
 if(act==='who'){const r=RV.setReviewer(rvStore(),{name:v('#rvName'),native:!!($('#rvNative')||{}).checked,qualification:v('#rvQual')});
  if(!r.ok){say2(RV_ERR[r.error]);return}save();say2(r.reviewer.native?'Relecteur enregistré.':'Enregistré, mais sans te déclarer locuteur tu ne peux pas donner d’avis.');return}
 if(act.indexOf('f:')===0){rvFilter=act.slice(2);rvPage=0;showWelcome('review');return}
 if(act.indexOf('p:')===0){rvPage+=+act.slice(2);showWelcome('review');return}
 if(act.indexOf('d:')===0){
  const p=act.split(':'),dec=p[1],i=+p[2],L=LANGS[rvLang],w=L.words[i],row=document.querySelector('.rvrow[data-wi="'+i+'"]');
  const sug=row?(row.querySelector('input')||{}).value:'';
  const r=RV.submit(rvStore(),L.id,w[1],w[2],dec,{suggestion:sug});
  if(!r.ok){say2(RV_ERR[r.error]||'Échec.');return}
  save();applyReviewStatus();say2('Avis enregistré.');
  if(row){const t=document.createElement('div');t.innerHTML=rvRow(L,i);row.replaceWith(t.firstChild)}
  const s=$('#rvSum');if(s)s.outerHTML=rvSummaryHtml(L);return}
 if(act==='export'){
  const f=RV.exportFile(rvStore());if(!f){say2(RV_ERR.reviewer);return}
  if(!f.items.length){say2('Tu n’as encore donné aucun avis.');return}
  const name='avis-nzassa-'+(slugT(f.reviewer.name))+'.json';
  await oralDownload(new Blob([JSON.stringify(f,null,1)],{type:'application/json'}),name);return}
}
async function rvFile(file){
 if(!file)return;const say2=t=>{rvMsg=t;const m=$('#rvMsg');if(m)m.textContent=t};
 if(file.size>2*1024*1024){say2(RV_ERR.toomany);return}
 let obj=null;try{obj=JSON.parse(await file.text())}catch(e){say2(RV_ERR.format);return}
 const r=RV.importFile(rvStore(),obj);
 if(r.errors.length){say2(r.errors[0]==='reviewer'||r.errors[0]==='native'?RV_ERR.reviewer2:RV_ERR[r.errors[0]]||RV_ERR.format);return}
 save();applyReviewStatus();showWelcome('review');rvMsg=r.added+' avis ajouté(s), '+r.skipped+' ignoré(s).';const m=$('#rvMsg');if(m)m.textContent=rvMsg}
function menuHtml(){
 const sc=menuScreen;
 if(sc==='home'){
  const cont=!!state.started||anyProgress()||!!state.avatar;
  const nL=Object.keys(LANGS).length;
  return '<div class="hero"><div class="hbanner"><img src="img/hero.jpg" alt="N’Zassa : un continent, mille cultures, une aventure." width="1312" height="410"></div><h2 class="brandname vh">N’Zassa</h2>'+idRow()+
   '<p class="pitch">Parcours des villages d’Afrique, rencontre leurs habitants et apprends '+nL+' langues par les contes, la cuisine et la musique.</p></div>'+accCard()+ONL.card()+'<div class="mlist">'+
   '<button class="mbtn big" data-m="new"><b>Nouvelle aventure</b><small>Choisir un peuple sur la carte et créer ton personnage</small></button>'+
   '<button class="mbtn" data-m="oral"><b>Patrimoine oral</b><small>Enregistrer, transcrire, traduire et réécouter un récit</small></button><button class="mbtn" data-m="continue"'+(cont?'':' disabled')+'><b>Continuer</b><small>'+(cont?'Reprendre en '+esc(lang().name):'Aucune sauvegarde pour le moment')+'</small></button>'+
   '<div class="mrow"><button class="mbtn sm" data-m="regions"><b>Régions</b><small>Carte par région</small></button><button class="mbtn sm" data-m="learn"><b>Apprendre</b><small>Carnet de mots</small></button></div>'+
   '<div class="mrow3"><button class="mbtn sm" data-m="parcours"><b>Mon parcours</b></button><button class="mbtn sm" data-m="collection"><b>Collection</b></button><button class="mbtn sm" data-m="review"><b>Relecture</b></button><button class="mbtn sm" data-m="account"><b>Profil</b></button><button class="mbtn sm" data-m="settings"><b>Paramètres</b></button><button class="mbtn sm" data-m="credits"><b>Crédits</b></button></div></div>'+
   '<p class="mload">'+(worldReady?'Monde prêt.':'Chargement du monde…')+'</p>'}
 if(sc==='new'||sc==='learn')return back('home')+'<h2>'+(sc==='new'?'Nouvelle aventure':'Apprendre une langue')+'</h2><p class="sub">Touche une pastille sur la carte pour choisir un peuple et sa langue. Chaque langue a son décor et sa propre progression.</p>'+mapBlock('menu',mapSel||state.lang)+'<details class="lst"><summary>Voir la liste des langues</summary><div class="lcards">'+Object.values(LANGS).map(L=>langCard(L,hasProgress(L.id)?'<i>Progression en cours</i>':'')).join('')+'</div></details>';

 if(sc==='regions'){const rr=mapReg?REGION_BY_ID[mapReg]:null;const sel=(mapSel&&LANGS[mapSel]&&(!rr||LANGS[mapSel].region===mapReg))?mapSel:(rr?rr.langs[0]:state.lang);
  return back('home')+'<h2>Choisir une région</h2><p class="sub">Touche une région pour la mettre en évidence, puis une pastille pour choisir la langue. Une région ne représente pas toute l’Afrique.</p><div class="regchips"><button data-reg="" aria-pressed="'+!rr+'">Toutes</button>'+REGIONS.map(r=>'<button data-reg="'+r.id+'" aria-pressed="'+(mapReg===r.id)+'" style="--c:'+LCA.regionColors[r.id]+'">'+esc(r.name.replace('Afrique ','').replace('de l’','').replace('du ','').replace('de ',''))+'</button>').join('')+'</div>'+(rr?'<p class="note" style="margin:0 0 8px"><b>'+esc(rr.name)+'</b> : '+esc(rr.note)+'. Décor : '+esc(THEME_NAMES[rr.id])+'.</p>':'')+mapBlock('menu',sel,mapReg)}
 if(sc==='prep'){const r=REGIONS.find(x=>x.id===menuLang);return back('regions')+'<h2>'+r.name+'</h2><span class="vr st-prep">En préparation</span><p class="sub">Aucune langue, aucun mot, conte ni recette n’est publié pour cette région. Rien n’a été inventé pour combler le vide.</p><h3 style="color:var(--accent)">À documenter avant l’ouverture</h3><ul class="cl"><li>Les langues et variantes concernées, avec leurs zones d’usage.</li><li>Un vocabulaire relu par un locuteur natif, avec l’orthographe officielle.</li><li>Des contes et proverbes avec leur source et leurs droits.</li><li>Des recettes sourcées, avec le contexte culturel.</li><li>Des enregistrements audio autorisés, si possible.</li><li>Les noms des contributeurs et le statut de validation.</li></ul><p class="note">Pour ajouter une langue : voir <b>docs/AJOUTER_UNE_LANGUE.md</b> dans le projet téléchargeable.</p>'}
 if(sc==='detail'){
  const L=LANGS[menuLang],d=state.d[L.id]||{},qn=questCount(L),done=Object.keys(d.done||{}).length;
  const prog=hasProgress(L.id);
  const primary=menuMode==='learn'?'<button class="btn warm" data-go2="learn">Ouvrir le carnet de mots</button>':(prog?'<button class="btn warm" data-go2="resume">Reprendre l’aventure</button><button class="btn ghost" data-go2="restart">'+(menuConfirm==='restart'?'Confirmer : tout effacer pour '+esc(L.name):'Recommencer à zéro')+'</button>':'<button class="btn warm" data-go2="start">Commencer l’aventure</button>');
  return back(menuMode==='regions'?'regions':(menuMode==='learn'?'learn':'new'))+'<h2>'+L.name+'</h2>'+stBadge(L)+'<p class="sub">'+L.where+'. '+esc(STATUS[L.status][1])+'</p>'+
  '<div class="acts"><div><b>'+L.W.length+'</b><span>mots et phrases</span></div><div><b>'+L.tales.length+'</b><span>contes</span></div><div><b>'+L.recipes.length+'</b><span>recettes</span></div><div><b>'+qn+'</b><span>quêtes</span></div></div>'+
  '<p class="sub">Activités : quêtes guidées, ramassage d’ingrédients, contes, recettes, rythme de tambour, cartes de mots et quiz. '+(prog?'Progression : '+done+' quête(s) sur '+qn+', '+Object.keys(d.learned||{}).length+' mot(s) appris.':'')+'</p>'+
  ''+(L.partial?'<p class="note" style="margin-top:0;border-color:var(--bad)"><b>Contenu partiel.</b> Cette langue n’a pas encore assez de vocabulaire, de contes ou de recettes documentés. Ce qui manque est signalé « à compléter » et rien n’a été inventé.</p>':'')+'<p class="note" style="margin-top:0">Sources : aucune renseignée. Vocabulaire, contes, recettes et histoire : contenu à valider par un locuteur ou une source fiable.</p><div class="row">'+primary+'</div>'}
 if(sc==='collection')return back('home')+'<h2>Collection culturelle</h2><p class="sub">Ce que tu as découvert, langue par langue.</p>'+Object.values(LANGS).map(L=>{const d=state.d[L.id]||{},n=Object.keys(d.learned||{}).length,it=Object.keys(d.items||{}).length,qd=Object.keys(d.done||{}).length;
  return '<div class="rcard"><b>'+L.name+'</b>'+stBadge(L)+'<div class="bar"><i style="width:'+Math.round(n/(L.W.length||1)*100)+'%"></i></div><small>'+n+' mot(s) appris sur '+L.W.length+' · '+qd+' quête(s) sur '+questCount(L)+' · '+it+' objet(s) sur '+Object.keys(ITEMS).length+(d.best?' · meilleur quiz '+d.best+' sur 6':'')+'</small></div>'}).join('');
 if(sc==='settings'){const s=state.settings||{};
  const sw=(k,t,sub)=>'<button class="trow" data-set="'+k+'" aria-pressed="'+!!s[k]+'"><span><b>'+t+'</b><small>'+sub+'</small></span><span class="tg"></span></button>';
  const cur=s.mode==='3d'?'3d':'2d',q=qualityOf(s),ok3=gl3d();
  const gm=(id,t,sub,dis)=>'<button class="trow gm" data-gmode="'+id+'" aria-pressed="'+(cur===id)+'"'+(dis?' disabled':'')+'><span><b>'+t+'</b><small>'+sub+'</small></span><span class="rd"></span></button>';
  const want=menuConfirm&&menuConfirm.indexOf('mode:')===0?menuConfirm.slice(5):null;
  return back('home')+'<h2>Paramètres</h2><h3 class="sh">Mode graphique</h3>'+
   gm('2d','Rendu 2D peint (plus léger)','Univers illustré inspiré de l’animation japonaise, fluide même sur une petite machine.',false)+
   gm('3d','Rendu 3D (par défaut)',ok3?'Village explorable en trois dimensions, caméra à la troisième personne. Plus gourmand.':'Indisponible sur cet appareil (WebGL absent ou bibliothèque 3D non chargée).',!ok3)+
   (want?'<div class="warnbox" role="alert"><b>Le jeu va se recharger.</b> Ta progression (quêtes, objets, XP, badges, leçons) est conservée : seul l’affichage change.<div class="row"><button class="btn warm sm" data-gmode="'+want+'">Changer et recharger</button><button class="btn ghost sm" data-m="settings">Annuler</button></div></div>':'')+
   (fallbackMsg?'<p class="note">'+esc(fallbackMsg)+'</p>':'')+
   '<h3 class="sh">Qualité graphique</h3><div class="seg" role="group" aria-label="Qualité graphique">'+['Auto','Bas','Moyen','Élevé'].map((t,i)=>{const on=i===0?autoOn(s):(!autoOn(s)&&q===i-1);return '<button data-q="'+(i-1)+'" aria-pressed="'+on+'">'+t+'</button>'}).join('')+'</div><p class="sub">'+(autoOn(s)?'Auto : le jeu choisit selon ton appareil (actuellement <b>'+['Bas','Moyen','Élevé'][qualityOf(s)]+'</b>) et baisse tout seul si l’affichage devient lent. ':'')+'Bas : pas d’ombres, résolution réduite, moins de décor. Pour les petites machines.</p>'+
   '<h3 class="sh">Son et confort</h3>'+sw('sound','Son','Rythme du tambour. La lecture des contes dépend de ton navigateur.')+sw('shadows','Ombres (3D)','Actives seulement en qualité Moyen ou Élevé.')+sw('slow','Voix lente','Prononciation plus lente pour mieux entendre.')+voiceBox()+
  '<div class="row" style="margin:12px 0"><button class="btn ghost" data-m="fs">Plein écran</button></div><p class="sub">Commandes : ZQSD ou WASD pour marcher, Maj pour courir, Espace pour sauter, E pour parler, M pour le menu, P ou Échap pour la pause.</p>'+
  '<div class="row"><button class="btn ghost" data-m="wipe">'+(menuConfirm==='wipe'?'Confirmer : effacer toute la progression':'Effacer toutes mes données')+'</button></div>'}
 if(sc==='account')return accountScreen();
 if(sc==='review')return reviewScreen();
 if(sc==='oral'||sc==='oralnew'||sc==='oralview')return oralScreen(sc);
 if(sc==='credits'){const v=DATA_CHECK;return back('home')+STYLIZED('decor')+STYLIZED('histoire')+'<h2>Crédits</h2><p>« N’Zassa : un continent, mille cultures, une aventure ». </p><p class="sub"><b>Projet pour le P.A.S Challenge Dakar 2026</b>, réalisé par l’équipe <b>BugSquash</b> :</p><ul class="cl"><li>GUINDO CHRYS MICHEL CHECK</li><li>Kouame Akissi Noëlle Desiree</li><li>Konan Ange Stéphane</li><li>OYETOLA ADEKOUEWOU AYILA HAMIDE</li></ul><ul class="cl"><li><b>3D</b> : three.js r128, licence MIT. Tous les décors et personnages sont générés par du code, aucun modèle externe.</li><li><b>Polices</b> : Bricolage Grotesque et Figtree, via Google Fonts.</li><li><b>Contenus</b> : mots, contes et recettes rédigés pour ce prototype par une IA. Ils ne sont ni sourcés ni validés et ne doivent pas être pris pour des données linguistiques authentiques.</li></ul><h3 style="color:var(--accent)">Contrôle des données</h3><p class="sub">'+v.langs+' langues, '+v.words+' mots. '+(v.err.length?'<b style="color:var(--bad)">'+v.err.length+' erreur(s)</b> : '+esc(v.err.slice(0,3).join(' ; ')):'Aucune erreur technique.')+' '+v.warn.length+' avertissement(s)'+(v.warn.length?' : '+esc(v.warn.slice(0,3).join(' ; ')):'')+'.</p>'}
 return ''}
function showWelcome(sc){
 oralLeave(sc||'home');menuScreen=sc||'home';welcomeOpen=true;$('#welcome').classList.toggle('home',menuScreen==='home');$('#stage').classList.add('menu');const w=$('#welcome');w.hidden=false;
 const c=$('#welcomeCard');c.classList.remove('in');c.innerHTML=menuHtml();void c.offsetWidth;c.classList.add('in');
 const f=$('button:not([disabled])',c);if(f&&menuScreen!=='home')f.focus();if(typeof ONL!=='undefined')ONL.sync()}
$('#welcomeCard').addEventListener('change',e=>{if(e.target.id==='voiceSel'){state.settings=state.settings||{};state.settings.voice=e.target.value;save();say(lang().hello)}});
$('#welcomeCard').addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(b){ONL.setPlay(b.dataset.play);showWelcome('home');return}if(e.target.closest('[data-onl=test]')){const a=$('#onlApi');if(a)ONL.setApi(a.value);ONL.test()}});
$('#welcomeCard').addEventListener('change',e=>{if(e.target.id==='onlApi'){ONL.setApi(e.target.value);showWelcome('home')}if(e.target.id==='onlConsent'){ONL.setConsent(e.target.checked)}});
$('#welcomeCard').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-map]')){e.preventDefault();const r=e.target.closest('.amap');if(r)selectMap(r,e.target.dataset.map)}});
$('#welcomeCard').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.accform input:not([type=checkbox]),#accName')){e.preventDefault();const f=e.target.closest('.accform');accAction(f?(accTab==='login'?'login':'register'):'name')}});
$('#welcomeCard').addEventListener('change',e=>{if(e.target.id==='oralFile'){oralFileChosen(e.target.files&&e.target.files[0])}if(e.target.id==='rvFile'){rvFile(e.target.files&&e.target.files[0]);e.target.value=''}if(e.target.id==='rvLang'){rvLang=e.target.value;rvPage=0;showWelcome('review')}});
$('#welcomeCard').addEventListener('click',e=>{
 let b;
 if((b=e.target.closest('[data-oral]'))){oralAction(b.dataset.oral);return}
 if((b=e.target.closest('[data-rv]'))){rvAction(b.dataset.rv);return}
 if((b=e.target.closest('[data-acc]'))){accAction(b.dataset.acc);return}
 if((b=e.target.closest('[data-reg]'))){mapReg=b.dataset.reg||null;showWelcome('regions');return}
 if((b=e.target.closest('.amap'))&&mapClicks(e,b))return;
 if((b=e.target.closest('[data-prep]'))){menuLang=b.dataset.prep;showWelcome('prep');return}
 if((b=e.target.closest('[data-pick]'))){menuLang=b.dataset.pick;menuConfirm=null;if(menuScreen==='regions')menuMode='regions';else if(menuScreen==='learn')menuMode='learn';else if(menuScreen==='new')menuMode='new';showWelcome('detail');return}
 if((b=e.target.closest('[data-go2]'))){const a=b.dataset.go2;
  if(a==='restart'&&menuConfirm!=='restart'){menuConfirm='restart';showWelcome('detail');return}
  if(a==='restart'){delete state.d[menuLang];save()}
  if(a==='learn')enterGame(menuLang,'apprentissage');else{if(menuMode==='regions')menuMode='new';enterGame(menuLang)}return}
 if((b=e.target.closest('[data-set]'))){const s=state.settings||(state.settings={});s[b.dataset.set]=s[b.dataset.set]?0:1;save();applySettings();showWelcome('settings');return}
 if((b=e.target.closest('[data-gmode]'))){const id=b.dataset.gmode,s=state.settings||(state.settings={});if(b.disabled||id===(s.mode==='3d'?'3d':'2d')){menuConfirm=null;return}
  if(menuConfirm==='mode:'+id){s.mode=id;save();location.reload();return}
  menuConfirm='mode:'+id;showWelcome('settings');return}
 if((b=e.target.closest('[data-q]'))&&menuScreen==='settings'){const s=state.settings||(state.settings={});const v=+b.dataset.q;if(v<0){s.auto=1;autoQ=null}else{s.auto=0;s.quality=v;s.low=v===0?1:0}save();applySettings();showWelcome('settings');return}
 if((b=e.target.closest('[data-m]'))){const m=b.dataset.m;menuConfirm=m==='wipe'?menuConfirm:null;
  if(m==='continue'){menuMode='continue';enterGame(state.lang||'wolof');return}
  if(m==='testvoice'){say(lang().hello);return}
  if(m==='fs'){try{const el=document.documentElement;const p=document.fullscreenElement?document.exitFullscreen():el.requestFullscreen();if(p&&p.catch)p.catch(()=>toast('Plein écran indisponible ici'))}catch(_){toast('Plein écran indisponible ici')}return}
  if(m==='wipe'){if(menuConfirm!=='wipe'){menuConfirm='wipe';showWelcome('settings')}else{state.d={};state.avatar=null;state.name='';state.started=0;menuConfirm=null;save();D();if(R&&R.setHeroName)R.setHeroName();updateWho();if(R&&R.rebuildPlayer)R.rebuildPlayer();R&&R.syncPickups&&R.syncPickups();check();toast('Données effacées');showWelcome('home')}return}
  if(m==='parcours'){LCA.learn.openDash();return}
  if(m==='oral'){oralShow('oral');return}
  if(m==='review'){rvMsg='';rvPage=0}
  if(m==='account'){accMsg='';accConfirm=false}
  if(m==='new'||m==='learn'){menuMode=m}
  if(m==='regions')menuMode='regions';
  showWelcome(m)}
});

/* ================= 3D ================= */
const P={x:0,z:26,y:0,vy:0,yaw:0,pitch:.3,heading:Math.PI},keys={},joy={x:0,y:0},joyc={x:0,y:0};
let near=null,R=null,renderMode='2d';const COLL=[];
let paused=false;
const frozen=()=>!!tab||welcomeOpen||paused||mapOpen||(LCA.learn&&LCA.learn.isOpen());
function setPause(v){if(welcomeOpen)return;paused=v;$('#pause').hidden=!v;if(v){closeDialog();closePanel();stopAudio()}}
$('#pauseBtn').onclick=()=>setPause(true);$('#pResume').onclick=()=>setPause(false);$('#pPerso').onclick=()=>{setPause(false);openPanel('perso')};
$('#pLang').onclick=()=>{setPause(false);openMap()};
$('#pMenu').onclick=()=>{setPause(false);showWelcome('home')};
let pickTarget=()=>null;

function init3D(){
 const THREE=window.THREE;if(!THREE)throw new Error('three');
 const canvas=$('#gl');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 const sk=document.createElement('canvas');sk.width=4;sk.height=256;const sx=sk.getContext('2d');const gr=sx.createLinearGradient(0,0,0,256);
 const setSky=c=>{const g2=sx.createLinearGradient(0,0,0,256);g2.addColorStop(0,c[0]);g2.addColorStop(.3,c[1]);g2.addColorStop(.55,c[2]);g2.addColorStop(1,c[3]);sx.fillStyle=g2;sx.fillRect(0,0,4,256);if(scene.background)scene.background.needsUpdate=true};
 setSky(['#1f3c75','#6a78ae','#f0a064','#ffd593']);
 scene.background=new THREE.CanvasTexture(sk);
 scene.fog=new THREE.Fog(0xeaa86a,60,240);
 const camera=new THREE.PerspectiveCamera(52,1,.1,500);
 const V=THREE.Vector3;
 const hemi=new THREE.HemisphereLight(0xffd9a8,0x7a5330,1);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffc27a,.95);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 const sc=sun.shadow.camera;sc.left=-40;sc.right=40;sc.top=40;sc.bottom=-40;sc.near=1;sc.far=150;sun.shadow.bias=-.0006;
 scene.add(sun);scene.add(sun.target);
 const fill=new THREE.DirectionalLight(0xbcd4ff,.3);fill.position.set(-20,30,60);scene.add(fill);

 let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
 const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
 const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
 const shade=(g,rc)=>{g.traverse(o=>{if(o.isMesh){o.castShadow=true;if(rc)o.receiveShadow=true}})};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const addColl=(x,z,r,g)=>COLL.push({x,z,r,g});
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();

 /* motifs de tissus */
 const PT={};
 function patTex(i){
  i=i%5;if(PT[i])return PT[i];
  const C=[['#e8a317','#1e5f8a','#fff3d6'],['#d4513b','#f4d35e','#2b2d42'],['#2f9e8f','#fff3d6','#c1440e'],['#3b4a8c','#f2b134','#ffffff'],['#7a2e65','#f5c26b','#1b1b1b']][i];
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.fillStyle=C[0];x.fillRect(0,0,128,128);
  if(i%3===0){for(let gx=0;gx<4;gx++)for(let gy=0;gy<4;gy++){const cx=gx*32+16,cy=gy*32+16;x.fillStyle=C[1];x.beginPath();x.moveTo(cx,cy-13);x.lineTo(cx+13,cy);x.lineTo(cx,cy+13);x.lineTo(cx-13,cy);x.fill();x.fillStyle=C[2];x.beginPath();x.arc(cx,cy,4,0,6.3);x.fill()}}
  else if(i%3===1){x.strokeStyle=C[1];x.lineWidth=6;for(let r=0;r<4;r++){x.beginPath();for(let k=0;k<=8;k++){const px=k*16,py=r*32+(k%2?10:22);k?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}x.fillStyle=C[2];for(let k=0;k<8;k++)for(let r=0;r<4;r++){x.beginPath();x.arc(k*16+8,r*32+30,2.4,0,6.3);x.fill()}}
  else{x.fillStyle=C[1];x.fillRect(0,0,128,18);x.fillRect(0,64,128,18);x.fillStyle=C[2];for(let k=0;k<8;k++){x.beginPath();x.arc(k*16+8,40,4,0,6.3);x.fill();x.fillRect(k*16+4,100,8,8)}}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1);PT[i]=t;return t};

 /* sol */
 const paths=[[0,48,0,0],[-26,7,0,2],[0,2,27,2],[0,0,-18,-11],[0,0,23,-17],[0,0,0,-58]];
 const dseg=(px,pz,s)=>{const ax=s[0],az=s[1],dx=s[2]-ax,dz=s[3]-az,t=clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(px-ax-t*dx,pz-az-t*dz)};
 const minPath=(x,z)=>Math.min(...paths.map(p=>dseg(x,z,p)));
 const gg=new THREE.PlaneGeometry(340,340,150,150);gg.rotateX(-Math.PI/2);gg.translate(0,0,-40);
 const pos=gg.attributes.position,cols=new Float32Array(pos.count*3);
 const cD=new THREE.Color(),cP=new THREE.Color(),cG=new THREE.Color(),cGr=new THREE.Color(),tmp=new THREE.Color();
 const gA=new Float32Array(pos.count),gpA=new Float32Array(pos.count),dA=new Float32Array(pos.count),fA=new Float32Array(pos.count);
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);dA[i]=minPath(x,z);
  const n=Math.sin(x*.31)*Math.cos(z*.27)+Math.sin(x*.13+z*.17)*.5;
  gA[i]=clamp((Math.hypot(x,z)-26)/55+n*.22,0,1);
  gpA[i]=clamp(Math.sin(x*.09+1)*Math.sin(z*.08)*1.4,0,1)*clamp((Math.hypot(x,z)-14)/30,0,1);
  fA[i]=clamp((Math.hypot(x,z)-8)/20,0,1)}
 gg.setAttribute('color',new THREE.BufferAttribute(cols,3));
 function paintGround(th){cD.setHex(th.g[0]);cP.setHex(th.g[1]);cG.setHex(th.g[2]);cGr.setHex(th.g[3]);
  for(let i=0;i<pos.count;i++){tmp.copy(cD).lerp(cG,gA[i]);tmp.lerp(cGr,clamp(gpA[i]+th.gb*fA[i],0,1)*.7);tmp.lerp(cP,clamp(1-(dA[i]-1.8)/2.4,0,1));cols[i*3]=tmp.r;cols[i*3+1]=tmp.g;cols[i*3+2]=tmp.b}
  gg.attributes.color.needsUpdate=true}
 const ground=new THREE.Mesh(gg,new THREE.MeshLambertMaterial({vertexColors:true}));ground.receiveShadow=true;scene.add(ground);

 /* ciel : soleil, halo, nuages */
 const sunB=new THREE.Mesh(new THREE.SphereGeometry(9,24,16),new THREE.MeshBasicMaterial({color:0xfff1b8,fog:false}));sunB.position.set(60,32,-190);scene.add(sunB);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc070,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));halo.scale.set(130,130,1);halo.position.copy(sunB.position);scene.add(halo);
 const clouds=[];
 for(let i=0;i<9;i++){const c=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:i%2?0xffb98a:0xf6d2c0,transparent:true,opacity:.55,depthWrite:false,fog:false}));
  c.scale.set(70+rnd()*60,16+rnd()*8,1);c.position.set(-180+i*45,70+rnd()*30,-200+rnd()*40);scene.add(c);clouds.push(c)}

 /* rivière, ponton, collines, chute */
 const wgeo=new THREE.PlaneGeometry(340,40,70,8);wgeo.rotateX(-Math.PI/2);
 const water=new THREE.Mesh(wgeo,new THREE.MeshLambertMaterial({color:0x3b87b0,emissive:0x1b5877}));water.position.set(0,.06,-82);scene.add(water);
 const wbase=Float32Array.from(wgeo.attributes.position.array);
 const glint=new THREE.Mesh(new THREE.PlaneGeometry(16,40),new THREE.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:.32,depthWrite:false}));glint.rotation.x=-Math.PI/2;glint.position.set(42,.1,-82);scene.add(glint);
 const pier=box(3,.25,9,M(0x8a5a30));pier.position.set(0,.22,-58);pier.receiveShadow=true;scene.add(pier);
 for(let pp=0;pp<6;pp++){const post=box(.25,1,.25,M(0x5d3a1e));post.position.set(pp%2?1.4:-1.4,.2,-54+Math.floor(pp/2)*-4);scene.add(post)}
 const hillM=M(0x84573a);
 [[-90,-150,40,26],[-40,-160,50,34],[70,-150,44,28],[120,-140,36,22],[-130,-120,34,20],[-170,-150,46,30]].forEach(h=>{const m=new THREE.Mesh(new THREE.ConeGeometry(h[2],h[3],9),hillM);m.position.set(h[0],h[3]/2,h[1]);scene.add(m)});
 const mesa=new THREE.Mesh(new THREE.CylinderGeometry(20,26,30,10),M(0x8d5c3b));mesa.position.set(30,15,-135);scene.add(mesa);
 const fall=new THREE.Mesh(new THREE.PlaneGeometry(4.5,20),new THREE.MeshBasicMaterial({color:0xeaf6ff,transparent:true,opacity:.85}));fall.position.set(22,19,-108);scene.add(fall);
 const mist=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:.6,depthWrite:false}));mist.scale.set(18,8,1);mist.position.set(22,9,-107);scene.add(mist);

 /* étiquettes */
 const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
 function labelTex(text){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');let fs=40;x.font='700 '+fs+'px Figtree,system-ui,sans-serif';while(x.measureText(text).width>470&&fs>18){fs-=2;x.font='700 '+fs+'px Figtree,system-ui,sans-serif'}
  const tw=x.measureText(text).width+36;x.fillStyle='rgba(8,24,48,.8)';rr(x,(512-tw)/2,12,tw,72,26);x.fill();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,50);return new THREE.CanvasTexture(c)}
 function label(text,w){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(text),transparent:true,depthTest:false,fog:false}));s.scale.set(w,w*96/512,1);s.renderOrder=10;return s}
 const setLabel=(s,text)=>{s.material.map.dispose();s.material.map=labelTex(text);s.material.needsUpdate=true};

 /* huttes */
 const wallM=[0,1,2].map(()=>M(0xb97b46)),roofM=[0,1,2].map(()=>M(0xd8a24f)),bandM=[0,1,2].map(()=>M(0x7a3b2a)),trimM=M(0xf0dfb8),doorM=M(0x3a2412);
 const HUTS=[],smokers=[];
 function hut(x,z,s,ry,name,smoke){
  const g=new THREE.Group(),i=Math.floor(rnd()*3),rg=new THREE.Group(),bgx=new THREE.Group();
  /* style rond : case à toit conique */
  const w=new THREE.Mesh(new THREE.CylinderGeometry(2.2*s,2.3*s,2.2*s,16),wallM[i]);w.position.y=1.1*s;rg.add(w);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(2.32*s,2.36*s,.32*s,16),bandM[i]);band.position.y=.5*s;rg.add(band);
  const band2=new THREE.Mesh(new THREE.CylinderGeometry(2.24*s,2.26*s,.18*s,16),trimM);band2.position.y=1.9*s;rg.add(band2);
  const r=new THREE.Mesh(new THREE.ConeGeometry(3.5*s,2.8*s,16),roofM[i]);r.position.y=3.6*s;rg.add(r);
  for(let k=1;k<=3;k++){const t=new THREE.Mesh(new THREE.TorusGeometry((3.5-k*.85)*s*.92,.07*s,6,24),M(0xb98234));t.rotation.x=Math.PI/2;t.position.y=(2.2+k*.62)*s;rg.add(t)}
  const tip=new THREE.Mesh(new THREE.SphereGeometry(.22*s,8,6),M(0x5d3a1e));tip.position.y=5.05*s;rg.add(tip);
  const dr=box(.95*s,1.6*s,.12,doorM);dr.position.set(0,.8*s,2.24*s);rg.add(dr);
  const df=box(1.2*s,1.85*s,.1,M(0x7a4a26));df.position.set(0,.92*s,2.2*s);rg.add(df);
  /* style cubique : maison à toit plat */
  const bb=box(4.9*s,2.7*s,4.5*s,wallM[i]);bb.position.y=1.35*s;bgx.add(bb);
  const sl=box(5.3*s,.35*s,4.9*s,roofM[i]);sl.position.y=2.88*s;bgx.add(sl);
  const tr=box(5.4*s,.14*s,5*s,trimM);tr.position.y=3.12*s;bgx.add(tr);
  const st=box(5.0*s,.28*s,4.6*s,bandM[i]);st.position.y=.3*s;bgx.add(st);
  const bd=box(1.05*s,1.75*s,.14,bandM[i]);bd.position.set(0,.88*s,2.3*s);bgx.add(bd);
  const bd2=box(.8*s,1.5*s,.1,doorM);bd2.position.set(0,.8*s,2.34*s);bgx.add(bd2);
  const wn=box(.8*s,.8*s,.1,doorM);wn.position.set(1.6*s,1.8*s,2.3*s);bgx.add(wn);const wn2=wn.clone();wn2.position.x=-1.6*s;bgx.add(wn2);
  const tw=box(1.5*s,1.1*s,1.5*s,wallM[i]);tw.position.set(-1.5*s,3.55*s,-1*s);bgx.add(tw);
  bgx.visible=false;g.add(rg,bgx);
  g.position.set(x,0,z);g.rotation.y=ry||0;shade(g,true);scene.add(g);addColl(x,z,2.6*s);HUTS.push({x,z,s,rg,bgx});
 if(name){const l=label(name,6.5);l.position.set(x,6.6*s,z);scene.add(l)}
  if(smoke)smokers.push({x:x+Math.sin(ry||0)*.5,z:z+Math.cos(ry||0)*.5,y:4.8*s})}
 [[-10,-32,1,1],[9,-35,1.1,0],[-38,-30,1,1],[40,-30,1,0],[-42,0,1,1],[44,16,1,0],[-32,30,1,0],[34,32,1,1],[-12,-48,.9,0],[18,-46,.9,0],[-48,-14,.9,0],[52,-8,.9,0]].forEach(h=>hut(h[0],h[1],h[2],rnd()*6,null,h[3]));
 hut(-24,-17,1.5,.3,'Maison des contes',1);
 const mur=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.9),new THREE.MeshLambertMaterial({map:patTex(1)}));mur.position.set(-24+Math.sin(.3)*3.45,1.9,-17+Math.cos(.3)*3.45);mur.rotation.y=.3;scene.add(mur);

 /* école */
 const school=new THREE.Group();const sb=box(9,3.2,5.5,M(0xd3b68c));sb.position.y=1.6;school.add(sb);
 const sr=new THREE.Mesh(new THREE.ConeGeometry(6.8,2.4,4),M(0x8f4b2b));sr.position.y=4.4;sr.rotation.y=Math.PI/4;school.add(sr);
 const sd=box(1.2,2.1,.1,M(0x3a2412));sd.position.set(0,1.05,2.78);school.add(sd);
 for(let k=0;k<3;k++){const wn=box(1,.9,.08,M(0x2b3a55));wn.position.set(-3+k*3+(k===1?0:0),2,2.78);if(k!==1)school.add(wn)}
 const stripe=box(9.1,.3,5.6,M(0xc0502c));stripe.position.y=.3;school.add(stripe);
 school.position.set(30,0,-26);shade(school,true);scene.add(school);[-3,0,3].forEach(o=>addColl(30+o,-26,2.8));
 const sl=label('École du village',6.5);sl.position.set(30,7.2,-26);scene.add(sl);
 const bc=document.createElement('canvas');bc.width=512;bc.height=300;const bx=bc.getContext('2d');const boardTex=new THREE.CanvasTexture(bc);
 function drawBoard(l1,l2,l3){bx.fillStyle='#1f3a2e';bx.fillRect(0,0,512,300);bx.strokeStyle='rgba(255,255,255,.85)';bx.lineWidth=3;bx.strokeRect(10,10,492,280);bx.fillStyle='#f4f1e6';bx.textAlign='center';bx.font='700 34px Figtree,sans-serif';bx.fillText(l1,256,90);bx.fillText(l2,256,150);bx.font='500 28px Figtree,sans-serif';bx.fillText(l3,256,215);boardTex.needsUpdate=true}
 const board=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.9),new THREE.MeshBasicMaterial({map:boardTex}));board.position.set(28.5,1.9,-17.4);scene.add(board);
 const bf=box(3.4,2.1,.1,M(0x5d3a1e));bf.position.set(28.5,1.9,-17.46);scene.add(bf);
 [27.5,30.5].forEach(lx=>{const lg=box(.1,1.8,.1,M(0x5d3a1e));lg.position.set(lx,.9,-17.5);scene.add(lg)});

 /* étal de Fatou + étals et objets */
 function stall(x,z,awCol,items){
  const st=new THREE.Group();const tb=box(3.6,.9,1.3,M(0x7a4a26));tb.position.y=.45;st.add(tb);
  const cl=box(3.7,.06,1.4,M(0xcf4b32));cl.position.y=.93;st.add(cl);
  [[-1.7,-.55],[1.7,-.55],[-1.7,.55],[1.7,.55]].forEach((p,i)=>{const po=box(.1,2.6,.1,M(0x5d3a1e));po.position.set(p[0],1.3,p[1]+(i<2?-.9:.4));st.add(po)});
  const aw=box(4.2,.08,2.2,M(awCol));aw.position.set(0,2.6,-.15);aw.rotation.x=.14;st.add(aw);
  for(let k=0;k<7;k++){const fl=box(.3,.35,.04,M(k%2?0xf4d35e:0x2f9e8f));fl.position.set(-1.9+k*.62,2.35,.95);st.add(fl)}
  items(st);st.position.set(x,0,z);shade(st,true);scene.add(st);[-1.2,0,1.2].forEach(o=>addColl(x+o,z,.9))}
 const fc=[0xd23b2a,0x6fae3c,0xf0a21e,0xe05a2a];
 stall(-22,8.6,0xe8892b,st=>{for(let b=0;b<4;b++){const bk=new THREE.Mesh(new THREE.CylinderGeometry(.3,.22,.25,10),M(0x9b6b34));bk.position.set(-1.3+b*.85,1.08,0);st.add(bk);
  for(let f=0;f<6;f++){const fr=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),M(fc[b]));fr.position.set(-1.3+b*.85+(rnd()-.5)*.35,1.28+rnd()*.06,(rnd()-.5)*.35);st.add(fr)}}});
 const jarGeo=new THREE.LatheGeometry([[0,0],[.22,0],[.32,.15],[.36,.32],[.3,.5],[.2,.58],[.22,.64],[.26,.66]].map(p=>new THREE.Vector2(p[0],p[1])),14);
 const jarMats=[M(0xb5532a),M(0xc9703a),M(0x9a4a2a)];
 function jar(x,y,z,s,mat){const j=new THREE.Mesh(jarGeo,mat||jarMats[Math.floor(rnd()*3)]);j.position.set(x,y,z);j.scale.setScalar(s);j.castShadow=true;scene.add(j);return j}
 stall(-8,25,0x3b8a8c,st=>{for(let k=0;k<5;k++){const j=jarGeo&&new THREE.Mesh(jarGeo,jarMats[k%3]);j.position.set(-1.4+k*.7,.95,0);j.scale.setScalar(.7);st.add(j)}});
 const fl2=label('Poteries',4);fl2.position.set(-8,4.2,25);scene.add(fl2);
 const fl=label('Cuisine traditionnelle',6.8);fl.position.set(-22,4.2,8.6);scene.add(fl);
 /* étal de tissus */
 [-32,-28].forEach(x=>{const po=box(.14,3,.14,M(0x5d3a1e));po.position.set(x,1.5,-2);po.castShadow=true;scene.add(po);addColl(x,-2,.3)});
 const rail=box(4.2,.1,.1,M(0x5d3a1e));rail.position.set(-30,3,-2);scene.add(rail);
 for(let k=0;k<6;k++){const cl=new THREE.Mesh(new THREE.PlaneGeometry(.62,2),new THREE.MeshLambertMaterial({map:patTex(k),side:THREE.DoubleSide}));cl.position.set(-31.6+k*.65,1.95,-2);cl.userData.sway=k;scene.add(cl);(R0.cloths=R0.cloths||[]).push(cl)}
 const tl=label('Tissus',3.4);tl.position.set(-30,4,-2);scene.add(tl);
 /* poteries au sol, paniers, mortier */
 [[-16,22],[20,24],[30,10],[-34,-22],[16,-34],[-4,-26]].forEach((p,i)=>{for(let k=0;k<3;k++)jar(p[0]+(k-1)*.9+rnd()*.3,0,p[1]+rnd()*.8,.9+rnd()*.5);addColl(p[0],p[1]+.3,1.6)});
 [[-26,12],[14,16],[-18,-26]].forEach(p=>{for(let k=0;k<2;k++){const ba=new THREE.Mesh(new THREE.CylinderGeometry(.45,.32,.4,12),M(0xa07a3a));ba.position.set(p[0]+k*.9,.2,p[1]);ba.castShadow=true;scene.add(ba);for(let f=0;f<5;f++){const fr=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),M(fc[(f+k)%4]));fr.position.set(p[0]+k*.9+(rnd()-.5)*.4,.42,p[1]+(rnd()-.5)*.4);scene.add(fr)}}});
 const mort=new THREE.Mesh(new THREE.CylinderGeometry(.3,.22,.6,10),M(0x7a5a38));mort.position.set(-27.5,.3,10.5);mort.castShadow=true;scene.add(mort);const pest=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.3,6),M(0x5d3a1e));pest.position.set(-27.4,.9,10.5);pest.rotation.z=.15;scene.add(pest);
 /* greniers */
 [[36,22],[-44,-12],[-26,40]].forEach(p=>{const g=new THREE.Group();for(let k=0;k<4;k++){const lg=box(.2,1,.2,M(0x5d3a1e));lg.position.set(k%2?.9:-.9,.5,k<2?.9:-.9);g.add(lg)}
  const bd=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.2,1.6,12),M(0xc89a5a));bd.position.y=1.8;g.add(bd);const rf=new THREE.Mesh(new THREE.ConeGeometry(1.8,1.3,12),M(0xd8a24f));rf.position.y=3.25;g.add(rf);
  g.position.set(p[0],0,p[1]);shade(g,true);scene.add(g);addColl(p[0],p[1],1.5)});

 /* feu de camp */
 const fire=new THREE.Group();for(let k=0;k<6;k++){const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.25),M(0x6a6a66));st.position.set(Math.cos(k*1.05)*.8,.12,Math.sin(k*1.05)*.8);fire.add(st)}
 for(let k=0;k<3;k++){const lg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1.1,6),M(0x4a2e1a));lg.position.y=.2;lg.rotation.z=1.2;lg.rotation.y=k*2.1;fire.add(lg)}
 const flame=new THREE.Mesh(new THREE.ConeGeometry(.32,.9,8),new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.9}));flame.position.y=.6;fire.add(flame);
 const flame2=new THREE.Mesh(new THREE.ConeGeometry(.18,.6,8),new THREE.MeshBasicMaterial({color:0xfff0a0}));flame2.position.y=.5;fire.add(flame2);
 const fireLight=new THREE.PointLight(0xff8a30,1.4,16);fireLight.position.y=1.2;fire.add(fireLight);
 fire.position.set(-12,0,-1);scene.add(fire);addColl(-12,-1,1);
 for(let k=0;k<4;k++){const lg=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,1.6,8),M(0x6a4526));lg.rotation.z=Math.PI/2;lg.rotation.y=k*1.57+.4;lg.position.set(-12+Math.cos(k*1.57+.4)*2.1,.22,-1-Math.sin(k*1.57+.4)*2.1);lg.castShadow=true;scene.add(lg)}
 smokers.push({x:-12,z:-1,y:1.2});

 /* arbres : baobab, palmiers, acacias, bananiers */
 const FL={baobab:new THREE.Group(),palm:new THREE.Group(),banana:new THREE.Group(),acacia:new THREE.Group()};Object.values(FL).forEach(g=>scene.add(g));
 const bao=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(1.5,2.5,8,12),M(0x8a6a4a));tr.position.y=4;bao.add(tr);
 for(let c=0;c<8;c++){const cn=new THREE.Mesh(new THREE.IcosahedronGeometry(3+rnd()*1.5,1),M(0x5f8a2c));const a=c/8*6.28;cn.position.set(Math.cos(a)*3.6,9+rnd()*2,Math.sin(a)*3.6);cn.scale.y=.6;bao.add(cn)}
 const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(4.6,1),M(0x6a9a32));cr.position.y=10.6;cr.scale.y=.6;bao.add(cr);
 for(let br=0;br<5;br++){const bm=box(.5,5,.5,M(0x7a5a3a));bm.position.set(Math.cos(br*1.3)*1.6,8,Math.sin(br*1.3)*1.6);bm.rotation.z=Math.cos(br*1.3)*.7;bm.rotation.x=-Math.sin(br*1.3)*.7;bao.add(bm)}
 bao.position.set(13,0,-9);shade(bao,true);bao.userData.inter={type:'tree',name:'Baobab',re:/^arbre/i,h:9};FL.baobab.add(bao);addColl(13,-9,2.7,FL.baobab);
 function palm(x,z,h,grp){const g=new THREE.Group();const lean=(rnd()-.5)*.5;let px=0,py=0;
  for(let k=0;k<7;k++){const seg=new THREE.Mesh(new THREE.CylinderGeometry(.17-k*.012,.2-k*.012,h/7+.05,7),M(0x7a5a38));px+=lean*h/7*.35;py=k*h/7+h/14;seg.position.set(px,py,0);seg.rotation.z=-lean*.35;g.add(seg)}
  for(let f=0;f<9;f++){const fr=new THREE.Mesh(new THREE.ConeGeometry(.28,3.4,4),M(f%2?0x4f8a2a:0x5f9a32));fr.scale.z=.25;fr.position.set(px,h,0);fr.rotation.y=f/9*6.28;fr.rotateZ(Math.PI/2+.35);fr.translateY(1.7);g.add(fr)}
  const nut=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),M(0x5a3a1e));nut.position.set(px,h-.2,.2);g.add(nut);
  g.position.set(x,0,z);g.scale.setScalar(.9+rnd()*.35);shade(g);g.userData.inter={type:'tree',name:'Palmier',re:/^arbre/i,h:h};const G=grp||FL.palm;G.add(g);addColl(x,z,.4,G)}
 [[-30,-54],[-18,-56],[14,-54],[26,-52],[40,-50],[-46,-48],[-52,10],[52,0],[50,-20],[-50,-24],[36,38],[-40,40]].forEach(p=>palm(p[0],p[1],6+rnd()*3));
 function banana(x,z){const g=new THREE.Group();for(let k=0;k<6;k++){const lf=new THREE.Mesh(new THREE.PlaneGeometry(.7,2.6),new THREE.MeshLambertMaterial({color:k%2?0x4f9a30:0x5aa838,side:THREE.DoubleSide}));lf.position.y=1.7;lf.rotation.y=k*1.05;lf.rotateX(-.7);lf.translateY(.9);g.add(lf)}
  const tk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,1.8,6),M(0x8aa04a));tk.position.y=.9;g.add(tk);g.position.set(x,0,z);shade(g);g.userData.inter={type:'tree',name:'Bananier',re:/^arbre/i,h:3};FL.banana.add(g);addColl(x,z,.4,FL.banana)}
 [[-34,16],[-36,20],[46,28],[48,24],[-20,-40],[-33,-38]].forEach(p=>banana(p[0],p[1]));
 const specials=[[-5,-24],[4,-44],[38,36],[-19,-10],[-22,6],[24,1],[24,-17],[0,0],[0,-55],[13,-9],[30,-26],[-24,-17],[-22,8.6],[-12,-1],[-30,-2],[-8,25]];
 let placed=0,tries=0;
 while(placed<22&&tries<400){tries++;const tx=(rnd()-.5)*130,tz=-52+rnd()*92;
  if(Math.hypot(tx,tz)<12)continue;let bad=false;
  specials.forEach(s=>{if(Math.hypot(tx-s[0],tz-s[1])<9)bad=true});HUTS.forEach(h=>{if(Math.hypot(tx-h.x,tz-h.z)<8)bad=true});COLL.forEach(c=>{if(Math.hypot(tx-c.x,tz-c.z)<c.r+3)bad=true});
  if(bad||minPath(tx,tz)<4)continue;
  const ac=new THREE.Group();const st=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,3.6,6),M(0x6b4a2a));st.position.y=1.8;ac.add(st);
  const ca=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2,.8,9),M(0x6f8f2e));ca.position.y=4;ac.add(ca);
  const cb=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.4,.6,9),M(0x7da036));cb.position.y=4.6;ac.add(cb);
  ac.position.set(tx,0,tz);ac.scale.setScalar(.8+rnd()*.5);shade(ac);ac.userData.inter={type:'tree',name:'Acacia',re:/^arbre/i,h:4.5};FL.acacia.add(ac);addColl(tx,tz,.5,FL.acacia);placed++}

 /* herbe, fleurs, cailloux (instanciés) */

 const mt=new THREE.Matrix4(),tcol=new THREE.Color();
 /* herbe, buissons, roseaux : vent dans le vertex shader, et la végétation s’écarte quand on passe */
 const WU={t:{value:0},p:{value:new V(0,0,9999)}};
 function windMat(col,hh){const m=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uT=WU.t;sh.uniforms.uP=WU.p;
   sh.vertexShader='uniform float uT;uniform vec3 uP;\n'+sh.vertexShader.replace('#include <begin_vertex>',['vec3 transformed=vec3(position);','vec4 wp4=instanceMatrix*vec4(0.,0.,0.,1.);','float hgt=clamp(position.y/'+hh.toFixed(2)+',0.,1.);','float wv=sin(uT*1.7+wp4.x*.35+wp4.z*.27)*.14+sin(uT*3.1+wp4.x*.9)*.04;','vec2 dP=wp4.xz-uP.xz;float dd=length(dP);float pu=1.-smoothstep(0.,2.4,dd);','vec2 aw=dd>.001?dP/dd:vec2(0.);','transformed.x+=(wv+aw.x*pu*1.1)*hgt*hgt;','transformed.z+=(wv*.6+aw.y*pu*1.1)*hgt*hgt;'].join('\n'))};
  m.customProgramCacheKey=()=>'wind'+hh;return m}
 const tuftGeo=(()=>{const pa=[],na=[];for(let k=0;k<5;k++){const c=new THREE.ConeGeometry(.04,.5+k%2*.12,3,1,true).translate(0,.25,0);c.rotateZ(.22+k*.05);c.rotateY(k*1.3);const g2=c.toNonIndexed();pa.push(...g2.attributes.position.array);na.push(...g2.attributes.normal.array)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pa,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(na,3));return g})();
 const GN=3200,grassM=windMat(0x7f9a3a,.6),grass=new THREE.InstancedMesh(tuftGeo,grassM,GN);
 for(let q=0;q<GN;q++){let gx=(rnd()-.5)*170,gz=-60+rnd()*112;
  if(minPath(gx,gz)<2.2||HUTS.some(h=>Math.hypot(gx-h.x,gz-h.z)<3.3*h.s)){gx=0;gz=500}
  mt.makeRotationY(rnd()*6.28);mt.setPosition(gx,0,gz);mt.multiply(new THREE.Matrix4().makeScale(1.3+rnd()*.9,.8+rnd()*1.1,1.3+rnd()*.9));
  mt.elements[12]=gx;mt.elements[13]=0;mt.elements[14]=gz;grass.setMatrixAt(q,mt);tcol.setScalar(.7+rnd()*.5);grass.setColorAt(q,tcol)}
 grass.frustumCulled=false;scene.add(grass);
 const BN=110,bushM=M(0x4f7a2a),bushes=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.9,0),bushM,BN);
 for(let q=0;q<BN;q++){let bx2=(rnd()-.5)*150,bz2=-58+rnd()*100;const sc2=.35+rnd()*.45;
  if(minPath(bx2,bz2)<3||Math.hypot(bx2,bz2)<10||HUTS.some(h=>Math.hypot(bx2-h.x,bz2-h.z)<4.2*h.s)){bx2=0;bz2=500}
  mt.makeRotationY(rnd()*6.28);mt.multiply(new THREE.Matrix4().makeScale(sc2*1.3,sc2*.8,sc2*1.3));mt.elements[12]=bx2;mt.elements[13]=.4*sc2;mt.elements[14]=bz2;bushes.setMatrixAt(q,mt);tcol.setScalar(.75+rnd()*.4);bushes.setColorAt(q,tcol)}
 bushes.frustumCulled=false;bushes.castShadow=true;scene.add(bushes);
 const RN=220,reedM=windMat(0x7a9a3a,1.6),reeds=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.05,1.6,4).translate(0,.8,0),reedM,RN);
 for(let q=0;q<RN;q++){let rx2=(rnd()-.5)*146;if(Math.abs(rx2)<3.4)rx2+=7;mt.makeScale(1,.6+rnd()*.9,1);mt.elements[12]=rx2;mt.elements[13]=0;mt.elements[14]=-63.5+rnd()*4.5;reeds.setMatrixAt(q,mt);tcol.setScalar(.75+rnd()*.5);reeds.setColorAt(q,tcol)}
 reeds.frustumCulled=false;scene.add(reeds);
 const NF=320,flw=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,5),new THREE.MeshLambertMaterial(),NF);const fcols=[0xff6fa8,0xffd23f,0xff7a3d,0xffffff,0xb06cff].map(c=>new THREE.Color(c));
 for(let q=0;q<NF;q++){let gx=(rnd()-.5)*150,gz=-56+rnd()*100;if(minPath(gx,gz)<3)gx+=36;mt.makeTranslation(gx,.5,gz);flw.setMatrixAt(q,mt);flw.setColorAt(q,fcols[q%5])}
 flw.instanceMatrix.needsUpdate=true;if(flw.instanceColor)flw.instanceColor.needsUpdate=true;scene.add(flw);
 const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5),M(0x8a7a6a),60);
 for(let q=0;q<60;q++){const rx=(rnd()-.5)*140,rz=q<30?-60+rnd()*4:-50+rnd()*90;if(minPath(rx,rz)<3||Math.hypot(rx,rz)<14){mt.makeTranslation(0,-5,0)}else{mt.makeTranslation(rx,.15,rz);mt.multiply(new THREE.Matrix4().makeScale(.5+rnd()*1.6,.4+rnd()*.8,.5+rnd()*1.6))}rocks.setMatrixAt(q,mt)}
 rocks.castShadow=true;rocks.frustumCulled=false;flw.frustumCulled=false;scene.add(rocks);

 /* panneau directionnel + guirlandes + lanternes */
 const sp=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,4.8,8),M(0x6b4a2a));pole.position.y=2.4;sp.add(pole);
 [['Maison des contes',4.1,-.12],['Cuisine traditionnelle',3.4,.1],['École du village',2.7,-.08],['Rivière',2.0,.12]].forEach(b=>{
  const c2=document.createElement('canvas');c2.width=512;c2.height=96;const x2=c2.getContext('2d');x2.fillStyle='#9a6b3a';x2.fillRect(0,0,512,96);
  x2.strokeStyle='rgba(60,35,15,.5)';x2.lineWidth=4;x2.strokeRect(3,3,506,90);x2.fillStyle='#fdf2dc';x2.font='700 42px Figtree,system-ui,sans-serif';x2.textAlign='center';x2.textBaseline='middle';x2.fillText(b[0],256,50);
  const wm=M(0x7a4f28),bm2=new THREE.Mesh(new THREE.BoxGeometry(3.4,.6,.12),[wm,wm,wm,wm,new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c2)}),wm]);bm2.position.set(0,b[1],.1);bm2.rotation.y=b[2];sp.add(bm2)});
 shade(sp);scene.add(sp);addColl(0,0,.6);
 const ring0=new THREE.Mesh(new THREE.TorusGeometry(1.3,.06,8,40),new THREE.MeshBasicMaterial({color:0x38b6ff,transparent:true,opacity:.85,fog:false}));ring0.rotation.x=Math.PI/2;ring0.position.set(0,.08,0);scene.add(ring0);
 const bpos=[[-10,-7],[10,-7],[10,11],[-10,11]];
 bpos.forEach(p=>{const po=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,3.6,6),M(0x6b4a2a));po.position.set(p[0],1.8,p[1]);po.castShadow=true;scene.add(po);addColl(p[0],p[1],.3);
  const lan=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshBasicMaterial({color:0xffc060,fog:false}));lan.position.set(p[0],3.5,p[1]);scene.add(lan);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffa840,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl.scale.set(2.6,2.6,1);gl.position.copy(lan.position);scene.add(gl)});
 const bv=[],bcl=[],fcl=[new THREE.Color(0xe8a317),new THREE.Color(0xd4513b),new THREE.Color(0x2f9e8f),new THREE.Color(0x3b8bd9),new THREE.Color(0xf4efe4),new THREE.Color(0x7a2e65)];
 const bl=[];
 for(let s=0;s<4;s++){const a=bpos[s],b=bpos[(s+1)%4],pts=[];
  for(let k=0;k<=28;k++){const t=k/28;pts.push(new V(a[0]+(b[0]-a[0])*t,3.45-Math.sin(t*Math.PI)*.8,a[1]+(b[1]-a[1])*t))}
  bl.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x5d3a1e})));
  for(let k=1;k<28;k+=2){const p0=pts[k],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,c=fcl[(k+s)%6],w=.34;
   bv.push(p0.x-ux*w,p0.y,p0.z-uz*w,p0.x+ux*w,p0.y,p0.z+uz*w,p0.x,p0.y-.55,p0.z);for(let q=0;q<3;q++)bcl.push(c.r,c.g,c.b)}}
 bl.forEach(l=>scene.add(l));
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bv,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(bcl,3));bg.computeVertexNormals();
 scene.add(new THREE.Mesh(bg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})));

 /* personnages */

 function avatarHead(head,o){
  const hc=M(o.hairCol),hs=o.hs,hat=o.hat;
  const dome=(r,col,y)=>{const d=new THREE.Mesh(new THREE.SphereGeometry(r,16,10,0,6.283,0,1.35),col);d.position.y=y;head.add(d);return d};
  if(hs==='court')dome(.225,hc,.02);
  else if(hs==='afro'){const af=new THREE.Mesh(new THREE.SphereGeometry(.27,14,10),hc);af.position.set(0,.07,-.03);head.add(af)}
  else if(hs==='tresses'){dome(.225,hc,.02);for(let k=0;k<11;k++){const a=-1.2+k*.24+Math.PI,bx=Math.sin(a)*.2,bz=Math.cos(a)*.2;const br=new THREE.Mesh(new THREE.CylinderGeometry(.022,.016,.55,5),hc);br.position.set(Math.sin(k*.57)*.2,-.24,-Math.abs(Math.cos(k*.57))*.15-.1);head.add(br)}}
  else if(hs==='chignon'){dome(.225,hc,.02);const bun=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),hc);bun.position.set(0,.27,-.08);head.add(bun)}
  else if(hs==='longs'){dome(.228,hc,.02);const lg=box(.42,.6,.14,hc);lg.position.set(0,-.22,-.15);head.add(lg)}
  if(hat==='bonnet'){dome(.24,M(o.hatCol),.05);const pp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),M(o.hatCol));pp.position.y=.3;head.add(pp)}
  else if(hat==='paille'){const br=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.03,18),M(0xd8b45a));br.position.y=.17;head.add(br);const cr=new THREE.Mesh(new THREE.CylinderGeometry(.2,.23,.2,14),M(0xc9a244));cr.position.y=.27;head.add(cr);const bd=new THREE.Mesh(new THREE.CylinderGeometry(.235,.235,.05,14),M(o.hatCol));bd.position.y=.2;head.add(bd)}
  else if(hat==='foulard'){const wr=dome(.245,M(o.hatCol),.04);const kn=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),M(o.hatCol));kn.position.set(.08,.24,-.02);head.add(kn)}
  else if(hat==='casquette'){dome(.235,M(o.hatCol),.04);const bm=box(.28,.03,.22,M(o.hatCol));bm.position.set(0,.13,.26);head.add(bm)}
  if(o.glasses){[-1,1].forEach(sd=>{const gl=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,6,12),M(0x1a1a1a));gl.position.set(sd*.075,.03,.2);head.add(gl)});const br=box(.05,.012,.012,M(0x1a1a1a));br.position.set(0,.04,.205);head.add(br)}
  if(o.beard){const bd=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8,0,6.283,1.5,1.2),hc);bd.position.set(0,-.07,.04);head.add(bd)}
  if(o.fem){[-1,1].forEach(sd=>{const lash=box(.06,.012,.012,M(0x111111));lash.position.set(sd*.075,.06,.2);head.add(lash)});const lp=box(.075,.02,.012,M(0xa23a46));lp.position.set(0,-.09,.2);head.add(lp)}}
 function person(o,s){
  const g=new THREE.Group(),skin=M(o.skin),top=M(o.top),bot=M(o.bottom||0x333333),shoe=M(o.shoe||0x2a1e16),gold=new THREE.MeshLambertMaterial({color:0xf2c14e,emissive:0x6a4a10});
  const leg=x=>{const L=new THREE.Group();L.position.set(x,.88,0);const m=box(.2,.8,.22,o.skirt||o.boubou?skin:bot);m.position.y=-.4;L.add(m);const f=box(.23,.1,.36,shoe);f.position.set(0,-.84,.06);L.add(f);return L};
  const legL=leg(-.14),legR=leg(.14);g.add(legL,legR);
  const torMat=o.shirt?M(o.top):top;
  const tor=new THREE.Mesh(new THREE.CylinderGeometry(.26,.29,.74,12),torMat);tor.scale.z=.62;if(o.hs!==undefined)tor.scale.x=o.fem?.88:1.1;tor.position.y=1.25;g.add(tor);
  if(o.pack){const strap=box(.07,.6,.34,M(0x1c1c1c));strap.position.set(-.14,1.28,0);g.add(strap);const st2=strap.clone();st2.position.x=.14;g.add(st2)}
  const shx=o.hs!==undefined?(o.fem?.27:.32):.3;[-1,1].forEach(sd=>{const sh=new THREE.Mesh(new THREE.SphereGeometry(.105,8,6),o.sleeve||o.boubou||o.shirt?top:skin);sh.position.set(sd*shx,1.55,0);g.add(sh)});
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.12,8),skin);neck.position.y=1.66;g.add(neck);
  const arm=x=>{const A=new THREE.Group();A.position.set(x,1.55,0);const m=box(.14,.62,.15,o.sleeve||o.boubou||o.shirt?top:skin);m.position.y=-.3;A.add(m);const h=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),skin);h.position.y=-.66;A.add(h);A.rotation.z=x<0?.06:-.06;return A};
  const ax=o.hs!==undefined?(o.fem?.34:.39):.37;const armL=arm(-ax),armR=arm(ax);g.add(armL,armR);
  if(o.skirt){const mat=o.pat!==undefined?new THREE.MeshLambertMaterial({map:patTex(o.pat)}):bot;const sk2=new THREE.Mesh(new THREE.CylinderGeometry(.3,.5,.95,18),mat);sk2.position.y=.6;g.add(sk2);
   const ba=new THREE.Mesh(new THREE.TorusGeometry(.3,.03,6,18),M(o.top));ba.rotation.x=Math.PI/2;ba.position.y=1.02;g.add(ba)}
  if(o.boubou){const tu=new THREE.Mesh(new THREE.CylinderGeometry(.3,.46,1.1,16),M(o.boubou));tu.position.y=.85;g.add(tu);const tm=new THREE.Mesh(new THREE.TorusGeometry(.46,.035,6,20),gold);tm.rotation.x=Math.PI/2;tm.position.y=.31;g.add(tm);
   const em=box(.18,.5,.03,gold);em.position.set(0,1.2,.2);g.add(em)}
  const head=new THREE.Group();head.position.y=1.82;g.add(head);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.21,16,12),skin);hd.scale.y=1.1;head.add(hd);
  [-1,1].forEach(sd=>{const ea=new THREE.Mesh(new THREE.SphereGeometry(.04,6,5),skin);ea.position.set(sd*.205,-.02,0);head.add(ea);
   const ew=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));ew.position.set(sd*.075,.03,.185);head.add(ew);
   const ep=new THREE.Mesh(new THREE.SphereGeometry(.018,6,5),new THREE.MeshBasicMaterial({color:0x111111}));ep.position.set(sd*.075,.03,.208);head.add(ep);
   const br=box(.08,.014,.02,M(0x1a1410));br.position.set(sd*.075,.09,.195);head.add(br);
   if(o.jewel){const er=new THREE.Mesh(new THREE.SphereGeometry(.03,6,5),gold);er.position.set(sd*.21,-.1,0);head.add(er)}});
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.03,6,5),skin);nose.position.set(0,-.02,.21);head.add(nose);
  const mo=box(.07,.014,.01,M(0x5a1f1a));mo.position.set(0,-.09,.2);head.add(mo);
  if(o.hs!==undefined){avatarHead(head,o)}
  else if(o.wrap){const wr=new THREE.Mesh(new THREE.SphereGeometry(.235,16,10,0,6.283,0,1.5),o.pat!==undefined?new THREE.MeshLambertMaterial({map:patTex((o.pat+2)%5)}):M(o.wrap));wr.position.y=.03;head.add(wr);
   const kn=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),M(o.wrap));kn.position.set(.07,.25,-.02);head.add(kn);const kn2=kn.clone();kn2.position.set(-.08,.22,-.02);kn2.scale.setScalar(.8);head.add(kn2)}
  else if(o.cap){const cp=new THREE.Mesh(new THREE.CylinderGeometry(.19,.22,.16,14),M(o.cap));cp.position.y=.2;head.add(cp)}
  else if(o.afro){const af=new THREE.Mesh(new THREE.SphereGeometry(.26,12,10),M(o.hair||0x111111));af.position.set(0,.07,-.03);head.add(af)}
  else{const hr=new THREE.Mesh(new THREE.SphereGeometry(.225,14,8,0,6.283,0,1.35),M(o.hair||0x151515));hr.position.y=.02;head.add(hr)}
  if(o.old){const gh=new THREE.Mesh(new THREE.SphereGeometry(.225,14,8,0,6.283,0,1.0),new THREE.MeshLambertMaterial({color:0xd8d8d8}));gh.position.set(0,.04,-.06);head.add(gh)}
  if(o.jewel){const nk=new THREE.Mesh(new THREE.TorusGeometry(.14,.018,6,18),gold);nk.rotation.x=Math.PI/2+.3;nk.position.y=1.6;g.add(nk)}
  if(o.pack){const pk=box(.42,.58,.22,M(o.pack));pk.position.set(0,1.28,-.26);g.add(pk);const pt=box(.3,.2,.06,M(0x38b6ff));pt.position.set(0,1.18,-.38);g.add(pt)}
  if(o.hood){const hdd=new THREE.Mesh(new THREE.TorusGeometry(.17,.07,6,12),top);hdd.position.set(0,1.64,-.08);hdd.rotation.x=Math.PI/2.4;g.add(hdd)}
  if(o.staff){const stf=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,1.9,6),M(0x5d3a1e));stf.position.set(.46,.95,.1);g.add(stf);const knb=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),gold);knb.position.set(.46,1.92,.1);g.add(knb)}
  const blob=new THREE.Mesh(new THREE.CircleGeometry(.55,16),new THREE.MeshBasicMaterial({color:0x1a0f08,transparent:true,opacity:.28,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.02;blob.renderOrder=1;g.add(blob);
  g.scale.setScalar(s||1);shade(g);g.userData={legL,legR,armL,armR,head,blob};return g};
 const walkAnim=(g,ph,amp)=>{const u=g.userData;u.legL.rotation.x=Math.sin(ph)*.75*amp;u.legR.rotation.x=-Math.sin(ph)*.75*amp;u.armL.rotation.x=-Math.sin(ph)*.6*amp;u.armR.rotation.x=Math.sin(ph)*.6*amp};

 const player=person(avOpts(),1);scene.add(player);
 const remote=new Map();
 function syncRemote(list){const seen=new Set();list.forEach(q=>{seen.add(q.id);let e=remote.get(q.id);
   if(!e){const g=person(ONL.remoteOpts(q.av),1),tag=label(q.name,2.6);tag.position.set(0,2.6,0);g.add(tag);scene.add(g);e={g,tag};remote.set(q.id,e)}
   e.g.position.set(q.x,0,q.z);e.g.rotation.y=q.h;walkAnim(e.g,q.ph,q.moving?1:0)});
  remote.forEach((e,id)=>{if(!seen.has(id)){scene.remove(e.g);e.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});remote.delete(id)}})}
 function addTag(g){if(g.userData.tag){g.remove(g.userData.tag);g.userData.tag.material.map.dispose();g.userData.tag.material.dispose();g.userData.tag=null}const n=heroName();if(n){const s=label(n,2.6);s.position.set(0,2.6,0);g.add(s);g.userData.tag=s}}
 addTag(player);

 const ringMat=new THREE.MeshBasicMaterial({color:0x38b6ff,transparent:true,opacity:.8,fog:false});
 const rings=[ring0],labels={};
 NPC_DATA.forEach(d=>{
  const g=person(d.kind,1);g.position.set(d.pos[0],0,d.pos[1]);scene.add(g);
  d.g=g;d.p=new V(d.pos[0],0,d.pos[1]);d.r=4.8;addColl(d.pos[0],d.pos[1],.5);
  const lb=label(lang().names[d.id],4.4);lb.position.set(d.pos[0],2.75,d.pos[1]);scene.add(lb);labels[d.id]=lb;
  const rg=new THREE.Mesh(new THREE.TorusGeometry(.85,.05,8,32),ringMat);rg.rotation.x=Math.PI/2;rg.position.set(d.pos[0],.08,d.pos[1]);scene.add(rg);rings.push(rg);
  if(d.kind.drum){const dm=new THREE.Mesh(new THREE.CylinderGeometry(.33,.26,.85,12),M(0x7a4426));dm.position.set(d.pos[0],.55,d.pos[1]+.55);dm.castShadow=true;scene.add(dm);
   const dt=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.04,12),M(0xe8d9b8));dt.position.set(d.pos[0],.98,d.pos[1]+.55);scene.add(dt);addColl(d.pos[0],d.pos[1]+.55,.5);
   d.g.userData.armL.rotation.x=-.9;d.g.userData.armR.rotation.x=-.9}
  if(d.id==='hist'){const mat=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,.04,18),M(0xb5532a));mat.position.set(d.pos[0],.03,d.pos[1]);scene.add(mat);const mat2=new THREE.Mesh(new THREE.TorusGeometry(1.1,.04,6,22),M(0xf2d98a));mat2.rotation.x=Math.PI/2;mat2.position.set(d.pos[0],.06,d.pos[1]);scene.add(mat2)}
  if(d.id==='awa'){const bn=box(2.4,.4,.7,M(0x6b4a2a));bn.position.set(-16.2,.25,-9);bn.rotation.y=.5;shade(bn,true);scene.add(bn)}
 });
 SPOTS.forEach(s=>{s.p=new V(s.pos[0],0,s.pos[1]);const rg=new THREE.Mesh(new THREE.TorusGeometry(1.3,.06,8,32),ringMat);rg.rotation.x=Math.PI/2;rg.position.set(s.pos[0],.5,s.pos[1]);scene.add(rg);rings.push(rg)});

 /* villageois, poule, vaches, pirogues */
 const WAND=[];
 const wander=(o,pts,sp,s)=>{const g=person(o,s);g.position.set(pts[0][0],0,pts[0][1]);scene.add(g);WAND.push({g,pts,i:1,sp,ph:Math.random()*6})};
 wander({skin:0x5a3a28,top:0x2e8b6a,bottom:0x6a3b8a,skirt:1,pat:2,wrap:0xd4513b,jewel:1},[[-12,14],[-4,4],[8,4],[14,16],[2,24],[-10,20]],1.5,1);
 wander({skin:0x4f3426,top:0x3a6ea5,bottom:0x7a5a2a,boubou:0x3a6ea5,cap:0xf4efe4},[[-14,-4],[-6,-14],[8,-20],[16,-8],[6,6]],1.6,1);
 wander({skin:0x5a3a28,top:0xe0a020,bottom:0x2f7a5a,skirt:1,pat:3,wrap:0x3a6ea5,pack:0x7a3b2a,jewel:1},[[18,20],[26,12],[16,8],[8,14]],1.4,1);
 wander({skin:0x4a2f22,top:0xd9462c,bottom:0x2b3a55,sleeve:true,hair:0x111111},[[6,12],[10,18],[4,22],[2,16]],2.6,.55);
 wander({skin:0x5a3a28,top:0x3a9a6a,bottom:0x2b3a55,sleeve:true,afro:1,hair:0x111111},[[-6,10],[-2,16],[-8,20],[-10,14]],2.4,.5);
 wander({skin:0x4f3426,top:0xb5532a,bottom:0x3a2a55,boubou:0xb5532a,cap:0x2f9e8f},[[-30,20],[-20,28],[-34,34],[-40,24]],1.3,1);
 const ch=(()=>{const g=new THREE.Group();const bd=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),M(0xf4efe4));bd.scale.set(1,.85,1.3);bd.position.y=.3;g.add(bd);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),M(0xf4efe4));hd.position.set(0,.55,.25);g.add(hd);const cm=box(.04,.08,.08,M(0xcf2a2a));cm.position.set(0,.65,.25);g.add(cm);
  const bk=box(.04,.04,.1,M(0xe0a020));bk.position.set(0,.53,.36);g.add(bk);shade(g);return g})();
 ch.position.set(12,0,9);scene.add(ch);WAND.push({g:ch,pts:[[12,9],[15,11],[17,8],[13,6]],i:1,sp:.9,ph:0,chick:true});
 [[38,-9,.3],[42,-4,2.5],[36,-3,4]].forEach(c=>{const cw=new THREE.Group();const cc=c[2]>2?0xf0e8d8:0x6a3f26;const bd=box(1.7,.95,.7,M(cc));bd.position.y=1.1;cw.add(bd);
  const hd=box(.45,.45,.55,M(cc));hd.position.set(1.05,1.3,0);cw.add(hd);[-1,1].forEach(sd=>{const ho=new THREE.Mesh(new THREE.ConeGeometry(.05,.3,5),M(0xe8dcc0));ho.position.set(1.05,1.65,sd*.18);cw.add(ho)});
  [[-.7,-.25],[-.7,.25],[.7,-.25],[.7,.25]].forEach(l=>{const lg=box(.16,.7,.16,M(0x3a2a1e));lg.position.set(l[0],.35,l[1]);cw.add(lg)});
  cw.position.set(c[0],0,c[1]);cw.rotation.y=c[2];shade(cw);scene.add(cw);addColl(c[0],c[1],1)});
 for(let f2=0;f2<7;f2++){const fp=box(.12,1,.12,M(0x5d3a1e));fp.position.set(32+f2*2.1,.5,-12);scene.add(fp)}
 const frl=box(14,.08,.08,M(0x5d3a1e));frl.position.set(38.4,.9,-12);scene.add(frl);
 const boats=[];[[-20,-64.5,.1],[22,-66,-.12]].forEach(b=>{const bg2=new THREE.Group();const hl=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M(0x7a4a26));hl.scale.set(3.2,.45,.8);hl.position.y=.2;bg2.add(hl);
  const ins=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M(0x3d2614));ins.scale.set(2.9,.3,.55);ins.position.y=.38;bg2.add(ins);
  const oar=box(2.2,.06,.06,M(0x5d3a1e));oar.position.set(0,.7,.2);oar.rotation.z=.4;bg2.add(oar);
  bg2.position.set(b[0],.05,b[1]);bg2.rotation.y=b[2];shade(bg2);scene.add(bg2);boats.push(bg2)});

 /* oiseaux, papillons, lucioles, fumée */
 const birds=[];for(let i=0;i<7;i++){const g=new THREE.Group();const bd=new THREE.Mesh(new THREE.ConeGeometry(.12,.5,4),new THREE.MeshBasicMaterial({color:0x2a2a30}));bd.rotation.x=Math.PI/2;g.add(bd);
  const wm=new THREE.MeshBasicMaterial({color:0x2a2a30,side:THREE.DoubleSide}),w1=new THREE.Mesh(new THREE.PlaneGeometry(.7,.28),wm),w2=w1.clone();w1.position.x=-.38;w2.position.x=.38;const p1=new THREE.Group(),p2=new THREE.Group();p1.add(w1);p2.add(w2);g.add(p1,p2);
  scene.add(g);birds.push({g,p1,p2,cx:-20+rnd()*60,cz:-50+rnd()*40,r:12+rnd()*18,h:14+rnd()*10,sp:.12+rnd()*.12,a:rnd()*6})}
 const flies=[];for(let i=0;i<9;i++){const g=new THREE.Group();const wm=new THREE.MeshBasicMaterial({color:[0xffd23f,0xff7a3d,0xffffff][i%3],side:THREE.DoubleSide}),a=new THREE.Mesh(new THREE.PlaneGeometry(.22,.18),wm),b=a.clone();a.position.x=-.11;b.position.x=.11;const pa=new THREE.Group(),pb=new THREE.Group();pa.add(a);pb.add(b);g.add(pa,pb);scene.add(g);flies.push({g,pa,pb,cx:-30+rnd()*60,cz:-20+rnd()*50,r:2+rnd()*3,a:rnd()*6,sp:.6+rnd()*.6})}
 const NFF=140,ffg=new THREE.BufferGeometry(),ffp=new Float32Array(NFF*3),ffb=[];
 for(let i=0;i<NFF;i++){const x=(rnd()-.5)*90,y=.5+rnd()*3,z=-40+rnd()*80;ffp[i*3]=x;ffp[i*3+1]=y;ffp[i*3+2]=z;ffb.push([x,y,z,rnd()*6])}
 ffg.setAttribute('position',new THREE.BufferAttribute(ffp,3));
 const ffs=new THREE.Points(ffg,new THREE.PointsMaterial({map:glowTex,color:0xffd27a,size:.55,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));scene.add(ffs);
 const puffs=[];smokers.forEach(s=>{for(let k=0;k<5;k++){const sp2=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xcfc3b4,transparent:true,opacity:0,depthWrite:false}));scene.add(sp2);puffs.push({sp:sp2,s,age:k*1.6,life:8})}});

 /* objets à ramasser */
 const PICK_DEF=[['poisson',-6,18],['poisson',16,-26],['riz',10,12],['riz',-30,-8],['eau',-14,-26],['eau',34,6],['viande',4,-22],['viande',-4,32]];
 function pickModel(t){const g=new THREE.Group();
  if(t==='poisson'){const b=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),M(0x9fc4d8,{emissive:0x203848}));b.scale.set(1.7,.7,.5);g.add(b);const tl=new THREE.Mesh(new THREE.ConeGeometry(.2,.4,4),M(0x7fa4b8));tl.rotation.z=Math.PI/2;tl.position.x=-.62;g.add(tl);const ey=new THREE.Mesh(new THREE.SphereGeometry(.04,6,5),new THREE.MeshBasicMaterial({color:0x111111}));ey.position.set(.35,.06,.14);g.add(ey)}
  else if(t==='riz'){const s=new THREE.Mesh(new THREE.CylinderGeometry(.24,.3,.56,10),M(0xeee0c0,{emissive:0x3a3020}));g.add(s);const tp=new THREE.Mesh(new THREE.ConeGeometry(.22,.22,10),M(0xeee0c0,{emissive:0x3a3020}));tp.position.y=.38;g.add(tp);const bd=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,6,12),M(0xc0502c));bd.rotation.x=Math.PI/2;bd.position.y=.27;g.add(bd)}
  else if(t==='eau'){const j=new THREE.Mesh(jarGeo,M(0xc9703a,{emissive:0x3a1a0a}));j.scale.setScalar(.8);j.position.y=-.25;g.add(j);const w=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.02,10),new THREE.MeshBasicMaterial({color:0x6fcaff}));w.position.y=.27;g.add(w)}
  else{const m=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),M(0xb5473a,{emissive:0x3a1210}));m.scale.set(1.2,.9,.9);g.add(m);const bn=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.55,6),M(0xf4efe4));bn.rotation.z=Math.PI/2;bn.position.x=.5;g.add(bn);[-1,1].forEach(sd=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),M(0xf4efe4));e.position.set(.78,0,sd*.05);g.add(e)})}
  return g}
 const picks=PICK_DEF.map((p,i)=>{const g=new THREE.Group();const m=pickModel(p[0]);g.add(m);g.position.set(p[1],.9,p[2]);const rg=new THREE.Mesh(new THREE.TorusGeometry(.7,.05,8,28),ringMat);rg.rotation.x=Math.PI/2;rg.position.y=-.8;g.add(rg);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x66ccff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl.scale.set(2.2,2.2,1);g.add(gl);
  shade(m);scene.add(g);return {t:p[0],i,g,m,x:p[1],z:p[2],got:false}});
 const syncPickups=()=>{const pk=D().picked;picks.forEach(p=>{p.got=!!pk[p.i];p.g.visible=!p.got})};
 pickTarget=()=>{const d=D();let best=null,bd=1e9;picks.forEach(p=>{if(p.got||d.got[p.t])return;const dd=Math.hypot(P.x-p.x,P.z-p.z);if(dd<bd){bd=dd;best=p}});return best?{x:best.x,z:best.z}:null};

 /* balise de quête */
 const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,40,16,1,true),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,fog:false}));beacon.visible=false;scene.add(beacon);
 const bring=new THREE.Mesh(new THREE.TorusGeometry(1.2,.08,8,32),new THREE.MeshBasicMaterial({color:0xffb347,fog:false}));bring.rotation.x=Math.PI/2;bring.visible=false;scene.add(bring);

 /* ====== décors par région, végétation, animaux, interactions ====== */
 const isVis=o=>{while(o){if(!o.visible)return false;o=o.parent}return true};
 const TX={nord:new THREE.Group(),est:new THREE.Group(),centrale:new THREE.Group(),australe:new THREE.Group()};Object.values(TX).forEach(g=>scene.add(g));
 const freeSpot=(r,minR)=>{for(let k=0;k<80;k++){const tx=(rnd()-.5)*140,tz=-56+rnd()*96;if(Math.hypot(tx,tz)<(minR||10))continue;let bad=false;
  specials.forEach(sp=>{if(Math.hypot(tx-sp[0],tz-sp[1])<8)bad=true});HUTS.forEach(h=>{if(Math.hypot(tx-h.x,tz-h.z)<6)bad=true});COLL.forEach(c=>{if(Math.hypot(tx-c.x,tz-c.z)<c.r+r)bad=true});
  if(bad||minPath(tx,tz)<3.5)continue;return [tx,tz]}return null};
 const SHAKERS=[];
 const reg=(g,inter)=>{g.userData.inter=inter;return g};
 /* --- Nord : dunes, oasis, palmiers-dattiers, colonnes, tour de pierre, pyramides lointaines --- */
 {const sandM=M(0xe0bb7a),G=TX.nord;
  [[-95,-70,34],[95,-60,40],[-100,10,30],[100,20,34],[-80,-110,44],[70,-125,50],[-105,-30,26],[110,-20,28]].forEach(d=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,18,10),sandM);m.scale.set(d[2],d[2]*.22,d[2]*.8);m.position.set(d[0],0,d[1]);m.rotation.y=d[0]*.03;G.add(m)});
  [[-62,-130,26],[-20,-150,38],[34,-140,20]].forEach(d=>{const m=new THREE.Mesh(new THREE.ConeGeometry(d[2],d[2]*.62,4),M(0xd5b072));m.position.set(d[0],d[2]*.31,d[1]);m.rotation.y=.78;G.add(m)});
  for(let k=0;k<16;k++){const sp2=freeSpot(1.5,12);if(sp2)palm(sp2[0],sp2[1],5.5+rnd()*3,G)}
  const cm=M(0xd8c39a);for(let k=0;k<5;k++){const cl=new THREE.Mesh(new THREE.CylinderGeometry(.55,.65,6,12),cm);cl.position.set(36+k*3.4,3,-44);G.add(cl);const cp=box(1.5,.4,1.5,cm);cp.position.set(36+k*3.4,6.2,-44);G.add(cp);addColl(36+k*3.4,-44,.8,G)}
  const arch=box(18,.8,1.8,cm);arch.position.set(43,6.8,-44);G.add(arch);
  const tw=new THREE.Group();const tb=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3,11,4),M(0xd2b07a));tb.position.y=5.5;tb.rotation.y=.78;tw.add(tb);for(let k=0;k<4;k++){const cr=box(1,1,1,M(0xd2b07a));cr.position.set(Math.cos(k*1.57+.78)*2.3,11.5,Math.sin(k*1.57+.78)*2.3);tw.add(cr)}
  const gate=box(1.3,2.4,.1,doorM);gate.position.set(0,1.2,2.2);tw.add(gate);tw.position.set(-54,0,-24);G.add(tw);addColl(-54,-24,3.4,G);
  const pool=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.1,24),new THREE.MeshLambertMaterial({color:0x2fb0b8,emissive:0x0e5a66}));pool.position.set(-46,.07,-38);G.add(pool);
  shade(G)}
 /* --- Est : montagne enneigée, acacias parasols, termitières, girafes --- */
 {const G=TX.est;
  const kb=new THREE.Mesh(new THREE.ConeGeometry(52,74,14),M(0x8a7a66));kb.position.set(-70,37,-185);G.add(kb);const kc=new THREE.Mesh(new THREE.ConeGeometry(13.6,19,14),new THREE.MeshLambertMaterial({color:0xf4f8ff,emissive:0x303840}));kc.position.set(-70,64.5,-185);G.add(kc);
  for(let k=0;k<20;k++){const sp2=freeSpot(2,14);if(!sp2)continue;const ac=new THREE.Group();const stm=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,4.4,6),M(0x6b4a2a));stm.position.y=2.2;ac.add(stm);const ca=new THREE.Mesh(new THREE.CylinderGeometry(3.6,2.6,.7,10),M(0x7a8f34));ca.position.y=4.6;ac.add(ca);const cb=new THREE.Mesh(new THREE.CylinderGeometry(2.4,1.8,.5,10),M(0x8aa03c));cb.position.y=5.1;ac.add(cb);
   ac.position.set(sp2[0],0,sp2[1]);ac.scale.setScalar(.8+rnd()*.5);shade(ac);reg(ac,{type:'tree',name:'Acacia',re:/^arbre/i,h:5});G.add(ac);addColl(sp2[0],sp2[1],.5,G)}
  for(let k=0;k<7;k++){const sp2=freeSpot(1.5,16);if(!sp2)continue;const tm=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.4,8),M(0xa86a3c));tm.position.set(sp2[0],1.2,sp2[1]);tm.scale.set(1,1+rnd()*.8,1);G.add(tm);addColl(sp2[0],sp2[1],1,G)}
  shade(G)}
 /* --- Centrale : forêt dense, fougères, brume --- */
 const mists=[];
 {const G=TX.centrale,trM=[M(0x6a5a46),M(0x5a4a38)],lvM=[M(0x2a6a2c),M(0x347a30),M(0x1f5a28)];
  for(let k=0;k<64;k++){const sp2=freeSpot(2.5,k<30?24:14);if(!sp2)continue;const h=7+rnd()*7,tr=new THREE.Group();const tk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.7,h,7),trM[k%2]);tk.position.y=h/2;tr.add(tk);
   for(let c=0;c<3;c++){const cn=new THREE.Mesh(new THREE.IcosahedronGeometry(2.6-c*.4,1),lvM[(k+c)%3]);cn.position.set((rnd()-.5)*2,h-.5+c*1.3,(rnd()-.5)*2);cn.scale.y=.7;tr.add(cn)}
   tr.position.set(sp2[0],0,sp2[1]);tr.scale.setScalar(.9+rnd()*.4);shade(tr);reg(tr,{type:'tree',name:'Arbre de la forêt',re:/^arbre/i,h:h});G.add(tr);addColl(sp2[0],sp2[1],.7,G)}
  const FN=60,ferns=new THREE.InstancedMesh(new THREE.ConeGeometry(.2,2.2,3).translate(0,1.1,0),M(0x3f8a3a),FN*6);let fi=0;
  for(let k=0;k<FN;k++){const sp2=freeSpot(1,8);if(!sp2){for(let j=0;j<6;j++){mt.makeScale(0,0,0);ferns.setMatrixAt(fi++,mt)}continue}
   for(let j=0;j<6;j++){const ang=j/6*6.28,m2=new THREE.Matrix4().makeRotationY(ang).multiply(new THREE.Matrix4().makeRotationZ(1.05+rnd()*.2));m2.setPosition(sp2[0],0,sp2[1]);ferns.setMatrixAt(fi++,m2)}}
  ferns.frustumCulled=false;G.add(ferns);
  for(let k=0;k<7;k++){const ms=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xe8f4e0,transparent:true,opacity:.28,depthWrite:false}));ms.scale.set(42,9,1);ms.position.set(-60+k*20,3.5+rnd()*2,-40+rnd()*60);G.add(ms);mists.push(ms)}
 }
 /* --- Australe : rochers (kopjes), aloès, montagne à sommet plat, enceinte de pierre --- */
 {const G=TX.australe,rk=[M(0x8a7a6a),M(0xa08a72),M(0x7a6a5a)];
  for(let k=0;k<9;k++){const sp2=freeSpot(4,16);if(!sp2)continue;const gp2=new THREE.Group();const n=3+Math.floor(rnd()*3);for(let j=0;j<n;j++){const r=1.5+rnd()*2,m=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),rk[j%3]);m.position.set((rnd()-.5)*4,r*.7+j*1.1,(rnd()-.5)*4);m.rotation.set(rnd()*3,rnd()*3,rnd()*3);m.scale.y=.85;gp2.add(m)}
   gp2.position.set(sp2[0],0,sp2[1]);shade(gp2);G.add(gp2);addColl(sp2[0],sp2[1],3.2,G)}
  for(let k=0;k<26;k++){const sp2=freeSpot(1.2,10);if(!sp2)continue;const al=new THREE.Group();const tk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,1.2,6),M(0x6a5a40));tk.position.y=.6;al.add(tk);
   for(let j=0;j<8;j++){const lf=new THREE.Mesh(new THREE.ConeGeometry(.16,1.5,4),M(j%2?0x5a8a4a:0x6a9a52));lf.position.y=1.2;lf.rotation.y=j/8*6.28;lf.rotateZ(.9);lf.translateY(.7);al.add(lf)}
   if(k%3===0){const fl=new THREE.Mesh(new THREE.ConeGeometry(.16,1.1,6),M(0xe8452a));fl.position.y=2.3;al.add(fl)}
   al.position.set(sp2[0],0,sp2[1]);al.scale.setScalar(.8+rnd()*.7);shade(al);G.add(al);addColl(sp2[0],sp2[1],.5,G)}
  const tm=new THREE.Mesh(new THREE.CylinderGeometry(60,76,46,18),M(0x7a6a56));tm.position.set(-20,23,-178);G.add(tm);
  const tcl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:.7,depthWrite:false}));tcl.scale.set(150,20,1);tcl.position.set(-20,50,-170);G.add(tcl);
  const wm=M(0x9a8a72);for(let k=0;k<22;k++){const a=.25+k/22*4.6,wx=-58+Math.cos(a)*9.5,wz=-47+Math.sin(a)*9.5,b=box(2.1,2.6+Math.sin(k)*.3,1.5,wm);b.position.set(wx,1.3,wz);b.rotation.y=-a;G.add(b);addColl(wx,wz,1,G)}
  const tw=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.4,6.2,14),wm);tw.position.set(-58,3.1,-47);G.add(tw);addColl(-58,-47,2.4,G);
  shade(G)}
 /* --- Animaux : s’enfuient quand on approche --- */
 const ANIM=[];
 function quad(o){const g=new THREE.Group(),m=M(o.col),dk=M(o.dark||0x3a2a1e),sc=o.sc||1,ll=o.ll||.7;
  const bd=box(1.5*sc,.7*sc,.55*sc,m);bd.position.y=(ll+.35)*sc;g.add(bd);
  const nk=box(.28*sc,(o.neck||.5)*sc,.28*sc,m);nk.position.set(.75*sc,(ll+.35+(o.neck||.5)/2)*sc,0);nk.rotation.z=-.35;g.add(nk);
  const hd=box(.5*sc,.3*sc,.3*sc,m);hd.position.set(.95*sc+(o.neck||.5)*.1*sc,(ll+.35+(o.neck||.5))*sc,0);g.add(hd);
  [[.2,.3],[.2,-.3],[-.2,.3],[-.2,-.3]].forEach((l,i)=>{const lg=box(.13*sc,ll*sc,.13*sc,dk);lg.position.set((i<2?.6:-.6)*sc,ll*sc/2,l[1]*sc);g.add(lg)});
  if(o.horns){[-1,1].forEach(sd=>{const h=new THREE.Mesh(new THREE.ConeGeometry(.04*sc,.4*sc,5),M(0xe8dcc0));h.position.set(1.05*sc,(ll+.35+(o.neck||.5)+.25)*sc,sd*.1*sc);g.add(h)})}
  const tl=box(.06*sc,.3*sc,.06*sc,dk);tl.position.set(-.78*sc,(ll+.45)*sc,0);g.add(tl);
  shade(g);g.userData.head=hd;return g}
 const ANIM_DEF=[
  {th:['ouest','nord','centrale','australe'],o:{col:0xc9b8a0,dark:0x4a3a2a,sc:.7,ll:.55,horns:1},pts:[[-17,25],[-13,27],[-20,28]],sp:4.6},
  {th:['est','australe','nord'],o:{col:0xc9965a,dark:0x5a3a22,sc:.95,ll:.9,horns:1,neck:.5},pts:[[28,26],[31,29],[26,31]],sp:7.5},
  {th:['est'],o:{col:0xe0b050,dark:0x8a5a2a,sc:1.25,ll:2.1,neck:2.6},pts:[[-40,-22],[-36,-17]],sp:3.2}];
 ANIM_DEF.forEach(d=>d.pts.forEach(pt=>{const g=quad(d.o);g.position.set(pt[0],0,pt[1]);g.rotation.y=rnd()*6;scene.add(g);ANIM.push({g,home:pt,th:d.th,sp:d.sp,ph:rnd()*6,mode:0,t:0})}));
 /* --- Oiseaux posés : s’envolent quand on s’approche --- */
 const PERCH=[];
 function mkPerchBird(col){const g=new THREE.Group();const bd=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),M(col));bd.scale.set(1,.85,1.3);bd.position.y=.16;g.add(bd);const hd=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),M(col));hd.position.set(0,.3,.17);g.add(hd);
  const bk=box(.03,.03,.07,M(0xe0a020));bk.position.set(0,.3,.27);g.add(bk);const tl=box(.07,.03,.2,M(col));tl.position.set(0,.18,-.28);g.add(tl);
  const wm=M(0x2a2a30);const p1=new THREE.Group(),p2=new THREE.Group();[p1,p2].forEach((p,i)=>{const w=box(.3,.02,.18,wm);w.position.x=i?.17:-.17;p.add(w);p.position.set(0,.22,0);g.add(p)});g.userData={p1,p2};return g}
 [[-26,30,0,'ouest','nord','centrale','est','australe'],[39,-12,1,'ouest','nord','centrale','est','australe'],[13,9.2,-9,'ouest','est','australe']].forEach((f,fi)=>{for(let k=0;k<5;k++){const g=mkPerchBird([0x6a4a3a,0x3a4a6a,0xa0502a,0x2a6a5a,0x5a5a5a][k]);const hx=f[0]+(k-2)*.7,hz=(fi===1?-12:fi===2?-9:f[1])+(k%2)*.5,hy=fi===1?1.05:fi===2?10.8:0;g.position.set(hx,hy,hz);g.rotation.y=rnd()*6;scene.add(g);PERCH.push({g,home:[hx,hy,hz],th:f.slice(3),mode:0,t:0,dir:[0,0],fl:fi})}});
 /* --- Feuilles qui tombent quand on secoue un arbre --- */
 const LEAVES=[];const leafM=new THREE.MeshBasicMaterial({color:0x6fae3c,side:THREE.DoubleSide});for(let k=0;k<26;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.22,.12),leafM);m.visible=false;scene.add(m);LEAVES.push({m,t:9,vx:0,vz:0,ph:0})}
 /* --- Puits, champ, poissons --- */
 const well=new THREE.Group();{const rk2=M(0x9a8a78);const ring=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.25,.95,16),rk2);ring.position.y=.48;well.add(ring);const wt=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.06,16),new THREE.MeshLambertMaterial({color:0x2a6a8a,emissive:0x0a2a3a}));wt.position.y=.92;well.add(wt);
  [-1,1].forEach(sd=>{const po=box(.14,2.4,.14,M(0x5d3a1e));po.position.set(sd*1.1,1.6,0);well.add(po)});const bm=box(2.5,.14,.14,M(0x5d3a1e));bm.position.y=2.8;well.add(bm);
  const bucket=new THREE.Mesh(new THREE.CylinderGeometry(.22,.17,.3,10),M(0x7a4a26));bucket.position.set(0,1.9,0);well.add(bucket);const rope=box(.025,1,.025,M(0xc9b080));rope.position.set(0,2.35,0);well.add(rope);well.userData={bucket,rope};
  well.position.set(-5,0,-24);shade(well,true);scene.add(well);addColl(-5,-24,1.5);reg(well,{type:'well',name:'le puits',re:/^eau\b/i,key:1,msg:'Le seau remonte, plein d’eau fraîche.'})}
 const fieldG=new THREE.Group();{const soil=box(14,.12,9,M(0x6a4a2a));soil.position.y=.06;fieldG.add(soil);const CN=60,crops=new THREE.InstancedMesh(new THREE.ConeGeometry(.2,1,4).translate(0,.5,0),windMat(0x5aa838,1),CN);
  for(let k=0;k<CN;k++){mt.makeScale(1,.8+rnd()*.6,1);mt.elements[12]=-6+(k%12)*1.1;mt.elements[13]=.1;mt.elements[14]=-3.6+Math.floor(k/12)*1.8;crops.setMatrixAt(k,mt)}crops.frustumCulled=false;fieldG.add(crops);fieldG.userData.crops=crops;
  fieldG.position.set(52,0,34);scene.add(fieldG);reg(fieldG,{type:'field',name:'le champ',re:/^champ/i,key:1,nr:8,msg:'Tu arroses les cultures : elles se redressent.'})}
 const fish=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),M(0xcfe4f0,{emissive:0x305060}));fish.scale.set(1.8,.7,.6);fish.visible=false;scene.add(fish);const fishS={t:-3,x:0,z:-80};
 const splash=new THREE.Mesh(new THREE.TorusGeometry(.5,.04,6,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));splash.rotation.x=Math.PI/2;splash.visible=false;scene.add(splash);
 reg(fire,{type:'fire',name:'le feu',re:/^feu/i,key:1,msg:'Le feu crépite et monte.'});
 reg(mort,{type:'mortar',name:'le mortier',key:1,msg:'On pile le grain : toc, toc, toc.'});reg(pest,{type:'mortar',name:'le mortier',key:1,msg:'On pile le grain : toc, toc, toc.'});
 const INTER_ROOTS=[well,fieldG,fire,mort,pest];
 /* sails sur les pirogues (nord et est) */
 const sails=boats.map(b=>{const sg=new THREE.Group();const ms=box(.07,3.2,.07,M(0x5d3a1e));ms.position.y=1.8;sg.add(ms);const sl=new THREE.Mesh(new THREE.ConeGeometry(1.3,3,3),new THREE.MeshLambertMaterial({color:0xf4efe0,side:THREE.DoubleSide}));sl.scale.z=.05;sl.position.set(.1,1.9,0);sl.rotation.y=Math.PI/2;sg.add(sl);sg.visible=false;b.add(sg);return sg});

 /* ====== thèmes ====== */
 const THEMES={
  ouest:{sky:['#1f3c75','#6a78ae','#f0a064','#ffd593'],fog:[0xeaa86a,60,240],hemi:[0xffd9a8,0x7a5330,1],sun:[0xffc27a,.95],disc:[0xfff1b8,0xffc070],g:[0xb47a42,0xdba66a,0x8f8a3d,0x6f8f35],gb:.45,grass:0x7f9a3a,bush:0x4f7a2a,reed:0x7a9a3a,hill:0x84573a,mesa:0x8d5c3b,water:[0x3b87b0,0x1b5877],hut:{box:0,w:[0xb97b46,0xc98d52,0xa86d3c],r:[0xd8a24f,0xcf9a45,0xe0ad5d],b:[0xd9b46a,0x7a3b2a,0x2f6f6a]},flora:['baobab','palm','banana','acacia'],mini:['#8f8a3d','#3b87b0'],boat:0x7a4a26,sail:0,fall:1},
  nord:{sky:['#2a6fb0','#7fb5df','#f6d9a2','#fbe9c0'],fog:[0xf0d9a8,70,250],hemi:[0xfff0cc,0xb08850,.78],sun:[0xfff0c8,.8],disc:[0xfffbe0,0xfff0b0],g:[0xc4a066,0xdcc088,0xcfb272,0x889650],gb:.18,grass:0xb0a850,bush:0x7a8a3a,reed:0x9aa84a,hill:0xe0bb7a,mesa:0xd0a868,water:[0x2fb0b8,0x147a88],hut:{box:1,w:[0xe3c48f,0xd8b27a,0xcfa56a],r:[0xc99a5a,0xbf8f50,0xd2a465],b:[0x2a7ab0,0x8a4a2a,0x2f8a7a]},flora:[],mini:['#d9bb80','#2fb0b8'],boat:0xc9a25a,sail:1,fall:0},
  est:{sky:['#2b64b8','#7fa8dc','#f2b97a','#ffe3b0'],fog:[0xf2c995,65,250],hemi:[0xffe6b8,0x8a6a3a,.85],sun:[0xffd08a,.85],disc:[0xfff3c0,0xffd090],g:[0xb98540,0xd6ad6c,0xb59c3e,0x7a923a],gb:.2,grass:0xcaa23e,bush:0x6a8a30,reed:0x9aaa40,hill:0xa88a58,mesa:0x9a7a4a,water:[0x2a9ab0,0x14687c],hut:{box:1,w:[0xf3ead8,0xeadfc6,0xe0d2b4],r:[0xa84a2a,0xb85a30,0x8a3a24],b:[0x1f7aa0,0x8a2a2a,0x2a8a6a]},flora:['baobab','palm','banana','acacia'],mini:['#c9b04a','#2a9ab0'],boat:0xe8dcc0,sail:1,fall:1},
  centrale:{sky:['#26455f','#5e8a98','#a9c8a8','#d7e6c4'],fog:[0x9fc2a0,35,175],hemi:[0xe0f0d0,0x3a5a30,.95],sun:[0xfff2c8,.7],disc:[0xfff6d0,0xd8f0c0],g:[0x6a4a2e,0xa8845a,0x3f6a2a,0x2a6a26],gb:.75,grass:0x3f8a2e,bush:0x2f6a28,reed:0x4a8a3a,hill:0x2f5a30,mesa:0x35603a,water:[0x3a6a4a,0x1a3a2a],hut:{box:0,w:[0x9a6a3e,0x8a5a32,0x7a4a2a],r:[0x7a7a3a,0x6a6a30,0x8a8a44],b:[0x5a3a22,0x7a3b2a,0x2f6f4a]},flora:['palm','banana'],mini:['#3f6a2a','#3a6a4a'],boat:0x5a3a22,sail:0,fall:1},
  australe:{sky:['#1a4fa0','#5f9ee0','#f4d29a','#fff0cf'],fog:[0xf6dfb8,90,270],hemi:[0xfff0d8,0x8a5a3a,.85],sun:[0xfff0cc,.85],disc:[0xfff8e0,0xffe6a8],g:[0xb8603a,0xdca070,0xb59a52,0x6a8c3a],gb:.3,grass:0xa09a42,bush:0x5a7a30,reed:0x8a9a40,hill:0x7a6a4a,mesa:0x7a6a56,water:[0x2a7ab0,0x145a88],hut:{box:0,w:[0xc9b79a,0xbfa98a,0xd8c8a8],r:[0xcaa860,0xbf9a50,0xd6b66e],b:[0xc0392b,0x2a6fb0,0xe0b020]},flora:['baobab','acacia'],mini:['#b59a52','#2a7ab0'],boat:0x7a4a26,sail:0,fall:1}};
 let TH=THEMES.ouest,curThemeId='ouest';
 function applyTheme(id){
  const th=THEMES[id]||THEMES.ouest;TH=th;curThemeId=THEMES[id]?id:'ouest';
  paintGround(th);setSky(th.sky);scene.fog.color.setHex(th.fog[0]);scene.fog.near=th.fog[1];scene.fog.far=th.fog[2];
  hemi.color.setHex(th.hemi[0]);hemi.groundColor.setHex(th.hemi[1]);hemi.intensity=th.hemi[2];sun.color.setHex(th.sun[0]);sun.intensity=th.sun[1];
  sunB.material.color.setHex(th.disc[0]);halo.material.color.setHex(th.disc[1]);
  grassM.color.setHex(th.grass);bushM.color.setHex(th.bush);reedM.color.setHex(th.reed);hillM.color.setHex(th.hill);mesa.material.color.setHex(th.mesa);
  water.material.color.setHex(th.water[0]);water.material.emissive.setHex(th.water[1]);fall.visible=!!th.fall;mist.visible=!!th.fall;
  for(let i=0;i<3;i++){wallM[i].color.setHex(th.hut.w[i]);roofM[i].color.setHex(th.hut.r[i]);bandM[i].color.setHex(th.hut.b[i])}
  HUTS.forEach(h=>{h.rg.visible=!th.hut.box;h.bgx.visible=!!th.hut.box});
  Object.keys(FL).forEach(k=>{FL[k].visible=th.flora.indexOf(k)>-1});
  Object.keys(TX).forEach(k=>{TX[k].visible=(k===id)});
  boats.forEach((b,i)=>{b.children[0].material.color.setHex(th.boat);sails[i].visible=!!th.sail});
  ANIM.forEach(a=>{a.g.visible=a.th.indexOf(id)>-1;a.g.position.set(a.home[0],0,a.home[1]);a.mode=0});
  PERCH.forEach(b=>{b.g.visible=b.th.indexOf(id)>-1&&(b.fl!==2||FL.baobab.visible);b.g.position.set(b.home[0],b.home[1],b.home[2]);b.mode=0;b.g.userData.p1.rotation.z=1.3;b.g.userData.p2.rotation.z=-1.3});
  fireLight.color.setHex(id==='nord'?0xffb060:0xff8a30);
  R&&(R.th=th)}
 /* --- interactions --- */
 let fireK=1,wellT=0,mortT=0,fieldT=0;
 function findInter(o){while(o){if(o.userData&&o.userData.inter)return o;o=o.parent}return null}
 const interObj=new WeakMap();
 function nearInter(px,pz){let best=null,bd=99;INTER_ROOTS.forEach(r=>{if(!isVis(r))return;const d=Math.hypot(px-r.position.x,pz-r.position.z),lim=r.userData.inter.nr||3.6;if(d<lim&&d<bd){bd=d;let o=interObj.get(r);if(!o){o={inter:true,root:r,name:r.userData.inter.name,r:0};interObj.set(r,o)}best=o}});return best}
 function triggerInter(root){
  const it=root.userData.inter,wp=new V();root.getWorldPosition(wp);
  if(Math.hypot(P.x-wp.x,P.z-wp.z)>12){toast('Rapproche-toi : '+it.name);return}
  let msg=it.msg||'';
  if(it.type==='tree'){root.userData.shake=1.6;if(SHAKERS.indexOf(root)<0)SHAKERS.push(root);let n=0;for(const lf of LEAVES){if(lf.t>=2.6&&n<9){lf.t=0;lf.vx=(Math.random()-.5)*1.6;lf.vz=(Math.random()-.5)*1.6;lf.ph=Math.random()*6;lf.m.position.set(wp.x+(Math.random()-.5)*2,(it.h||5)*.9,wp.z+(Math.random()-.5)*2);lf.m.visible=true;n++}}msg='Tu secoues '+(it.name==='Acacia'?'l’acacia':'l’arbre')+' : des feuilles tombent.'}
  else if(it.type==='well')wellT=3;else if(it.type==='mortar')mortT=3;else if(it.type==='fire')fireK=2.1;else if(it.type==='field')fieldT=2.4;
  const wi=it.re?frWord(it.re):-1;
  if(wi>=0){const w=lang().W[wi];const d=D();if(!d.learned[wi]){d.learned[wi]=1;save();check()}msg=(msg?msg+' ':'')+w.wo+' : '+w.fr.toLowerCase();say(w.wo)}
  toast(msg||it.name)}
 function tick(dt,t){
  WU.t.value=t;WU.p.value.set(P.x,0,P.z);
  for(let i=SHAKERS.length-1;i>=0;i--){const c=SHAKERS[i];c.userData.shake-=dt;if(c.userData.shake<=0){c.rotation.z=0;c.rotation.x=0;SHAKERS.splice(i,1)}else{const k=c.userData.shake/1.6;c.rotation.z=Math.sin(t*26)*.05*k;c.rotation.x=Math.cos(t*22)*.03*k}}
  LEAVES.forEach(lf=>{if(lf.t<2.6){lf.t+=dt;lf.m.position.y-=dt*1.5;lf.m.position.x+=lf.vx*dt+Math.sin(t*3+lf.ph)*.01;lf.m.position.z+=lf.vz*dt;lf.m.rotation.set(t*3+lf.ph,t*2,t);if(lf.t>=2.6||lf.m.position.y<.05)lf.m.visible=false}});
  /* puits, mortier, champ, feu */
  if(wellT>0){wellT-=dt;const u=Math.max(0,wellT)/3,by=1.9-Math.sin((1-u)*Math.PI)*1.2;well.userData.bucket.position.y=by;well.userData.rope.scale.y=Math.max(.2,(2.8-by)/1);well.userData.rope.position.y=2.8-(2.8-by)/2+.1}
  if(mortT>0){mortT-=dt;pest.position.y=.9+Math.abs(Math.sin(t*9))*.35}else pest.position.y=.9;
  if(fieldT>0){fieldT-=dt;fieldG.userData.crops.scale.y=1+Math.sin(Math.min(1,fieldT/2.4)*Math.PI)*.4}else fieldG.userData.crops.scale.y=1;
  fireK+=(1-fireK)*Math.min(1,dt*1.6);R.fireK=fireK;
  /* animaux */
  ANIM.forEach(a=>{if(!a.g.visible)return;const dx=a.g.position.x-P.x,dz=a.g.position.z-P.z,d=Math.hypot(dx,dz);
   if(d<7.5){a.mode=1;a.t=0}
   if(a.mode===1){const l=d||1;a.g.position.x+=dx/l*a.sp*dt;a.g.position.z+=dz/l*a.sp*dt;let da=Math.atan2(-dz,dx)-a.g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));a.g.rotation.y+=da*Math.min(1,dt*6);
    a.g.position.y=Math.abs(Math.sin(t*10+a.ph))*.12;if(d>16)a.mode=2}
   else if(a.mode===2){const hx=a.home[0]-a.g.position.x,hz=a.home[1]-a.g.position.z,hd=Math.hypot(hx,hz);if(hd<.6){a.mode=0}else{a.g.position.x+=hx/hd*1.4*dt;a.g.position.z+=hz/hd*1.4*dt;a.g.rotation.y=Math.atan2(-hz,hx);a.g.position.y=0}}
   else{a.g.position.y=0;const hd=a.g.userData.head;if(hd)hd.rotation.z=Math.sin(t*.8+a.ph)*.25}});
  /* oiseaux posés */
  PERCH.forEach(b=>{if(!b.g.visible)return;const u=b.g.userData,dx=b.g.position.x-P.x,dz=b.g.position.z-P.z,d=Math.hypot(dx,dz);
   if(b.mode===0){if(d<6.5){b.mode=1;b.t=0;const l=d||1;b.dir=[dx/l+(Math.random()-.5)*.8,dz/l+(Math.random()-.5)*.8]}}
   else if(b.mode===1){b.t+=dt;b.g.position.x+=b.dir[0]*5*dt;b.g.position.z+=b.dir[1]*5*dt;b.g.position.y+=(b.t<2?3.2:-.2)*dt;const f=Math.sin(t*26)*.8;u.p1.rotation.z=f;u.p2.rotation.z=-f;b.g.rotation.y=Math.atan2(b.dir[0],b.dir[1]);if(b.t>5){b.mode=2;b.t=0}}
   else{b.t+=dt;if(b.t>5&&d>10){const hx=b.home[0]-b.g.position.x,hy=b.home[1]-b.g.position.y,hz=b.home[2]-b.g.position.z,hd=Math.hypot(hx,hy,hz);const f=Math.sin(t*26)*.8;u.p1.rotation.z=f;u.p2.rotation.z=-f;
     if(hd<.3){b.mode=0;b.g.position.set(b.home[0],b.home[1],b.home[2]);u.p1.rotation.z=1.3;u.p2.rotation.z=-1.3}else{b.g.position.x+=hx/hd*5*dt;b.g.position.y+=hy/hd*5*dt;b.g.position.z+=hz/hd*5*dt;b.g.rotation.y=Math.atan2(hx,hz)}}else{b.g.position.y+=Math.sin(t*3+b.t)*.002;u.p1.rotation.z=.4+Math.sin(t*14)*.3;u.p2.rotation.z=-.4-Math.sin(t*14)*.3}}});
  /* poisson qui saute */
  fishS.t+=dt;if(fishS.t>0&&fishS.t<1.1){const u=fishS.t/1.1;fish.visible=true;fish.position.set(fishS.x+u*3,.2+Math.sin(u*Math.PI)*2,fishS.z);fish.rotation.z=Math.cos(u*Math.PI)*.9;splash.visible=u<.3||u>.85;splash.position.set(fish.position.x,.12,fishS.z);splash.scale.setScalar(1+(u<.5?u:u-.85)*5)}
  else{fish.visible=false;splash.visible=false;if(fishS.t>=1.1){fishS.t=-(2.5+Math.random()*4);fishS.x=-24+Math.random()*48;fishS.z=-72-Math.random()*14}}
  mists.forEach((m,i)=>{m.position.x+=Math.sin(t*.1+i)*dt*.8})}
 paintGround(THEMES.ouest);
 const tapRoots=()=>{const out=[];[FL.baobab,FL.palm,FL.banana,FL.acacia,TX.est,TX.centrale].forEach(g=>{if(g.visible)g.children.forEach(c=>{if(c.userData&&c.userData.inter)out.push(c)})});INTER_ROOTS.forEach(r=>{if(isVis(r))out.push(r)});return out};
 const applyLang=()=>{const L=lang();applyTheme(L.region);NPC_DATA.forEach(d=>setLabel(labels[d.id],L.names[d.id]));drawBoard(L.board[0],L.board[1],'1   2   3   4   5');syncPickups()};
 const adapt=pf=>{grass.count=Math.max(1,Math.round(GN*pf.density));bushes.count=Math.max(1,Math.round(BN*pf.density));reeds.count=Math.max(1,Math.round(RN*pf.density));flw.count=Math.max(1,Math.round(NF*pf.density));rocks.count=Math.max(1,Math.round(60*pf.density));R.cull=pf.cull;scene.fog.far=pf.fogFar;if(pf.cull===Infinity)treeList.forEach(c=>{c.visible=true})};
 const treeList=Object.values(FL).flatMap(g=>g.children);
 R={syncRemote,adapt,treeList,cull:Infinity,applyTheme,tick,triggerInter,nearInter,tapRoots,findInter,th:THEMES.ouest,fireK:1,rebuildPlayer(){scene.remove(R.player);R.player.traverse(o=>{if(o.geometry)o.geometry.dispose()});R.player=person(avOpts(),1);scene.add(R.player);addTag(R.player)},setHeroName(){addTag(R.player)},renderer,scene,camera,player,sun,rings,WAND,walkAnim,THREE,V,HUTS,picks,syncPickups,applyLang,beacon,bring,clouds,water,wgeo,wbase,fire,flame,flame2,fireLight,boats,birds,flies,ffs,ffb,ffp,puffs,halo,glint,cloths:R0.cloths||[],ch};
 applyLang();

 /* contrôles */
 const resize=()=>{const st=$('#stage'),w=st.clientWidth,h=st.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.9?74:52;camera.updateProjectionMatrix()};
 window.addEventListener('resize',resize);resize();
 let drag=null;const rc=new THREE.Raycaster(),m2=new THREE.Vector2();const ptrs=new Map();let pinch0=0,dist0=7.5;
 canvas.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){const a=[...ptrs.values()];pinch0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);dist0=P.dist||7.5}drag={x:e.clientX,y:e.clientY,moved:0};try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
 canvas.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId)){ptrs.get(e.pointerId).x=e.clientX;ptrs.get(e.pointerId).y=e.clientY}if(ptrs.size===2){const a=[...ptrs.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch0>10)P.dist=clamp(dist0*pinch0/d,4,12);if(drag)drag.moved+=99;return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;P.yaw-=dx*.006;P.pitch=clamp(P.pitch+dy*.005,.08,.75)});
 canvas.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null});
 canvas.addEventListener('pointerup',e=>{ptrs.delete(e.pointerId);const was=drag;drag=null;if(!was||was.moved>6||frozen())return;
  const r=canvas.getBoundingClientRect();m2.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(m2,camera);
  const hit=rc.intersectObjects(NPC_DATA.map(d=>d.g),true)[0];
  if(hit){let o=hit.object;while(o&&!NPC_DATA.some(d=>d.g===o))o=o.parent;const n=NPC_DATA.find(d=>d.g===o);
   if(n){if(Math.hypot(P.x-n.p.x,P.z-n.p.z)<=n.r+3)openDialog(n);else toast('Rapproche-toi de '+npcName(n))}}
  else{const ih=rc.intersectObjects(R.tapRoots(),true)[0];if(ih){const rt=R.findInter(ih.object);if(rt)R.triggerInter(rt)}}});
 canvas.addEventListener('wheel',e=>{e.preventDefault();P.dist=clamp((P.dist||7.5)+e.deltaY*.01,4,12)},{passive:false});
}
const R0={};

/* clavier */
function openMenu(){setPause(false);closeDialog();closePanel();showWelcome('home')}
function leaveMenu(){if(!state.started&&!anyProgress())return;welcomeOpen=false;$('#welcome').hidden=true;$('#stage').classList.remove('menu');renderTracker();ONL.sync()}
$('#menuBtn').onclick=()=>{if(welcomeOpen)leaveMenu();else openMenu()};
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();
 if(e.target&&/^(select|input|textarea)$/i.test(e.target.tagName))return;
 if(k==='m'&&!e.ctrlKey&&!e.metaKey){if(welcomeOpen)leaveMenu();else openMenu();return}
 if(welcomeOpen){if(k==='escape'&&menuScreen!=='home'){showWelcome(menuScreen==='prep'?'regions':menuScreen==='detail'?(menuMode==='regions'?'regions':menuMode==='learn'?'learn':'new'):'home')}return}
 if(k==='escape'){if(mapOpen){closeMap();return}if(paused)setPause(false);else if(dlg)closeDialog();else if(tab)closePanel();else setPause(true);return}
 if(k==='p'){setPause(!paused);return}
 if(k==='e'&&dlg&&!frozen()){$('#dlgGo').click();return}
 if(k==='e'&&!frozen()&&near){useNear(near);return}
 if(['arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(k)>-1&&!frozen())e.preventDefault();
 keys[k]=1;if(!frozen())hideHint()});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
window.addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=0)});
$('#act').onclick=()=>{if(near&&!frozen())useNear(near)};
function useNear(n){if(n.inter)R.triggerInter(n.root);else openDialog(n)}
(function(){const j=$('#joy'),k=$('i',j);let id=null;
 const set=e=>{const r=j.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=Math.min(1,Math.hypot(dx,dy)/40),a=Math.atan2(dy,dx);joy.x=Math.cos(a)*m;joy.y=-Math.sin(a)*m;k.style.transform='translate('+Math.cos(a)*m*34+'px,'+Math.sin(a)*m*34+'px)'};
 j.addEventListener('pointerdown',e=>{id=e.pointerId;try{j.setPointerCapture(id)}catch(_){}set(e);hideHint()});
 j.addEventListener('pointermove',e=>{if(e.pointerId===id)set(e)});
 const end=e=>{if(e.pointerId!==id)return;id=null;joy.x=joy.y=0;k.style.transform=''};
 j.addEventListener('pointerup',end);j.addEventListener('pointercancel',end)})();

(function(){const j=$('#joyc');if(!j)return;const k=$('i',j);let id=null;
 const set=e=>{const r=j.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=Math.min(1,Math.hypot(dx,dy)/36),a=Math.atan2(dy,dx);joyc.x=Math.cos(a)*m;joyc.y=Math.sin(a)*m;k.style.transform='translate('+Math.cos(a)*m*30+'px,'+Math.sin(a)*m*30+'px)'};
 j.addEventListener('pointerdown',e=>{id=e.pointerId;try{j.setPointerCapture(id)}catch(_){}set(e);hideHint()});
 j.addEventListener('pointermove',e=>{if(e.pointerId===id)set(e)});
 const end=e=>{if(e.pointerId!==id)return;id=null;joyc.x=joyc.y=0;k.style.transform=''};
 j.addEventListener('pointerup',end);j.addEventListener('pointercancel',end)})();

/* minicarte */
const miniC=$('#mini canvas'),mx=miniC.getContext('2d');
function drawMini(t){
 const S=miniC.width,sc=S/2/46,cx=S/2,cy=S/2;const X=x=>cx+(x-P.x)*sc,Y=z=>cy+(z-P.z)*sc;
 mx.clearRect(0,0,S,S);mx.save();mx.beginPath();mx.arc(cx,cy,cx-3,0,6.283);mx.clip();
 mx.fillStyle=R.th.mini[0];mx.fillRect(0,0,S,S);mx.fillStyle=R.th.mini[1];mx.fillRect(0,0,S,Math.max(0,Y(-62)));
 mx.strokeStyle='#dba66a';mx.lineWidth=5*sc/2;mx.lineCap='round';
 [[0,48,0,0],[-26,7,0,2],[0,2,27,2],[0,0,-18,-11],[0,0,23,-17],[0,0,0,-58]].forEach(p=>{mx.beginPath();mx.moveTo(X(p[0]),Y(p[1]));mx.lineTo(X(p[2]),Y(p[3]));mx.stroke()});
 mx.fillStyle='#'+('000000'+R.th.hut.w[0].toString(16)).slice(-6);R.HUTS.forEach(h=>{mx.beginPath();mx.arc(X(h.x),Y(h.z),Math.max(4,h.s*3.4),0,6.283);mx.fill()});
 mx.fillStyle='#d3b68c';mx.fillRect(X(30)-18,Y(-26)-10,36,20);
 NPC_DATA.forEach(d=>{mx.fillStyle='#3fb8a4';mx.beginPath();mx.arc(X(d.p.x),Y(d.p.z),6,0,6.283);mx.fill();mx.strokeStyle='#fff';mx.lineWidth=2;mx.stroke()});
 R.picks.forEach(p=>{if(p.got)return;mx.fillStyle='#7fd8ff';mx.beginPath();mx.arc(X(p.x),Y(p.z),3.5,0,6.283);mx.fill()});
 if(curTarget){const tg=curTarget();if(tg){let tx=X(tg.x),ty=Y(tg.z);const dx=tx-cx,dy=ty-cy,d=Math.hypot(dx,dy),lim=cx-14;if(d>lim){tx=cx+dx/d*lim;ty=cy+dy/d*lim}
  mx.fillStyle='rgba(245,154,46,'+(.5+.4*Math.sin(t*5))+')';mx.beginPath();mx.arc(tx,ty,11,0,6.283);mx.fill();mx.fillStyle='#f59a2e';mx.strokeStyle='#fff';mx.lineWidth=2;mx.beginPath();mx.arc(tx,ty,6,0,6.283);mx.fill();mx.stroke()}}
 mx.save();mx.translate(cx,cy);mx.rotate(Math.PI-P.heading);mx.fillStyle='#fff';mx.strokeStyle='#0a1c36';mx.lineWidth=2.5;mx.beginPath();mx.moveTo(0,-11);mx.lineTo(8,9);mx.lineTo(0,5);mx.lineTo(-8,9);mx.closePath();mx.fill();mx.stroke();mx.restore();
 mx.restore()}

/* boucle */
function loop(){
 const T=R.THREE,V=R.V,clock=new T.Clock();let t=0,ph=0,last=0,hdrs=0;const camPos=new V(),tgt=new V(),lead=new V();let camSet=false,mvx=0,mvz=0,Pz={},airPrev=false,landT=1,cullN=0;
 const arrow=$('#qarrow'),qd=$('#qdist');
 function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,clock.getDelta());t+=dt;perfTick(dt);
  let fwd=0,side=0;
  if(!frozen()){if(keys.w||keys.z||keys.arrowup)fwd+=1;if(keys.s||keys.arrowdown)fwd-=1;if(keys.d||keys.arrowright)side+=1;if(keys.a||keys.q||keys.arrowleft)side-=1;fwd+=joy.y;side+=joy.x}
  const len=Math.min(1,Math.hypot(fwd,side)),sp=(keys.shift?8.5:5.4)*len,moving=len>.05;
  if(moving){const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
   let dx=fx*fwd+rx*side,dz=fz*fwd+rz*side;const l=Math.hypot(dx,dz);dx/=l;dz/=l;P.x+=dx*sp*dt;P.z+=dz*sp*dt;mvx=dx;mvz=dz;
   let da=Math.atan2(dx,dz)-P.heading;da=Math.atan2(Math.sin(da),Math.cos(da));P.heading+=da*Math.min(1,dt*12);ph+=dt*sp*1.7}
  for(const c of COLL){if(c.g&&!c.g.visible)continue;const ox=P.x-c.x,oz=P.z-c.z,d=Math.hypot(ox,oz),mn=c.r+.45;if(d<mn&&d>.001){P.x+=ox/d*(mn-d);P.z+=oz/d*(mn-d)}}
  P.x=Math.max(-72,Math.min(72,P.x));P.z=Math.max(-61,Math.min(44,P.z));
  if(!frozen()&&keys[' ']&&P.y<=0.001){P.vy=7}P.vy-=22*dt;P.y=Math.max(0,P.y+P.vy*dt);if(P.y===0&&P.vy<0)P.vy=0;
  R.player.position.set(P.x,P.y+(Pz.bob||0),P.z);R.player.rotation.order='YXZ';R.player.rotation.y=P.heading;
  const air=P.y>.05;if(airPrev&&!air)landT=0;airPrev=air;if(landT<1)landT=Math.min(1,landT+dt/.22);
  Pz=LCA.motion.pose({ph,speed:moving?sp:0,onGround:!air,vy:P.vy,land:landT,run:keys.shift&&moving?1:moving?Math.max(0,(sp-5.4)/3.1):0});
  ONL.tick(dt);R.syncRemote(ONL.players);
  const pu=R.player.userData;pu.baseSy=pu.baseSy||1;LCA.motion.apply(R.player,Pz);pu.head.rotation.y=Math.sin(t*.7)*.12;
  if(R.cull!==Infinity&&(++cullN%12===0)){const cc=R.cull;R.treeList.forEach(c=>{c.visible=Math.hypot(c.position.x-P.x,c.position.z-P.z)<cc})}
  if(dlg&&dlg.p&&Math.hypot(P.x-dlg.p.x,P.z-dlg.p.z)>(dlg.r||4.8)+4)closeDialog();
  /* objets */
  if(!frozen()){const d=D();R.picks.forEach(p=>{if(p.got)return;if(Math.hypot(P.x-p.x,P.z-p.z)<1.7){p.got=true;p.g.visible=false;d.picked[p.i]=1;d.got[p.t]=(d.got[p.t]||0)+1;
    const wi=lang().W.findIndex(w=>w.k===p.t),w=lang().W[wi];if(wi>=0)d.learned[wi]=1;save();toast((w?w.wo+' : '+w.fr.toLowerCase():'Ingrédient trouvé : '+PKFR[p.t]+' (mot à documenter)')+' ('+gotTypes()+' sur 4 ingrédients)');if(w)say(w.wo);check()}})}
  R.picks.forEach((p,i)=>{if(p.got)return;p.m.rotation.y=t*1.6+i;p.g.position.y=.95+Math.sin(t*2.4+i)*.12});
  /* interactions */
  let best=null,bd=1e9;NPC_DATA.concat(SPOTS).forEach(n=>{const d=Math.hypot(P.x-n.p.x,P.z-n.p.z);if(d<n.r&&d<bd){bd=d;best=n}});if(!best)best=R.nearInter(P.x,P.z);
  const act=$('#act'),show=!!best&&!frozen()&&!dlg;
  if(best!==near||act.hidden===show){near=best;if(show){$('#actTxt').textContent=near.inter?'Toucher : '+near.name:near.wat?'Contempler le fleuve':'Parler à '+npcName(near)}act.hidden=!show}
  NPC_DATA.forEach(d=>{const u=d.g.userData,dist=Math.hypot(P.x-d.p.x,P.z-d.p.z);
   if(dist<10){let da=Math.atan2(P.x-d.p.x,P.z-d.p.z)-d.g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));d.g.rotation.y+=da*Math.min(1,dt*5)}
   d.g.position.y=Math.sin(t*2+d.p.x)*.012;
   if(d.kind.drum){const b=Math.sin(t*9);u.armL.rotation.x=-.9+Math.max(0,b)*.5;u.armR.rotation.x=-.9+Math.max(0,-b)*.5}
   else if(dist<8){u.armR.rotation.z=-.5-Math.max(0,Math.sin(t*5))*.4}else u.armR.rotation.z=-.06});
  R.WAND.forEach(w=>{const p=w.pts[w.i],dx=p[0]-w.g.position.x,dz=p[1]-w.g.position.z,d=Math.hypot(dx,dz);
   if(d<.4)w.i=(w.i+1)%w.pts.length;else{w.g.position.x+=dx/d*w.sp*dt;w.g.position.z+=dz/d*w.sp*dt;let da=Math.atan2(dx,dz)-w.g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));w.g.rotation.y+=da*Math.min(1,dt*6)}
   if(w.chick)w.g.position.y=Math.abs(Math.sin(t*9+w.ph))*.04;else{w.ph+=dt*w.sp*3.2;R.walkAnim(w.g,w.ph,1)}});
  R.rings.forEach((r,i)=>{const s=1+.1*Math.sin(t*3+i);r.scale.set(s,s,s)});
  /* ambiance */
  R.clouds.forEach((c,i)=>{c.position.x+=dt*(.8+i*.05);if(c.position.x>200)c.position.x=-200});
  const wp=R.wgeo.attributes.position;for(let i=0;i<wp.count;i++){const x=R.wbase[i*3],z=R.wbase[i*3+2];wp.setY(i,Math.sin(x*.12+t*1.3)*.07+Math.cos(z*.4+t*1.1)*.05)}wp.needsUpdate=true;
  R.glint.material.opacity=.28+.08*Math.sin(t*2);
  R.boats.forEach((b,i)=>{b.position.y=.05+Math.sin(t*1.4+i)*.05;b.rotation.z=Math.sin(t*1.1+i)*.03});
  R.tick(dt,t);const fl=(1+Math.sin(t*14)*.1+Math.sin(t*23)*.06)*R.fireK;R.flame.scale.set(fl,fl*1.1,fl);R.flame2.scale.set(1,fl,1);R.fireLight.intensity=1.3+Math.sin(t*17)*.25;
  R.birds.forEach(b=>{b.a+=dt*b.sp;b.g.position.set(b.cx+Math.cos(b.a)*b.r,b.h+Math.sin(b.a*2)*1.2,b.cz+Math.sin(b.a)*b.r);b.g.rotation.y=-b.a;const f=Math.sin(t*9+b.a*5)*.6;b.p1.rotation.z=f;b.p2.rotation.z=-f});
  R.flies.forEach(f=>{f.a+=dt*f.sp;f.g.position.set(f.cx+Math.cos(f.a)*f.r,.9+Math.sin(f.a*2)*.4,f.cz+Math.sin(f.a*1.3)*f.r);f.g.rotation.y=-f.a;const w=Math.sin(t*20+f.a)*.9;f.pa.rotation.z=w;f.pb.rotation.z=-w});
  for(let i=0;i<R.ffb.length;i++){const b=R.ffb[i];R.ffp[i*3]=b[0]+Math.sin(t*.4+b[3])*1.5;R.ffp[i*3+1]=b[1]+Math.sin(t*.7+b[3]*2)*.5;R.ffp[i*3+2]=b[2]+Math.cos(t*.3+b[3])*1.5}R.ffs.geometry.attributes.position.needsUpdate=true;
  R.puffs.forEach(p=>{p.age+=dt;if(p.age>p.life)p.age=0;const k=p.age/p.life;p.sp.position.set(p.s.x+k*3+Math.sin(p.age)*.3,p.s.y+k*7,p.s.z);const sc=1+k*4;p.sp.scale.set(sc,sc,1);p.sp.material.opacity=Math.sin(k*Math.PI)*.35});
  R.cloths.forEach((c,i)=>{c.rotation.y=Math.sin(t*1.5+i)*.18});
  /* guide de quête */
  const tg=curTarget?curTarget():null;
  if(tg&&!welcomeOpen){const dx=tg.x-P.x,dz=tg.z-P.z,dist=Math.hypot(dx,dz),dot=dx*(-Math.sin(P.yaw))+dz*(-Math.cos(P.yaw)),cr=dx*Math.cos(P.yaw)+dz*(-Math.sin(P.yaw));
   arrow.style.transform='rotate('+(Math.atan2(cr,dot)*180/Math.PI).toFixed(1)+'deg)';qd.textContent='À '+Math.round(dist)+' m';
   R.beacon.visible=dist>3;R.bring.visible=dist>3;R.beacon.position.set(tg.x,20,tg.z);R.bring.position.set(tg.x,.2+Math.abs(Math.sin(t*2))*.3,tg.z);R.beacon.material.opacity=.22+.12*Math.sin(t*3)}
  else{R.beacon.visible=false;R.bring.visible=false;qd.textContent=tg?'':'Termine'}
  /* caméra */
  if(welcomeOpen)P.yaw+=dt*.12;
  if(!frozen()&&(joyc.x||joyc.y)){P.yaw-=joyc.x*dt*2.4;P.pitch=Math.min(.75,Math.max(.08,P.pitch+joyc.y*dt*1.2))}
  const dist=P.dist||7.5,cp=Math.cos(P.pitch);
  const lk=1-Math.exp(-dt*3);lead.x+=((moving?mvx*Math.min(2.2,sp*.3):0)-lead.x)*lk;lead.z+=((moving?mvz*Math.min(2.2,sp*.3):0)-lead.z)*lk;
  tgt.set(P.x+lead.x+Math.sin(P.yaw)*dist*cp,1.4+Math.sin(P.pitch)*dist+.8,P.z+lead.z+Math.cos(P.yaw)*dist*cp);
  if(!camSet){camPos.copy(tgt);camSet=true}camPos.lerp(tgt,1-Math.exp(-dt*9));
  /* la caméra ne traverse ni les bâtiments ni le sol */
  for(const c of COLL){if(c.r<1.3||(c.g&&!c.g.visible))continue;const ox=camPos.x-c.x,oz=camPos.z-c.z,d=Math.hypot(ox,oz),mn=c.r+.4;if(d<mn&&d>.001){camPos.x=c.x+ox/d*mn;camPos.z=c.z+oz/d*mn}}
  if(camPos.y<.9)camPos.y=.9;
  {const w=innerWidth,h=innerHeight,on=tab==='perso';if(on&&w<=700){R.camera.setViewOffset(w,h,0,h*.2,w,h)}else if(on){R.camera.setViewOffset(w,h,w*.16,0,w,h)}else if(R.camera.view&&R.camera.view.enabled){R.camera.clearViewOffset()}}
  R.camera.position.copy(camPos);R.camera.lookAt(P.x+lead.x*.7,1.5+P.y*.6,P.z+lead.z*.7);
  R.sun.position.set(P.x+34,30,P.z-48);R.sun.target.position.set(P.x,0,P.z);R.sun.target.updateMatrixWorld();
  R.renderer.render(R.scene,R.camera);
  if(!worldReady){worldReady=true;if(welcomeOpen&&menuScreen==='home')showWelcome('home');hideBoot()}
  last+=dt;if(last>.05){last=0;drawMini(t)}
 }
 frame()}


/* ================= 2D (style peint, par défaut) ================= */
function init2D(){
 const canvas=$('#c2d');const rr=LCA.createRenderer(canvas);
 let lastTheme=null;const fr=()=>0;
 NPC_DATA.forEach(d=>{d.p={x:d.pos[0],z:d.pos[1]};d.r=4.8;d.near=false;d.flip=false});SPOTS.forEach(s=>{s.p={x:s.pos[0],z:s.pos[1]}});
 const syncPickups=()=>{const pk=D().picked;rr.picks.forEach(p=>{p.got=!!pk[p.i]})};
 const th2={mini:['#8f8a3d','#3b87b0'],hut:{w:[0xb97b46]}};
 const applyLang=()=>{const L=lang();const reg=L.region;if(reg!==lastTheme||!R.HUTS.length){rr.build(reg);lastTheme=reg;const T=rr.th;R.th.mini=T.mini;R.th.hut.w[0]=parseInt(T.hut.wall[0].slice(1),16);R.HUTS=rr.huts;R.picks=rr.picks}syncPickups()};
 const wrap={};
 R={is2d:true,rr,th:th2,HUTS:[],picks:[],fireK:1,applyLang,syncPickups,rebuildPlayer(){},setHeroName(){},tick(){},
  nearInter(x,z){const i=rr.nearInter(x,z);if(!i)return null;return wrap[i.id]||(wrap[i.id]={inter:true,root:i,name:i.name,r:0})},
  tapRoots(){return rr.inter},findInter(o){return o},
  triggerInter(it){if(Math.hypot(P.x-it.x,P.z-it.z)>(it.type==='field'?12:12)){toast('Rapproche-toi : '+it.name);return}
   const r=rr.trigger(it,P);let msg=r.msg||'';const wi=it.re?frWord(it.re):-1;
   if(wi>=0){const w=lang().W[wi];const d=D();if(!d.learned[wi]){d.learned[wi]=1;save();check()}msg=(msg?msg+' ':'')+w.wo+' : '+w.fr.toLowerCase();say(w.wo)}
   if(R.shake)R.shake(it.type==='tree'?.35:it.type==='fire'?.2:.12);toast(msg||it.name)}};
 pickTarget=()=>{const d=D();let best=null,bd=1e9;rr.picks.forEach(p=>{if(p.got||d.got[p.t])return;const dd=Math.hypot(P.x-p.x,P.z-p.z);if(dd<bd){bd=dd;best=p}});return best?{x:best.x,z:best.z}:null};
 R.th.hut={w:[0xb97b46]};R.th.mini=th2.mini;
 /* NPC : collisions fixes */
 const resize=()=>{const st=$('#stage'),w=st.clientWidth||innerWidth,h=st.clientHeight||innerHeight;const s=state.settings||{},q=qualityOf(s);rr.resize(w,h,Math.min(window.devicePixelRatio||1,[1,1.5,2][q]),{low:q===0})};
 window.addEventListener('resize',resize);resize();R.resize=resize;
 applyLang();
 /* toucher : PNJ et objets interactifs */
 let down=null;
 canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
 canvas.addEventListener('pointerup',e=>{const was=down;down=null;if(!was||frozen())return;if(Math.hypot(e.clientX-was.x,e.clientY-was.y)>10)return;
  const r=canvas.getBoundingClientRect(),h=rr.hit(e.clientX-r.left,e.clientY-r.top);if(!h)return;
  if(h.npc){const n=NPC_DATA.find(d=>d.id===h.npc);if(n){if(Math.hypot(P.x-n.p.x,P.z-n.p.z)<=n.r+3)openDialog(n);else toast('Rapproche-toi de '+npcName(n))}}
  else if(h.root)R.triggerInter(h.root)});
}
function loop2D(){
 const rr=R.rr;let t=0,ph=0,last=0,prev=performance.now(),first=true,fx=0,fz=1,face='f',flip=false;
 const C=R.cam={look:0,lookT:0,zoom:1.5,pitch:-.05,user:{x:0,y:0,z:1},shake:0,intro:1,idle:0,pz:P.z,wasMenu:true,bob:0};
 R.shake=a=>{C.shake=Math.max(C.shake,a)};
 const cv=$('#c2d');const ptr=new Map();let pinch0=0,uz0=1;
 cv.addEventListener('pointerdown',e=>{ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptr.size===2){const a=[...ptr.values()];pinch0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);uz0=C.user.z}C.idle=0});
 cv.addEventListener('pointermove',e=>{const q=ptr.get(e.pointerId);if(!q||frozen())return;
  if(ptr.size===2){q.x=e.clientX;q.y=e.clientY;const a=[...ptr.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch0>10)C.user.z=Math.max(.78,Math.min(1.35,uz0*d/pinch0));return}
  const dx=e.clientX-q.x,dy=e.clientY-q.y;q.x=e.clientX;q.y=e.clientY;C.user.x=Math.max(-7,Math.min(7,C.user.x-dx*.03));C.user.y=Math.max(-.1,Math.min(.14,C.user.y+dy*.0006));C.idle=0});
 const up=e=>{ptr.delete(e.pointerId);C.idle=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();C.user.z=Math.max(.78,Math.min(1.35,C.user.z-e.deltaY*.0008))},{passive:false});
 const arrow=$('#qarrow'),qd=$('#qdist');
 function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-prev)/1000||0);prev=now;t+=dt;perfTick(dt);
  let fwd=0,side=0;
  if(!frozen()){if(keys.w||keys.z||keys.arrowup)fwd+=1;if(keys.s||keys.arrowdown)fwd-=1;if(keys.d||keys.arrowright)side+=1;if(keys.a||keys.q||keys.arrowleft)side-=1;fwd+=joy.y;side+=joy.x}
  P.yaw=0;
  const len=Math.min(1,Math.hypot(fwd,side)),sp=(keys.shift?8.5:5.4)*len,moving=len>.05;
  if(moving){let dx=side,dz=-fwd;const l=Math.hypot(dx,dz);dx/=l;dz/=l;P.x+=dx*sp*dt;P.z+=dz*sp*dt;P.heading=Math.atan2(dx,dz);ph+=dt*sp*1.9;
   if(Math.abs(dx)>Math.abs(dz)+.15){face='s';flip=dx<0}else{face=dz<0?'b':'f';flip=false}}
  const cl=rr.coll;for(const c of cl){const ox=P.x-c.x,oz=P.z-c.z,d=Math.hypot(ox,oz),mn=c.r+.45;if(d<mn&&d>.001){P.x+=ox/d*(mn-d);P.z+=oz/d*(mn-d)}}
  NPC_DATA.forEach(n=>{const ox=P.x-n.p.x,oz=P.z-n.p.z,d=Math.hypot(ox,oz);if(d<.95&&d>.001){P.x+=ox/d*(.95-d);P.z+=oz/d*(.95-d)}});
  P.x=Math.max(-72,Math.min(72,P.x));P.z=Math.max(-61,Math.min(44,P.z));
  if(!frozen()&&keys[' ']&&P.y<=0.001){P.vy=7}P.vy-=22*dt;P.y=Math.max(0,P.y+P.vy*dt);if(P.y===0&&P.vy<0)P.vy=0;
  if(!frozen()){const d=D();rr.picks.forEach(p=>{if(p.got)return;if(Math.hypot(P.x-p.x,P.z-p.z)<1.7){p.got=true;d.picked[p.i]=1;d.got[p.t]=(d.got[p.t]||0)+1;
    const wi=lang().W.findIndex(w=>w.k===p.t),w=lang().W[wi];if(wi>=0)d.learned[wi]=1;save();toast((w?w.wo+' : '+w.fr.toLowerCase():'Ingrédient trouvé : '+PKFR[p.t]+' (mot à documenter)')+' ('+gotTypes()+' sur 4 ingrédients)');if(w)say(w.wo);C.shake=Math.max(C.shake,.22);check()}})}
  let best=null,bd=1e9;NPC_DATA.concat(SPOTS).forEach(n=>{const d=Math.hypot(P.x-n.p.x,P.z-n.p.z);if(d<n.r&&d<bd){bd=d;best=n}});if(!best)best=R.nearInter(P.x,P.z);
  const act=$('#act'),show=!!best&&!frozen()&&!dlg;
  if(best!==near||act.hidden===show){near=best;if(show){$('#actTxt').textContent=near.inter?'Toucher : '+near.name:near.wat?'Contempler le fleuve':'Parler à '+npcName(near)}act.hidden=!show}
  if(dlg&&dlg.p&&Math.hypot(P.x-dlg.p.x,P.z-dlg.p.z)>(dlg.r||4.8)+4)closeDialog();
  const L=lang();
  const npcs=NPC_DATA.map(n=>{const dist=Math.hypot(P.x-n.p.x,P.z-n.p.z);n.near=dist<8;n.flip=dist<10&&P.x<n.p.x-.5&&false;return {id:n.id,name:L.names[n.id]||n.id,kind:n.kind,x:n.p.x,z:n.p.z,near:n.near,flip:n.flip,drumTop:!!n.kind.drum}});
  ONL.tick(dt);rr.update(dt,t,P);
  const tg=curTarget?curTarget():null;
  if(tg&&!welcomeOpen){const dx=tg.x-P.x,dz=tg.z-P.z,dist=Math.hypot(dx,dz);
   arrow.style.transform='rotate('+(Math.atan2(dx,-dz)*180/Math.PI).toFixed(1)+'deg)';qd.textContent='À '+Math.round(dist)+' m'}
  else qd.textContent=tg?'':'Termine';
  const on=tab==='perso',w=innerWidth;
  /* caméra : anticipation, zoom de course, zoom de dialogue, respiration, balancement, secousses, retour en douceur */
  C.idle+=dt;if(!ptr.size&&C.idle>1.2){const k=Math.min(1,dt*2.2);C.user.x-=C.user.x*k;C.user.y-=C.user.y*k}
  if(C.wasMenu&&!welcomeOpen){C.intro=1;C.zoom=1.5;C.pitch=-.05;P.z=P.z}C.wasMenu=welcomeOpen;
  C.intro=Math.max(0,C.intro-dt/2.4);
  const dn=dlg&&dlg.p?dlg:null;let tz=1,tl=0,tp=0;
  if(welcomeOpen){tz=1.04+Math.sin(t*.25)*.03;tl=Math.sin(t*.2)*5}
  else if(dn){tz=1.2;tl=(dn.p.x-P.x)*.5;tp=-.02}
  else if(on){tz=1.1}
  else{const ln=moving?Math.sign(side||0)*2.6:0;tl=ln;tz=moving?(keys.shift?.95:.985):1+Math.sin(t*.7)*.006;if(moving&&Math.abs(fwd)>.3)tp=fwd>0?-.012:.012}
  const ease=1-Math.exp(-dt*(dn?4:3));C.zoom+=(tz*C.user.z-C.zoom)*ease*(C.intro>0?.35:1);C.look+=(tl+C.user.x-C.look)*(1-Math.exp(-dt*3.2));
  C.bob=moving?Math.sin(ph*2)*.0028*Math.min(1,sp/5):C.bob*.9;
  C.pitch+=(tp+C.user.y+C.bob-C.pitch)*(1-Math.exp(-dt*5));
  if(C.pz===2&&P.y<=0)C.shake=Math.max(C.shake,.3);C.pz=P.y>.05?2:1;
  C.shake=Math.max(0,C.shake-dt*2.2);
  const shift=on?(w<=700?{x:0,y:-.24}:{x:-.16,y:0}):{x:0,y:0};
  rr.render({t,dt,P:{x:P.x,z:P.z,y:P.y,face:on?'f':(moving||P.y>0?face:(face==='b'?'b':'f')),ph,amp:moving?Math.min(1,sp/5):0,flip},avatar:avOpts(),heroName:heroName(),npcs,remote:ONL.players.map(q=>({x:q.x,z:q.z,h:q.h,ph:q.ph,moving:q.moving,name:q.name,o:ONL.remoteOpts(q.av)})),tgt:tg&&!welcomeOpen?tg:null,shift,snap:first,cam:{zoom:C.zoom,look:C.look,pitch:C.pitch,shake:C.shake,back:(1-C.intro)*0+C.intro*2}});first=false;
  if(!worldReady){worldReady=true;if(welcomeOpen&&menuScreen==='home')showWelcome('home');hideBoot()}
  last+=dt;if(last>.05){last=0;drawMini(t)}
 }
 requestAnimationFrame(frame)}

const PERF={frames:0,t:0,fps:0,warned:false};
function perfTick(dt){if(welcomeOpen||paused||document.hidden||dt<=0)return;PERF.frames++;PERF.t+=dt;
 if(PERF.t>=4){PERF.fps=Math.round(PERF.frames/PERF.t);
  if(renderMode==='3d'&&PERF.fps<22){const s=state.settings||{},r=QL.adjust({fps:PERF.fps,q:qualityOf(s),auto:autoOn(s)});
   if(r.changed){autoQ=r.q;applySettings();toast('Affichage lent ('+PERF.fps+' i/s) : qualité abaissée automatiquement ('+['Bas','Moyen','Élevé'][r.q]+').')}
   else if(!PERF.warned&&(r.suggest2d||!autoOn(s))){PERF.warned=true;toast('Affichage lent ('+PERF.fps+' i/s) : essaie la qualité Bas ou le rendu 2D dans Paramètres.')}}
  PERF.frames=0;PERF.t=0}}
const T0=performance.now();
function hideBoot(){const b=$('#boot');if(!b)return;setTimeout(()=>{b.classList.add('off');setTimeout(()=>b.remove(),700)},Math.max(0,1700-(performance.now()-T0)))}
/* ================= MONDE OUVERT (chat texte) ================= */
/* Mode « Solo » par défaut. Le mode « Monde ouvert » exige un serveur (server/server.cjs) dont l'adresse est saisie sur l'accueil ou fixée dans LCA.config.apiBase. */
const ONL=(function(){
 let client=null,wc=null,clientBase='',unread=0,chatOpen=false,joinedRoom=null,joining=false,last={x:0,z:0,h:0},meNow={x:0,z:0,h:0,moving:false};
 const cfgBase=()=>String((state.settings&&state.settings.api)||(LCA.config&&LCA.config.apiBase)||'').trim().replace(/\/+$/,'');
 const validBase=u=>{try{const x=new URL(u);return x.protocol==='https:'||(x.protocol==='http:'&&/^(localhost|127\.0\.0\.1|\[::1\])$/.test(x.hostname))}catch(e){return false}};
 const wanted=()=>!!(state.settings&&state.settings.play==='online');
 const consent=()=>!!(state.settings&&state.settings.onlineConsent);
 function me(){const dx=P.x-last.x,dz=P.z-last.z,d=Math.hypot(dx,dz);if(d>.02){meNow.h=Math.atan2(dx,dz);meNow.moving=true}else meNow.moving=false;last.x=P.x;last.z=P.z;meNow.x=P.x;meNow.z=P.z;return meNow}
 function netAvatar(){const o=avOpts(),r={};['skin','top','bottom','hairCol','hatCol','boubou'].forEach(k=>{if(Number.isInteger(o[k]))r[k]=o[k]});
  ['fem','glasses','beard','jewel'].forEach(k=>{if(o[k])r[k]=true});if(o.pack)r.pack=true;if(o.skirt)r.skirt=1;if(Number.isInteger(o.pat))r.pat=o.pat;
  ['hs','hat'].forEach(k=>{if(typeof o[k]==='string')r[k]=o[k]});return r}
 const remoteOpts=av=>Object.assign({sleeve:true,shoe:0xf2f2f2,bottom:0x333333},av,{pack:av&&av.pack?0x2a2a2a:undefined});
 function ensure(){const b=cfgBase();if(!validBase(b))return null;if(!client||clientBase!==b){if(wc){wc.stop()}client=LCA.online.create({apiBase:b});clientBase=b;wc=LCA.worldClient.create({api:client.world,me,onChat:onMsg,onStatus:onStatus});joinedRoom=null}return wc}
 function pseudo(){const n=(heroName()||'').trim();return n.length>=2?n:'Voyageur'}
 async function sync(){
  const want=wanted()&&consent()&&!welcomeOpen&&state.started!==0&&!!R;
  if(!want){if(wc&&joinedRoom){const w=wc;joinedRoom=null;await w.leave()}ui();return}
  const w=ensure();if(!w){ui();return}
  if(joinedRoom===state.lang||joining){ui();return}
  joining=true;try{if(joinedRoom)await w.leave();const jr=await w.join({name:pseudo(),room:state.lang,consent:true,avatar:netAvatar(),x:P.x,z:P.z});mineName=jr.name;joinedRoom=state.lang;w.start(450);toast('Monde ouvert : tu es dans le village '+lang().name+'.')}
  catch(e){joinedRoom=null;toast(e.code==='room_full'?e.message:'Monde ouvert indisponible ('+(e.message||'erreur')+'). Tu joues en solo.')}
  finally{joining=false;ui()}}
 function onStatus(){ui()}
 function onMsg(m){addLine(m);if(!chatOpen&&!m.sys&&m.id!==(wc&&wc.sid)){unread++;badge()}}
 const badge=()=>{const b=$('#chatBadge');b.hidden=!unread;b.textContent=unread>9?'9+':unread};
 function addLine(m){const l=$('#chatLog');if(!l)return;const p=document.createElement('p');
  if(m.sys||m.err){p.className=m.err?'err':'sys';p.textContent=m.text}else{const b=document.createElement('b');b.textContent=m.name+' : ';p.appendChild(b);p.appendChild(document.createTextNode(m.text));if(mineName&&m.name===mineName)p.className='me'}
  l.appendChild(p);while(l.children.length>80)l.removeChild(l.firstChild);l.scrollTop=l.scrollHeight}
 let mineName='';
 function ui(){const on=!!(wc&&joinedRoom&&wc.status!=='off'),st=wc?wc.status:'off';
  $('#chatBtn').hidden=!(wanted()&&consent()&&!welcomeOpen&&(on||joining||st==='error'||st==='reconnecting'));
  const t=$('#chatT');if(t)t.textContent='Village '+(LANGS[state.lang]?LANGS[state.lang].name:'')+' · '+(wc&&wc.players?wc.players.size+1:1)+' joueur(s)';
  const e=$('#chatSt');if(e){const msg=st==='reconnecting'?'Connexion instable… nouvelle tentative.':st==='error'?'Serveur injoignable.':st==='connecting'?'Connexion…':'';e.hidden=!msg;e.textContent=msg}
  if(chatOpen)renderPlayers();
  if(!wanted()||welcomeOpen)closeChat()}
 function renderPlayers(){const box=$('#chatPl');if(!box||!wc)return;box.textContent='';$('#chatPlS').textContent='Joueurs ('+wc.players.size+') · masquer ou signaler';
  wc.players.forEach(q=>{const d=document.createElement('div'),b=document.createElement('b'),m=document.createElement('button'),r=document.createElement('button');b.textContent=q.name;
   const hid=wc.muted.has(q.id);m.type='button';m.textContent=hid?'Afficher':'Masquer';m.dataset.cm=q.id;r.type='button';r.textContent='Signaler';r.dataset.cr=q.id;d.append(b,m,r);box.appendChild(d)})}
 function openChat(){if(!wc||!joinedRoom)return;chatOpen=true;unread=0;badge();$('#chat').hidden=false;renderPlayers();ui();const l=$('#chatLog');l.scrollTop=l.scrollHeight;if(!matchMedia('(pointer:coarse)').matches)setTimeout(()=>$('#chatIn').focus(),30)}
 function closeChat(){chatOpen=false;const c=$('#chat');if(c)c.hidden=true;const i=$('#chatIn');if(i)i.blur()}
 $('#chatBtn').onclick=()=>chatOpen?closeChat():openChat();
 $('#chatX').onclick=closeChat;
 $('#chatF').addEventListener('submit',e=>{e.preventDefault();const i=$('#chatIn'),v=i.value.trim();if(!v||!wc)return;wc.say(v);i.value=''});
 $('#chatPl').addEventListener('click',async e=>{const m=e.target.closest('[data-cm]'),r=e.target.closest('[data-cr]');
  if(m){wc.mute(m.dataset.cm,!wc.muted.has(m.dataset.cm));renderPlayers()}
  if(r&&wc){try{await wc.report(r.dataset.cr);toast('Signalement envoyé. Merci !')}catch(err){toast('Signalement impossible : '+err.message)}}});
 window.addEventListener('keydown',e=>{if(e.target&&/^(input|textarea|select)$/i.test(e.target.tagName)){if(e.key==='Escape'&&chatOpen){closeChat()}return}if(e.key.toLowerCase()==='t'&&wanted()&&joinedRoom&&!welcomeOpen&&!e.ctrlKey&&!e.metaKey){e.preventDefault();chatOpen?closeChat():openChat()}});
 /* carte d'accueil : choix du mode */
 function card(){const s=state.settings||{},on=s.play==='online',b=cfgBase(),fixed=!!(LCA.config&&LCA.config.apiBase&&!s.api);
  return '<div class="playcard"><b>Mode de jeu</b><div class="seg" role="group" aria-label="Mode de jeu"><button data-play="solo" aria-pressed="'+!on+'">Solo</button><button data-play="online" aria-pressed="'+on+'">Monde ouvert</button></div>'+
   (on?'<p class="sub">Retrouve d’autres joueurs dans le village de ta langue et discute <b>par écrit uniquement</b> (pas d’images, pas de liens, pas de vocal).</p>'+
    (fixed?'':'<label for="onlApi" class="sub">Adresse du serveur N’Zassa</label><input id="onlApi" type="url" inputmode="url" placeholder="https://…" value="'+esc(s.api||'')+'" autocomplete="off">')+
    '<label><input id="onlConsent" type="checkbox"'+(s.onlineConsent?' checked':'')+'><span>J’accepte que mon pseudo, mon personnage, ma position et mes messages soient visibles des autres joueurs du village. Je ne partage aucune information personnelle (nom réel, adresse, téléphone, école).</span></label>'+
    '<div class="row"><button class="btn ghost sm" data-onl="test">Tester le serveur</button></div><p class="pmsg" id="onlMsg" role="status">'+(!b?'Aucun serveur configuré : le monde ouvert nécessite un serveur (voir docs/MONDE_OUVERT.md).':!validBase(b)?'Adresse invalide (https:// requis).':'')+'</p>'
    :'<p class="sub">Tu joues seul(e) dans ton village : rien n’est envoyé sur Internet.</p>')+'</div>'}
 async function test(){const m=$('#onlMsg'),b=cfgBase();if(!validBase(b)){m.textContent='Adresse invalide (https:// requis).';return}m.textContent='Test en cours…';
  try{const r=await fetch(b+'/v1/health',{cache:'no-store'});const j=await r.json();m.textContent=j&&j.ok?'Serveur joignable.':'Réponse inattendue.'}catch(e){m.textContent='Serveur injoignable (adresse, HTTPS ou CORS).'}}
 function setPlay(v){state.settings=state.settings||{};state.settings.play=v;save()}
 function setApi(v){state.settings=state.settings||{};state.settings.api=String(v||'').trim().slice(0,200);save()}
 function setConsent(v){state.settings=state.settings||{};state.settings.onlineConsent=!!v;save()}
 return {sync,ui,card,test,setPlay,setApi,setConsent,openChat,closeChat,tick(dt){if(wc&&joinedRoom)wc.tick(dt)},
  get players(){return wc&&joinedRoom?[...wc.players.values()]:[]},remoteOpts,get active(){return !!(wc&&joinedRoom)},wanted,get status(){return wc?wc.status:'off'}}})();
/* le salon courant sert de nom de joueur local pour surligner ses messages */

/* ================= PLEIN ÉCRAN (téléphones et tablettes) ================= */
/* L'API plein écran exige un geste de l'utilisateur et n'existe pas sur iPhone (Safari) : dans ce cas, on propose l'installation sur l'écran d'accueil (manifest « fullscreen »). */
const FSG=(function(){
 const g=$('#fsGate'),coarse=()=>window.matchMedia&&matchMedia('(pointer:coarse)').matches,root=document.documentElement;
 const can=!!(root.requestFullscreen||root.webkitRequestFullscreen);
 const standalone=()=>(window.matchMedia&&(matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches))||navigator.standalone===true;
 const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 let skipped=false;
 const need=()=>coarse()&&!isFs()&&!standalone()&&!skipped&&!window.LCA_NO_FSGATE;
 function sync(){if(!g)return;const n=need();g.hidden=!n;if(n){if(!paused&&typeof setPause==='function'&&!welcomeOpen)setPause(true);
   const ios=!can;$('#fsGo').hidden=ios;$('#fsSkip').hidden=!ios&&!g.dataset.failed;
   if(ios)$('#fsP').textContent='Ton navigateur ne permet pas le plein écran automatique. Pour jouer en plein écran : touche « Partager », puis « Sur l’écran d’accueil », et ouvre N’Zassa depuis l’icône. Tu peux aussi continuer ici.'}}
 async function go(){try{const r=root.requestFullscreen?root.requestFullscreen({navigationUI:'hide'}):root.webkitRequestFullscreen();if(r&&r.then)await r;
   try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(_){}
  }catch(e){g.dataset.failed='1';$('#fsP').textContent='Le plein écran a été refusé par ce navigateur. Tu peux continuer, mais l’affichage sera moins confortable.'}sync();window.dispatchEvent(new Event('resize'))}
 if(g){$('#fsGo').onclick=go;$('#fsSkip').onclick=()=>{skipped=true;sync()};
  document.addEventListener('fullscreenchange',()=>{sync();window.dispatchEvent(new Event('resize'))});document.addEventListener('webkitfullscreenchange',sync)}
 return {sync,need,isFs}})();

/* ================= DÉMARRAGE ================= */
load();applyReviewStatus();updateWho();FSG.sync();$('#who').onclick=()=>{setPause(false);closeDialog();closePanel();accMsg='';accConfirm=false;showWelcome('account')};
if(!state.lang||!LANGS[state.lang])state.lang='wolof';
D();renderLangMenu();renderTracker();
showWelcome('home');
function start2D(){document.body.classList.add('m2d');init2D();applySettings();loop2D();renderMode='2d'}
function startWorld(){
 if(state.settings&&state.settings.mode==='3d'){
  let why='';
  if(!gl3d())why='WebGL ou la bibliothèque 3D est indisponible';
  else try{init3D();applySettings();loop();renderMode='3d';document.body.classList.add('m3d');return}catch(err){why='erreur au démarrage de la 3D';R=null;if(window.console)console.error(err)}
  fallbackMsg='Le rendu 3D n’est pas disponible sur cet appareil ('+why+'). Le rendu 2D est utilisé à la place ; ton choix est conservé.';
  setTimeout(()=>toast('Rendu 3D indisponible : rendu 2D utilisé.'),2200)}
 start2D()}
try{startWorld();check()}catch(err){hideBoot();$('#nogl').hidden=false;$('#hint').hidden=true;$('#mini').hidden=true;if(window.console)console.error(err)}
window.__lca={LANGS,state,P,get mode(){return renderMode},get perf(){return PERF},get R(){return R},get onl(){return ONL}};
})();
