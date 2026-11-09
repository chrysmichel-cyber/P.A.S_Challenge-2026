'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs');
const A=require(root+'/js/ambient/ambient.js'),C=require(root+'/js/ambient/climate.js');
const LCA=load(),LANGS=Object.values(LCA.langs);
const share=(prof,kind,segs=600)=>{let n=0;for(let s=0;s<segs;s++){const hour=10;const st=A.weatherAt(s*A.SEG+5,C.ambientOpts(prof));if(st.kind===kind)n++}return n/segs};
test('chaque langue reçoit un climat valide et une graine propre',()=>{
 const seeds=new Set();
 LANGS.forEach(L=>{const p=C.profile(L);assert.ok(C.TYPES[p.id],L.id);assert.ok(p.tmin<p.tmax&&p.wet>=0&&p.dust>=0&&p.mist>=0);assert.ok(Number.isFinite(p.lon));seeds.add(p.seed)});
 assert.ok(seeds.size>LANGS.length*.9,'graines presque toutes différentes');
});
test('le climat varie selon la zone : désert sec, forêt humide, plateaux frais',()=>{
 const get=id=>C.profile(LCA.langs[id]);
 const des=get('arabe'),for_=get('lingala'),pla=get('amharique');
 assert.equal(des.id,'desert');assert.equal(for_.id,'foret');assert.equal(pla.id,'plateaux');
 assert.ok(share(des,2)<.02,'quasi jamais de pluie dans le désert');assert.ok(share(des,3)>.15,'vent de sable fréquent dans le désert');
 assert.ok(share(for_,2)>share(des,2)+.15,'plus de pluie en forêt');assert.equal(share(for_,3),0,'pas de sable en forêt');
 assert.ok(pla.tmax<des.tmax&&pla.tmin<for_.tmin,'plus frais sur les plateaux');
 assert.equal(get('somali').id,'sahel');assert.equal(get('kabyle').id,'mediterraneen');
});
test('heure solaire locale : plus tard vers l’est, plus tôt vers l’ouest',()=>{
 const t=0,w=A.hourAt(t,-17.4),e=A.hourAt(t,39.2),g=A.hourAt(t,0);
 assert.ok(Math.abs(g-A.START_H)<1e-9);assert.ok(Math.abs((e-w)-(39.2+17.4)/15)<1e-6);
 for(let h=0;h<24;h+=.7)assert.ok(A.hourAt(h*60,25)>=0&&A.hourAt(h*60,25)<24);
 assert.equal(A.hourAt(100),A.hourAt(100,undefined),'sans longitude : comportement inchangé');
});
test('état : sable, brume (qui se lève le matin), température indicative',()=>{
 const o={dust:1,wet:0,mist:0,cloud:0,tmin:16,tmax:37,seed:1};
 let found=null;for(let t=0;t<2000&&!found;t+=5){const s=A.state(t,Object.assign({hour:13},o));if(s.kind===3)found=s}
 assert.ok(found&&found.dust>.5&&found.weather==='Vent de sable');
 const m={mist:1,dust:0,wet:0,cloud:0,seed:2};
 let early=null,late=null;for(let t=0;t<2000&&!(early&&late);t+=5){const a=A.state(t,Object.assign({hour:6.5},m)),b=A.state(t,Object.assign({hour:13},m));if(a.mist>.5)early=a;if(b.mist>0)late=b}
 assert.ok(early&&early.kind===4&&early.weather==='Brume');assert.equal(late,null,'plus de brume en début d’après-midi');
 const cold=A.state(0,{hour:4,noWeather:true,tmin:10,tmax:24}),hot=A.state(0,{hour:15,noWeather:true,tmin:10,tmax:24});
 assert.ok(hot.temp>cold.temp&&hot.temp<=24&&cold.temp>=10,'temp '+cold.temp+'→'+hot.temp);
 const tn=A.tint(Object.assign({},A.state(0,{hour:12,noWeather:true}),{dust:1}));assert.ok(tn.a>.2&&tn.r>tn.b,'voile ocre');
});
test('rétro-compatibilité : sans options de climat la météo reste celle de v0.15',()=>{
 for(let t=0;t<900;t+=11){const s=A.state(t,{wet:1,seed:3});assert.ok(s.kind<=2&&s.dust===0&&s.mist===0)}
});
