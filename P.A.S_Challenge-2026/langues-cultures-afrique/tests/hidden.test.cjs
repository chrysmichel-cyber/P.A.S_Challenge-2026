'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs');
const H=require(root+'/js/rewards/hidden.js');const LANGS=Object.keys(load().langs);
test('positions déterministes, en nombre voulu, espacées, hors zones interdites',()=>{
 const av=[[0,0,12],[20,20,8]];
 LANGS.forEach(id=>{const a=H.place(id,{avoid:av}),b=H.place(id,{avoid:av});assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
  assert.equal(a.length,H.COUNT,id);
  a.forEach((p,i)=>{assert.equal(p.i,i);assert.ok(p.x>=-60&&p.x<=60&&p.z>=-50&&p.z<=38);assert.ok(Math.hypot(p.x,p.z)>=12);assert.ok(Math.hypot(p.x-20,p.z-20)>=8);assert.ok(p.k>=0&&p.k<H.KINDS.length)});
  for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)assert.ok(Math.hypot(a[i].x-a[j].x,a[i].z-a[j].z)>=22*.49-1e-6)});
 const w=H.place('wolof',{}),y=H.place('yoruba',{});assert.notEqual(JSON.stringify(w),JSON.stringify(y),'chaque village a ses cachettes');
});
test('la contrainte ok() est respectée (arbres, cases)',()=>{
 const ok=(x,z)=>x>0;const a=H.place('swahili',{ok});assert.equal(a.length,H.COUNT);a.forEach(p=>assert.ok(p.x>0));
 assert.deepEqual(H.place('x',{ok:()=>false}),[],'si rien n’est libre, on ne place rien plutôt que de bloquer');
});
test('visibilité et indice progressifs avec la distance',()=>{
 assert.equal(H.reveal(40),0);assert.equal(H.reveal(H.REVEAL),0);assert.equal(H.reveal(2),1);
 let prev=0;for(let d=H.REVEAL;d>=0;d-=.5){const r=H.reveal(d);assert.ok(r>=prev-1e-9&&r>=0&&r<=1);prev=r}
 assert.equal(H.hint(60),0);assert.equal(H.hint(1),1);assert.ok(H.hint(20)>0&&H.hint(20)<1);assert.ok(H.hint(H.REVEAL)>0,'l’indice commence avant l’apparition');
});
test('compteur et mot offert',()=>{
 assert.deepEqual(H.stats({0:1,2:1},5),{found:2,total:5,all:false});assert.equal(H.stats({0:1,1:1,2:1,3:1,4:1}).all,true);assert.equal(H.stats(null).found,0);assert.equal(H.stats({9:1}).found,0,'index hors plage ignoré');
 const W=[1,2,3,4,5,6,7];assert.equal(H.wordFor(0,W,{}),0);assert.equal(H.wordFor(1,W,{3:1}),4);assert.ok(H.wordFor(2,W,{0:1,1:1,2:1,3:1,4:1,5:1,6:1})>=0);assert.equal(H.wordFor(0,[],{}),-1);
});
