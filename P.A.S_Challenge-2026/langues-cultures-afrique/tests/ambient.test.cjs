'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{root}=require('./helpers.cjs');
const A=require(root+'/js/ambient/ambient.js');
test('cycle jour/nuit : nuit à 2 h, plein jour à 12 h, retour à 24 h',()=>{
 assert.equal(A.daylight(2),0);assert.equal(A.daylight(12),1);assert.equal(A.daylight(23),0);
 assert.ok(A.daylight(6.2)>0&&A.daylight(6.2)<1,'lever progressif');
 assert.ok(Math.abs(A.hourAt(0)-A.START_H)<1e-9);
 assert.ok(Math.abs(A.hourAt(A.DAY_SEC)-A.START_H)<1e-9,'une journée de jeu se referme');
 for(let t=0;t<A.DAY_SEC*2;t+=7){const s=A.state(t);assert.ok(s.daylight>=0&&s.daylight<=1&&s.rain>=0&&s.rain<=1&&s.cloud>=0&&s.cloud<=1&&s.dim>=.25&&s.dim<=1)}
});
test('météo déterministe, continue, et variable selon la région',()=>{
 assert.equal(JSON.stringify(A.weatherAt(123.4,{seed:3})),JSON.stringify(A.weatherAt(123.4,{seed:3})));
 let prev=A.weatherAt(0).rain,jump=0;for(let t=.5;t<3000;t+=.5){const r=A.weatherAt(t).rain;jump=Math.max(jump,Math.abs(r-prev));prev=r}
 assert.ok(jump<.2,'pas de saut brutal de pluie : '+jump);
 const rainy=(wet)=>{let n=0;for(let seg=0;seg<400;seg++)if(A.weatherAt(seg*A.SEG+10,{wet,seed:1}).kind===2)n++;return n};
 assert.ok(rainy(0)===0,'région très sèche : jamais de pluie');
 assert.ok(rainy(1)>20&&rainy(1)<200,'région normale : pluie par moments, pas tout le temps');
 assert.ok(rainy(1.5)>rainy(.5));
});
test('voile de couleur : opaque la nuit, transparent à midi par beau temps',()=>{
 const noon=A.tint(A.state(0,{hour:12,noWeather:true})),night=A.tint(A.state(0,{hour:2,noWeather:true}));
 assert.equal(noon.a,0);assert.ok(night.a>.3&&night.a<=.7);
 assert.equal(A.state(0,{hour:12,noWeather:true}).rain,0);
});
