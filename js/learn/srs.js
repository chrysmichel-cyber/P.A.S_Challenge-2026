/* Révision espacée (système de boîtes de Leitner) pour les mots découverts. Module pur : navigateur (LCA.srs) et Node (tests).
   Chaque mot découvert reçoit une fiche {box, due, seen, ok, ko, uses}. Une bonne réponse monte d'une boîte (intervalle plus long),
   « difficile » reste dans la boîte avec un rappel plus proche, « oublié » retombe en boîte 0. La priorité combine le retard,
   les difficultés du joueur (taux d'échec) et la rareté d'usage : un mot souvent rencontré dans le jeu est moins urgent qu'un mot vu une fois. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.srs=f()}})(typeof self!=='undefined'?self:this,function(){
 const MIN=60e3,DAY=864e5,INTERVALS=[10*MIN,DAY,3*DAY,7*DAY,16*DAY,35*DAY],MASTER_BOX=4;
 const empty=()=>({v:1,cards:{}});
 function normalize(s){const o=empty();if(s&&typeof s==='object'&&s.cards&&typeof s.cards==='object')Object.keys(s.cards).forEach(k=>{const c=s.cards[k];if(!c||typeof c!=='object')return;
  const n=v=>Number.isFinite(+v)&&+v>=0?+v:0;o.cards[k]={box:Math.min(5,Math.floor(n(c.box))),due:n(c.due),seen:n(c.seen),ok:n(c.ok),ko:n(c.ko),uses:n(c.uses),last:n(c.last),note:typeof c.note==='string'?c.note.slice(0,200):''}});return o}
 /* crée la fiche d'un mot s'il vient d'être découvert ; learned = {indice:1} */
 function sync(store,learned,now){let n=0;Object.keys(learned||{}).forEach(k=>{if(learned[k]&&!store.cards[k]){store.cards[k]={box:0,due:now+INTERVALS[0],seen:0,ok:0,ko:0,uses:1,last:now,note:''};n++}});return n}
 /* un usage en jeu (dialogue, quête, carte touchée) : augmente la fréquence */
 function use(store,idx,now){const c=store.cards[idx];if(c){c.uses++;c.last=now}}
 function grade(store,idx,result,now){
  const c=store.cards[idx]||(store.cards[idx]={box:0,due:now,seen:0,ok:0,ko:0,uses:1,last:now,note:''});
  c.seen++;c.last=now;
  if(result==='good'){c.ok++;c.box=Math.min(5,c.box+1);c.due=now+INTERVALS[c.box]}
  else if(result==='hard'){c.ok+=.5;c.ko+=.5;c.due=now+Math.max(10*MIN,INTERVALS[c.box]*.5)}
  else{c.ko++;c.box=0;c.due=now+INTERVALS[0]}
  return c}
 const difficulty=c=>(c.ko+1)/(c.ok+c.ko+2);
 function priority(c,now){const late=Math.max(0,(now-c.due)/DAY);return late+2.5*difficulty(c)+1.2/(1+c.uses*.35)+(c.seen===0?.6:0)}
 const isDue=(c,now)=>c.due<=now;
 /* mots à réviser maintenant, les plus urgents d'abord */
 function dueList(store,now,limit){return Object.keys(store.cards).filter(k=>isDue(store.cards[k],now)).sort((a,b)=>priority(store.cards[b],now)-priority(store.cards[a],now)).slice(0,limit||20).map(Number)}
 const status=(c)=>c.box>=MASTER_BOX?'maitrise':c.seen===0?'nouveau':'en_cours';
 function stats(store,now,total){const ks=Object.keys(store.cards),c=ks.map(k=>store.cards[k]);const ok=c.reduce((a,x)=>a+x.ok,0),ko=c.reduce((a,x)=>a+x.ko,0);
  return {discovered:ks.length,mastered:c.filter(x=>x.box>=MASTER_BOX).length,learning:c.filter(x=>x.box<MASTER_BOX).length,due:c.filter(x=>isDue(x,now)).length,exercises:Math.round(ok+ko),accuracy:ok+ko>0?Math.round(100*ok/(ok+ko)):null,total:total||0,pct:total?Math.round(100*ks.length/total):0}}
 /* niveau de vocabulaire d'une langue d'après les mots maîtrisés */
 const LEVELS=[[0,'Débutant'],[5,'Éveil'],[15,'Élémentaire'],[35,'Intermédiaire'],[70,'Avancé']];
 const levelFor=m=>{let r=LEVELS[0];LEVELS.forEach(l=>{if(m>=l[0])r=l});return {name:r[1],min:r[0],next:(LEVELS.find(l=>l[0]>m)||[null])[0]}};
 return {INTERVALS,MASTER_BOX,empty,normalize,sync,use,grade,priority,dueList,status,stats,levelFor,difficulty}});
