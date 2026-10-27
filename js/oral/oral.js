/* Patrimoine oral : récits enregistrés, avec transcription et traduction écrites à la main.
   Logique pure + stockage injecté (IndexedDB dans le navigateur, mémoire dans les tests), isolé du jeu pour pouvoir passer à une API plus tard.
   Aucune transcription ni traduction automatique : ce qui est affiché a été écrit par une personne, et son statut dit si un locuteur l'a relu. */
(function(root,factory){const m=factory(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.oral=m}})(typeof window!=='undefined'?window:this,function(root){
'use strict';
const LIM={title:80,narrator:60,place:80,reviewer:60,text:20000},MAX_SEC=300,MAX_BYTES=25*1024*1024;
const STATUS={brouillon:'Brouillon',relu:'Relu par un locuteur'};
const line=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const block=(s,n)=>String(s==null?'':s).replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').slice(0,n);

/* Nettoie une fiche venue d'un formulaire (ou d'un ancien stockage) : jamais d'exception, champs toujours présents. */
function sanitize(m){
 m=m&&typeof m==='object'?m:{};
 const st=m.status==='relu'?'relu':'brouillon';
 return {id:typeof m.id==='string'?m.id.replace(/[^a-z0-9]/gi,'').slice(0,32):'',
  title:line(m.title,LIM.title),lang:line(m.lang,40),narrator:line(m.narrator,LIM.narrator),place:line(m.place,LIM.place),
  transcript:block(m.transcript,LIM.text),translation:block(m.translation,LIM.text),
  consent:m.consent===true,status:st,reviewer:st==='relu'?line(m.reviewer,LIM.reviewer):line(m.reviewer,LIM.reviewer),
  duration:isFinite(+m.duration)&&+m.duration>0?Math.min(Math.round(+m.duration),MAX_SEC):0,
  mime:line(m.mime,60),size:isFinite(+m.size)?Math.max(0,+m.size):0,
  created:isFinite(+m.created)?+m.created:0,updated:isFinite(+m.updated)?+m.updated:0};
}
/* Liste de codes d'erreur ; vide = valide. */
function validate(m,o){
 o=o||{};const e=[];
 if(!m.title)e.push('title');
 if(!m.lang||(o.langs&&!o.langs[m.lang]))e.push('lang');
 if(!m.consent)e.push('consent');
 if(o.needAudio&&!o.hasAudio)e.push('audio');
 if(m.status==='relu'&&!m.reviewer)e.push('reviewer');
 if(o.hasAudio&&m.size>MAX_BYTES)e.push('toobig');
 return e;
}
function exportText(m,langName){
 const d=m.created?new Date(m.created).toISOString().slice(0,10):'';
 return ['Récit : '+m.title,'Langue : '+(langName||m.lang),m.narrator?'Conteur ou conteuse : '+m.narrator:'','Lieu : '+(m.place||'non précisé'),d?'Date d’enregistrement : '+d:'',
  'Statut : '+STATUS[m.status]+(m.status==='relu'&&m.reviewer?' (par '+m.reviewer+', déclaré)':''),
  'Accord de la personne qui raconte : '+(m.consent?'déclaré':'non déclaré'),'','TRANSCRIPTION','',m.transcript||'(à écrire)','','TRADUCTION EN FRANÇAIS','',m.translation||'(à écrire)','',
  'Texte écrit à la main dans N’Zassa, sans transcription ni traduction automatique. Tant que le statut est « Brouillon », aucun locuteur ne l’a relu.'].filter((x,i,a)=>x!==''||a[i-1]!=='').join('\n');
}
function memAdapter(){const m=new Map();return {get:async k=>m.get(k),put:async(k,v)=>{m.set(k,v)},del:async k=>{m.delete(k)},keys:async()=>Array.from(m.keys())}}
/* IndexedDB : renvoie null si le navigateur ne l'offre pas (mode privé strict, contexte bloqué). */
function idbAdapter(name){
 const idb=root.indexedDB;if(!idb)return null;
 let dbp=null;
 const open=()=>dbp||(dbp=new Promise((res,rej)=>{let r;try{r=idb.open(name||'nzassa-oral',1)}catch(e){rej(e);return}r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onblocked=()=>rej(new Error('blocked'))}));
 const tx=(mode,fn)=>open().then(db=>new Promise((res,rej)=>{const t=db.transaction('kv',mode),r=fn(t.objectStore('kv'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
 return {get:k=>tx('readonly',s=>s.get(k)),put:(k,v)=>tx('readwrite',s=>s.put(v,k)),del:k=>tx('readwrite',s=>s.delete(k)),keys:()=>tx('readonly',s=>s.getAllKeys())};
}
function create(o){
 const ad=o.adapter,prof=String(o.profile||'guest'),now=o.now||(()=>Date.now()),langs=o.langs;
 const mk='meta:'+prof+':',ak='audio:'+prof+':';
 const newId=()=>{const u=new Uint8Array(6);const c=root.crypto;if(c&&c.getRandomValues)c.getRandomValues(u);else for(let i=0;i<6;i++)u[i]=Math.floor(Math.random()*256);return Array.from(u,x=>x.toString(16).padStart(2,'0')).join('')};
 return {
  async list(){
   const ks=(await ad.keys()).filter(k=>typeof k==='string'&&k.indexOf(mk)===0),out=[];
   for(const k of ks){try{const v=await ad.get(k);if(v)out.push(sanitize(v))}catch(e){}}
   return out.sort((a,b)=>b.created-a.created);
  },
  async get(id){const v=await ad.get(mk+id);if(!v)return null;const a=await ad.get(ak+id);return {meta:sanitize(v),audio:a||null}},
  /* Crée un récit. audio = {blob,type} (obligatoire). */
  async create(meta,audio){
   const m=sanitize(meta);if(audio){m.size=audio.blob&&audio.blob.size||0;m.mime=audio.type||m.mime}
   const err=validate(m,{langs,needAudio:true,hasAudio:!!(audio&&audio.blob)});if(err.length)return {ok:false,errors:err};
   m.id=newId();m.created=m.updated=now();
   try{await ad.put(ak+m.id,{blob:audio.blob,type:audio.type||''});await ad.put(mk+m.id,m)}catch(e){try{await ad.del(ak+m.id)}catch(_){}return {ok:false,errors:['storage']}}
   return {ok:true,meta:m};
  },
  async update(id,patch){
   const cur=await ad.get(mk+id);if(!cur)return {ok:false,errors:['unknown']};
   const m=sanitize(Object.assign({},cur,patch,{id,created:cur.created,duration:cur.duration,mime:cur.mime,size:cur.size}));
   const err=validate(m,{langs});if(err.length)return {ok:false,errors:err};
   m.updated=now();try{await ad.put(mk+id,m)}catch(e){return {ok:false,errors:['storage']}}
   return {ok:true,meta:m};
  },
  async remove(id){try{await ad.del(mk+id);await ad.del(ak+id);return true}catch(e){return false}}
 };
}
return {create,sanitize,validate,exportText,memAdapter,idbAdapter,LIM,MAX_SEC,MAX_BYTES,STATUS};
});
