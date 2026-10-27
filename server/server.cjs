#!/usr/bin/env node
/* Serveur de référence N'Zassa (SANS dépendance, Node ≥ 18). Sert de contrat exécutable pour la future API ;
   il n'est PAS un déploiement de production : stockage fichier JSON, pas de TLS (à placer derrière un proxy HTTPS), pas de vraie modération.
   Sécurité mise en œuvre : mots de passe hachés (scrypt + sel), jetons signés HMAC-SHA256 avec expiration, limitation de débit,
   limites de taille, validation stricte, consentement explicite, suppression et export des données, statut de modération (aucun récit public sans validation). */
'use strict';
const http=require('http'),crypto=require('crypto'),fs=require('fs'),path=require('path');
const MAX_BODY=6*1024*1024,TOKEN_TTL=7*24*3600,NAME_RE=/^[\p{L}\p{N}][\p{L}\p{N} '’_-]{1,23}$/u;
function createServer(opts){
 opts=opts||{};const secret=opts.secret||process.env.NZASSA_SECRET||crypto.randomBytes(32).toString('hex'),file=opts.file||null,rate=opts.rate||{max:60,windowMs:60000},now=opts.now||(()=>Date.now());
 let db={users:{},stories:{},reports:[]};if(file&&fs.existsSync(file)){try{db=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){}}
 const persist=()=>{if(file)fs.writeFileSync(file,JSON.stringify(db))};
 const b64=b=>Buffer.from(b).toString('base64url');
 const sign=p=>{const body=b64(JSON.stringify(p));return body+'.'+crypto.createHmac('sha256',secret).update(body).digest('base64url')};
 function verify(t){if(typeof t!=='string'||t.length>2000)return null;const [body,sig]=t.split('.');if(!body||!sig)return null;
  const exp=crypto.createHmac('sha256',secret).update(body).digest('base64url'),a=Buffer.from(sig),c=Buffer.from(exp);
  if(a.length!==c.length||!crypto.timingSafeEqual(a,c))return null;let p;try{p=JSON.parse(Buffer.from(body,'base64url').toString())}catch(e){return null}
  return p&&p.exp>now()/1000?p:null}
 const hash=(pw,salt)=>crypto.scryptSync(pw,salt,64,{N:16384,r:8,p:1}).toString('hex');
 const hits=new Map();
 function limited(ip,path){const k=ip+'|'+(path.startsWith('/v1/auth')?'auth':'api'),max=path.startsWith('/v1/auth')?(rate.authMax||Math.min(rate.max,10)):rate.max,t=now();let h=hits.get(k);if(!h||t-h.t>rate.windowMs){h={t,n:0};hits.set(k,h)}h.n++;return h.n>max}
 const send=(res,code,obj)=>{const b=JSON.stringify(obj);res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':opts.cors||'null','access-control-allow-headers':'content-type, authorization','access-control-allow-methods':'GET,POST,DELETE,OPTIONS'});res.end(b)};
 const err=(res,code,msg,c)=>send(res,code,{error:msg,code:c||'error'});
 const clean=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,n);
 const pub=u=>({id:u.id,name:u.name,created:u.created});
 function readBody(req){return new Promise((ok,ko)=>{let n=0;const ch=[];req.on('data',d=>{n+=d.length;if(n>MAX_BODY){ko(Object.assign(new Error('Corps trop volumineux'),{status:413}));req.destroy();return}ch.push(d)});req.on('end',()=>{if(!n)return ok({});try{ok(JSON.parse(Buffer.concat(ch).toString()))}catch(e){ko(Object.assign(new Error('JSON invalide'),{status:400}))}});req.on('error',ko)})}
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.method==='OPTIONS')return send(res,204,{});
   const url=new URL(req.url,'http://x'),p=url.pathname,ip=req.socket.remoteAddress||'?';
   if(p==='/v1/health')return send(res,200,{ok:true});
   if(limited(ip,p))return err(res,429,'Trop de requêtes','rate_limited');
   const body=['POST','PUT','DELETE'].includes(req.method)?await readBody(req):{};
   let user=null;const m=/^Bearer (.+)$/.exec(req.headers.authorization||'');if(m){const t=verify(m[1]);if(t&&db.users[t.sub])user=db.users[t.sub]}
   const need=()=>{if(!user){err(res,401,'Connexion requise','unauthorized');return false}return true};
   if(p==='/v1/auth/register'&&req.method==='POST'){
    const name=clean(body.name,24).trim(),pw=typeof body.password==='string'?body.password:'';
    if(!NAME_RE.test(name))return err(res,400,'Nom invalide (2 à 24 caractères : lettres, chiffres, espace, apostrophe, tiret)','bad_name');
    if(pw.length<8||pw.length>200)return err(res,400,'Mot de passe : 8 caractères minimum','bad_password');
    if(body.consent!==true)return err(res,400,'Consentement requis pour créer un compte en ligne','consent_required');
    const key=name.toLowerCase();if(Object.values(db.users).some(u=>u.key===key))return err(res,409,'Nom déjà utilisé','name_taken');
    const id=crypto.randomUUID(),salt=crypto.randomBytes(16).toString('hex');
    db.users[id]={id,name,key,salt,hash:hash(pw,salt),created:now(),consent:{at:now(),v:1}};persist();
    return send(res,201,{user:pub(db.users[id]),token:sign({sub:id,exp:now()/1000+TOKEN_TTL})})}
   if(p==='/v1/auth/login'&&req.method==='POST'){
    const key=clean(body.name,24).trim().toLowerCase(),u=Object.values(db.users).find(x=>x.key===key),pw=typeof body.password==='string'?body.password:'';
    const salt=u?u.salt:'00'.repeat(16),h=hash(pw.slice(0,200),salt);
    const good=u&&crypto.timingSafeEqual(Buffer.from(h),Buffer.from(u.hash));
    if(!good)return err(res,401,'Nom ou mot de passe incorrect','bad_credentials');
    return send(res,200,{user:pub(u),token:sign({sub:u.id,exp:now()/1000+TOKEN_TTL})})}
   if(p==='/v1/me'&&req.method==='GET'){if(!need())return;return send(res,200,{user:pub(user)})}
   if(p==='/v1/me'&&req.method==='DELETE'){if(!need())return;delete db.users[user.id];Object.keys(db.stories).forEach(k=>{if(db.stories[k].owner===user.id)delete db.stories[k]});persist();return send(res,200,{deleted:true})}
   if(p==='/v1/me/export'&&req.method==='GET'){if(!need())return;return send(res,200,{user:pub(user),consent:user.consent,stories:Object.values(db.stories).filter(s=>s.owner===user.id)})}
   if(p==='/v1/stories'&&req.method==='GET'){
    const mine=url.searchParams.get('mine')==='1';if(mine&&!need())return;
    const list=Object.values(db.stories).filter(s=>mine?s.owner===user.id:s.status==='approved').map(s=>({id:s.id,title:s.title,lang:s.lang,transcript:s.transcript,translation:s.translation,author:s.author,status:s.status,created:s.created,draft:true}));
    return send(res,200,{stories:list})}
   if(p==='/v1/stories'&&req.method==='POST'){if(!need())return;
    if(body.consent!==true)return err(res,400,'Le consentement des personnes enregistrées est requis','consent_required');
    const title=clean(body.title,120).trim();if(!title)return err(res,400,'Titre requis','bad_title');
    const id=crypto.randomUUID();
    db.stories[id]={id,owner:user.id,author:user.name,title,lang:clean(body.lang,40),transcript:clean(body.transcript,8000),translation:clean(body.translation,8000),
     audio:typeof body.audio==='string'&&body.audio.length<=MAX_BODY?body.audio:'',status:'pending',created:now()};persist();
    return send(res,201,{id,status:'pending',note:'En attente de modération : aucun récit n’est public avant validation.'})}
   const sm=/^\/v1\/stories\/([\w-]{1,64})(\/report)?$/.exec(p);
   if(sm){const s=db.stories[sm[1]];
    if(sm[2]&&req.method==='POST'){if(!need())return;if(!s)return err(res,404,'Introuvable','not_found');db.reports.push({story:s.id,by:user.id,reason:clean(body.reason,300),at:now()});if(s.status==='approved')s.status='pending';persist();return send(res,202,{reported:true})}
    if(req.method==='DELETE'){if(!need())return;if(!s||s.owner!==user.id)return err(res,404,'Introuvable','not_found');delete db.stories[s.id];persist();return send(res,200,{deleted:true})}}
   if((p==='/v1/transcribe'||p==='/v1/translate')&&req.method==='POST'){if(!need())return;
    return err(res,501,'Aucun fournisseur de '+(p.endsWith('transcribe')?'transcription':'traduction')+' n’est configuré. Le jeu n’invente pas de résultat : saisis le texte à la main.','no_provider')}
   return err(res,404,'Route inconnue','not_found')
  }catch(e){err(res,e.status||500,e.status?e.message:'Erreur serveur')}});
 server.db=db;return server}
module.exports={createServer};
if(require.main===module){const port=+process.env.PORT||8787,s=createServer({file:process.env.NZASSA_DB||path.join(__dirname,'data.json')});s.listen(port,process.env.HOST||'127.0.0.1',()=>console.log('N’Zassa API de référence sur http://127.0.0.1:'+port))}
