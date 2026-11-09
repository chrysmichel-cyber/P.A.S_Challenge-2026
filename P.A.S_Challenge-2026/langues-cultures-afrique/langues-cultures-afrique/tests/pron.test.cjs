'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{root}=require('./helpers.cjs');
const P=require(root+'/js/speech/pron.js');const SR=16000;
/* voix synthétique : suite de « syllabes » (salves sinusoïdales à hauteur donnée) séparées de silences */
function voice(sylls,stretch){stretch=stretch||1;const out=[];const gap=Math.round(.08*SR*stretch);
 out.push(new Float32Array(Math.round(.15*SR)));
 sylls.forEach(([f0,f1,dur])=>{const n=Math.round(dur*SR*stretch),b=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const f=f0+(f1-f0)*i/n;ph+=2*Math.PI*f/SR;const env=Math.sin(Math.PI*i/n);b[i]=.5*env*(Math.sin(ph)+.3*Math.sin(2*ph))}out.push(b,new Float32Array(gap))});
 out.push(new Float32Array(Math.round(.2*SR)));const L=out.reduce((a,x)=>a+x.length,0),y=new Float32Array(L);let o=0;out.forEach(x=>{y.set(x,o);o+=x.length});return y}
const noise=(x,a)=>{const y=x.slice();let s=1;for(let i=0;i<y.length;i++){s=(s*16807)%2147483647;y[i]+=a*(s/2147483647-.5)}return y};
const WORD=[[140,170,.22],[170,130,.3],[130,120,.25]];
test('mêmes sons, même voix : score élevé',()=>{const r=P.compare(voice(WORD),noise(voice(WORD),.01),SR);assert.ok(r.ok&&r.score>=85,'score '+r.score);assert.ok(r.approx)});
test('même mot dit 25 % plus lentement : encore proche, avec un conseil de vitesse',()=>{const r=P.compare(voice(WORD),voice(WORD,1.25),SR);assert.ok(r.ok&&r.score>=60,'score '+r.score);assert.ok(r.durRatio>1.15)});
test('très lent : conseil sur la vitesse',()=>{const r=P.compare(voice(WORD),voice(WORD,1.9),SR);assert.ok(r.tips.some(t=>t.includes('plus lent')))});
test('rythme différent (autre nombre de syllabes) : score plus bas',()=>{const same=P.compare(voice(WORD),voice(WORD),SR).score,diff=P.compare(voice(WORD),voice([[140,140,.12],[140,140,.12],[140,140,.12],[140,140,.12],[140,140,.12],[140,140,.12]]),SR).score;assert.ok(diff<same-15,same+' vs '+diff)});
test('mélodie différente (montante / descendante) : mélodie plus basse',()=>{const up=voice([[120,200,.6]]),down=voice([[200,120,.6]]);const r=P.compare(up,down,SR),s=P.compare(up,up,SR);assert.ok(r.melody!==null&&s.melody!==null&&r.melody<s.melody-.2,r.melody+' vs '+s.melody)});
test('silence ou bruit trop faible : refus explicite, jamais de note inventée',()=>{const r=P.compare(voice(WORD),new Float32Array(SR),SR);assert.equal(r.ok,false);assert.equal(r.error,'silence');assert.equal(P.compare(new Float32Array(SR),voice(WORD),SR).error,'ref')});
test('rééchantillonnage 48 kHz accepté',()=>{const x=new Float32Array(48000*1);for(let i=0;i<x.length;i++)x[i]=Math.sin(i/48000*2*Math.PI*150)*Math.sin(Math.PI*i/x.length);const d=P.down(x,48000);assert.equal(d.sr,16000);assert.equal(d.x.length,16000)});
