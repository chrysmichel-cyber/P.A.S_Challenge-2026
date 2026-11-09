'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs');
const Li=require(root+'/js/life/life.js');const LCA=load();
test('disposition : toutes les stations trouvent un emplacement libre et se respectent',()=>{
 const st=Li.layout(()=>true);assert.equal(st.length,Li.STATIONS.length+1,'les lieux + l’entrée');assert.ok(st.find(s=>s.id==='gate')&&st.filter(s=>s.res.length).length===Li.STATIONS.length);
 for(let i=0;i<st.length;i++)for(let j=i+1;j<st.length;j++)assert.ok(Math.hypot(st[i].x-st[j].x,st[i].z-st[j].z)>=st[i].radius+2,'stations trop proches');
 st.forEach(s=>{assert.ok(s.props.length>0);if(s.id!=='gate')assert.ok(s.res.length>0);s.res.forEach(r=>{assert.ok(r.kind&&r.act&&r.role&&r.por);assert.ok(Math.hypot(r.x-s.x,r.z-s.z)<=s.radius)})});
});
test('disposition : un emplacement occupé est évité, et sans place une station est omise (pas de blocage)',()=>{
 const full=Li.layout(()=>true),blocked=Li.layout((x,z)=>Math.hypot(x-full[0].x,z-full[0].z)>6);
 const m=blocked.find(s=>s.id==='market');assert.ok(!m||Math.hypot(m.x-full[0].x,m.z-full[0].z)>6);
 assert.equal(Li.layout(()=>false).length,1,'sans place : seule l’entrée fixe reste');
});
test('routines : le marché ferme le soir, le conteur ne vient que le soir, la nuit tout le monde dort',()=>{
 const st=Li.layout(()=>true),R=id=>st.flatMap(s=>s.res).find(r=>r.id===id);
 assert.ok(Li.present(R('vend1'),10)&&!Li.present(R('vend1'),20));assert.ok(!Li.present(R('griot'),10)&&Li.present(R('griot'),19));
 st.flatMap(s=>s.res).forEach(r=>assert.ok(!Li.present(r,3),r.id+' ne dort pas'));
 assert.equal(Li.phase(3),'nuit');assert.equal(Li.phase(12),'jour');assert.equal(Li.phase(18),'soir');assert.equal(Li.phase(21),'veillée');
 assert.ok(Li.eventAt(9).id==='market'&&Li.eventAt(19).id==='gathering'&&Li.eventAt(14)===null);
 assert.ok(Li.inHours(23,22,6)&&!Li.inHours(12,22,6));
});
test('animations : bornées, variées selon l’activité et la phase individuelle, pas figées',()=>{
 for(const a of ['cook','craft','sell','chat','tell','play','idle'])for(let t=0;t<30;t+=.37){const p=Li.pose(a,t,1.3);['armR','armL','head','bob'].forEach(k=>assert.ok(Number.isFinite(p[k])&&Math.abs(p[k])<2.2,a+' '+k))}
 const seq=a=>{const v=[];for(let t=0;t<10;t+=.3)v.push(Li.pose(a,t,0).armR);return Math.max(...v)-Math.min(...v)};
 assert.ok(seq('cook')>.5&&seq('craft')>.5&&seq('play')>1.5,'les gestes de travail bougent');
 assert.notEqual(Li.pose('chat',2,0).head,Li.pose('chat',2,2.4).head,'deux habitants ne bougent pas à l’unisson');
 let looks=0;for(let t=0;t<200;t+=.5)if(Li.idleLook(t,0.7)!==0)looks++;assert.ok(looks>5&&looks<150,'regards autour de soi, de temps en temps');
 const a=Li.loopPos({x:0,z:0},{loop:2,sp:2},0,0),b=Li.loopPos({x:0,z:0},{loop:2,sp:2},1,0);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.3);assert.ok(Math.abs(Math.hypot(b.x,b.z)-2)<1e-9);
});
test('dialogues : construits uniquement à partir des données, jamais de mot inventé',()=>{
 const st=Li.layout(()=>true),res=st.flatMap(s=>s.res),L=LCA.langs.wolof;
 res.forEach(r=>{const s=st.find(x=>x.id===r.st),d=Li.dialog(s,r,L,{hour:10});assert.ok(d.pages.length>=1);d.pages.forEach(p=>assert.ok(p.fr&&p.fr.length>10));
  d.learn.forEach(i=>assert.ok(L.words[i],'indice de mot valide'));d.pages.forEach(p=>{if(p.wo)assert.ok(L.words.some(w=>w[1]===p.wo),'mot « '+p.wo+' » absent des données')})});
 const v=res.find(r=>r.act==='sell'),dv=Li.dialog(null,v,L,{});assert.ok(dv.pages.some(p=>/Ndox|Ceeb|Jën/i.test(p.fr)),'le vendeur cite des mots wolof existants');
 const poor=LCA.langs.umbundu,dp=Li.dialog(null,v,poor,{});assert.ok(dp.pages.some(p=>p.fr.includes('rien n’a été inventé')||p.fr.includes('pas encore documentés')),'langue pauvre : le dialogue le dit');
 assert.equal(dp.learn.length,0);dp.pages.forEach(p=>assert.equal(p.wo,''));
 Object.values(LCA.langs).forEach(l=>res.forEach(r=>{const d=Li.dialog(null,r,l,{hour:19});assert.ok(d.pages.length>0);d.learn.forEach(i=>assert.ok(l.words[i]))}));
});
test('mixage sonore : varie selon la zone et l’heure, gains bornés',()=>{
 const st=Li.layout(()=>true),m=st.find(s=>s.id==='market'),c=st.find(s=>s.id==='cook');
 const at=Li.mix({x:m.x,z:m.z},10,1,st),far=Li.mix({x:m.x+60,z:m.z+40},10,1,st);
 assert.ok(at.market>.7&&far.market===0,'on entend le marché de près seulement');
 assert.equal(Li.mix({x:m.x,z:m.z},21,0,st).market,0,'marché fermé le soir');
 assert.ok(Li.mix({x:0,z:0},2,0,st).crickets>Li.mix({x:0,z:0},12,1,st).crickets&&Li.mix({x:0,z:0},12,1,st).birds>Li.mix({x:0,z:0},2,0,st).birds);
 assert.ok(Li.mix({x:0,z:-56},12,1,st).water>.7&&Li.mix({x:0,z:0},12,1,st).water===0,'rivière au nord seulement');
 assert.ok(Li.mix({x:c.x,z:c.z},12,1,st).cook>.6);
 for(let x=-70;x<=70;x+=14)for(let z=-60;z<=44;z+=13)for(const h of [3,9,13,19,22]){const g=Li.mix({x,z},h,h>6&&h<18?1:0,st);Object.values(g).forEach(v=>assert.ok(v>=0&&v<=1))}
});

