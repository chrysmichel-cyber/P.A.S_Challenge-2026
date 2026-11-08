/* Voix de référence : enregistrements de mots par des locuteurs qui se déclarent natifs et consentants.
   Rien n'est fourni avec le jeu : sans voix de référence, le jeu le dit et n'utilise que la synthèse vocale du navigateur (approximative).
   Stockage injecté (IndexedDB dans le navigateur, mémoire dans les tests), comme js/oral/oral.js. Validation DÉCLARATIVE : deux autres locuteurs distincts
   doivent confirmer ; sans serveur, aucune identité n'est vérifiée. */
(function(root,f){const m=f(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.refs=m}})(typeof window!=='undefined'?window:this,function(root){
 'use strict';
 const REQUIRED=2,MAX_BYTES=2*1024*1024,MAX_SEC=8;
 const line=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
 const key=(lang,form,fr)=>line(lang,40)+'|'+line(form,120).toLowerCase()+'|'+line(fr,160).toLowerCase();
 function sanitize(m){m=m&&typeof m==='object'?m:{};const votes={};
  if(m.votes&&typeof m.votes==='object')Object.keys(m.votes).slice(0,30).forEach(k=>{const v=m.votes[k];if(!v||(v.d!=='ok'&&v.d!=='bad'))return;votes[line(k,60).toLowerCase()]={d:v.d,name:line(v.name||k,60),native:v.native===true,at:isFinite(+v.at)?+v.at:0}});
  return {id:typeof m.id==='string'?m.id.replace(/[^a-z0-9]/gi,'').slice(0,32):'',lang:line(m.lang,40),form:line(m.form,120),fr:line(m.fr,160),speaker:line(m.speaker,60),role:['elder','teacher'].indexOf(m.role)>=0?m.role:'speaker',native:m.native===true,consent:m.consent===true,
   region:line(m.region,60),mime:line(m.mime,60),size:isFinite(+m.size)?Math.max(0,+m.size):0,dur:isFinite(+m.dur)?Math.min(MAX_SEC,Math.max(0,+m.dur)):0,created:isFinite(+m.created)?+m.created:0,votes}}
 function validate(m,o){o=o||{};const e=[];if(!m.lang||(o.langs&&!o.langs[m.lang]))e.push('lang');if(!m.form||!m.fr)e.push('word');if(!m.speaker)e.push('speaker');if(!m.native)e.push('native');if(!m.consent)e.push('consent');
  if(!o.hasAudio)e.push('audio');if(m.size>MAX_BYTES)e.push('toobig');return e}
 function statusOf(m){const v=Object.keys(m.votes).map(k=>m.votes[k]).filter(x=>x.native);const ok=v.filter(x=>x.d==='ok').length,bad=v.filter(x=>x.d==='bad').length;
  const id=bad>0?'conteste':ok>=REQUIRED?'valide':'propose';return {id,label:({conteste:'En discussion',valide:'Validée (déclaratif)',propose:'Proposée, à valider'})[id],ok,bad}}
 function vote(m,reviewer,decision,now){if(!reviewer||!reviewer.name)return {ok:false,error:'reviewer'};if(!reviewer.native)return {ok:false,error:'native'};if(decision!=='ok'&&decision!=='bad')return {ok:false,error:'decision'};
  const k=line(reviewer.name,60).toLowerCase();if(k===line(m.speaker,60).toLowerCase())return {ok:false,error:'self'};
  const votes=Object.assign({},m.votes);votes[k]={d:decision,name:line(reviewer.name,60),native:true,at:now||Date.now()};return {ok:true,votes}}
 /* meilleure voix pour un mot : validée d'abord, puis proposée, jamais une voix contestée */
 function best(list){const rank={valide:0,propose:1,conteste:9};return list.filter(m=>statusOf(m).id!=='conteste').sort((a,b)=>rank[statusOf(a).id]-rank[statusOf(b).id]||b.created-a.created)[0]||null}
 function create(o){const ad=o.adapter,now=o.now||(()=>Date.now()),langs=o.langs,mk='rmeta:',ak='raudio:';
  const newId=()=>{const u=new Uint8Array(6);const c=root.crypto;if(c&&c.getRandomValues)c.getRandomValues(u);else for(let i=0;i<6;i++)u[i]=Math.floor(Math.random()*256);return Array.from(u,x=>x.toString(16).padStart(2,'0')).join('')};
  return {
   async list(lang){const ks=(await ad.keys()).filter(k=>typeof k==='string'&&k.indexOf(mk)===0),out=[];for(const k of ks){try{const v=await ad.get(k);if(v){const m=sanitize(v);if(!lang||m.lang===lang)out.push(m)}}catch(e){}}return out},
   async forWord(lang,form,fr){const k=key(lang,form,fr);return (await this.list(lang)).filter(m=>key(m.lang,m.form,m.fr)===k)},
   async get(id){const v=await ad.get(mk+id);if(!v)return null;return {meta:sanitize(v),audio:await ad.get(ak+id)||null}},
   async add(meta,audio){const m=sanitize(meta);if(audio){m.size=audio.blob&&audio.blob.size||0;m.mime=audio.type||m.mime}
    const err=validate(m,{langs,hasAudio:!!(audio&&audio.blob)});if(err.length)return {ok:false,errors:err};m.id=newId();m.created=now();m.votes={};
    try{await ad.put(ak+m.id,{blob:audio.blob,type:audio.type||''});await ad.put(mk+m.id,m)}catch(e){try{await ad.del(ak+m.id)}catch(_){}return {ok:false,errors:['storage']}}return {ok:true,meta:m}},
   async vote(id,reviewer,decision){const cur=await ad.get(mk+id);if(!cur)return {ok:false,error:'unknown'};const m=sanitize(cur),r=vote(m,reviewer,decision,now());if(!r.ok)return r;m.votes=r.votes;try{await ad.put(mk+id,m)}catch(e){return {ok:false,error:'storage'}}return {ok:true,meta:m,status:statusOf(m)}},
   async remove(id){try{await ad.del(mk+id);await ad.del(ak+id);return true}catch(e){return false}}}}
 return {REQUIRED,MAX_BYTES,MAX_SEC,key,sanitize,validate,statusOf,vote,best,create}});
