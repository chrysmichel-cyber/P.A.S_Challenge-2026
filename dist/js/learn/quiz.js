/* Leçons et questions : lit la banque (js/data/quiz/bank.js), le parcours (curriculum.js) et complète à partir du vocabulaire.
   Module pur : fonctionne dans le navigateur (LCA.quiz) et sous Node (tests). Les questions générées sont déterministes (mêmes identifiants et mêmes propositions à chaque lancement). */
(function(root,factory){const m=factory(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.quiz=m}})(typeof window!=='undefined'?window:this,function(root){
'use strict';
const MIN_WORDS=4,LESSON_LEN=10,IDS=['a','b','c','d'];
const GENERATED_SRC='Vocabulaire de démonstration du prototype, non validé';

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function slug(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function shuf(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function cfg(){return (root.LCA&&root.LCA.curriculum)||{passRate:.6,levels:[],overrides:{}}}
function bank(){return (root.LCA&&root.LCA.quizBank)||[]}

/* Mots d’une catégorie, sans doublon de traduction (pour que les quatre propositions restent distinctes). */
function wordsOf(L,cat){
 const seenW={},seenF={},out=[];
 (L.words||[]).forEach(a=>{if(a[0]!==cat)return;const wo=String(a[1]),fr=String(a[2]);if(seenW[wo]||seenF[fr])return;seenW[wo]=seenF[fr]=1;out.push({wo,fr})});
 return out;
}
function validationOf(L){return L.status||'brouillon'}
function isAuthentic(q){return q.validation==='valide'||q.validation==='publie'}

/* Parcours d’une langue : niveaux et leçons, avec l’état « disponible / à compléter ». */
function curriculumFor(L){
 const c=cfg(),o=(c.overrides&&c.overrides[L.id])||null,levels=(o&&o.levels)||c.levels;
 const lessons=[],lv=[];
 levels.forEach(l=>{
  const entry={n:l.n,title:l.title,todo:l.todo||'',lessons:[]};
  (l.lessons||[]).forEach(ls=>{
   const id=L.id+':'+ls.id,kind=ls.kind||'words',explicit=kind==='words'?bank().filter(q=>q.lang===L.id&&q.lesson===ls.id):[];
   const words=wordsOf(L,ls.cat||'s');
   const probe={id,key:ls.id,lang:L.id,level:l.n,title:ls.title,cat:ls.cat,kind};
   const n=explicit.length>=4?explicit.length:(kind==='words'?(words.length>=MIN_WORDS?Math.min(LESSON_LEN,words.length*2):0):Math.min(LESSON_LEN,gen(L,probe).length));
   const item=Object.assign(probe,{available:n>=(kind==='words'?1:MIN_WORDS),count:Math.min(LESSON_LEN,n),words:words.length,explicit:explicit.length>=4,needs:ls.needs||''});
   entry.lessons.push(item);if(item.available)lessons.push(item);
  });
  lv.push(entry)});
 return {levels:lv,lessons,passRate:c.passRate};
}

const DIFF={words:l=>l.level>1?2:1,phrases:()=>2,numbers:()=>2,odd:()=>3,scenario:()=>3,tales:()=>3,recipes:()=>3,mixed:()=>3};
const FRAME={s:w=>'Un voisin te croise. Pour lui dire « '+w+' », que dis-tu ?',f:w=>'Au marché, tu veux demander : « '+w+' ». Quel mot utilises-tu ?',m:w=>'Au village, tu veux parler de : « '+w+' ». Quel mot utilises-tu ?',n:w=>'En te promenant, tu montres : « '+w+' ». Quel mot utilises-tu ?',c:w=>'Tu comptes sur tes doigts. Comment dis-tu : « '+w+' » ?'};
const catName=k=>(root.LCA&&root.LCA.GROUPS&&root.LCA.GROUPS[k])||k;
function isAuth(st){return st==='valide'||st==='publie'}

/* Fabrique une question à 4 propositions de façon déterministe ; renvoie null si le choix de mauvaises réponses est trop pauvre. */
function make(L,lesson,id,o){
 const right=o.right,seen={};seen[right]=1;
 const pool=(o.pool||[]).filter(t=>t&&!seen[t]&&(seen[t]=1));
 if(pool.length<3)return null;
 const r=rng(hash(id)),wrong=shuf(pool,r).slice(0,3),order=shuf([right].concat(wrong),r),opts=order.map((t,k)=>({id:IDS[k],text:t}));
 const st=o.validation||validationOf(L);
 return {id,lang:L.id,lesson:lesson.key,category:o.category||lesson.title,difficulty:o.diff||(DIFF[lesson.kind||'words']||DIFF.words)(lesson),
  prompt:o.prompt,text:o.text,options:opts,answer:opts.find(x=>x.text===right).id,
  explanation:o.explanation+' (Contenu '+(isAuth(st)?'validé':'provisoire, non validé par un locuteur')+'.)',
  source:o.source||GENERATED_SRC,validation:st,say:o.say||''};
}

/* Questions « mot ↔ traduction » sur une liste de mots donnée. */
function genWords(L,lesson,W,catLabel){
 const out=[];
 W.forEach(w=>{['wf','fw'].forEach(dir=>{
  const right=dir==='wf'?w.fr:w.wo,pool=W.filter(x=>x!==w).map(x=>dir==='wf'?x.fr:x.wo);
  const q=make(L,lesson,L.id+'.'+slug(w.wo)+'.'+dir,{category:catLabel,right,pool,
   prompt:dir==='wf'?'Que signifie ce mot ou cette expression en '+L.name+' ?':'Comment dit-on cela en '+L.name+' ?',text:dir==='wf'?w.wo:w.fr,say:dir==='wf'?w.wo:'',
   explanation:'« '+w.wo+' » se traduit par « '+w.fr+' » dans le vocabulaire du prototype'});
  if(q)out.push(q)})});
 return out;
}
const base=n=>String(n).split('(')[0].trim().toLowerCase();
const toks=n=>base(n).split(/[^a-zàâçéèêëîïôûùüÿœ]+/).map(t=>t.replace(/s$/,'')).filter(t=>t.length>=4);

function gen(L,lesson){
 const kind=lesson.kind||'words';
 if(kind==='words')return genWords(L,lesson,wordsOf(L,lesson.cat),catName(lesson.cat));
 if(kind==='phrases'){const P=wordsOf(L,'s').filter(w=>/\s|\?/.test(w.wo));return P.length>=MIN_WORDS?genWords(L,lesson,P,'Expressions'):[]}
 if(kind==='numbers'){
  const N=wordsOf(L,'c');if(N.length!==10)return [];const out=[];
  for(let k=0;k<10;k++){
   [1,-1].forEach(d=>{const j=k+d;if(j<0||j>9)return;
    const pool=N.filter((x,i)=>i!==j&&i!==k).map(x=>x.wo);
    const q=make(L,lesson,L.id+'.nb.'+(d>0?'apres':'avant')+'.'+(k+1),{category:'Compter',right:N[j].wo,pool,
     prompt:(d>0?'Quel nombre vient juste après':'Quel nombre vient juste avant')+' « '+N[k].wo+' » ('+(k+1)+') en '+L.name+' ?',text:N[k].wo+' = '+(k+1),say:N[k].wo,
     explanation:'On compte 1, 2, 3… : '+(d>0?'après « '+N[k].wo+' » ('+(k+1)+') vient « '+N[j].wo+' » ('+(j+1)+').':'avant « '+N[k].wo+' » ('+(k+1)+') vient « '+N[j].wo+' » ('+(j+1)+').')});
    if(q)out.push(q)})}
  return out}
 if(kind==='odd'){
  const cats=['f','m','n','s','c'].filter(k=>wordsOf(L,k).length>=1),out=[];
  cats.forEach(A=>{const WA=wordsOf(L,A);if(WA.length<3)return;
   cats.forEach(B=>{if(B===A)return;const WB=wordsOf(L,B);
    for(let rep=0;rep<2;rep++){
     const id=L.id+'.odd.'+A+B+rep,r=rng(hash(id)),three=shuf(WA,r).slice(0,3),odd=shuf(WB,r)[0];
     if(three.some(w=>w.wo===odd.wo||w.fr===odd.fr))continue;
     const q=make(L,lesson,id,{category:'Trouver l’intrus',right:odd.wo,pool:three.map(w=>w.wo),
      prompt:'Quel mot n’appartient pas au groupe « '+catName(A)+' » en '+L.name+' ?',text:'Groupe : '+catName(A),
      explanation:'« '+odd.wo+' » ('+odd.fr+') fait partie du groupe « '+catName(B)+' ». Les trois autres mots ('+three.map(w=>w.fr).join(', ')+') font partie du groupe « '+catName(A)+' ».'});
     if(q)out.push(q)}})});
  return out}
 if(kind==='scenario'){
  const W=wordsOf(L,lesson.cat),fr=FRAME[lesson.cat]||FRAME.m,out=[];
  if(W.length<MIN_WORDS)return [];
  W.forEach(w=>{const q=make(L,lesson,L.id+'.sc.'+lesson.cat+'.'+slug(w.wo),{category:'Mise en situation',right:w.wo,pool:W.filter(x=>x!==w).map(x=>x.wo),
   prompt:'Mise en situation en '+L.name,text:fr(w.fr),say:'',explanation:'Pour dire « '+w.fr+' », on utilise « '+w.wo+' » en '+L.name+'.'});if(q)out.push(q)});
  return out}
 if(kind==='tales'){
  const out=[],all=(L.words||[]).map(a=>String(a[2]));
  (L.tales||[]).forEach((t,ti)=>{
   (t.vocab||[]).forEach(v=>{const wo=String(v[0]),fr=String(v[1]);
    const pool=(t.vocab||[]).map(x=>String(x[1])).concat(all);
    const q=make(L,lesson,L.id+'.tale'+ti+'.'+slug(wo),{category:'Contes',right:fr,pool,prompt:'Dans le conte « '+t.title+' », que signifie ce mot ?',text:wo,say:wo,
     explanation:'Dans « '+t.title+' », « '+wo+' » désigne « '+fr+' ».'});if(q)out.push(q)});
   if(t.moral){
    const others=[];const LG=(root.LCA&&root.LCA.langs)||{};Object.keys(LG).sort().forEach(k=>(LG[k].tales||[]).forEach(x=>{if(x.moral&&x.moral!==t.moral)others.push(x.moral)}));
    const q=make(L,lesson,L.id+'.tale'+ti+'.moral',{category:'Contes',right:t.moral,pool:others,prompt:'Quelle est la morale du conte « '+t.title+' » ?',text:t.title,
     explanation:'La morale de ce conte, telle qu’elle est écrite dans le jeu, est : « '+t.moral+' »'});if(q)out.push(q)}});
  return out}
 if(kind==='recipes'){
  const out=[],LG=(root.LCA&&root.LCA.langs)||{},every=[];
  Object.keys(LG).sort().forEach(k=>(LG[k].recipes||[]).forEach(r=>(r.ing||[]).forEach(i=>every.push(String(i[0])))));
  (L.recipes||[]).forEach((r,ri)=>{
   const mine=(r.ing||[]).map(i=>String(i[0])),bases=mine.map(base);
   const mt={};mine.forEach(n=>toks(n).forEach(t=>{mt[t]=1}));
   const pool=every.filter(n=>bases.indexOf(base(n))<0&&!toks(n).some(t=>mt[t]));/* aucun mauvais choix ne doit partager un mot avec les ingrédients de la recette */
   mine.forEach((n,k)=>{const q=make(L,lesson,L.id+'.rec'+ri+'.'+k,{category:'Recettes',right:n,pool,prompt:'Quel ingrédient figure dans la recette « '+r.name+' » du jeu ?',text:r.name,
    explanation:'La recette « '+r.name+' » utilise : '+mine.join(', ')+'. Cette recette est un brouillon à faire valider.'});if(q)out.push(q)})});
  return out}
 if(kind==='mixed'){
  const src=[];
  ['s','f','m','n'].forEach(k=>{if(wordsOf(L,k).length>=MIN_WORDS)src.push.apply(src,genWords(L,{key:'defi',level:4,kind:'words',cat:k,title:'Défi'},wordsOf(L,k),catName(k)))});
  src.push.apply(src,gen(L,{id:lesson.id,key:'defi',level:4,kind:'numbers',title:'Défi'}));
  src.push.apply(src,gen(L,{id:lesson.id,key:'defi',level:4,kind:'odd',title:'Défi'}));
  if(src.length<LESSON_LEN||new Set(src.map(q=>q.category)).size<3)return [];/* il faut au moins trois sortes de questions */
  return src.map(q=>Object.assign({},q,{id:L.id+'.defi.'+q.id.slice(L.id.length+1),lesson:lesson.key,difficulty:3}));
 }
 return [];
}
function generate(L,lesson){return gen(L,lesson)}

/* Questions d’une leçon : banque explicite, sinon génération. Sélection déterministe de 10 au plus. */
function questionsFor(L,lesson){
 const ex=bank().filter(q=>q.lang===L.id&&q.lesson===lesson.key);
 let qs=ex.length>=4?ex.slice():gen(L,lesson);
 if(qs.length>LESSON_LEN){const r=rng(hash(lesson.id));qs=shuf(qs,r).slice(0,LESSON_LEN).sort((a,b)=>a.id<b.id?-1:1)}
 return qs;
}
/* Toutes les questions connues d’une langue (pour retrouver une question à partir de son identifiant, et pour la révision). */
function allQuestions(L){
 const map={};curriculumFor(L).lessons.forEach(ls=>{(ls.explicit?bank().filter(q=>q.lang===L.id&&q.lesson===ls.key):gen(L,ls)).forEach(q=>{map[q.id]=q})});
 return map;
}
function validateQuestion(q){
 const e=[];
 ['id','lang','category','prompt','text','answer','explanation','source','validation'].forEach(k=>{if(!q[k])e.push('champ manquant : '+k)});
 if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>3)e.push('difficulty doit valoir 1, 2 ou 3');
 if(!Array.isArray(q.options)||q.options.length!==4)e.push('il faut exactement 4 propositions');
 else{const ids=q.options.map(o=>o.id),tx=q.options.map(o=>o.text);
  if(new Set(ids).size!==4)e.push('identifiants de propositions en double');
  if(new Set(tx).size!==4)e.push('propositions identiques');
  if(ids.indexOf(q.answer)<0)e.push('la bonne réponse n’est pas dans les propositions')}
 return e;
}
return {MIN_WORDS,LESSON_LEN,curriculumFor,questionsFor,allQuestions,generate,wordsOf,validateQuestion,isAuthentic,hash,rng,slug};
});
