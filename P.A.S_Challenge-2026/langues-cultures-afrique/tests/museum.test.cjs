const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const M=require(root+'/js/museum/collection.js'),Z=require(root+'/js/museum/photo.js');
const w={};w.window=w;w.LCA={};vm.createContext(w);
['js/museum/masks.js','js/museum/instruments.js','js/data/regions.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),w));
const masks=w.LCA.maskCollection,inst=w.LCA.museumInstruments,regions=w.LCA.regions;
test('chaque notice de masque est complète, libre de droits et son image existe',()=>{
 masks.forEach(m=>{assert.deepEqual(M.validate(m),[],m.id);assert.ok(fs.existsSync(path.join(root,m.image)),m.image+' absent')});
 assert.equal(new Set(masks.map(m=>m.id)).size,masks.length,'identifiants uniques');
});
test('les langues citées dans langs existent dans le jeu',()=>{
 const ids=new Set(regions.flatMap(r=>r.langs));
 masks.forEach(m=>m.langs.forEach(l=>assert.ok(ids.has(l),m.id+' : langue inconnue '+l)));
});
test('village yoruba : son masque passe en premier, étiqueté « peuple »',()=>{
 const v=M.forLang({id:'yoruba',name:'Yoruba',region:'ouest'},masks,inst,regions);
 assert.equal(v.masks[0].id,'yoruba-mask');assert.equal(v.masks[0].tier,'people');assert.ok(v.hasOwn);
 assert.ok(/1 masque du peuple/.test(v.intro));
});
test('village sans masque propre : région d’abord, et le texte le dit sans rien inventer',()=>{
 const v=M.forLang({id:'wolof',name:'Wolof',region:'ouest'},masks,inst,regions);
 assert.ok(!v.hasOwn);assert.ok(v.masks.slice(0,v.counts.region).every(m=>m.tier==='region'&&m.region==='ouest'));
 assert.ok(/Aucun masque de ce peuple/.test(v.intro));
 assert.equal(v.masks.length,masks.length,'aucun masque perdu');
});
test('village d’une région sans masque : tout est « ailleurs »',()=>{
 const v=M.forLang({id:'makhuwa',name:'Makhuwa',region:'australe'},masks,inst,regions);
 assert.equal(v.counts.people+v.counts.region,0);assert.ok(v.masks.every(m=>m.tier==='other'));assert.ok(/d’autres régions/.test(v.intro));
});
test('toutes les langues du jeu obtiennent une collection',()=>{
 regions.forEach(r=>r.langs.forEach(l=>{const v=M.forLang({id:l,name:l,region:r.id},masks,inst,regions);assert.equal(v.masks.length,masks.length);assert.equal(v.exhibits.length,masks.length+inst.length)}));
});
test('neighbour boucle dans les deux sens',()=>{
 const l=[{id:'a'},{id:'b'},{id:'c'}];assert.equal(M.neighbour(l,'c',1).id,'a');assert.equal(M.neighbour(l,'a',-1).id,'c');assert.equal(M.neighbour([],'a',1),null);
});
test('validate refuse une image non libre ou une notice incomplète',()=>{
 assert.ok(M.validate({id:'x'}).length>3);
 assert.ok(M.validate(Object.assign({},masks[0],{rights:'Tous droits réservés'})).some(p=>/droits/.test(p)));
});
test('zoom : borné, ancré sur le point visé, déplacement limité au cadre',()=>{
 const s=Z.create();Z.zoomAt(s,2,100,0,400,300);assert.equal(s.scale,2);assert.equal(s.x,-100);
 Z.zoomAt(s,100,0,0,400,300);assert.equal(s.scale,Z.MAX);
 Z.pan(s,-9999,9999,400,300);assert.equal(s.x,-(Z.MAX-1)*200);assert.equal(s.y,(Z.MAX-1)*150);
 Z.zoomAt(s,.001,0,0,400,300);assert.deepEqual([s.scale,s.x,s.y],[1,0,0]);
});
test('add-mask : refuse un objet hors domaine public et construit une notice sans rien inventer',async()=>{
 const {toEntry}=await import(root+'/scripts/add-mask.mjs');
 const bad=toEntry({objectID:1,isPublicDomain:false,primaryImage:'x'});assert.ok(bad.problems.some(p=>/domaine public/.test(p)));
 const ok=toEntry({objectID:42,isPublicDomain:true,primaryImage:'https://x/y.jpg',title:'Mask',culture:'Baule',country:'Côte d’Ivoire',objectURL:'https://www.metmuseum.org/art/collection/search/42'},['baoule']);
 assert.deepEqual(ok.problems,[]);assert.equal(ok.entry.id,'baule-42');assert.deepEqual(ok.entry.langs,['baoule']);assert.match(ok.entry.description,/à rédiger/);
});
test('empreinte du musée : aucun trou, on ne traverse pas les murs (balayage de tout le rectangle)',()=>{
 const f=M.footprint(38,-5),inside=(x,z)=>f.some(c=>Math.hypot(x-c.x,z-c.z)<c.r);
 for(let x=-5.2;x<=5.2;x+=.1)for(let z=-3.7;z<=3.7;z+=.1)assert.ok(inside(38+x,-5+z),'trou en '+x.toFixed(1)+','+z.toFixed(1));
 /* la porte (z=-1,35) reste atteignable : le joueur (rayon .45) s'arrête à moins de 4,2 de la porte */
 const front=Math.max(...f.map(c=>c.z+c.r))+.45;assert.ok(Math.abs(front-(-1.35))<4.2);
});
