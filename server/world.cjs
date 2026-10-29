/* Monde ouvert N'Zassa : salons (un par village/langue), positions des joueurs et chat TEXTE uniquement.
   En mémoire, sans persistance : rien n'est conservé après l'arrêt du serveur. Aucune donnée personnelle demandée (pseudo seulement). */
'use strict';
const crypto=require('crypto');
const NAME_RE=/^[\p{L}\p{N}][\p{L}\p{N} '’_-]{1,15}$/u,ROOM_RE=/^[a-z0-9_-]{1,24}$/;
const L={maxPlayers:30,idleMs:20000,chatMax:200,history:50,chatGapMs:1500,chatPerMin:20,reportsToMute:3,muteMs:10*60*1000,bound:200};
class WorldError extends Error{constructor(status,code,msg){super(msg);this.status=status;this.code=code}}
/* nettoie un message : caractères de contrôle, liens, adresses e-mail, numéros de téléphone, espaces multiples */
function cleanChat(t){
 let s=String(t==null?'':t).normalize('NFKC').replace(/[\u0000-\u001f\u007f​-‏‪-‮]/g,' ').replace(/\s+/g,' ').trim();
 s=s.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'***').replace(/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g,'***').replace(/\b[\w-]+\.(?:com|net|org|io|fr|ci|sn|me|app|xyz|info|co)\b\S*/gi,'***');
 s=s.replace(/(?:\+?\d[\s().-]?){7,}/g,'***');
 return s.slice(0,L.chatMax)}
const num=(v,d)=>Number.isFinite(+v)?Math.max(-L.bound,Math.min(L.bound,+v)):d;
/* avatar : seulement des couleurs/valeurs bornées (jamais de texte libre) */
function cleanAvatar(a){a=a&&typeof a==='object'?a:{};const o={},col=v=>Number.isInteger(v)&&v>=0&&v<=0xffffff;
 ['skin','top','bottom','hairCol','hatCol','boubou'].forEach(k=>{if(col(a[k]))o[k]=a[k]});
 ['fem','glasses','beard','jewel','pack'].forEach(k=>{if(a[k]===true)o[k]=true});
 ['hs','hat'].forEach(k=>{if(typeof a[k]==='string'&&/^[a-z]{2,12}$/.test(a[k]))o[k]=a[k]});
 if(Number.isInteger(a.pat)&&a.pat>=0&&a.pat<=4)o.pat=a.pat;if(a.skirt===1||a.skirt===true)o.skirt=1;return o}
