/* Client des services en ligne (comptes, récits partagés, transcription, traduction).
   Aucune dépendance. Inactif tant que LCA.config.apiBase n'est pas défini : le jeu reste 100 % local par défaut.
   Isolé du reste du code pour pouvoir être branché sur une vraie API sans toucher à l'interface. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.online=f()}})(typeof self!=='undefined'?self:this,function(){
 function create(o){o=o||{};const base=(o.apiBase||'').replace(/\/+$/,''),fx=o.fetch||(typeof fetch==='function'?fetch.bind(globalThis):null);let token=o.token||null;
  const enabled=()=>!!base&&!!fx;
  async function call(method,path,body,auth){
   if(!enabled())throw Object.assign(new Error('Services en ligne non configurés'),{code:'offline'});
   const h={'content-type':'application/json'};if(auth!==false&&token)h.authorization='Bearer '+token;
   const r=await fx(base+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
   let j=null;try{j=await r.json()}catch(e){}
   if(!r.ok)throw Object.assign(new Error((j&&j.error)||('HTTP '+r.status)),{code:(j&&j.code)||'http',status:r.status});
   return j}
  let sess=null;
  async function wcall(path,body){if(!enabled())throw Object.assign(new Error('Services en ligne non configurés'),{code:'offline'});
   const h={'content-type':'application/json'};if(sess)h.authorization='Bearer '+sess;const r=await fx(base+path,{method:'POST',headers:h,body:JSON.stringify(body||{})});let j=null;try{j=await r.json()}catch(e){}
   if(!r.ok)throw Object.assign(new Error((j&&j.error)||('HTTP '+r.status)),{code:(j&&j.code)||'http',status:r.status});return j}
  return {
   world:{join:b=>wcall('/v1/world/join',b),sync:b=>wcall('/v1/world/sync',b),report:id=>wcall('/v1/world/report',{id}),leave:()=>wcall('/v1/world/leave',{}),setSession:t=>{sess=t}},
   enabled,setToken:t=>{token=t},getToken:()=>token,
   auth:{
    register:async(name,password,consent)=>{const j=await call('POST','/v1/auth/register',{name,password,consent:!!consent},false);token=j.token;return j},
    login:async(name,password)=>{const j=await call('POST','/v1/auth/login',{name,password},false);token=j.token;return j},
    logout:()=>{token=null},me:()=>call('GET','/v1/me'),updateProfile:p=>call('PUT','/v1/me/profile',p),
    deleteAccount:async()=>{const j=await call('DELETE','/v1/me');token=null;return j},
    exportData:()=>call('GET','/v1/me/export')},
   stories:{
    list:()=>call('GET','/v1/stories'),mine:()=>call('GET','/v1/stories?mine=1'),
    share:s=>call('POST','/v1/stories',s),remove:id=>call('DELETE','/v1/stories/'+encodeURIComponent(id)),
    report:(id,reason)=>call('POST','/v1/stories/'+encodeURIComponent(id)+'/report',{reason})},
   /* transcription / traduction : l'API renvoie 501 tant qu'aucun fournisseur n'est configuré ; le résultat est TOUJOURS un brouillon à relire */
   transcribe:(audioB64,mime,lang)=>call('POST','/v1/transcribe',{audio:audioB64,mime,lang}),
   translate:(text,from,to)=>call('POST','/v1/translate',{text,from,to})}}
 return {create}});
