/* Profils et comptes : la progression de chaque profil reste dans ce navigateur ; lorsque l’API est configurée,
   l’authentification et le nom d’utilisateur sont aussi enregistrés côté serveur SQLite. Hors ligne, les profils
   locaux restent disponibles. Le mot de passe local est haché PBKDF2 ; l’API hache les comptes avec scrypt.
   Clés : « lca-acc » (index local), « lca-u-<id> » (sauvegarde), « lca-cloud » (session API) ; l’invité reste « lca-v2 ». */
(function(root,factory){const m=factory(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.accounts=m}})(typeof window!=='undefined'?window:this,function(root){
'use strict';
const INDEX='lca-acc',SAVE='lca-v2',PREFIX='lca-u-',CLOUD='lca-cloud',ITER=150000,MAXFAIL=5,LOCK_MS=30000,PW_MIN=6,PW_MAX=64;
const clean=(s,n)=>root.LCA&&root.LCA.store?root.LCA.store.cleanName(s,n):String(s||'').trim().slice(0,n||16);
const b64=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
const unb64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
const same=(a,b)=>{if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};

function create(o){
 o=o||{};const st=o.storage,cr=o.crypto||(root.crypto),iter=o.iterations||ITER,now=o.now||(()=>Date.now()),online=o.online||null;
 const subtle=cr&&cr.subtle;
 let idx=readIndex(),cloud=readCloud();if(cloud&&cloud.token&&online&&online.auth)online.auth.setToken(cloud.token);
 function blank(){return {v:1,current:null,accounts:[],fails:{}}}
 function readIndex(){try{const j=JSON.parse(st.getItem(INDEX));if(j&&Array.isArray(j.accounts))return Object.assign(blank(),j,{fails:j.fails&&typeof j.fails==='object'?j.fails:{}})}catch(e){}return blank()}
 function readCloud(){try{const c=JSON.parse(st.getItem(CLOUD));return c&&typeof c.token==='string'&&typeof c.id==='string'?c:null}catch(e){return null}}
 function writeCloud(c){try{if(c)st.setItem(CLOUD,JSON.stringify(c));else st.removeItem(CLOUD);cloud=c;return true}catch(e){return false}}
 function writeIndex(){try{st.setItem(INDEX,JSON.stringify(idx));return true}catch(e){return false}}
 const key=p=>clean(p,20).toLowerCase();
 const byPseudo=p=>idx.accounts.find(a=>a.key===key(p));
 const pub=a=>a?{id:a.id,pseudo:a.pseudo,hasPassword:!!a.hash,created:a.created,last:a.last||0}:null;
 function activateCloud(user,token,importGuest){
  const pseudo=clean(user&&user.name,20),k=key(pseudo);let a=byPseudo(pseudo),added=false;
  if(!a){a={id:user.id||newId(),pseudo,key:k,created:user.created||now()};try{if(importGuest){const g=st.getItem(SAVE);if(g)st.setItem(PREFIX+a.id,g)}}catch(e){return {ok:false,error:'storage'}}idx.accounts.push(a);added=true}
  const previous=idx.current;a.cloud=user.id;idx.current=a.id;a.last=now();
  if(!writeIndex()){idx.current=previous;if(added)idx.accounts=idx.accounts.filter(x=>x.id!==a.id);return {ok:false,error:'storage'}}
  if(!writeCloud({id:user.id,pseudo,created:user.created||now(),token})){return {ok:false,error:'storage'}}
  return {ok:true,account:pub(a),online:true};
 }
 async function loginLocal(pseudo,password){
  const a=byPseudo(pseudo);if(!a)return {ok:false,error:'bad'};
  const f=idx.fails[a.id]||{n:0,until:0};
  if(f.until>now())return {ok:false,error:'locked',wait:Math.ceil((f.until-now())/1000)};
  if(a.hash){let ok=false;if(subtle&&typeof password==='string'&&password){try{ok=same(await hash(password,unb64(a.salt)),a.hash)}catch(e){ok=false}}
   if(!ok){f.n++;if(f.n>=MAXFAIL){f.until=now()+LOCK_MS;f.n=0}idx.fails[a.id]=f;writeIndex();return {ok:false,error:f.until>now()?'locked':'bad',wait:f.until>now()?Math.ceil(LOCK_MS/1000):0}}}
  delete idx.fails[a.id];idx.current=a.id;a.last=now();writeIndex();if(online&&online.auth)online.auth.logout();writeCloud(null);
  return {ok:true,account:pub(a)};
 }
 async function hash(pw,salt){
  const k=await subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  const bits=await subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:iter},k,256);
  return b64(new Uint8Array(bits));
 }
 function newId(){const u=new Uint8Array(8);if(cr&&cr.getRandomValues)cr.getRandomValues(u);else for(let i=0;i<8;i++)u[i]=Math.floor(Math.random()*256);return Array.from(u,x=>x.toString(16).padStart(2,'0')).join('')}

 return {
  INDEX,SAVE,
  canProtect:()=>!!subtle,
  onlineEnabled:()=>!!(online&&online.enabled&&online.enabled()),
  isOnline:()=>!!cloud,
  cloudCurrent:()=>cloud?{id:cloud.id,pseudo:cloud.pseudo,created:cloud.created}:null,
  list:()=>idx.accounts.map(pub),
  current:()=>{const a=idx.accounts.find(x=>x.id===idx.current);return pub(a)},
  /* Stockage « vu » par le jeu : la clé de sauvegarde habituelle est redirigée vers le profil actif (invité si aucun). */
  storage(){
   const map=k=>{const a=idx.accounts.find(x=>x.id===idx.current);return a&&typeof k==='string'&&k.indexOf(SAVE)===0?PREFIX+a.id+k.slice(SAVE.length):k};
   return {getItem:k=>st.getItem(map(k)),setItem:(k,v)=>st.setItem(map(k),v),removeItem:k=>st.removeItem(map(k))};
  },
  guestHasData:()=>{try{return !!st.getItem(SAVE)}catch(e){return false}},
  checkPseudo(p){const c=clean(p,20);if(c.length<3)return 'short';if(byPseudo(c))return 'exists';return null},
  checkPassword(pw){if(!pw)return null;if(typeof pw!=='string'||pw.length<PW_MIN)return 'short';if(pw.length>PW_MAX)return 'long';if(!subtle)return 'nocrypto';return null},
  async register({pseudo,password,importGuest,consent}){
   const c=clean(pseudo,20);
   if(this.onlineEnabled()){
    try{const r=await online.auth.register(c,password,consent===true);return activateCloud(r.user,r.token,importGuest)}
    catch(e){return {ok:false,error:e.code||'offline'}}
   }
   const e1=this.checkPseudo(c);if(e1)return {ok:false,error:e1};
   const e2=this.checkPassword(password);if(e2)return {ok:false,error:e2};
   const a={id:newId(),pseudo:c,key:key(c),created:now()};
   if(password){const salt=new Uint8Array(16);cr.getRandomValues(salt);a.salt=b64(salt);a.iter=iter;a.hash=await hash(password,salt)}
   try{
    if(importGuest){const g=st.getItem(SAVE);if(g)st.setItem(PREFIX+a.id,g)}
   }catch(e){return {ok:false,error:'storage'}}
   idx.accounts.push(a);idx.current=a.id;a.last=now();
   if(!writeIndex()){idx.accounts.pop();idx.current=null;return {ok:false,error:'storage'}}
   return {ok:true,account:pub(a)};
  },
  async login(pseudo,password){
   if(this.onlineEnabled()){
    try{const r=await online.auth.login(clean(pseudo,24),password);return activateCloud(r.user,r.token,false)}
    catch(e){const a=byPseudo(pseudo);if(a&&!a.cloud&&(e.code==='bad_credentials'||!e.code||e.code==='offline'))return loginLocal(pseudo,password);return {ok:false,error:e.code||'offline'}}
   }
   return loginLocal(pseudo,password);
  },
  logout(){idx.current=null;if(online&&online.auth)online.auth.logout();writeCloud(null);return writeIndex()},
  /* Supprime le profil ET sa sauvegarde (jamais la sauvegarde invité). Mot de passe exigé s’il y en a un. */
  async remove(id,password){
   const a=idx.accounts.find(x=>x.id===id);if(!a)return {ok:false,error:'unknown'};
   if(a.hash){let ok=false;try{ok=subtle&&typeof password==='string'&&same(await hash(password,unb64(a.salt)),a.hash)}catch(e){}if(!ok)return {ok:false,error:'bad'}}
   if(cloud&&a.cloud===cloud.id&&online&&online.auth&&online.enabled&&online.enabled()){
    try{await online.auth.deleteAccount()}catch(e){return {ok:false,error:e.code||'offline'}}
   }
   idx.accounts=idx.accounts.filter(x=>x.id!==id);if(idx.current===id)idx.current=null;if(cloud&&a.cloud===cloud.id)writeCloud(null);delete idx.fails[id];
   try{st.removeItem(PREFIX+id);st.removeItem(PREFIX+id+'.bak')}catch(e){}
   writeIndex();return {ok:true};
  }
 };
}
return {create,INDEX,SAVE,PREFIX,PW_MIN};
});
