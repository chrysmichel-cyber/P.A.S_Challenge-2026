const test=require('node:test'),assert=require('node:assert/strict');
const {load,memStorage}=require('./helpers.cjs');
const {webcrypto}=require('node:crypto');
const LCA=load(),AC=LCA.accounts,ST=LCA.store;
const mk=(init,t0)=>{let t=t0||1000;const m=memStorage(init);const a=AC.create({storage:m,crypto:webcrypto,iterations:1000,now:()=>t});a.tick=ms=>{t+=ms};return {m,a}};

test('A1 : nom du personnage nettoyé, jamais d’exception',()=>{
 assert.equal(ST.cleanName('  Awa   Diop  '),'Awa Diop');
 assert.equal(ST.cleanName('<b>Moussa</b>'),'bMoussab');
 assert.equal(ST.cleanName('Kofi_#$%'),'Kofi');
 assert.equal(ST.cleanName('Awa N’Diaye-Sy'),'Awa N’Diaye-Sy');
 assert.equal(ST.cleanName('a'.repeat(40)).length,16);
 [null,undefined,5,{},[]].forEach(x=>assert.equal(ST.cleanName(x),''));
});
test('A2 : le nom est dans la sauvegarde v4 et survit à la migration d’une v3',()=>{
 const st=memStorage({'lca-v2':JSON.stringify({v:3,lang:'wolof',d:{},settings:{},learn:{},name:'<i>Awa</i>'})});
 const s=ST.load(st);assert.equal(s.v,5);assert.equal(s.name,'iAwai');
 const s0=ST.load(memStorage({'lca-v2':JSON.stringify({v:2,d:{}})}));assert.equal(s0.name,'');
 s.name='Awa';ST.save(st,s);assert.equal(ST.load(st).name,'Awa');
});
test('A3 : création de profil, mot de passe haché (jamais en clair), pseudo unique',async()=>{
 const {m,a}=mk();
 const r=await a.register({pseudo:'Awa',password:'secret1'});assert.ok(r.ok);assert.equal(a.current().pseudo,'Awa');
 const idx=m.getItem('lca-acc');assert.ok(!idx.includes('secret1'));assert.ok(JSON.parse(idx).accounts[0].hash.length>20);
 assert.equal((await a.register({pseudo:' awa ',password:''})).error,'exists');
 assert.equal((await a.register({pseudo:'ab',password:''})).error,'short');
 assert.equal((await a.register({pseudo:'Moussa',password:'123'})).error,'short');
 assert.equal((await a.register({pseudo:'Kofi',password:''})).ok,true);/* sans mot de passe autorisé */
});
test('A4 : connexion, mauvais mot de passe, message identique si pseudo inconnu',async()=>{
 const {a}=mk();await a.register({pseudo:'Awa',password:'secret1'});a.logout();assert.equal(a.current(),null);
 assert.equal((await a.login('Awa','nope')).error,'bad');
 assert.equal((await a.login('Inconnu','x')).error,'bad');
 assert.equal((await a.login('Awa','')).error,'bad');
 const r=await a.login('aWa','secret1');assert.ok(r.ok);assert.equal(a.current().pseudo,'Awa');
});
test('A5 : blocage temporaire après 5 échecs, puis déblocage',async()=>{
 const {a}=mk();await a.register({pseudo:'Awa',password:'secret1'});a.logout();
 for(let i=0;i<5;i++)await a.login('Awa','x');
 const r=await a.login('Awa','secret1');assert.equal(r.error,'locked');assert.ok(r.wait>0);
 a.tick(31000);assert.ok((await a.login('Awa','secret1')).ok);
});
test('A6 : une sauvegarde par profil, l’invité n’est jamais écrasé',async()=>{
 const {m,a}=mk({'lca-v2':JSON.stringify({v:4,name:'Invite',d:{}})});
 const s=a.storage();
 assert.equal(JSON.parse(s.getItem('lca-v2')).name,'Invite');
 await a.register({pseudo:'Awa',password:'',importGuest:false});
 assert.equal(a.storage().getItem('lca-v2'),null);/* profil vierge */
 const st=ST.defaults();st.name='Awa';ST.save(a.storage(),st);
 assert.equal(JSON.parse(m.getItem('lca-v2')).name,'Invite');/* invité intact */
 assert.ok(Object.keys(m._m).some(k=>k.startsWith('lca-u-')));
 a.logout();assert.equal(JSON.parse(a.storage().getItem('lca-v2')).name,'Invite');
 await a.login('Awa','');assert.equal(ST.load(a.storage()).name,'Awa');
});
test('A7 : import de la progression invité ; sauvegarde de secours .bak redirigée aussi',async()=>{
 const g=JSON.stringify({v:3,lang:'wolof',d:{wolof:{done:{q1:1}}},settings:{},learn:{}});
 const {m,a}=mk({'lca-v2':g});
 await a.register({pseudo:'Kofi',password:'',importGuest:true});
 const s=ST.load(a.storage());assert.equal(s.d.wolof.done.q1,1);assert.equal(s.v,5);
 const id=a.current().id;assert.ok(m.getItem('lca-u-'+id+'.bak'));assert.equal(m.getItem('lca-v2.bak'),null);
 assert.equal(m.getItem('lca-v2'),g);
});
test('A8 : suppression : mot de passe exigé, sauvegarde du profil effacée, invité intact',async()=>{
 const {m,a}=mk({'lca-v2':'{"v":4}'});
 await a.register({pseudo:'Awa',password:'secret1'});const id=a.current().id;ST.save(a.storage(),ST.defaults());
 assert.equal((await a.remove(id,'bad')).error,'bad');assert.ok(m.getItem('lca-u-'+id));
 assert.ok((await a.remove(id,'secret1')).ok);assert.equal(m.getItem('lca-u-'+id),null);assert.equal(a.list().length,0);assert.equal(a.current(),null);assert.equal(m.getItem('lca-v2'),'{"v":4}');
});
test('A9 : index corrompu ou stockage qui échoue : pas d’exception',async()=>{
 const a1=AC.create({storage:memStorage({'lca-acc':'{oops'}),crypto:webcrypto,iterations:1000});assert.equal(a1.list().length,0);
 const bad={getItem(){return null},setItem(){throw new Error('quota')},removeItem(){}};
 const a2=AC.create({storage:bad,crypto:webcrypto,iterations:1000});
 assert.equal((await a2.register({pseudo:'Awa',password:''})).error,'storage');assert.equal(a2.current(),null);
 const a3=AC.create({storage:memStorage(),crypto:{getRandomValues:webcrypto.getRandomValues.bind(webcrypto)}});
 assert.equal((await a3.register({pseudo:'Awa',password:'secret1'})).error,'nocrypto');
 assert.ok((await a3.register({pseudo:'Awa',password:''})).ok);
});
