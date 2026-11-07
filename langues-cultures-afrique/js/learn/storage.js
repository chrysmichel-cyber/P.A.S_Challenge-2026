/* Sauvegarde : isolée du jeu pour pouvoir passer à une API plus tard. Le stockage est injecté (localStorage dans le navigateur, un objet simulé dans les tests).
   Schéma : v2 = ancien format (progression par langue) ; v3 = v2 + « learn » (profil d’apprentissage) ; v4 = v3 + « name » (nom du personnage) ; v5 = v4 + « review » (relectures de locuteurs). Une sauvegarde v2 est conservée telle quelle dans la clé « .bak » avant la première migration. */
(function(root,factory){const m=factory(root);if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.store=m}})(typeof window!=='undefined'?window:this,function(root){
'use strict';
/* rendu par défaut : 3D ; une page peut imposer '2d' avant ce script (window.LCA_DEFAULT_MODE) pour une édition 2D */
const DEF_MODE=root&&root.LCA_DEFAULT_MODE==='2d'?'2d':'3d';
const KEY='lca-v2',VERSION=5,DEFAULT_SETTINGS={sound:1,shadows:1,low:0,slow:0,mode:DEF_MODE,modeV:2,quality:1,auto:1};
const P=()=>root.LCA&&root.LCA.progress;
const RV=()=>root.LCA&&root.LCA.review;

/* Nom affiché : lettres, chiffres, espace, apostrophe, tiret ; 16 caractères au plus. Renvoie toujours une chaîne. */
function cleanName(x,max){
 let t=typeof x==='string'?x:'';
 try{t=t.normalize('NFC')}catch(e){}
 try{t=t.replace(/[^\p{L}\p{N} '’\-]/gu,'')}catch(e){t=t.replace(/[^A-Za-z0-9 '’\-\u00C0-\u024F]/g,'')}
 t=t.replace(/\s+/g,' ').trim();
 return t.slice(0,max||16).trim();
}

function defaults(){return {v:VERSION,lang:null,name:'',review:RV()?RV().empty():{v:1,reviewer:null,items:{}},d:{},settings:Object.assign({},DEFAULT_SETTINGS),learn:P()?P().newProfile():{}}}

/* Rend n’importe quelle donnée lue exploitable, sans jamais lever d’exception ni perdre les champs existants. */
function migrate(raw){
 const base=defaults();
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return base;
 const s=Object.assign(base,raw);
 if(!s.d||typeof s.d!=='object'||Array.isArray(s.d))s.d={};
 s.settings=Object.assign({},DEFAULT_SETTINGS,raw.settings&&typeof raw.settings==='object'?raw.settings:{});
 const rs=raw.settings&&typeof raw.settings==='object'?raw.settings:{};
 /* anciens réglages : mode3d (v0.6) devient mode ; low devient quality */
 if(rs.mode!=='2d'&&rs.mode!=='3d')s.settings.mode=DEF_MODE;
 /* v0.11 : le rendu 3D devient le rendu par défaut ; appliqué une seule fois, le choix fait ensuite dans les réglages est conservé */
 if(rs.modeV!==2){s.settings.mode=DEF_MODE;s.settings.modeV=2}
 if(![0,1,2].includes(rs.quality))s.settings.quality=rs.low?0:1;
 s.name=cleanName(raw.name);
 s.review=RV()?RV().normalize(raw.review):(raw.review||{v:1,reviewer:null,items:{}});
 s.learn=P()?P().normalize(raw.learn):raw.learn||{};
 s.v=VERSION;
 return s;
}
function read(storage){
 try{const t=storage.getItem(KEY);if(!t)return null;const j=JSON.parse(t);return j&&typeof j==='object'?j:null}catch(e){return null}
}
/* Charge, migre si besoin (avec copie de secours de l’ancienne version) et renvoie l’état. */
function load(storage){
 let raw=null,text=null;
 try{text=storage.getItem(KEY);raw=text?JSON.parse(text):null}catch(e){raw=null}
 const old=raw&&typeof raw==='object'&&(raw.v||0)<VERSION;
 if(old&&text){try{if(!storage.getItem(KEY+'.bak'))storage.setItem(KEY+'.bak',text)}catch(e){}}
 const s=migrate(raw);
 return s;
}
function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return true}catch(e){return false}}
return {KEY,VERSION,cleanName,defaults,migrate,load,save,read};
});
