/* Ambiance du village : heure de la journée et météo. Module pur (aucun accès au DOM) : navigateur (LCA.ambient) et Node (tests).
   Tout est déterministe à partir du temps de jeu : mêmes dates, même météo. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.ambient=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const DAY_SEC=420;   /* une journée de jeu = 7 minutes réelles */
const START_H=9;     /* on commence le matin */
const SEG=70;        /* durée d’une plage météo, en secondes */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function hash(n){let h=2166136261^n;h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^(h>>>16))>>>0)/4294967296}

/* Heure (0–24) à partir du temps de jeu en secondes. lon (facultatif) : heure solaire locale, 1 h de décalage par 15° de longitude
   (on part du méridien de Greenwich) ; voyager vers l’est avance donc l’heure, vers l’ouest la recule. */
function hourAt(t,lon){return((START_H+(t/DAY_SEC)*24+(Number.isFinite(lon)?lon/15:0))%24+24)%24}
/* Lumière du jour : 0 = pleine nuit, 1 = plein jour ; lever vers 6 h, coucher vers 19 h. */
function daylight(h){return smooth(5,7.5,h)*(1-smooth(17.5,20,h))}
/* Chaleur de l’aube et du crépuscule : 1 aux alentours de 6 h et 18 h 30. */
function glow(h){const d=Math.min(Math.abs(h-6.2),Math.abs(h-18.7));return clamp(1-d/1.6,0,1)}

/* Type de météo d’une plage : 0 = dégagé, 1 = nuageux, 2 = pluie, 3 = vent de sable, 4 = brume.
   wet règle la chance de pluie (0 = région très sèche) ; dust et mist (0–1) sont les chances de sable et de brume propres à la zone. */
function kindOf(seg,o,seed){const r=hash(seg*7919+(seed|0)*104729);const wet=o.wet,rain=.22*wet,dust=o.dust||0,mist=o.mist||0,cloud=(o.cloud===undefined?.28+.12*wet:o.cloud);
 if(r<rain)return 2;if(r<rain+dust)return 3;if(r<rain+dust+mist)return 4;return r<rain+dust+mist+cloud?1:0}
function weatherAt(t,opt){
 opt=opt||{};const o={wet:opt.wet===undefined?1:opt.wet,dust:opt.dust,mist:opt.mist,cloud:opt.cloud},seed=opt.seed||0;
 const seg=Math.floor(t/SEG),f=(t-seg*SEG)/SEG,k0=kindOf(seg,o,seed),k1=kindOf(seg+1,o,seed);
 const mix=smooth(.82,1,f);                       /* fondu entre deux plages */
 const lv=k=>({cloud:k===0?.06:k===1?.55:k===2?.85:k===3?.3:.4,rain:k===2?1:0,dust:k===3?1:0,mist:k===4?1:0});
 const a=lv(k0),b=lv(k1),m=(x,y)=>x+(y-x)*mix;
 return {kind:k0,cloud:m(a.cloud,b.cloud),rain:m(a.rain,b.rain),dust:m(a.dust,b.dust),mist:m(a.mist,b.mist)};
}
const WEATHER_NAMES=['Ciel dégagé','Nuageux','Pluie','Vent de sable','Brume'];
function state(t,opt){
 opt=opt||{};const fixed=opt.hour;
 if(opt.realtime){
  const r=opt.realtime,h=Number.isFinite(r.hour)?r.hour:(Number.isFinite(r.localHour)?r.localHour:12),d=clamp(r.daylight,0,1),rain=r.rain?1:0,cloud=clamp(r.cloud||0,0,1),dust=clamp(r.dust||0,0,1),mist=clamp(r.mist||0,0,1),kind=rain?2:(mist>.4?4:(cloud>.35?1:0));
  const moment=h<5?'Nuit':h<7.5?'Aube':h<11.5?'Matin':h<14.5?'Midi':h<17.5?'Après-midi':h<20?'Soir':'Nuit';
  return {hour:h,daylight:d,night:1-d,glow:glow(h),cloud,rain,dust,mist,temp:Number.isFinite(r.temp)?r.temp:20,kind,moment,weather:r.weather||WEATHER_NAMES[kind],dim:clamp(1-.55*(1-d)-.18*cloud-.12*rain-.15*dust-.08*mist,.25,1),realtime:true,sourceTime:r.sourceTime,timezone:r.timezone};
 }
 const h=fixed!==undefined?fixed:hourAt(t,opt.lon),d=daylight(h),w=weatherAt(t,opt);
 const nw=!!opt.noWeather,rain=nw?0:w.rain,cloud=nw?0:w.cloud;
 const dust=nw?0:w.dust,mist=nw?0:w.mist*(1-smooth(8.5,11.5,h));   /* la brume se lève dans la matinée */
 const kind=rain>.5?2:dust>.5?3:mist>.4?4:cloud>.35?1:0;
 const tmin=Number.isFinite(opt.tmin)?opt.tmin:20,tmax=Number.isFinite(opt.tmax)?opt.tmax:31;
 const temp=Math.round(tmin+(tmax-tmin)*(1+Math.cos((h-15)/24*6.2832))/2-3.5*rain-2*cloud*(1-rain)+(dust?1:0));
 const moment=h<5?'Nuit':h<7.5?'Aube':h<11.5?'Matin':h<14.5?'Midi':h<17.5?'Après-midi':h<20?'Soir':'Nuit';
 return {hour:h,daylight:d,night:1-d,glow:glow(h),cloud,rain,dust,mist,temp,kind,moment,weather:WEATHER_NAMES[kind],
  dim:clamp(1-.55*(1-d)-.18*cloud-.12*rain-.15*dust-.08*mist,.25,1)};   /* facteur appliqué aux lumières 3D */
}
/* Voile de couleur pour l’écran : rgba (alpha déjà borné). */
function tint(s,maxNight){
 const mn=maxNight===undefined?.5:maxNight;
 let r=14,g=24,b=64,a=s.night*mn;                  /* nuit : bleu marine */
 const gw=s.glow*.22;                               /* aube/crépuscule : orangé */
 if(gw>a*.2){r=r+(255-r)*gw*2;g=g+(140-g)*gw*2;b=b+(60-b)*gw*2;a=Math.max(a,gw)}
 const gr=s.cloud*.16+s.rain*.1;                    /* temps gris */
 if(gr>0){const k=gr/(a+gr);r+= (90-r)*k;g+=(100-g)*k;b+=(115-b)*k;a=Math.min(.7,a+gr*(1-a))}
 const du=(s.dust||0)*.34;                          /* vent de sable : voile ocre */
 if(du>0){const k=du/(a+du);r+=(205-r)*k;g+=(150-g)*k;b+=(80-b)*k;a=Math.min(.7,a+du*(1-a))}
 const mi=(s.mist||0)*.3;                           /* brume : voile blanc-gris */
 if(mi>0){const k=mi/(a+mi);r+=(226-r)*k;g+=(233-g)*k;b+=(238-b)*k;a=Math.min(.7,a+mi*(1-a))}
 return {r:Math.round(clamp(r,0,255)),g:Math.round(clamp(g,0,255)),b:Math.round(clamp(b,0,255)),a:+clamp(a,0,.7).toFixed(3)};
}
return {DAY_SEC,START_H,SEG,hourAt,daylight,glow,weatherAt,state,tint,WEATHER_NAMES};
});
