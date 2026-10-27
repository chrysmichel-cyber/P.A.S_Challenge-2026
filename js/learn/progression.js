/* Règles de progression : expérience, niveaux, badges, séries, révision.
   Module pur (aucun accès au DOM ni au stockage) : il fonctionne dans le navigateur (window.LCA.progress) et sous Node (tests). */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.progress=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';

/* ---------- Règles configurables ---------- */
const CONFIG={
 xp:{correctFirst:10,retry:5,streak3:5,streak5:10,lesson:20,level:50},
 passRate:.6,           /* part de bonnes réponses qui débloque la leçon suivante */
 reviewSize:10,         /* questions d’une séance de révision */
 levels:[
  {id:'debutant',name:'Débutant',xp:0},
  {id:'explorateur',name:'Explorateur',xp:100},
  {id:'apprenti',name:'Apprenti linguiste',xp:250},
  {id:'gardien',name:'Gardien des langues',xp:500},
  {id:'maitre',name:'Maître des connaissances',xp:900}],
 badges:[
  {id:'premiere_lecon',name:'Première leçon terminée',desc:'Terminer une leçon.',icon:'book',test:s=>s.lessonsDone>=1},
  {id:'dix_bonnes',name:'Dix bonnes réponses',desc:'Répondre juste à 10 questions différentes.',icon:'check',test:s=>s.distinctCorrect>=10},
  {id:'serie_5',name:'Série de cinq',desc:'Enchaîner 5 bonnes réponses d’affilée.',icon:'flame',test:s=>s.bestStreak>=5},
  {id:'premiere_parfaite',name:'Première leçon parfaite',desc:'Terminer une leçon sans aucune erreur.',icon:'star',test:s=>s.perfect>=1},
  {id:'explorateur_langues',name:'Explorateur des langues',desc:'Terminer une leçon dans deux langues différentes.',icon:'compass',test:s=>s.langsStudied>=2},
  {id:'niveau_3',name:'Expressions maîtrisées',desc:'Terminer toutes les leçons disponibles du niveau 3 dans une langue.',icon:'compass',test:s=>s.levelsDone.indexOf(3)>=0},
  {id:'niveau_4',name:'Voyageur confirmé',desc:'Terminer toutes les leçons disponibles du niveau 4 dans une langue.',icon:'trophy',test:s=>s.levelsDone.indexOf(4)>=0},
  {id:'collectionneur',name:'Collectionneur de connaissances',desc:'Apprendre 30 mots (cartes, quiz ou objets).',icon:'flower',test:s=>s.wordsLearned>=30}]
};

const SCHEMA=1;
const clone=o=>JSON.parse(JSON.stringify(o));
const iso=now=>new Date(now===undefined?Date.now():now).toISOString();

function newProfile(){
 return {v:SCHEMA,xp:0,levelsDone:{},answered:{},lessons:{},badges:{},review:{},journal:{},stats:{answers:0,correct:0,bestStreak:0,perfect:0},settings:{timer:0},session:null};
}
/* Rend un profil lu sur disque exploitable (champs manquants, types erronés). */
function normalize(p){
 const b=newProfile();if(!p||typeof p!=='object')return b;
 const o=Object.assign(newProfile(),p);
 ['answered','lessons','badges','review','journal','stats','settings','levelsDone'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]=clone(b[k])});
 o.stats=Object.assign(clone(newProfile().stats),o.stats);o.settings=Object.assign({timer:0},o.settings);
 o.xp=Number.isFinite(o.xp)&&o.xp>0?Math.floor(o.xp):0;o.v=SCHEMA;
 if(o.session&&(typeof o.session!=='object'||!Array.isArray(o.session.qids)||!Array.isArray(o.session.results)))o.session=null;
 return o;
}

