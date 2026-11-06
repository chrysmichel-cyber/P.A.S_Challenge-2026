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
  created:isFinite(+m.created)?+m.created:0,updated:isFinite(+m.updated)?+m.updated:0,
  region:line(m.region,60),share:m.share==='communaute'?'communaute':'prive',
  narratorOk:m.narratorOk===undefined?!!line(m.narrator,LIM.narrator):m.narratorOk===true,
  origName:line(m.origName,120),origSource:m.origSource==='import'?'import':'micro',sha256:/^[0-9a-f]{64}$/.test(String(m.sha256||''))?m.sha256:'',
  votes:cleanVotes(m.votes),imported:m.imported===true,importedFrom:line(m.importedFrom,60)};
}
const REQUIRED=2,DEC={ok:'Fidèle au récit',bad:'À corriger'};
function cleanVotes(v){const o={};if(v&&typeof v==='object')Object.keys(v).slice(0,40).forEach(k=>{const x=v[k];if(!x||!DEC[x.d])return;o[line(k,60).toLowerCase()]={d:x.d,name:line(x.name||k,60),native:x.native===true,note:line(x.note,300),at:isFinite(+x.at)?+x.at:0}});return o}
/* Le nom de la personne qui raconte n'est conservé que si elle a donné son accord pour qu'il soit indiqué. */
function privacy(m){if(!m.narratorOk)m.narrator='';return m}
/* Validation communautaire : un récit n'est « validé » pour publication que s'il est partagé, relu, et confirmé par au moins REQUIRED locuteurs distincts sans contestation. */
function communityStatus(m){
 if(m.share!=='communaute')return {id:'prive',label:'Privé (sur cet appareil)',ok:0,bad:0,publishable:false};
 const v=Object.keys(m.votes||{}).map(k=>m.votes[k]).filter(x=>x.native),ok=v.filter(x=>x.d==='ok').length,bad=v.filter(x=>x.d==='bad').length;
 if(bad>0)return {id:'conteste',label:'En discussion',ok,bad,publishable:false};
 if(ok>=REQUIRED&&m.status==='relu'&&m.consent)return {id:'valide',label:'Validé par la communauté (déclaratif)',ok,bad,publishable:true};
 return {id:'a_valider',label:ok?'Relu '+ok+' fois, en attente':'En attente de validation',ok,bad,publishable:false}}
function vote(m,reviewer,decision,note,now){
 if(!reviewer||!reviewer.name)return {ok:false,error:'reviewer'};if(!reviewer.native)return {ok:false,error:'native'};if(!DEC[decision])return {ok:false,error:'decision'};
 if(m.share!=='communaute')return {ok:false,error:'private'};
 const k=line(reviewer.name,60).toLowerCase();if(m.narrator&&line(m.narrator,60).toLowerCase()===k)return {ok:false,error:'self'};
 const votes=Object.assign({},m.votes);votes[k]={d:decision,name:line(reviewer.name,60),native:true,note:line(note,300),at:now||Date.now()};return {ok:true,votes}}
/* Bibliothèque : recherche texte (titre, narrateur si indiqué, lieu, région, transcription) et filtres. */
const fold=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function search(list,o){o=o||{};const q=fold(o.q).split(/\s+/).filter(Boolean);
 return list.filter(m=>{if(o.lang&&m.lang!==o.lang)return false;if(o.region&&fold(m.region)!==fold(o.region))return false;
  if(o.status&&communityStatus(m).id!==o.status)return false;
  const hay=fold([m.title,m.narratorOk?m.narrator:'',m.place,m.region,m.transcript,m.translation].join(' '));return q.every(w=>hay.indexOf(w)>=0)})}
/* Paquet d'échange (fichier .json) : fiche + audio original en base64. Aucune connexion nécessaire. */
function toBundle(m,audioB64,type,now){const x=privacy(sanitize(m));x.id='';return {format:'nzassa-oral',version:1,exportedAt:new Date(now||Date.now()).toISOString(),meta:x,audio:{type:line(type||m.mime,60),b64:audioB64}}}
function fromBundle(obj){
 if(!obj||typeof obj!=='object'||obj.format!=='nzassa-oral'||obj.version!==1)return {ok:false,error:'format'};
 const m=sanitize(obj.meta);if(!m.consent)return {ok:false,error:'consent'};if(!m.title)return {ok:false,error:'title'};
 if(!obj.audio||typeof obj.audio.b64!=='string'||obj.audio.b64.length<8||!/^[A-Za-z0-9+/=]+$/.test(obj.audio.b64))return {ok:false,error:'audio'};
 if(obj.audio.b64.length>MAX_BYTES*1.4)return {ok:false,error:'toobig'};
 m.imported=true;m.importedFrom=m.importedFrom||m.reviewer||'';privacy(m);return {ok:true,meta:m,type:line(obj.audio.type,60)||m.mime,b64:obj.audio.b64}}
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
   const m=privacy(sanitize(meta));if(audio){m.size=audio.blob&&audio.blob.size||0;m.mime=audio.type||m.mime}
   const err=validate(m,{langs,needAudio:true,hasAudio:!!(audio&&audio.blob)});if(err.length)return {ok:false,errors:err};
   m.id=newId();m.created=m.updated=now();
   try{await ad.put(ak+m.id,{blob:audio.blob,type:audio.type||''});await ad.put(mk+m.id,m)}catch(e){try{await ad.del(ak+m.id)}catch(_){}return {ok:false,errors:['storage']}}
   return {ok:true,meta:m};
  },
  async update(id,patch){
   const cur=await ad.get(mk+id);if(!cur)return {ok:false,errors:['unknown']};
   const m=privacy(sanitize(Object.assign({},cur,patch,{id,created:cur.created,duration:cur.duration,mime:cur.mime,size:cur.size,origName:cur.origName,origSource:cur.origSource,sha256:cur.sha256,imported:cur.imported,importedFrom:cur.importedFrom,votes:patch&&patch.votes?patch.votes:cur.votes})));
   const err=validate(m,{langs});if(err.length)return {ok:false,errors:err};
   m.updated=now();try{await ad.put(mk+id,m)}catch(e){return {ok:false,errors:['storage']}}
   return {ok:true,meta:m};
  },
  async remove(id){try{await ad.del(mk+id);await ad.del(ak+id);return true}catch(e){return false}}
 };
}
return {privacy,communityStatus,vote,search,toBundle,fromBundle,REQUIRED,DEC,create,sanitize,validate,exportText,memAdapter,idbAdapter,LIM,MAX_SEC,MAX_BYTES,STATUS};
});
