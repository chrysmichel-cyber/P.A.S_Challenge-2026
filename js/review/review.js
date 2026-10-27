/* Relecture par des locuteurs : chaque mot peut être confirmé, contesté ou corrigé par des personnes qui se déclarent locutrices de la langue.
   Module pur (aucun accès au DOM) : fonctionne dans le navigateur (LCA.review) et sous Node (tests).
   IMPORTANT : l'identité et la qualité de locuteur sont DÉCLARATIVES. Sans serveur ni compte vérifié, ce système prépare la validation mais ne la certifie pas.
   Règles : un mot est « validé (déclaratif) » quand au moins REQUIRED relecteurs distincts le confirment et qu'aucun ne le conteste. Une contestation ou une correction le met « en discussion » :
   le jeu n'applique JAMAIS une correction tout seul, un mainteneur doit la reprendre dans les fichiers de données. Le statut officiel d'une langue ne passe pas à « valide » sans intervention humaine (sources, mainteneur). */
(function(root,factory){const m=factory(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.review=m}})(typeof window!=='undefined'?window:this,function(root){
'use strict';
const REQUIRED=2,MAX_ITEMS=5000,DECISIONS={ok:'Correct',bad:'Incorrect',fix:'À corriger'};
const line=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const wkey=(form,fr)=>line(form,120)+'|'+line(fr,160);
const rkey=n=>line(n,60).toLowerCase();
const STATUS_LABEL={a_verifier:'À vérifier',en_cours:'Relu une fois',valide:'Validé (déclaratif)',conteste:'En discussion'};

function empty(){return {v:1,reviewer:null,items:{}}}
function sanitizeReviewer(r){
 if(!r||typeof r!=='object')return null;
 const name=line(r.name,60);if(!name)return null;
 return {name,native:r.native===true,qualification:line(r.qualification,120)};
}
/* Rend n'importe quelle donnée lue exploitable sans lever d'exception. */
function normalize(raw){
 const s=empty();
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 s.reviewer=sanitizeReviewer(raw.reviewer);
 if(raw.items&&typeof raw.items==='object')Object.keys(raw.items).slice(0,80).forEach(lang=>{
  const L=raw.items[lang];if(!L||typeof L!=='object')return;
  const out={};
  Object.keys(L).slice(0,MAX_ITEMS).forEach(k=>{const e=L[k];if(!e||typeof e!=='object'||!e.by||typeof e.by!=='object')return;
   const by={};
   Object.keys(e.by).slice(0,50).forEach(rk=>{const x=e.by[rk];if(!x||!DECISIONS[x.d])return;
    by[rkey(rk)]={d:x.d,name:line(x.name||rk,60),s:x.d==='fix'?line(x.s,200):'',n:line(x.n,300),at:isFinite(+x.at)?+x.at:0}});
   if(Object.keys(by).length)out[line(k,300)]={by}});
  if(Object.keys(out).length)s.items[line(lang,40)]=out});
 return s;
}
function setReviewer(store,r){const x=sanitizeReviewer(r);if(!x)return {ok:false,error:'name'};store.reviewer=x;return {ok:true,reviewer:x}}
/* Enregistre l'avis du relecteur actif. Refuse si le relecteur ne se déclare pas locuteur. */
function submit(store,lang,form,fr,decision,o){
 o=o||{};const rv=store.reviewer;
 if(!rv||!rv.name)return {ok:false,error:'reviewer'};
 if(!rv.native)return {ok:false,error:'native'};
 if(!DECISIONS[decision])return {ok:false,error:'decision'};
 const sug=line(o.suggestion,200);if(decision==='fix'&&!sug)return {ok:false,error:'suggestion'};
 const L=store.items[lang]||(store.items[lang]={}),k=wkey(form,fr),e=L[k]||(L[k]={by:{}});
 e.by[rkey(rv.name)]={d:decision,name:rv.name,s:decision==='fix'?sug:'',n:line(o.note,300),at:(o.now||Date.now())};
 return {ok:true,status:statusOf(store,lang,form,fr)};
}
function statusOf(store,lang,form,fr){
 const e=store.items[lang]&&store.items[lang][wkey(form,fr)];
 const by=e?Object.keys(e.by).map(k=>e.by[k]):[];
 const ok=by.filter(x=>x.d==='ok').length,bad=by.filter(x=>x.d==='bad'||x.d==='fix').length;
 const status=bad>0?'conteste':ok>=REQUIRED?'valide':ok>=1?'en_cours':'a_verifier';
 return {status,label:STATUS_LABEL[status],ok,bad,suggestions:by.filter(x=>x.d==='fix').map(x=>({by:x.name,text:x.s})),mine:null};
}
function mine(store,lang,form,fr){
 const rv=store.reviewer;if(!rv)return null;
 const e=store.items[lang]&&store.items[lang][wkey(form,fr)];return e&&e.by[rkey(rv.name)]||null;
}
/* Bilan d'une langue : words = [[cat,forme,fr,...]]. */
function summary(store,lang,words){
 const c={a_verifier:0,en_cours:0,valide:0,conteste:0,total:words.length};
 words.forEach(w=>{c[statusOf(store,lang,w[1],w[2]).status]++});
 c.reviewed=c.total-c.a_verifier;
 c.pct=c.total?Math.round(c.reviewed/c.total*100):0;
 /* le statut d'une langue ne monte jamais seul au-delà de « en cours de relecture » */
 c.language=c.reviewed>0?'verification':'brouillon';
 return c;
}
/* Fichier à envoyer à un mainteneur : uniquement les avis du relecteur actif. */
function exportFile(store,langs,now){
 const rv=store.reviewer;if(!rv)return null;const out=[];
 Object.keys(store.items).forEach(lang=>{if(langs&&langs.indexOf(lang)<0)return;
  Object.keys(store.items[lang]).forEach(k=>{const x=store.items[lang][k].by[rkey(rv.name)];if(!x)return;
   const i=k.indexOf('|');out.push({lang,form:k.slice(0,i),fr:k.slice(i+1),decision:x.d,suggestion:x.s,note:x.n,at:x.at})})});
 return {format:'nzassa-review',version:1,exportedAt:new Date(now||Date.now()).toISOString(),reviewer:{name:rv.name,native:rv.native,qualification:rv.qualification},declaredOnly:true,items:out};
}
/* Fusionne un fichier reçu (mainteneur). Rejette tout ce qui est mal formé ; n'applique aucune correction au contenu. */
function importFile(store,obj){
 const res={added:0,skipped:0,errors:[]};
 if(!obj||typeof obj!=='object'||obj.format!=='nzassa-review'||obj.version!==1||!Array.isArray(obj.items)){res.errors.push('format');return res}
 const rv=sanitizeReviewer(obj.reviewer);if(!rv){res.errors.push('reviewer');return res}
 if(!rv.native){res.errors.push('native');return res}
 if(obj.items.length>MAX_ITEMS){res.errors.push('toomany');return res}
 const keep=store.reviewer;store.reviewer=rv;
 obj.items.forEach(it=>{
  if(!it||typeof it.lang!=='string'||typeof it.form!=='string'||typeof it.fr!=='string'){res.skipped++;return}
  const r=submit(store,line(it.lang,40),it.form,it.fr,it.decision,{suggestion:it.suggestion,note:it.note,now:isFinite(+it.at)?+it.at:undefined});
  if(r.ok)res.added++;else res.skipped++});
 store.reviewer=keep;return res;
}
return {REQUIRED,DECISIONS,STATUS_LABEL,empty,normalize,sanitizeReviewer,setReviewer,submit,statusOf,mine,summary,exportFile,importFile,wkey};
});