/* ---------- Niveaux ---------- */
function levelFor(xp,levels){
 levels=levels||CONFIG.levels;let i=0;for(let k=0;k<levels.length;k++)if(xp>=levels[k].xp)i=k;
 const cur=levels[i],next=levels[i+1]||null;
 const into=xp-cur.xp,span=next?next.xp-cur.xp:0;
 return {index:i,level:cur,next,into,span,pct:next?Math.min(100,Math.round(into/span*100)):100,toNext:next?next.xp-xp:0};
}

/* ---------- Statistiques dérivées ---------- */
function derived(p,ctx){
 ctx=ctx||{};const langs={};let lessonsDone=0;
 Object.keys(p.lessons).forEach(id=>{const l=p.lessons[id];if(l&&l.done&&!l.review){lessonsDone++;langs[l.lang||id.split(':')[0]]=1}});
 const distinctCorrect=Object.keys(p.answered).filter(q=>p.answered[q].okCount>0).length;
 const a=p.stats.answers;
 return {lessonsDone,langsStudied:Object.keys(langs).length,distinctCorrect,bestStreak:p.stats.bestStreak,perfect:p.stats.perfect,
  levelsDone:Array.from(new Set(Object.keys(p.levelsDone||{}).map(k=>+k.split(':')[1]))).filter(n=>n>0),wordsLearned:ctx.wordsLearned||0,answers:a,correct:p.stats.correct,rate:a?Math.round(p.stats.correct/a*100):0,reviewCount:Object.keys(p.review).length};
}

/* ---------- Badges : attribués une seule fois ---------- */
function evaluateBadges(p,ctx,now){
 const s=derived(p,ctx),out=[];
 CONFIG.badges.forEach(b=>{if(!p.badges[b.id]&&b.test(s)){p.badges[b.id]={at:iso(now)};out.push(b)}});
 return out;
}

/* ---------- Leçons : déblocage ---------- */
const lessonRec=(p,id)=>p.lessons[id]||null;
const passed=(p,id)=>{const l=lessonRec(p,id);return !!(l&&l.done&&l.best>=CONFIG.passRate)};
/* lessons : liste ordonnée [{id,...}] ; une leçon est ouverte si la précédente est réussie. */
function lessonState(p,lessons,id){
 const i=lessons.findIndex(l=>l.id===id);if(i<0)return 'absent';
 const l=lessonRec(p,id);
 if(i>0&&!passed(p,lessons[i-1].id))return 'locked';
 if(l&&l.done)return l.best>=1?'perfect':'done';
 return 'open';
}
function recommended(p,lessons){
 for(const l of lessons){const s=lessonState(p,lessons,l.id);if(s==='open')return l}
 return null;
}

/* ---------- Séances ---------- */
function startSession(p,lesson,qids,now){
 const s={lid:lesson.id,lang:lesson.lang,review:!!lesson.review,qids:qids.slice(),i:0,results:[],streak:0,xp:0,startedAt:iso(now),finished:false};
 p.session=s;return s;
}
function resumable(p,lessonId){return !!(p.session&&p.session.lid===lessonId&&!p.session.finished&&p.session.results.length<p.session.qids.length)}

