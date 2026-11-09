const test=require('node:test'),assert=require('node:assert');
const {createServer}=require('../server/server.cjs'),C=require('../js/online/client.js'),WC=require('../js/online/world.js');
let srv,base;test.before(async()=>{srv=createServer({secret:'t',rate:{max:500,syncMax:5000,joinMax:100,windowMs:60000}});await new Promise(r=>srv.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+srv.address().port});
test.after(()=>srv.close());
const mk=(name,pos)=>{const api=C.create({apiBase:base}).world,chats=[];const w=WC.create({api,me:()=>pos,onChat:m=>chats.push(m)});return {w,chats,pos}};
test('deux clients se voient, bavardent, lissage',async()=>{
 const A=mk('Awa',{x:2,z:3,h:0,moving:true}),B=mk('Bo',{x:9,z:9,h:1,moving:false});
 await A.w.join({name:'Awa',room:'wolof',consent:true,avatar:{skin:0x8a5a3a,fem:true}});await B.w.join({name:'Bo',room:'wolof',consent:true});
 assert.equal(A.w.status,'online');
 await A.w.poll();await B.w.poll();await A.w.poll();
 assert.equal(A.w.players.size,1);const q=[...A.w.players.values()][0];assert.equal(q.name,'Bo');assert.equal(q.tx,9);
 B.w.tick(1);A.w.tick(.016);assert.ok(q.x<9,'lissage progressif');A.w.tick(2);assert.ok(Math.abs(q.x-9)<.01);
 A.w.say('Salut Bo !');await A.w.poll();await B.w.poll();
 assert.ok(B.chats.some(m=>m.text==='Salut Bo !'&&m.name==='Awa'));
 B.w.mute([...B.w.players.values()][0].id);A.w.say('encore');await new Promise(r=>setTimeout(r,1600));await A.w.poll();const n=B.chats.length;await B.w.poll();assert.equal(B.chats.length,n,'les messages d’un joueur masqué ne s’affichent pas');
 await A.w.leave();await B.w.poll();assert.equal(B.w.players.size,0,'départ visible');await B.w.leave()});
test('erreurs : consentement, hors ligne, reconnexion après session perdue',async()=>{
 const X=mk('X',{x:0,z:0});await assert.rejects(()=>X.w.join({name:'Xo',room:'wolof'}),e=>e.code==='consent_required');assert.equal(X.w.status,'error');
 const off=WC.create({api:C.create({}).world,me:()=>({})});await assert.rejects(()=>off.join({}),e=>e.code==='offline');assert.equal(off.status,'off');
 const Y=mk('Y',{x:1,z:1});await Y.w.join({name:'Yan',room:'wolof',consent:true});srv.world.sessions.clear();await Y.w.poll();assert.equal(Y.w.status,'online','nouvelle session ouverte automatiquement');assert.ok(Y.w.sid);await Y.w.leave()});
