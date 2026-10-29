/* Interface des leçons : hub, quiz, correction, résultats, tableau de bord. Navigateur uniquement.
   Toute la logique (XP, séries, badges, déblocage) reste dans progression.js ; ce fichier ne fait qu’afficher et relayer les clics. */
(function(LCA){
'use strict';
const PR=LCA.progress,QZ=LCA.quiz;
const ICON={
 book:'<path d="M12 6c-2-1.6-5-2-9-1.5v14c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5v-14C17 4 14 4.4 12 6zM12 6v14"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="M7.5 12.5l3 3 6-7"/>',
 flame:'<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 compass:'<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 flower:'<path d="M12 3c2 2 2 4 0 6 2-2 4-2 6 0-2 2-4 2-6 0 2 2 2 4 0 6 0-2-2-4-4-4 2 0 4-2 4-4-2 2-4 2-6 0 2-2 4-2 6 0z"/><circle cx="12" cy="9" r="1.2"/><path d="M12 15c-1 2-1 4 0 6"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4M8 20h8M9 17h6"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>'
};
const svg=(n,c)=>'<svg class="li '+(c||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[n]+'</svg>';
const TIMER_S=20;

function create(ctx){
 const $=ctx.$,esc=ctx.esc,root=$('#learn');
 let view='hub',sel=null,validated=null,tmr=null,tLeft=0,lastResult=null,lastSummary=null,open=false,hubLang=null;
 const cache={};
 const prof=()=>{const s=ctx.state();if(!s.learn||!s.learn.v)s.learn=PR.normalize(s.learn);return s.learn};
 const L0=()=>ctx.lang();
 const qmap=L=>cache[L.id]||(cache[L.id]=QZ.allQuestions(L));
 const lessonsOf=L=>QZ.curriculumFor(L).lessons;
 const wordsLearned=()=>{let n=0;const d=ctx.state().d;Object.keys(d).forEach(k=>{n+=Object.keys((d[k]&&d[k].learned)||{}).length});return n};
 /* informations de niveau pour la progression : toutes les leçons disponibles du niveau d’une leçon, dans sa langue */
 const levelInfo=lid=>{const lg=String(lid).split(':')[0],L=LANGS_get(lg);if(!L)return null;const cu=QZ.curriculumFor(L);
  for(const lv of cu.levels){const av=lv.lessons.filter(x=>x.available);if(av.some(x=>x.id===lid))return {n:lv.n,ids:av.map(x=>x.id)}}return null};
 const pctx=()=>({wordsLearned:wordsLearned(),levelInfo});
 const persist=()=>ctx.save();
 const stopTimer=()=>{if(tmr){clearInterval(tmr);tmr=null}};

 function setOpen(v){open=v;root.hidden=!v;document.body.classList.toggle('learn-open',v);if(!v){stopTimer();ctx.onClose&&ctx.onClose()}else ctx.onOpen&&ctx.onOpen()}
 const isOpen=()=>open;
 function close(){setOpen(false)}

 /* ---------- éléments communs ---------- */
 function levelBar(p){const lv=PR.levelFor(p.xp);
  return '<div class="lv"><div class="lvh"><b>'+esc(lv.level.name)+'</b><span>'+p.xp+' XP'+(lv.next?' · encore '+lv.toNext+' avant « '+esc(lv.next.name)+' »':' · niveau maximal')+'</span></div><div class="bar"><i style="width:'+lv.pct+'%"></i></div></div>'}
 function topbar(title,back){return '<header class="lh"><button class="lx" data-a="'+(back||'close')+'" aria-label="'+(back?'Retour':'Fermer')+'">'+svg(back?'book':'x')+'</button><h2>'+title+'</h2></header>'}
 const provisional=q=>QZ.isAuthentic(q)?'':'<p class="prov" role="note"><b>Contenu provisoire.</b> Ces traductions n’ont pas encore été vérifiées par un locuteur : ne les prends pas pour une vérité culturelle établie.</p>';

 /* ---------- hub : choix de la leçon ---------- */
 function hubHtml(){
  const p=prof(),L=LANGS_get(hubLang||L0().id),cur=QZ.curriculumFor(L),rec=PR.recommended(p,cur.lessons);
  let h=topbar('École du village')+'<div class="lbody">'+'<p class="sub">Langue étudiée : <b>'+esc(L.name)+'</b>. Termine une leçon avec au moins '+Math.round(PR.CONFIG.passRate*100)+' % de bonnes réponses pour ouvrir la suivante.</p>'+levelBar(p);
  if(p.session&&!p.session.finished){const sl=LANGS_get(p.session.lang);h+='<div class="resume"><span>Leçon en cours : <b>'+esc(titleOf(p.session))+'</b> ('+p.session.results.length+'/'+p.session.qids.length+')</span><button class="btn warm sm" data-a="resume">Reprendre</button></div>'}
  cur.levels.forEach(lv=>{
   h+='<h3 class="lvt"><span>Niveau '+lv.n+'</span> '+esc(lv.title)+'</h3>';
   if(!lv.lessons.length&&lv.todo)h+='<div class="lc todo"><div><b>À venir</b><small>'+esc(lv.todo)+' Rien n’est inventé en attendant.</small></div></div>';
   lv.lessons.forEach(ls=>{
    const st=ls.available?PR.lessonState(p,cur.lessons,ls.id):'todo',rec2=p.lessons[ls.id];
    const pc=rec2&&rec2.done?Math.round(rec2.best*100):0;
    let side='';
    if(st==='locked')side=svg('lock','lk');else if(st==='todo')side='';
    else side='<button class="btn '+(rec&&rec.id===ls.id?'warm':'ghost')+' sm" data-a="start" data-id="'+esc(ls.id)+'">'+(PR.resumable(p,ls.id)?'Reprendre':(rec2&&rec2.done?'Rejouer':'Commencer'))+'</button>';
    h+='<div class="lc '+st+'"><div><b>'+esc(ls.title)+'</b><small>'+(st==='todo'?(ls.kind==='words'?'À compléter : seulement '+ls.words+' mot(s) documenté(s) en '+esc(L.name)+' (minimum '+QZ.MIN_WORDS+').':'À compléter : cette leçon demande '+esc(ls.needs||'plus de contenu documenté')+'. Rien n’est inventé pour la remplir.'):st==='locked'?'Verrouillée : réussis d’abord la leçon précédente.':ls.count+' questions'+(rec2&&rec2.done?' · meilleur score '+pc+' %'+(rec2.perfect?' · parfaite':''):''))+'</small></div>'+side+'</div>'});
  });
  const rn=Object.keys(p.review).filter(id=>id.indexOf(L.id+'.')===0&&qmap(L)[id]).length;
  h+='<div class="lrow"><button class="btn '+(rn?'warm':'ghost')+' sm" data-a="review"'+(rn?'':' disabled')+'>Réviser mes erreurs ('+rn+')</button><button class="btn ghost sm" data-a="dash">Mon parcours</button></div></div>';
  return h}
 const LANGS_get=id=>ctx.langs()[id]||L0();
 const titleOf=s=>{if(s.review)return 'Révision';const L=LANGS_get(s.lang),ls=lessonsOf(L).find(x=>x.id===s.lid);return ls?ls.title:s.lid};

 /* ---------- quiz ---------- */
 function curQ(){const p=prof(),s=p.session;if(!s)return null;const L=LANGS_get(s.lang);return {q:qmap(L)[s.qids[s.i]],L,s,p}}
 function quizHtml(){
  const c=curQ();if(!c)return hubHtml();
  const {q,s,p}=c;
  if(!q)return topbar('Leçon indisponible')+'<div class="lbody"><p class="err">Cette question n’est plus disponible (le contenu a changé). Ta progression est conservée.</p><button class="btn warm" data-a="hub">Retour</button></div>';
  const n=s.i+1,tot=s.qids.length,done=validated!==null||s.results.length>s.i;
  const res=done?s.results[s.i]:null;
  let h=topbar(esc(titleOf(s)))+'<div class="lbody"><div class="qhead"><span>Question '+n+'/'+tot+'</span><button class="chrono'+(p.settings.timer?' on':'')+'" data-a="timer" aria-pressed="'+!!p.settings.timer+'">Chrono : '+(p.settings.timer?'oui':'non')+'</button></div><div class="bar"><i style="width:'+Math.round((s.results.length/tot)*100)+'%"></i></div>';
  if(p.settings.timer&&!done)h+='<div class="tbar" aria-hidden="true"><i id="tfill" style="width:'+(tLeft/TIMER_S*100)+'%"></i></div>';
  h+=provisional(q)+'<p class="qp">'+esc(q.prompt)+'</p><div class="qw"><span id="qtext">'+esc(q.text)+'</span>'+(q.say?'<button class="spk2" data-a="say" aria-label="Écouter">'+svg('speaker')+'</button>':'')+'</div>';
  h+='<div class="opts" role="radiogroup" aria-label="Propositions">';
  q.options.forEach((o,k)=>{
   let cls='';if(done){if(o.id===q.answer)cls=' ok';else if(res.sel===o.id)cls=' ko'}else if(sel===o.id)cls=' sel';
   h+='<button class="opt'+cls+'" role="radio" aria-checked="'+(sel===o.id||(done&&res.sel===o.id))+'" data-a="pick" data-o="'+o.id+'"'+(done?' disabled':'')+'><span class="ol">'+'ABCD'[k]+'</span><span>'+esc(o.text)+'</span></button>'});
  h+='</div>';
  if(!done)h+='<button class="btn warm lgo" data-a="ok"'+(sel?'':' disabled')+'>Valider ma réponse</button>';
  else{
   const last=s.i+1>=tot;
   h+='<div class="fb '+(res.ok?'good':'bad')+'" role="status"><b>'+(res.sel===null?'Temps écoulé. ':'')+(res.ok?'Très bien ! Tu as reconnu le mot.':'Pas tout à fait ! Voici la bonne réponse et son explication.')+'</b>'+
    (res.ok?'':'<p>Bonne réponse : <b>'+esc(q.options.find(o=>o.id===q.answer).text)+'</b></p>')+'<p>'+esc(q.explanation)+'</p>'+
    (res.xp?'<p class="xp">+'+res.xp+' XP'+(res.events.length>1?' <small>('+res.events.map(e=>({correct:'bonne réponse',retry:'révision réussie',streak3:'série de 3',streak5:'série de 5'}[e.type])+' +'+e.xp).join(', ')+')</small>':'')+'</p>':(res.ok?'<p class="xp0">Déjà récompensée : pas de nouveaux points, mais bravo !</p>':'<p class="enc">Continue, tu progresses à chaque tentative.</p>'))+'</div>';
   if(lastResult&&lastResult.newBadges&&lastResult.newBadges.length)h+=badgePop(lastResult.newBadges);
   h+='<button class="btn warm lgo" data-a="next">'+(last?'Voir mon résultat':'Question suivante')+'</button>'}
  return h+'</div>'}
 const badgePop=bs=>bs.map(b=>'<div class="bpop">'+svg(b.icon)+'<span>Nouveau badge : <b>'+esc(b.name)+'</b></span></div>').join('');

 function resultHtml(){
  const sm=lastSummary,p=prof();if(!sm)return hubHtml();
  const cur=QZ.curriculumFor(LANGS_get(lastSummary.lang||L0().id)),rec=sm.review?null:PR.recommended(p,cur.lessons);
  const pct=sm.total?Math.round(sm.score/sm.total*100):0;
  let h=topbar(sm.review?'Révision terminée':'Leçon terminée')+'<div class="lbody res"><div class="score">'+sm.score+' / '+sm.total+'</div><p class="sub">'+(sm.perfect?'Réussite parfaite ! Un badge t’attend.':pct>=PR.CONFIG.passRate*100?'Bravo, tu as réussi la leçon.':'Tu peux la rejouer pour progresser et ouvrir la suite.')+'</p>';
  h+='<div class="xpbox"><b>+'+(sm.xpSession)+' XP</b><small>'+(sm.xpBonus?'dont '+sm.xpBonus+' XP de bonus de leçon'+((sm.events||[]).filter(e=>e.type==='level').map(e=>' et de niveau '+e.n+' terminé')[0]||''):'Aucun point de leçon supplémentaire : déjà obtenu')+'</small></div>'+levelBar(p);
  if(sm.newBadges.length)h+=badgePop(sm.newBadges);
  if(sm.unlockedJournal)h+='<div class="bpop">'+svg('book')+'<span>Nouvelle page dans ton journal : <b>'+esc(sm.title||'')+'</b></span></div>';
  h+='<div class="lrow">'+(rec?'<button class="btn warm" data-a="start" data-id="'+esc(rec.id)+'">Leçon suivante : '+esc(rec.title)+'</button>':'')+
   (p.stats&&Object.keys(p.review).length?'<button class="btn ghost" data-a="review">Revoir mes erreurs</button>':'')+'<button class="btn ghost" data-a="hub">Choisir une leçon</button><button class="btn ghost" data-a="dash">Mon parcours</button><button class="btn ghost" data-a="close">Retourner au village</button></div></div>';
  return h}

 /* ---------- tableau de bord ---------- */
 function dashHtml(){
  const p=prof(),L=L0(),lv=PR.levelFor(p.xp),dv=PR.derived(p,pctx());
  const langs=ctx.langs();let studied=[];
  Object.keys(langs).forEach(id=>{const cur=QZ.curriculumFor(langs[id]),dn=cur.lessons.filter(l=>p.lessons[l.id]&&p.lessons[l.id].done).length,wl=Object.keys(((ctx.state().d[id])||{}).learned||{}).length;if(dn||wl)studied.push({L:langs[id],dn,tot:cur.lessons.length,wl})});
  let h=topbar('Mon parcours')+'<div class="lbody dash"><div class="dcards">'+
   '<div class="dc big"><div class="dci">'+svg('trophy')+'</div><div><b>'+esc(lv.level.name)+'</b><span>'+p.xp+' XP</span></div><div class="bar"><i style="width:'+lv.pct+'%"></i></div><small>'+(lv.next?'Encore '+lv.toNext+' XP pour « '+esc(lv.next.name)+' »':'Niveau maximal atteint')+'</small></div>'+
   '<div class="dc"><b>'+dv.lessonsDone+'</b><span>leçons terminées</span></div>'+
   '<div class="dc"><b>'+dv.rate+' %</b><span>de réussite ('+dv.correct+'/'+dv.answers+')</span></div>'+
   '<div class="dc"><b>'+dv.wordsLearned+'</b><span>mots appris</span></div>'+
   '<div class="dc"><b>'+dv.reviewCount+'</b><span>à réviser</span></div></div>';
  h+='<h3>Langues étudiées</h3>'+(studied.length?studied.map(s=>'<div class="lc"><div><b>'+esc(s.L.name)+'</b><small>'+s.dn+' leçon(s) terminée(s) sur '+s.tot+' · '+s.wl+' mot(s) appris</small></div></div>').join(''):'<p class="sub">Aucune pour le moment : parle à l’enseignant pour commencer.</p>');
  h+='<h3>Badges</h3><div class="badges">'+PR.CONFIG.badges.map(b=>{const g=p.badges[b.id];return '<div class="bd'+(g?' on':'')+'" title="'+esc(b.desc)+'">'+svg(g?b.icon:'lock')+'<b>'+esc(b.name)+'</b><small>'+(g?'Obtenu le '+new Date(g.at).toLocaleDateString('fr-FR'):esc(b.desc))+'</small></div>'}).join('')+'</div>';
  const jr=Object.keys(p.journal);h+='<h3>Pages du journal</h3>'+(jr.length?jr.map(id=>{const lg=LANGS_get(id.split(':')[0]),ls=lessonsOf(lg).find(x=>x.id===id);if(!ls)return '';const ws=QZ.wordsOf(lg,ls.cat);return '<details class="jp"><summary>'+esc(lg.name)+' · '+esc(ls.title)+'</summary><p class="sub">Vocabulaire de la leçon (provisoire, non validé) :</p><ul>'+ws.map(w=>'<li><b>'+esc(w.wo)+'</b> : '+esc(w.fr)+'</li>').join('')+'</ul></details>'}).join(''):'<p class="sub">Les pages se débloquent en terminant des leçons. Elles reprennent uniquement le vocabulaire étudié.</p>');
  const rv=Object.keys(p.review);h+='<div class="lrow"><button class="btn warm sm" data-a="review"'+(rv.length?'':' disabled')+'>Réviser mes erreurs ('+rv.length+')</button><button class="btn ghost sm" data-a="hub">École du village</button></div></div>';
  return h}

 function render(){
  let h;
  if(view==='quiz')h=quizHtml();else if(view==='result')h=resultHtml();else if(view==='dash')h=dashHtml();else h=hubHtml();
  root.innerHTML='<div class="lcard">'+h+'</div>';
  root.querySelector('.lbody')&&(root.querySelector('.lbody').scrollTop=0);
  if(view==='quiz')armTimer();
 }
 function armTimer(){
  stopTimer();const c=curQ(),p=prof();if(!c||!c.q||!p.settings.timer||validated!==null||c.s.results.length>c.s.i)return;
  if(tLeft<=0||tLeft>TIMER_S)tLeft=TIMER_S;
  tmr=setInterval(()=>{tLeft-=.25;const f=$('#tfill');if(f)f.style.width=Math.max(0,tLeft/TIMER_S*100)+'%';if(tLeft<=0){stopTimer();submit(null)}},250);
 }

 /* ---------- actions ---------- */
 function show(v){view=v;sel=null;validated=null;if(v!=='quiz')stopTimer();render()}
 function startLesson(id){
  const L=LANGS_get(id.split(':')[0]);const cur=QZ.curriculumFor(L),ls=cur.lessons.find(x=>x.id===id),p=prof();
  if(!ls){ctx.toast('Cette leçon n’est pas disponible.');return}
  if(PR.lessonState(p,cur.lessons,id)==='locked'){ctx.toast('Leçon verrouillée : réussis d’abord la précédente.');return}
  if(!PR.resumable(p,id)){const qs=QZ.questionsFor(L,ls);if(qs.length<1){ctx.toast('Contenu pédagogique indisponible.');return}PR.startSession(p,ls,qs.map(q=>q.id))}
  persist();tLeft=TIMER_S;lastResult=null;show('quiz');quizSay();
 }
 function startReview(){
  const L=L0(),p=prof(),m=qmap(L),ids=Object.keys(p.review).filter(id=>m[id]).slice(0,PR.CONFIG.reviewSize);
  if(!ids.length){ctx.toast('Rien à réviser pour le moment.');return}
  PR.startSession(p,{id:'review:'+L.id,lang:L.id,review:true},ids);persist();tLeft=TIMER_S;lastResult=null;show('quiz');quizSay();
 }
 function quizSay(){const c=curQ();if(c&&c.q&&c.q.say&&c.s.results.length<=c.s.i)ctx.say(c.q.say)}
 function submit(optId){
  const c=curQ();if(!c||!c.q)return;const p=c.p;
  if(validated!==null||c.s.results.length>c.s.i)return;/* déjà validée : on ignore les clics répétés */
  stopTimer();
  const r=PR.answer(p,c.q,optId,pctx());if(r.error)return;
  validated=optId===null?'timeout':optId;lastResult=r;
  if(r.ok)ctx.learnWord&&ctx.learnWord(c.L,c.q);
  persist();render();if(r.newBadges&&r.newBadges.length)ctx.toast('Nouveau badge : '+r.newBadges[0].name);
 }
 function next(){
  const p=prof(),s=p.session;if(!s)return show('hub');
  if(s.i>=s.results.length)return;/* pas encore répondu */
  const more=PR.next(p);validated=null;sel=null;lastResult=null;tLeft=TIMER_S;persist();
  if(more){render();quizSay()}else{
   const lang=s.lang,title=titleOf(s);const sm=PR.finish(p,pctx());if(sm.error){show('hub');return}
   sm.lang=lang;sm.title=title;lastSummary=sm;
   ctx.onFinish&&ctx.onFinish(sm);persist();show('result')}
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
  if(a==='close')close();
  else if(a==='hub')show('hub');
  else if(a==='dash')show('dash');
  else if(a==='start')startLesson(b.dataset.id);
  else if(a==='resume'){const s=prof().session;if(s){tLeft=TIMER_S;show('quiz');quizSay()}}
  else if(a==='review')startReview();
  else if(a==='pick'){const c=curQ();if(c&&c.s.results.length<=c.s.i&&validated===null){sel=b.dataset.o;render()}}
  else if(a==='ok'){if(sel)submit(sel)}
  else if(a==='next')next();
  else if(a==='timer'){const p=prof();p.settings.timer=p.settings.timer?0:1;tLeft=TIMER_S;persist();render()}
  else if(a==='say'){const c=curQ();if(c&&c.q&&c.q.say)ctx.say(c.q.say)}
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
 /* API */
 function openHub(){hubLang=null;setOpen(true);show('hub')}
 function openDash(){setOpen(true);show('dash')}
 function startRecommended(){
  const p=prof(),L=L0(),cur=QZ.curriculumFor(L);hubLang=null;setOpen(true);
  if(p.session&&!p.session.finished&&p.session.lang===L.id){tLeft=TIMER_S;show('quiz');quizSay();return}
  const rec=PR.recommended(p,cur.lessons);
  if(!cur.lessons.length){show('hub');return}
  if(rec)startLesson(rec.id);else show('hub');
 }
 return {openHub,openDash,startRecommended,isOpen,close,_state:()=>({view,sel,validated})};
}
LCA.learnUI={create};
})(window.LCA=window.LCA||{});
