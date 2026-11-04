/* Trésors cachés dans chaque village. Module pur (navigateur : LCA.hidden ; Node : tests).
   Les positions sont tirées de façon déterministe à partir de l’identifiant du village : elles sont identiques à chaque visite,
   et les trésors déjà trouvés (enregistrés par numéro) restent trouvés. Les objets sont génériques (perle, graine, pierre…) :
   ils ne prétendent représenter aucun objet culturel précis. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.hidden=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const COUNT=5;
const REVEAL=14,FULL=8,HINT=30,TAKE=1.9;   /* distances de jeu : apparition, pleine visibilité, indice sur la minicarte, ramassage */
const KINDS=[
 {id:'perle',fr:'une perle brillante',color:'#7fd8ff'},
 {id:'graine',fr:'une graine dorée',color:'#ffd24a'},
 {id:'pierre',fr:'une pierre rouge',color:'#ff7a5c'},
 {id:'plume',fr:'une plume légère',color:'#a8e6a1'},
 {id:'coquille',fr:'un coquillage nacré',color:'#f2c6ff'}];
function hash(str){let h=2166136261;for(let i=0;i<String(str).length;i++){h^=String(str).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed>>>0||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
/* place(seed, {n, ok, avoid, bounds, minGap}) -> [{i,x,z,k}]
   ok(x,z) : le point est libre (pas d’arbre, de case…) ; avoid : [[x,z,rayon],…] zones à éviter ; minGap : écart minimal entre deux trésors. */
function place(id,o){
 o=o||{};const n=o.n||COUNT,b=o.bounds||{x0:-60,x1:60,z0:-50,z1:38},ok=o.ok||(()=>true),avoid=o.avoid||[];
 const r=rng(hash(id)),out=[];let gap=o.minGap||22;
 for(let pass=0;pass<4&&out.length<n;pass++){
  for(let k=0;k<1500&&out.length<n;k++){
   const x=b.x0+r()*(b.x1-b.x0),z=b.z0+r()*(b.z1-b.z0);
   if(Math.hypot(x,z)<12)continue;
   if(avoid.some(a=>Math.hypot(x-a[0],z-a[1])<a[2]))continue;
   if(out.some(p=>Math.hypot(x-p.x,z-p.z)<gap))continue;
   if(!ok(x,z))continue;
   out.push({i:out.length,x:+x.toFixed(2),z:+z.toFixed(2),k:out.length%KINDS.length})}
  gap*=.7}                         /* si la place manque, on rapproche un peu les trésors plutôt que d’en perdre */
 return out;
}
/* 0 = invisible, 1 = pleinement visible (scintillement qui apparaît en s’approchant). */
function reveal(d){return d>=REVEAL?0:d<=FULL?1:(REVEAL-d)/(REVEAL-FULL)}
/* Indice de la minicarte : 0 = loin, 1 = tout près. */
function hint(d){return d>=HINT?0:Math.min(1,(HINT-d)/(HINT-FULL))}
function stats(found,n){const f=found&&typeof found==='object'?found:{};let c=0;for(let i=0;i<(n||COUNT);i++)if(f[i])c++;return {found:c,total:n||COUNT,all:c>=(n||COUNT)}}
/* Mot offert par un trésor : on prend en priorité un mot pas encore appris, dans l’ordre de la liste de la langue. */
function wordFor(i,words,learned){
 if(!words||!words.length)return -1;learned=learned||{};
 for(let k=0;k<words.length;k++){const j=(i*3+k)%words.length;if(!learned[j])return j}
 return (i*3)%words.length}
return {COUNT,REVEAL,FULL,HINT,TAKE,KINDS,hash,place,reveal,hint,stats,wordFor};
});
