/* Atelier de langue : réviser (révision espacée), carnet personnel, prononciation (écouter, s'enregistrer, comparer),
   voix de référence et propositions de mots par des locuteurs. Navigateur uniquement ; la logique est dans srs.js, pron.js, refs.js, review.js.
   Honnêteté : sans voix de référence ajoutée par un locuteur, rien n'est comparé ; la comparaison est approximative (rythme et mélodie). */
(function(LCA){
'use strict';
function create(ctx){
 const $=ctx.$,esc=ctx.esc,root=$('#lab'),SRS=LCA.srs,PR=LCA.pron,RF=LCA.refs,RV=LCA.review;
 let view='home',open=false,cur=null,rv=null,filter='all',msg='',rec=null,mine=null,refAudio=null,res=null,sess=null,refList=[],store=null,prevFocus=null;
 const L=()=>ctx.lang(),D=()=>ctx.D(),now=()=>Date.now();
 const srs=()=>{const d=D();if(!d.srs||!d.srs.cards)d.srs=SRS.normalize(d.srs);if(SRS.sync(d.srs,d.learned,now()))ctx.save();return d.srs};
 const W=()=>L().W||[];
 function refStore(){if(!store){let ad=null;try{ad=LCA.oral.idbAdapter('nzassa-refs')}catch(e){ad=null}store=RF.create({adapter:ad||LCA.oral.memAdapter(),langs:ctx.langs()})}return store}
 const reviewer=()=>ctx.rvStore().reviewer;
 const ST={nouveau:'Nouveau',en_cours:'En cours',maitrise:'Maîtrisé'};
 const head=(t,back)=>'<div class="lhd">'+(back?'<button class="btn ghost sm" data-lab="home">← Atelier</button>':'')+'<h2>'+t+'</h2><button class="btn ghost sm" data-lab="close" aria-label="Fermer l’atelier">✕</button></div>';
 const note=()=>msg?'<p class="sub" role="status" aria-live="polite" id="labMsg">'+esc(msg)+'</p>':'<p id="labMsg" class="sub" role="status" aria-live="polite"></p>';
 const setMsg=t=>{msg=t;const m=$('#labMsg');if(m)m.textContent=t};
 function wordOpts(sel){return W().map((w,i)=>'<option value="'+i+'"'+(i===sel?' selected':'')+'>'+esc(w.wo)+' — '+esc(w.fr)+'</option>').join('')}
 function render(){
  if(!open)return;let h='';
  if(!W().length){root.innerHTML='<div class="lcard">'+head('Atelier de langue')+'<p class="sub">Aucun mot n’est documenté pour cette langue : rien à travailler ici pour l’instant.</p></div>';return}
  if(view==='home'){const s=srs(),st=SRS.stats(s,now(),W().length),lv=SRS.levelFor(st.mastered);
   h=head('Atelier · '+esc(L().name))+'<div class="labstats"><div><b>'+st.discovered+'/'+st.total+'</b><span>mots découverts</span></div><div><b>'+st.mastered+'</b><span>maîtrisés</span></div><div><b>'+st.due+'</b><span>à réviser</span></div><div><b>'+st.exercises+'</b><span>exercices</span></div><div><b>'+(st.accuracy===null?'—':st.accuracy+' %')+'</b><span>réussite</span></div><div><b>'+esc(lv.name)+'</b><span>vocabulaire'+(lv.next?' (prochain : '+lv.next+' mots)':'')+'</span></div></div>'+
    '<div class="bar"><i style="width:'+st.pct+'%"></i></div>'+
    '<div class="labgrid"><button class="btn warm" data-lab="review">Réviser'+(st.due?' ('+st.due+')':'')+'</button><button class="btn ghost" data-lab="notebook">Mon carnet</button><button class="btn ghost" data-lab="pron">Prononcer un mot</button><button class="btn ghost" data-lab="ref">Voix de locuteurs</button><button class="btn ghost" data-lab="propose">Proposer un mot</button></div>'+
    '<p class="note">Les contenus de cette langue sont en brouillon, à faire valider par des locuteurs. La comparaison de voix est approximative (rythme et mélodie), ce n’est pas une note de prononciation.</p>'+note()}
  else if(view==='review')h=reviewView();
  else if(view==='notebook')h=notebookView();
  else if(view==='pron')h=pronView();
  else if(view==='ref')h=refView();
  else if(view==='propose')h=proposeView();
  const keep={};root.querySelectorAll('input[id],textarea[id]').forEach(i=>{keep[i.id]=i.type==='checkbox'?i.checked:i.value});
  root.innerHTML='<div class="lcard">'+h+'</div>';
  Object.keys(keep).forEach(k=>{const i=root.querySelector('#'+k);if(i){if(i.type==='checkbox')i.checked=keep[k];else if(!i.value)i.value=keep[k]}})}
 /* ---- Réviser ---- */
 function startReview(force){const s=srs(),ids=SRS.dueList(s,now(),10);let list=ids;
  if(!list.length&&force)list=Object.keys(s.cards).map(Number).sort((a,b)=>SRS.priority(s.cards[b],now())-SRS.priority(s.cards[a],now())).slice(0,5);
  sess={list,i:0,shown:false,dir:Math.random()<.5?'fr':'wo',good:0,total:0};view='review';render()}
 function reviewView(){
  if(!sess||!sess.list.length){const n=Object.keys(srs().cards).length;return head('Réviser',1)+'<p class="sub">'+(n?'Rien à réviser pour le moment : reviens plus tard, les mots reviennent au bon moment.':'Découvre d’abord quelques mots en jouant : ils arriveront ici.')+'</p>'+(n?'<button class="btn ghost" data-lab="reviewforce">Réviser quand même 5 mots</button>':'')}
  if(sess.i>=sess.list.length)return head('Révision terminée',1)+'<p class="sub">'+sess.good+' mot(s) retenu(s) sur '+sess.total+'. Les mots oubliés reviennent bientôt, les mots acquis plus tard.</p><button class="btn warm" data-lab="home">Retour à l’atelier</button>';
  const w=W()[sess.list[sess.i]],q=sess.dir==='fr'?w.fr:w.wo,a=sess.dir==='fr'?w.wo:w.fr;
  return head('Réviser ('+(sess.i+1)+'/'+sess.list.length+')',1)+'<div class="labcard"><small>'+(sess.dir==='fr'?'Comment dit-on en '+esc(L().name)+' :':'Que veut dire :')+'</small><b class="big">'+esc(q)+'</b>'+(sess.shown?'<b class="big ans">'+esc(a)+'</b>':'')+'</div>'+
   (sess.shown?'<div class="row"><button class="btn ghost" data-lab="grade:again">Oublié</button><button class="btn ghost" data-lab="grade:hard">Difficile</button><button class="btn warm" data-lab="grade:good">Je savais</button></div>':'<div class="row"><button class="btn warm" data-lab="reveal">Voir la réponse</button></div>')+
   '<div class="row"><button class="btn ghost sm" data-lab="listen:'+sess.list[sess.i]+'">🔊 Écouter</button></div>'+note()}
 /* ---- Carnet ---- */
 function notebookView(){const s=srs(),ks=Object.keys(s.cards).map(Number).sort((a,b)=>a-b).filter(i=>W()[i]);
  const rows=ks.filter(i=>filter==='all'||SRS.status(s.cards[i])===filter).map(i=>{const w=W()[i],c=s.cards[i],st=SRS.status(c);return '<div class="nbrow"><div><b>'+esc(w.wo)+'</b> <span>'+esc(w.fr)+'</span> <em class="rvchip '+st+'">'+ST[st]+'</em><small> · vu '+c.seen+' fois · '+c.ok+' ✓ '+c.ko+' ✗</small></div><div class="row"><button class="btn ghost sm" data-lab="listen:'+i+'" aria-label="Écouter '+esc(w.wo)+'">🔊</button><button class="btn ghost sm" data-lab="pronw:'+i+'">Prononcer</button></div><input type="text" maxlength="200" data-note="'+i+'" placeholder="Ma note (astuce, contexte…)" value="'+esc(c.note)+'" aria-label="Note pour '+esc(w.wo)+'"></div>'}).join('');
  return head('Mon carnet · '+esc(L().name),1)+'<div class="seg">'+[['all','Tous'],['nouveau','Nouveaux'],['en_cours','En cours'],['maitrise','Maîtrisés']].map(f=>'<button data-lab="filter:'+f[0]+'" aria-pressed="'+(filter===f[0])+'">'+f[1]+'</button>').join('')+'</div>'+(rows||'<p class="sub">Aucun mot dans cette catégorie.</p>')}
 /* ---- Prononciation ---- */
 async function loadRef(i){const w=W()[i];refAudio=null;refList=[];try{refList=await refStore().forWord(L().id,w.wo,w.fr);const b=RF.best(refList);if(b){const r=await refStore().get(b.id);if(r&&r.audio&&r.audio.blob)refAudio={meta:b,blob:r.audio.blob,url:URL.createObjectURL(r.audio.blob)}}}catch(e){}}
 function pronView(){const i=cur===null?0:cur,w=W()[i];
  const rf=refAudio?'<p class="sub">Voix de référence : <b>'+esc(refAudio.meta.speaker)+'</b>'+(refAudio.meta.region?' ('+esc(refAudio.meta.region)+')':'')+' · '+RF.statusOf(refAudio.meta).label+'</p><audio controls src="'+refAudio.url+'" style="width:100%" aria-label="Voix de référence"></audio>':'<p class="note">Aucune voix de référence pour ce mot. Le bouton « Écouter » utilise la synthèse vocale du navigateur, qui n’est pas la voix d’un locuteur. Un locuteur peut en ajouter une (« Voix de locuteurs »).</p>';
  return head('Prononcer',1)+'<label class="labsel">Mot<select id="labWord">'+wordOpts(i)+'</select></label><div class="labcard"><b class="big">'+esc(w.wo)+'</b><small>'+esc(w.fr)+'</small></div>'+rf+
   '<div class="row"><button class="btn ghost" data-lab="listen:'+i+'">🔊 Écouter (synthèse)</button>'+(rec?'<button class="btn warm" data-lab="recstop">■ Arrêter</button>':'<button class="btn warm" data-lab="recstart">● M’enregistrer</button>')+'</div>'+
   (mine?'<p class="sub">Ton enregistrement :</p><audio controls src="'+mine.url+'" style="width:100%" aria-label="Ton enregistrement"></audio><div class="row"><button class="btn ghost" data-lab="compare">Comparer avec la référence</button></div>':'')+
   (res?resultHtml():'')+note()}
 function resultHtml(){if(!res.ok)return '<div class="warnbox" role="alert">'+({silence:'Je n’ai presque rien entendu : rapproche-toi du micro et réessaie.',ref:'La voix de référence est trop faible pour comparer.',noref:'Pas de voix de référence : je ne peux rien comparer. Écoute-toi, puis demande à un locuteur d’en ajouter une.',decode:'Impossible de lire l’un des enregistrements.'}[res.error]||'Comparaison impossible.')+'</div>';
  return '<div class="labres" role="status"><div class="bar"><i style="width:'+res.score+'%"></i></div><b>Ressemblance approximative : '+res.score+' / 100</b><small>rythme '+Math.round(res.rhythm*100)+' % · mélodie '+(res.melody===null?'non mesurée':Math.round(res.melody*100)+' %')+' · durée ×'+res.durRatio+'</small><ul>'+res.tips.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p class="note">Ceci compare seulement le rythme et la mélodie de deux enregistrements. Cela ne juge ni les sons ni les tons de la langue : fie-toi à l’oreille d’un locuteur.</p></div>'}
 async function micRecord(maxSec){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true}),mt=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t)),r=new MediaRecorder(stream,mt?{mimeType:mt}:undefined),chunks=[],t0=Date.now();
  const o={r,stream,t0,timer:null};rec=o;
  const done=new Promise(ok=>{r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};r.onstop=()=>{clearTimeout(o.timer);stream.getTracks().forEach(t=>t.stop());rec=null;ok({blob:new Blob(chunks,{type:r.mimeType||mt||'audio/webm'}),dur:Math.min(maxSec,(Date.now()-t0)/1000)})}});
  r.start(200);o.timer=setTimeout(()=>{try{r.stop()}catch(e){}},maxSec*1000);o.done=done;return o}
 async function decode(blob){const AC=window.AudioContext||window.webkitAudioContext,ac=new AC();try{const b=await ac.decodeAudioData(await blob.arrayBuffer());return {x:b.getChannelData(0).slice(),sr:b.sampleRate}}finally{try{ac.close()}catch(e){}}}
 async function doCompare(){res=null;if(!refAudio){res={ok:false,error:'noref'};render();return}if(!mine){return}
  try{const a=await decode(refAudio.blob),b=await decode(mine.blob);res=PR.compare(a.x,b.x,a.sr,b.sr)}catch(e){res={ok:false,error:'decode'}}render()}
 async function startMine(onDone,maxSec){try{const o=await micRecord(maxSec);setMsg('Enregistrement… parle maintenant (8 s au plus).');render();const r=await o.done;onDone(r)}catch(e){rec=null;setMsg('Micro refusé ou introuvable. Autorise le micro dans le navigateur.');render()}}
 /* ---- Voix de locuteurs ---- */
 let refDraft=null;
 function refView(){const i=cur===null?0:cur,w=W()[i],r=reviewer();
  const lst=refList.map(m=>{const s=RF.statusOf(m);return '<div class="nbrow"><div><b>'+esc(m.speaker)+'</b>'+(m.region?' · '+esc(m.region):'')+' <em class="rvchip '+(s.id==='valide'?'valide':s.id==='conteste'?'conteste':'en_cours')+'">'+s.label+' · '+s.ok+' ✓ '+s.bad+' ✗</em></div><div class="row"><button class="btn ghost sm" data-lab="rplay:'+m.id+'">▶ Écouter</button><button class="btn ghost sm" data-lab="rvote:'+m.id+':ok">Fidèle</button><button class="btn ghost sm" data-lab="rvote:'+m.id+':bad">À refaire</button></div></div>'}).join('');
  return head('Voix de locuteurs',1)+'<p class="note">Seules des personnes qui se déclarent locutrices de la langue et qui sont d’accord peuvent ajouter une voix. Elle reste sur cet appareil ; la validation par d’autres locuteurs est déclarative.</p>'+
   '<label class="labsel">Mot<select id="labWord">'+wordOpts(i)+'</select></label>'+(lst||'<p class="sub">Aucune voix pour ce mot.</p>')+
   '<div class="accform oform"><h3>Ajouter ma voix</h3><label>Mon nom ou pseudo<input id="rfName" type="text" maxlength="60" value="'+esc(r?r.name:'')+'"></label><label>Région <small>(facultatif)</small><input id="rfReg" type="text" maxlength="60"></label>'+
   '<label class="chk"><input id="rfNat" type="checkbox"'+(r&&r.native?' checked':'')+'> Je suis locuteur ou locutrice de cette langue.</label><label class="chk"><input id="rfCons" type="checkbox"> Je suis d’accord pour que ma voix soit utilisée comme référence dans ce jeu (sur cet appareil).</label>'+
   '<div class="row">'+(rec?'<button class="btn warm" data-lab="recstop">■ Arrêter</button>':'<button class="btn warm" data-lab="rrecstart">● Enregistrer le mot</button>')+'</div>'+
   (refDraft?'<audio controls src="'+refDraft.url+'" style="width:100%" aria-label="Ma voix"></audio><div class="row"><button class="btn warm" data-lab="rsave">Ajouter cette voix</button></div>':'')+'</div>'+note()}
 /* ---- Proposer un mot ---- */
 function proposeView(){const r=reviewer(),props=RV.proposalsFor(ctx.rvStore(),L().id).map(p=>{const m=RV.mine(ctx.rvStore(),L().id,p.form,p.fr);return '<div class="nbrow"><div><b>'+esc(p.form)+'</b> <span>'+esc(p.fr)+'</span>'+(p.cat?' <small>('+esc(p.cat)+')</small>':'')+' <em class="rvchip '+p.st.status+'">'+esc(p.st.label)+' · '+p.st.ok+' ✓ '+p.st.bad+' ✗</em><small> proposé par '+esc(p.by)+'</small></div><div class="row"><button class="btn ghost sm" data-lab="pvote:'+encodeURIComponent(p.form)+'|'+encodeURIComponent(p.fr)+':ok"'+(m&&m.d==='ok'?' aria-pressed="true"':'')+'>Correct</button><button class="btn ghost sm" data-lab="pvote:'+encodeURIComponent(p.form)+'|'+encodeURIComponent(p.fr)+':bad">Incorrect</button></div></div>'}).join('');
  return head('Proposer un mot',1)+'<p class="note">Réservé aux locuteurs de la langue. Une proposition n’entre jamais dans le jeu toute seule : elle doit être confirmée par d’autres locuteurs puis reprise par un mainteneur.</p>'+
   (r&&r.native?'<p class="sub">Connecté comme <b>'+esc(r.name)+'</b> (locuteur déclaré).</p>':'<div class="accform oform"><label>Mon nom ou pseudo<input id="pvName" type="text" maxlength="60"></label><label class="chk"><input id="pvNat" type="checkbox"> Je suis locuteur ou locutrice de '+esc(L().name)+'.</label><div class="row"><button class="btn ghost" data-lab="pwho">Me déclarer</button></div></div>')+
   (r&&r.native?'<div class="accform oform"><label>Mot en '+esc(L().name)+'<input id="pvForm" type="text" maxlength="120"></label><label>Sens en français<input id="pvFr" type="text" maxlength="160"></label><label>Catégorie <small>(facultatif)</small><input id="pvCat" type="text" maxlength="40"></label><label>Note <small>(prononciation, usage…)</small><input id="pvNote" type="text" maxlength="300"></label><div class="row"><button class="btn warm" data-lab="psave">Proposer</button></div></div>':'')+
   (props||'<p class="sub">Aucune proposition pour cette langue.</p>')+note()}
 /* ---- écoute ---- */
 async function listen(i){const w=W()[i];await loadRef(i);if(refAudio){try{const a=new Audio(refAudio.url);a.play();return}catch(e){}}ctx.say(w.wo)}
 const P=(s)=>s.split(':');
 async function onClick(e){
  const n=e.target.closest('[data-lab]');if(!n)return;const act=n.dataset.lab,s=srs();
  if(act==='close')return close();if(act==='home'){view='home';sess=null;return render()}
  if(act==='review'||act==='reviewforce')return startReview(act==='reviewforce');
  if(act==='reveal'){sess.shown=true;return render()}
  if(act.indexOf('grade:')===0){const idx=sess.list[sess.i],g=P(act)[1];SRS.grade(s,idx,g,now());sess.total++;if(g==='good')sess.good++;sess.i++;sess.shown=false;sess.dir=Math.random()<.5?'fr':'wo';ctx.save();return render()}
  if(act.indexOf('listen:')===0)return listen(+P(act)[1]);
  if(act==='notebook'){view='notebook';return render()}
  if(act.indexOf('filter:')===0){filter=P(act)[1];return render()}
  if(act==='pron'||act==='ref'||act==='propose'){view=act;if(act!=='propose'){if(cur===null)cur=0;await loadRef(cur)}mine=null;res=null;refDraft=null;return render()}
  if(act.indexOf('pronw:')===0){cur=+P(act)[1];view='pron';mine=null;res=null;await loadRef(cur);return render()}
  if(act==='recstart'){return startMine(r=>{mine={blob:r.blob,url:URL.createObjectURL(r.blob)};res=null;setMsg('');render()},8)}
  if(act==='rrecstart'){return startMine(r=>{refDraft={blob:r.blob,url:URL.createObjectURL(r.blob),dur:r.dur};setMsg('');render()},RF.MAX_SEC)}
  if(act==='recstop'){if(rec)try{rec.r.stop()}catch(e){}return}
  if(act==='compare')return doCompare();
  if(act.indexOf('rplay:')===0){const r=await refStore().get(P(act)[1]);if(r&&r.audio)new Audio(URL.createObjectURL(r.audio.blob)).play();return}
  if(act.indexOf('rvote:')===0){const p=P(act),r=await refStore().vote(p[1],reviewer(),p[2]);setMsg(r.ok?'Avis enregistré : '+r.status.label+'.':({reviewer:'Déclare-toi d’abord locuteur (onglet « Proposer un mot »).',native:'Seuls les locuteurs peuvent donner un avis.',self:'Tu ne peux pas valider ta propre voix.'}[r.error]||'Échec.'));await loadRef(cur);return render()}
  if(act==='rsave'){if(!refDraft){setMsg('Enregistre d’abord le mot.');return}const v=id=>($(id)||{}).value||'',w=W()[cur],ch=id=>!!($(id)||{}).checked;
   const r=await refStore().add({lang:L().id,form:w.wo,fr:w.fr,speaker:v('#rfName'),region:v('#rfReg'),native:ch('#rfNat'),consent:ch('#rfCons'),dur:refDraft.dur},{blob:refDraft.blob,type:refDraft.blob.type});
   if(!r.ok){setMsg({consent:'Coche l’accord : la voix ne peut être utilisée qu’avec ton consentement.',native:'Seuls les locuteurs de la langue peuvent ajouter une voix de référence.',speaker:'Écris ton nom ou un pseudo.',audio:'Enregistre d’abord le mot.',toobig:'Enregistrement trop long.',storage:'Stockage indisponible.'}[r.errors[0]]||'Échec.');return}
   refDraft=null;await loadRef(cur);setMsg('Voix ajoutée. Elle est « proposée » : deux autres locuteurs doivent la confirmer.');return render()}
  if(act==='pwho'){const v=id=>($(id)||{}).value||'',r=RV.setReviewer(ctx.rvStore(),{name:v('#pvName'),native:!!($('#pvNat')||{}).checked,qualification:''});if(!r.ok){setMsg('Écris ton nom ou un pseudo.');return}ctx.save();return render()}
  if(act==='psave'){const v=id=>($(id)||{}).value||'',r=RV.propose(ctx.rvStore(),L().id,v('#pvForm'),v('#pvFr'),{cat:v('#pvCat'),note:v('#pvNote')});
   if(!r.ok){setMsg({reviewer:'Déclare-toi d’abord.',native:'Réservé aux locuteurs de la langue.',empty:'Remplis le mot et son sens.',dup:'Ce mot a déjà été proposé.',toomany:'Trop de propositions.'}[r.error]||'Échec.');return}
   ctx.save();msg='Proposition enregistrée sur cet appareil. Elle sera relue par d’autres locuteurs.';return render()}
  if(act.indexOf('pvote:')===0){const p=P(act),k=p[1].split('|'),r=RV.submit(ctx.rvStore(),L().id,decodeURIComponent(k[0]),decodeURIComponent(k[1]),p[2]);if(r.ok)ctx.save();setMsg(r.ok?'Avis enregistré.':({reviewer:'Déclare-toi d’abord.',native:'Réservé aux locuteurs.'}[r.error]||'Échec.'));return render()}
 }
 root.addEventListener('click',onClick);
 root.addEventListener('change',async e=>{if(e.target.id==='labWord'){cur=+e.target.value;mine=null;res=null;await loadRef(cur);render()}});
 root.addEventListener('input',e=>{const i=e.target.dataset&&e.target.dataset.note;if(i!==undefined&&i!==''){const c=srs().cards[i];if(c){c.note=e.target.value.slice(0,200);clearTimeout(onNote.t);onNote.t=setTimeout(ctx.save,400)}}});
 const onNote=()=>{};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.stopPropagation();close()}},true);
 function openLab(v){if(ctx.onOpen)ctx.onOpen();prevFocus=document.activeElement;open=true;view=v||'home';sess=null;msg='';root.hidden=false;render();const f=root.querySelector('button');if(f)f.focus()}
 function close(){if(rec){try{rec.r.stop()}catch(e){}}open=false;root.hidden=true;[mine,refDraft,refAudio].forEach(x=>{try{x&&x.url&&URL.revokeObjectURL(x.url)}catch(e){}});mine=null;refDraft=null;refAudio=null;res=null;if(prevFocus&&prevFocus.focus)try{prevFocus.focus()}catch(e){}}
 return {open:openLab,close,isOpen:()=>open,_s:()=>({view,cur,sess})}}
LCA.lab={create};
})(window.LCA=window.LCA||{});
