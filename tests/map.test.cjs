const test=require('node:test'),assert=require('node:assert');
const {load:loadLCA}=require('./helpers.cjs');
const lay=require('../js/map/layout.js');
test('spread sépare les points superposés',()=>{
 const pts=[];for(let i=0;i<5;i++)pts.push({id:'p'+i,x:100+i%2,y:100});
 const r=lay.spread(pts,{minDist:20});assert.ok(lay.minGap(r)>=17,'écart '+lay.minGap(r));
 r.forEach(p=>assert.ok(p.x>=0&&p.x<=380&&p.y>=0&&p.y<=392))});
test('points déjà espacés : pas de décalage',()=>{
 const r=lay.spread([{id:'a',x:50,y:50},{id:'b',x:200,y:200}],{minDist:20});r.forEach(p=>assert.ok(p.shift<0.5))});
test('toutes les langues du jeu ont un écart lisible et un décalage borné',()=>{
 const L=loadLCA();const MAP={W:380,H:392,lon0:-19,lon1:53,lat0:38.5,lat1:-36};
 const pts=Object.values(L.langs||L.LANGS||{}).map(l=>({id:l.id,x:(l.geo.lon-MAP.lon0)/(MAP.lon1-MAP.lon0)*MAP.W,y:(MAP.lat0-l.geo.lat)/(MAP.lat0-MAP.lat1)*MAP.H}));
 assert.ok(pts.length>=58,'langues '+pts.length);
 const r=lay.spread(pts,{minDist:15});assert.ok(lay.minGap(r)>=12,'écart '+lay.minGap(r));
 const mx=Math.max(...r.map(p=>p.shift));console.log('décalage max',mx.toFixed(1),'écart min',lay.minGap(r).toFixed(1));assert.ok(mx<60)});
test('données de carte : contours et frontières valides',()=>{
 const L=loadLCA();const G=L.mapGeo;assert.ok(G&&G.land.length>5&&G.borders.length>20);
 G.land.concat(G.borders).forEach(a=>{assert.equal(a.length%2,0);for(let i=0;i<a.length;i+=2){assert.ok(Math.abs(a[i])<=5400&&Math.abs(a[i+1])<=9000)}})});
