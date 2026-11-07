/* Climat d’ambiance de chaque village. Module pur (navigateur : LCA.climate ; Node : tests).
   Les profils sont des regroupements STYLISÉS inspirés des grands types de climat d’Afrique (désert, sahel, forêt équatoriale, hauts plateaux…).
   Ce n’est ni une prévision ni une donnée météorologique : les températures sont des ordres de grandeur pour l’ambiance du jeu. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.climate=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
/* wet : chance relative de pluie ; dust / mist : chance de vent de sable / de brume ; cloud : chance de ciel couvert ; tmin/tmax : °C indicatifs */
const TYPES={
 desert:{id:'desert',name:'Désert et oasis',wet:.05,dust:.3,mist:0,cloud:.1,tmin:16,tmax:37,note:'Très sec, vents de sable, nuits fraîches.'},
 mediterraneen:{id:'mediterraneen',name:'Côte méditerranéenne',wet:.6,dust:.04,mist:.06,cloud:.3,tmin:12,tmax:26,note:'Doux, pluies d’hiver.'},
 sahel:{id:'sahel',name:'Sahel',wet:.45,dust:.16,mist:0,cloud:.2,tmin:22,tmax:36,note:'Chaud et sec, poussière de l’harmattan.'},
 savane:{id:'savane',name:'Savane',wet:.9,dust:.02,mist:.02,cloud:.3,tmin:20,tmax:32,note:'Chaud, averses.'},
 foret:{id:'foret',name:'Forêt équatoriale',wet:1.6,dust:0,mist:.18,cloud:.34,tmin:21,tmax:29,note:'Chaud, humide, brumes du matin.'},
 plateaux:{id:'plateaux',name:'Hauts plateaux',wet:.8,dust:0,mist:.16,cloud:.32,tmin:10,tmax:24,note:'Plus frais, ciel changeant, brume matinale.'},
 cote:{id:'cote',name:'Côte tropicale',wet:1.1,dust:0,mist:.05,cloud:.3,tmin:23,tmax:31,note:'Chaud, humide, averses.'},
 australe:{id:'australe',name:'Plateaux de l’Afrique australe',wet:.55,dust:.05,mist:.04,cloud:.24,tmin:9,tmax:28,note:'Ensoleillé, nuits fraîches.'}};
/* Langues vivant surtout sur des hauts plateaux (Éthiopie, Kenya central, Grands Lacs) : repères géographiques généraux. */
const HIGHLAND={amharique:1,oromo:1,tigrinya:1,kikuyu:1,kinyarwanda:1,kirundi:1};
/* Langues du littoral de l’océan Indien ou de l’Atlantique tropical. */
const COAST={swahili:1,malagasy:1};
function typeFor(L){
 if(!L||!L.geo)return TYPES.savane;
 const id=L.id,lat=L.geo.lat,lon=L.geo.lon,reg=L.region;
 if(HIGHLAND[id])return TYPES.plateaux;
 if(id==='somali')return TYPES.sahel;   /* Corne de l’Afrique : plutôt sec */
 if(COAST[id])return TYPES.cote;
 if(lat>=31)return TYPES.mediterraneen;
 if(reg==='nord'||lat>=21)return TYPES.desert;
 if(lat>=12&&lon<35)return TYPES.sahel;
 if(Math.abs(lat)<=7&&(reg==='centrale'||lon<10))return TYPES.foret;
 if(lat<=-22||(reg==='australe'&&lat<-17))return TYPES.australe;
 if(lat<=8&&lon>=36)return TYPES.cote;
 return TYPES.savane;
}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
/* Profil complet d’un village : type de climat + graine de météo propre + longitude pour l’heure solaire. */
function profile(L){
 const t=typeFor(L);
 return Object.assign({},t,{seed:hash((L&&L.id)||'x')%100000,lon:L&&L.geo&&Number.isFinite(L.geo.lon)?L.geo.lon:0});
}
/* Options à passer à LCA.ambient.state(t,…). */
function ambientOpts(p){return {wet:p.wet,dust:p.dust,mist:p.mist,cloud:p.cloud,tmin:p.tmin,tmax:p.tmax,seed:p.seed,lon:p.lon}}
return {TYPES,typeFor,profile,ambientOpts};
});
