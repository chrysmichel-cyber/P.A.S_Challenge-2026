'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../js/ambient/realtime.js');

test('météo réelle : normalisation, heure locale et jour/nuit',()=>{
 const now=new Date();
 const iso=new Date(now.getTime()-10000).toISOString();
 const s=R.normalize({timezone:'Africa/Abidjan',current:{time:iso,temperature_2m:29,weather_code:61,is_day:1,precipitation:1,cloud_cover:80}});
 assert.ok(s);
 assert.equal(s.temp,29);
 assert.equal(s.weather,'Pluie');
 assert.equal(s.rain,1);
 assert.equal(s.daylight,1);
 assert.ok(s.hour>=0&&s.hour<24);
});

test('météo réelle : les données de plus d’une heure sont refusées',()=>{
 const old=new Date(Date.now()-R.MAX_AGE-60000).toISOString().slice(0,13)+':00';
 assert.equal(R.normalize({timezone:'UTC',current:{time:old,temperature_2m:20,weather_code:0,is_day:1,cloud_cover:0}}),null);
});
