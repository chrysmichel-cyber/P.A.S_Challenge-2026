'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{root}=require('./helpers.cjs');
const I=require(root+'/js/anim/idle.js');
const run=(s,sec,o)=>{for(let i=0;i<sec*20;i++)I.update(s,.05,o)};
test('inactivité : rien avant 60 s, un geste après',()=>{
 const s=I.create();run(s,59,{});assert.equal(s.cur,null);assert.equal(s.w,0);
 run(s,2,{});assert.ok(s.cur,'un geste démarre après 60 s');assert.ok(I.KINDS.includes(s.cur));
});
test('le seuil par défaut est bien de 60 secondes',()=>assert.equal(I.cfg.thresh,60));
test('interruption propre : le geste s’efface en moins de 0,3 s puis l’état est remis à zéro',()=>{
 const s=I.create();run(s,64,{});assert.ok(s.w>0);
 for(let i=0;i<5;i++)I.update(s,.05,{active:true});assert.equal(s.cur,null,'effacé en 0,25 s');assert.equal(s.w,0);assert.equal(s.t,0);
 run(s,30,{});assert.equal(s.cur,null,'le compteur repart de zéro après l’action');
});
test('variété : tous les gestes (sauf s’asseoir sans siège) apparaissent, jamais deux fois de suite',()=>{
 const s=I.create(),seen=new Set(),seq=[];let seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 let prev=null;for(let i=0;i<20*60*8;i++){I.update(s,.05,{rnd});if(s.cur&&s.cur!==prev){seen.add(s.cur);seq.push(s.cur)}prev=s.cur}
 ['look','shift','stretch','yawn','hands'].forEach(k=>assert.ok(seen.has(k),k));assert.ok(!seen.has('sit'),'pas de siège : pas d’assise');
 for(let i=1;i<seq.length;i++)assert.notEqual(seq[i],seq[i-1]);assert.ok(seq.length>=10);
});
test('s’asseoir quand un siège est disponible, se relever s’il disparaît ou dès qu’on bouge',()=>{
 const s=I.create();run(s,62,{canSit:true});assert.equal(s.cur,'sit');run(s,5,{canSit:true});assert.equal(s.cur,'sit','reste assis');
 const P=I.pose(s,1);assert.ok(P.sit>.9&&P.legL<-1&&P.bob<-.3);
 run(s,2,{canSit:false});assert.notEqual(s.cur,'sit','siège disparu : on se relève');
 const s2=I.create();run(s2,62,{canSit:true});I.update(s2,.3,{active:true,canSit:true});assert.equal(s2.cur,null);
});
test('poses : angles finis, bras levés pour s’étirer, mélange pondéré',()=>{
 const s=I.create();['look','shift','stretch','yawn','hands','sit'].forEach(k=>{s.cur=k;for(const a of [0,.3,1.5,3]){s.age=a;s.w=1;const P=I.pose(s,2);Object.keys(P).forEach(q=>{if(typeof P[q]==='number')assert.ok(Number.isFinite(P[q]),k+'.'+q)})}});
 s.cur='stretch';s.age=1.8;s.w=1;assert.ok(I.pose(s,0).armL<-2.5);s.w=.5;assert.ok(Math.abs(I.scaled(I.pose(s,0)).armL)<Math.abs(I.pose(s,0).armL)+1e-9);
});
