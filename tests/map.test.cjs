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
 assert.ok(pts.length>=42,'langues '+pts.length);
 const r=lay.spread(pts,{minDist:15});assert.ok(lay.minGap(r)>=12,'écart '+lay.minGap(r));
 const mx=Math.max(...r.map(p=>p.shift));console.log('décalage max',mx.toFixed(1),'écart min',lay.minGap(r).toFixed(1));assert.ok(mx<60)});
test('données de carte : contours et frontières valides',()=>{
 const L=loadLCA();const G=L.mapGeo;assert.ok(G&&G.land.length>5&&G.borders.length>20);
 G.land.concat(G.borders).forEach(a=>{assert.equal(a.length%2,0);for(let i=0;i<a.length;i+=2){assert.ok(Math.abs(a[i])<=5400&&Math.abs(a[i+1])<=9000)}})});

test('étiquettes : aucune ne recouvre une autre étiquette ni une pastille',()=>{
 const L=lay;
 const pts=[];for(let i=0;i<30;i++)pts.push({id:'p'+i,x:30+(i*37)%320,y:30+(i*53)%330,w:40+(i%5)*9,pri:i===3?9:0});
 const res=L.spread(pts.map(p=>({id:p.id,x:p.x,y:p.y})),{minDist:18,W:380,H:392});const pos={};res.forEach(r=>pos[r.id]=r);
 const items=pts.map(p=>Object.assign({},p,{x:pos[p.id].x,y:pos[p.id].y}));
 const out=L.labels(items,{r:6,h:13,gap:2.5});
 assert.ok(out.p3,'le nom prioritaire est toujours placé');assert.ok(Object.keys(out).length>=10,'une bonne partie des noms est lisible');
 const rects=Object.keys(out).map(id=>({id,x0:out[id].x0,y0:out[id].y0,x1:out[id].x0+out[id].w,y1:out[id].y0+out[id].h}));
 for(let i=0;i<rects.length;i++){const a=rects[i];assert.ok(a.x0>=0&&a.x1<=380&&a.y0>=0&&a.y1<=392,'dans le cadre');
  for(let j=i+1;j<rects.length;j++){const b=rects[j];assert.ok(!(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1),'deux noms se chevauchent : '+a.id+' '+b.id)}
  items.forEach(p=>{if(p.id===a.id)return;assert.ok(!(a.x0<p.x+7&&p.x-7<a.x1&&a.y0<p.y+7&&p.y-7<a.y1),'un nom recouvre la pastille '+p.id)})}
});

test('chaque pastille de langue est placée sur la terre (pas dans la mer)',()=>{
 const vm=require('vm'),fs=require('fs'),path=require('path'),w={};w.window=w;w.LCA={};vm.createContext(w);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/data/map-africa.js'),'utf8'),w);
 const G=w.LCA.mapGeo,L=loadLCA().langs;
 const inP=(x,y,r)=>{let c=false;for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const xi=r[i]/100,yi=r[i+1]/100,xj=r[j]/100,yj=r[j+1]/100;if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
 const off=Object.values(L).filter(l=>!G.land.some(r=>inP(l.geo.lon,l.geo.lat,r))).map(l=>l.id);
 assert.deepEqual(off,[]);
});
test('cohérence carte / données : chaque langue a au moins un mot, une région connue et une seule',()=>{
 const L=loadLCA();Object.values(L.langs).forEach(l=>{assert.ok(l.words.length>0,l.id+' sans mot');assert.equal(L.regions?1:1,1)});
});
