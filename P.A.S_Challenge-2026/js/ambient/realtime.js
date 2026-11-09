/* Météo réelle de la position de l'utilisateur. La position reste dans le navigateur
   et est envoyée directement à Open-Meteo, jamais au serveur N'Zassa. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.realtimeWeather=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const MAX_AGE=60*60*1000,REFRESH=15*60*1000;
let current=null,pending=false,lastAttempt=0,timer=0;
const weatherCode=c=>c===0?'Ciel dégagé':c<=3?'Nuageux':c<=48?'Brume':c<=67||c===80||c===81?'Pluie':c<=77?'Neige':c<=82?'Averses':'Orage';
const validTime=t=>{const ms=Date.parse(t);return Number.isFinite(ms)&&Math.abs(Date.now()-ms)<=MAX_AGE};
function normalize(data){
 const c=data&&data.current;if(!c||!validTime(c.time)||!Number.isFinite(+c.temperature_2m)||![0,1].includes(+c.is_day))return null;
 const code=Number(c.weather_code),rain=Number(c.precipitation||0)>0||[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code);
 let hour=12;try{const parts=new Intl.DateTimeFormat('fr-FR',{hour:'numeric',hour12:false,timeZone:data.timezone}).formatToParts(new Date(c.time));hour=Number(parts.find(p=>p.type==='hour').value)}catch(e){}
 return {hour,daylight:+c.is_day,night:1-+c.is_day,cloud:Math.max(0,Math.min(1,(+c.cloud_cover||0)/100)),rain:rain?1:0,dust:0,mist:code>=45&&code<=48?1:0,temp:Math.round(+c.temperature_2m),weather:weatherCode(code),kind:rain?2:(code>=45&&code<=48?4:(code<=3&&code>0?1:0)),moment:'',sourceTime:c.time,timezone:data.timezone,latitude:data.latitude,longitude:data.longitude};
}
async function update(){
 if(pending||!navigator.geolocation||!window.fetch)return;
 pending=true;lastAttempt=Date.now();
 try{
  const pos=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{enableHighAccuracy:false,maximumAge:REFRESH,timeout:10000}));
  const p=pos.coords,url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(p.latitude)+'&longitude='+encodeURIComponent(p.longitude)+'&current=temperature_2m,weather_code,is_day,precipitation,cloud_cover&timezone=auto';
  const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('weather_http_'+res.status);
  const value=normalize(await res.json());if(!value)throw new Error('weather_stale');
  current=value;return value;
 }catch(e){return null}finally{pending=false}
}
function start(onUpdate){
 if(timer)return;
 const run=async()=>{const value=await update();if(value&&onUpdate)onUpdate(value)};
 run();timer=setInterval(run,REFRESH);
}
function get(){return current}
function reset(){if(timer)clearInterval(timer);timer=0;current=null;pending=false;lastAttempt=0}
return {MAX_AGE,REFRESH,start,update,get,reset,normalize,weatherCode};
});