/* Enregistre une réponse. Idempotent : une question déjà répondue dans la séance renvoie son résultat initial sans rien modifier. */
function answer(p,question,selectedId,ctx,now){
 const s=p.session;
 if(!s||s.finished)return {error:'no-session'};
 const idx=s.results.length;
 if(s.i<idx){/* déjà répondue */return Object.assign({},s.results[s.i],{duplicate:true})}
 if(s.qids[s.i]!==question.id)return {error:'wrong-question'};
 const ok=selectedId===question.answer;
 const rec=p.answered[question.id]||(p.answered[question.id]={n:0,okCount:0,firstOk:null,paid:false,retryPaid:false,last:null});
 const first=rec.n===0;
 rec.n++;rec.last=iso(now);if(ok)rec.okCount++;if(first)rec.firstOk=ok;
 p.stats.answers++;if(ok)p.stats.correct++;
 const events=[];let xp=0;
 if(ok){
  s.streak++;if(s.streak>p.stats.bestStreak)p.stats.bestStreak=s.streak;
  delete p.review[question.id];
  if(first&&!rec.paid){rec.paid=true;xp+=CONFIG.xp.correctFirst;events.push({type:'correct',xp:CONFIG.xp.correctFirst})}
  else if(!first&&rec.firstOk===false&&!rec.retryPaid){rec.retryPaid=true;xp+=CONFIG.xp.retry;events.push({type:'retry',xp:CONFIG.xp.retry})}
  if(!s.review){
   const L=p.lessons[s.lid]||(p.lessons[s.lid]={lang:s.lang,done:false,best:0,attempts:0,perfect:false,bonus:{}});
   if(!L.bonus)L.bonus={};
   if(s.streak===3&&!L.bonus.s3){L.bonus.s3=1;xp+=CONFIG.xp.streak3;events.push({type:'streak3',xp:CONFIG.xp.streak3})}
   if(s.streak===5&&!L.bonus.s5){L.bonus.s5=1;xp+=CONFIG.xp.streak5;events.push({type:'streak5',xp:CONFIG.xp.streak5})}
  }
 }else{s.streak=0;p.review[question.id]=1}
 p.xp+=xp;s.xp+=xp;
 const res={qid:question.id,sel:selectedId,ok,xp,events,correct:question.answer,first};
 s.results.push(res);
 const newBadges=evaluateBadges(p,ctx,now);
 return Object.assign({},res,{newBadges,duplicate:false});
}
function next(p){const s=p.session;if(!s)return false;if(s.i<s.results.length)s.i++;return s.i<s.qids.length}

/* Clôture : bonus de leçon (une seule fois par leçon), enregistrement du meilleur score, page de journal. */
function finish(p,ctx,now){
 const s=p.session;if(!s)return {error:'no-session'};
 if(s.finished)return {error:'already-finished'};
 if(s.results.length<s.qids.length)return {error:'incomplete'};
 const total=s.qids.length,score=s.results.filter(r=>r.ok).length,perfect=score===total&&total>0;
 let xp=0;const events=[];let unlockedJournal=false;
 if(!s.review){
  const L=p.lessons[s.lid]||(p.lessons[s.lid]={lang:s.lang,done:false,best:0,attempts:0,perfect:false,bonus:{}});
  if(!L.bonus)L.bonus={};
  L.attempts++;L.done=true;L.lang=s.lang;L.best=Math.max(L.best||0,total?score/total:0);L.last=iso(now);
  if(!L.bonus.c){L.bonus.c=1;xp+=CONFIG.xp.lesson;events.push({type:'lesson',xp:CONFIG.xp.lesson})}
  if(perfect&&!L.perfect){L.perfect=true;p.stats.perfect++}
  if(!p.journal[s.lid]){p.journal[s.lid]={at:iso(now)};unlockedJournal=true}
  /* niveau terminé : toutes les leçons disponibles du niveau, dans cette langue, réussies (bonus une seule fois) */
  const li=ctx&&typeof ctx.levelInfo==='function'?ctx.levelInfo(s.lid):null;
  if(li&&li.ids&&li.ids.length&&li.n>=2){const key=s.lang+':'+li.n;
   if(!p.levelsDone[key]&&li.ids.every(id=>passed(p,id))){p.levelsDone[key]={at:iso(now)};xp+=CONFIG.xp.level;events.push({type:'level',n:li.n,xp:CONFIG.xp.level})}}
 }
 p.xp+=xp;s.xp+=xp;s.finished=true;
 const newBadges=evaluateBadges(p,ctx,now);
 const summary={lid:s.lid,review:s.review,score,total,perfect,xpSession:s.xp,xpBonus:xp,events,newBadges,unlockedJournal};
 p.session=null;
 return summary;
}
function abandon(p){/* quitter sans perdre : la séance reste enregistrée pour la reprise */return p.session}
function dropSession(p){p.session=null}

return {CONFIG,SCHEMA,newProfile,normalize,levelFor,derived,evaluateBadges,lessonState,recommended,passed,startSession,resumable,answer,next,finish,abandon,dropSession};
});