test('apparition : toujours devant l’entrée, tournée vers l’intérieur, jamais dans un obstacle',()=>{
 const G=Li.GATE,s0=Li.spawn(()=>true);assert.deepEqual([s0.x,s0.z],[G.spawn.x,G.spawn.z]);assert.equal(s0.heading,Math.PI,'vers le nord (l’intérieur)');
 assert.ok(s0.z>G.z&&s0.z<=44,'devant la porte, à l’extérieur : il la franchit en avançant');
 const block=(x,z)=>Math.hypot(x-G.spawn.x,z-G.spawn.z)>5,s1=Li.spawn(block);assert.ok(block(s1.x,s1.z)&&!s1.forced,'un obstacle devant la porte : on apparaît à côté');
 const wall=(x,z)=>z<G.spawn.z-3||Math.abs(x)>8,s2=Li.spawn(wall);assert.ok(wall(s2.x,s2.z));
 assert.ok(Li.spawn(()=>false).forced,'aucun point libre : repli défini, jamais d’erreur');
 Object.values(LCA.langs).forEach(()=>{const r=Li.spawn((x,z)=>!(Math.abs(x)<2&&z>30));assert.ok(Number.isFinite(r.x)&&Number.isFinite(r.z))});
});
test('animaux : placés près de leur lieu, errent sans sortir de leur zone ni traverser un obstacle',()=>{
 const st=Li.layout(()=>true),an=Li.animalsFor(st,()=>true);assert.equal(an.length,Li.ANIMALS.length);
 ['poule','goat','mouton'].forEach(t=>assert.ok(an.some(a=>a.type===t),t));
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const wall=(x,z)=>!(x>an[0].hx+1&&x<an[0].hx+2.5&&z>an[0].hz-9&&z<an[0].hz+9);
 an.forEach(a=>{let moved=0,px=a.x,pz=a.z;for(let i=0;i<4000;i++){Li.wander(a,.1,rnd,wall);moved+=Math.hypot(a.x-px,a.z-pz);px=a.x;pz=a.z;assert.ok(Math.hypot(a.x-a.hx,a.z-a.hz)<=a.r+.5,a.id+' sort de sa zone');assert.ok(wall(a.x,a.z),a.id+' traverse un obstacle')}assert.ok(moved>10,a.id+' ne bouge pas')});
 assert.equal(Li.animalsFor(st,()=>false).length,0);
});
test('jardin et point d’eau : dialogues sans mot inventé',()=>{
 const st=Li.layout(()=>true),L=LCA.langs.wolof,poor=LCA.langs.umbundu;
 ['gardener','watercarrier'].forEach(id=>{const r=st.flatMap(s=>s.res).find(x=>x.id===id);assert.ok(r,id);
  [L,poor].forEach(l=>{const d=Li.dialog(null,r,l,{});d.pages.forEach(p=>{if(p.wo)assert.ok(l.words.some(w=>w[1]===p.wo))});d.learn.forEach(i=>assert.ok(l.words[i]))})});
 const w=st.flatMap(s=>s.res).find(x=>x.id==='watercarrier');assert.ok(Li.dialog(null,w,L,{}).pages.some(p=>p.wo==='Ndox'),'« eau » en wolof vient des données');
});
test('gestes parasites : variés, brefs, jamais figé longtemps, mains occupées épargnées',()=>{
 const kinds=new Set();let still=0,maxStill=0;
 for(let t=0;t<600;t+=.1){const f=Li.fidget('tell',t,.37);if(f.kind){kinds.add(f.kind);still=0}else{still+=.1;maxStill=Math.max(maxStill,still)}}
 assert.ok(['stretch','scratch','look','shift'].every(k=>kinds.has(k)),'4 gestes différents : '+[...kinds]);assert.ok(maxStill<=14,'au plus ~14 s sans geste ('+maxStill.toFixed(1)+')');
 const busy=new Set();for(let t=0;t<600;t+=.1){const f=Li.fidget('cook',t,.5);if(f.kind)busy.add(f.kind)}assert.ok(!busy.has('stretch')&&!busy.has('scratch'),'la cuisinière ne lâche pas sa marmite');
 for(let t=0;t<50;t+=.2){const p=Li.poseFull('sell',t,1.2);Object.values(p).forEach(v=>{if(typeof v==='number')assert.ok(Number.isFinite(v))})}
});
