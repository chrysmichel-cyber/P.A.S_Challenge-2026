const test=require('node:test'),assert=require('node:assert');
const Q=require('../js/perf/quality.js'),M=require('../js/anim/motion.js');
test('détection : petite machine, mobile, rendu logiciel → bas',()=>{
 assert.equal(Q.detect({cores:2,mem:2,dpr:1,w:1366,h:768}),0);
 assert.equal(Q.detect({cores:8,mem:8,dpr:1,w:1366,h:768,renderer:'SwiftShader Device'}),1,'logiciel : 1+1-3 = -1 → moyen');
 assert.equal(Q.detect({cores:4,mem:2,dpr:2,mobile:true,w:390,h:844}),0);
 assert.equal(Q.detect({cores:8,mem:8,dpr:1,w:1920,h:1080,renderer:'ANGLE (NVIDIA)'}),2);
 assert.equal(Q.detect({}),1,'inconnu → moyen');
 assert.equal(Q.detect({cores:2,mem:1,dpr:1,renderer:'llvmpipe'}),0)});
test('profils : le budget décroît avec la qualité',()=>{
 const a=Q.profile(0,3),b=Q.profile(1,3),c=Q.profile(2,3);
 assert.ok(a.pixelRatio<=1&&b.pixelRatio<=1.25&&c.pixelRatio<=2);
 assert.equal(a.shadows,false);assert.equal(c.shadows,true);
 assert.ok(a.density<b.density&&b.density<c.density&&c.density===1);
 assert.ok(a.cull<b.cull&&b.cull<c.cull);assert.ok(a.shadowMap<c.shadowMap);
 assert.equal(Q.profile(9,1).q,1)});
test('dégradation automatique',()=>{
 assert.deepEqual(Q.adjust({fps:15,q:2,auto:true}),{q:1,changed:true,suggest2d:false});
 assert.deepEqual(Q.adjust({fps:15,q:0,auto:true}),{q:0,changed:false,suggest2d:true});
 assert.equal(Q.adjust({fps:15,q:2,auto:false}).changed,false);
 assert.equal(Q.adjust({fps:40,q:2,auto:true}).changed,false)});
const R=p=>M.pose(Object.assign({ph:1,speed:0,onGround:true,vy:0},p));
test('course : amplitude et inclinaison plus fortes que la marche',()=>{
 const w=R({speed:5.4,run:0,ph:Math.PI/2}),r=R({speed:8.5,run:1,ph:Math.PI/2});
 assert.ok(Math.abs(r.legL)>Math.abs(w.legL));assert.ok(r.lean>w.lean);assert.ok(r.bob>w.bob);
 const idle=R({speed:0});assert.equal(idle.legL,0);assert.equal(idle.lean,0)});
test('saut : montée, descente et réception',()=>{
 const up=R({onGround:false,vy:5}),dn=R({onGround:false,vy:-5});
 assert.ok(up.armL<-2&&dn.armL>up.armL,'bras levés puis écartés');assert.notEqual(up.armL,dn.armL);
 const land=R({land:.5}),done=R({land:1});assert.ok(land.squash<1);assert.equal(done.squash,1)});
test('apply : écrit les rotations sur le personnage',()=>{
 const mk=()=>({rotation:{x:0,z:0}}),g={rotation:{x:0},scale:{y:1},userData:{legL:mk(),legR:mk(),armL:mk(),armR:mk(),baseSy:1}};
 M.apply(g,R({onGround:false,vy:3}));assert.ok(g.userData.armL.rotation.x<-2);assert.equal(g.userData.armR.rotation.z,-g.userData.armL.rotation.z)});