function createWorld(opt){opt=opt||{};const now=opt.now||(()=>Date.now()),rooms=new Map(),sessions=new Map();
 const room=id=>{let r=rooms.get(id);if(!r){r={id,players:new Map(),chat:[],seq:0};rooms.set(id,r)}return r};
 function prune(){const t=now();for(const [sid,s] of sessions){if(t-s.seen>L.idleMs){const r=rooms.get(s.room);if(r)r.players.delete(sid);sessions.delete(sid);if(r&&!r.players.size&&!r.chat.length)rooms.delete(r.id)}}}
 function get(sid){prune();const s=sessions.get(sid);if(!s)throw new WorldError(401,'no_session','Session expirée : rejoins le monde ouvert.');s.seen=now();return s}
 function post(r,s,text,system){r.seq++;const m={n:r.seq,id:s?s.pub:'sys',name:s?s.name:'Village',text,t:now(),sys:!!system};r.chat.push(m);if(r.chat.length>L.history)r.chat.shift();return m}
 function join(b){
  if(b.consent!==true)throw new WorldError(400,'consent_required','Le monde ouvert affiche ton pseudo et tes messages aux autres joueurs : accepte pour continuer.');
  const name=String(b.name==null?'':b.name).replace(/\s+/g,' ').trim();if(!NAME_RE.test(name))throw new WorldError(400,'bad_name','Pseudo invalide (2 à 16 caractères : lettres, chiffres, espace, apostrophe, tiret).');
  const rid=String(b.room||'');if(!ROOM_RE.test(rid))throw new WorldError(400,'bad_room','Salon invalide.');
  prune();const r=room(rid);if(r.players.size>=L.maxPlayers)throw new WorldError(409,'room_full','Ce village est plein : réessaie dans un moment ou change de village.');
  let nm=name,k=2;const taken=n=>[...r.players.values()].some(p=>p.name.toLowerCase()===n.toLowerCase());while(taken(nm))nm=name.slice(0,13)+' '+(k++);
  const sid=crypto.randomBytes(18).toString('base64url'),pub=crypto.randomBytes(5).toString('hex');
  const s={sid,pub,name:nm,room:rid,x:num(b.x,0),z:num(b.z,26),h:0,a:0,av:cleanAvatar(b.avatar),seen:now(),sent:[],last:'',lastAt:0,reports:new Set(),mutedUntil:0};
  sessions.set(sid,s);r.players.set(sid,s);post(r,null,nm+' est arrivé(e) au village.',true);
  return {sid,id:pub,name:nm,room:rid,limits:{chatMax:L.chatMax,chatGapMs:L.chatGapMs},state:view(r,s,0)}}
 function view(r,me,since){return {players:[...r.players.values()].filter(p=>p!==me).map(p=>({id:p.pub,name:p.name,x:p.x,z:p.z,h:p.h,a:p.a,av:p.av})),
  chat:r.chat.filter(m=>m.n>since),cursor:r.seq,online:r.players.size}}
 function say(r,s,text){
  const t=now();if(t<s.mutedUntil)throw new WorldError(403,'muted','Tu es temporairement réduit(e) au silence suite à des signalements.');
  const c=cleanChat(text);if(!c)return null;
  if(t-s.lastAt<L.chatGapMs)throw new WorldError(429,'slow_down','Doucement : un message toutes les 1,5 secondes.');
  s.sent=s.sent.filter(x=>t-x<60000);if(s.sent.length>=L.chatPerMin)throw new WorldError(429,'slow_down','Trop de messages : attends un peu.');
  if(c.toLowerCase()===s.last)throw new WorldError(400,'duplicate','Message déjà envoyé.');
  s.sent.push(t);s.lastAt=t;s.last=c.toLowerCase();return post(r,s,c,false)}
 function sync(sid,b){const s=get(sid),r=rooms.get(s.room);
  s.x=num(b.x,s.x);s.z=num(b.z,s.z);s.h=num(b.h,s.h)%(Math.PI*8);s.a=[0,1,2,3].includes(b.a)?b.a:0;
  let err=null;if(typeof b.say==='string'&&b.say){try{say(r,s,b.say)}catch(e){if(e instanceof WorldError)err={code:e.code,error:e.message};else throw e}}
  const v=view(r,s,Number.isFinite(+b.since)?+b.since:0);if(err)v.chatError=err;return v}
 function report(sid,b){const s=get(sid),r=rooms.get(s.room),t=[...r.players.values()].find(p=>p.pub===b.id);
  if(!t||t===s)throw new WorldError(404,'not_found','Joueur introuvable.');t.reports.add(s.pub);
  if(t.reports.size>=L.reportsToMute&&now()>=t.mutedUntil){t.mutedUntil=now()+L.muteMs;t.reports.clear();post(r,null,t.name+' est en silence pendant 10 minutes (signalements).',true)}
  return {reported:true}}
 function leave(sid){const s=sessions.get(sid);if(!s)return {left:true};const r=rooms.get(s.room);if(r){r.players.delete(sid);post(r,null,s.name+' a quitté le village.',true)}sessions.delete(sid);return {left:true}}
 return {join,sync,report,leave,limits:L,rooms,sessions}}
module.exports={createWorld,cleanChat,cleanAvatar,WorldError,NAME_RE};
