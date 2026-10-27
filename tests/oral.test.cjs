const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers.cjs');
const LCA=load(),O=LCA.oral,LANGS={wolof:{},yoruba:{}};
const de=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
const mk=(p,ad,t)=>{let n=t||1000;return O.create({adapter:ad||O.memAdapter(),profile:p||'guest',langs:LANGS,now:()=>n++})};
const audio={blob:{size:1200},type:'audio/webm'};
const ok={title:'Le lièvre et la hyène',lang:'wolof',consent:true,narrator:'Grand-mère Awa',duration:42};

test('O1 : nettoyage des champs, jamais d’exception',()=>{
 const m=O.sanitize({title:'  A\u0000   B  ',lang:'wolof',transcript:'a\r\nb',status:'bizarre',duration:99999,consent:'oui'});
 assert.equal(m.title,'A B');assert.equal(m.transcript,'a\nb');assert.equal(m.status,'brouillon');assert.equal(m.duration,300);assert.equal(m.consent,false);
 [null,undefined,5,'x',[]].forEach(x=>assert.equal(typeof O.sanitize(x).title,'string'));
 assert.equal(O.sanitize({title:'x'.repeat(500)}).title.length,80);
});
test('O2 : validation : titre, langue, accord, audio, relecture',()=>{
 const v=(m,o)=>O.validate(O.sanitize(m),Object.assign({langs:LANGS},o));
 de(v(ok,{needAudio:true,hasAudio:true}),[]);
 assert.ok(v({},{}).includes('title')&&v({},{}).includes('lang')&&v({},{}).includes('consent'));
 assert.ok(v(ok,{needAudio:true,hasAudio:false}).includes('audio'));
 assert.ok(v(Object.assign({},ok,{lang:'inconnue'})).includes('lang'));
 assert.ok(v(Object.assign({},ok,{status:'relu'})).includes('reviewer'));
 de(v(Object.assign({},ok,{status:'relu',reviewer:'Awa'})),[]);
});
test('O3 : création, liste (plus récent d’abord), lecture, modification, suppression',async()=>{
 const s=mk();
 de((await s.create(Object.assign({},ok,{consent:false}),audio)).errors,['consent']);
 de((await s.create(ok,null)).errors,['audio']);
 const a=await s.create(ok,audio),b=await s.create(Object.assign({},ok,{title:'Second'}),audio);
 assert.ok(a.ok&&b.ok&&a.meta.id!==b.meta.id);
 const l=await s.list();assert.equal(l.length,2);assert.equal(l[0].title,'Second');
 const g=await s.get(a.meta.id);assert.equal(g.audio.type,'audio/webm');assert.equal(g.meta.size,1200);
 const u=await s.update(a.meta.id,{transcript:'Texte',translation:'Traduction',duration:7,size:1});
 assert.ok(u.ok);assert.equal(u.meta.transcript,'Texte');assert.equal(u.meta.duration,42);/* la durée de l’audio n’est pas modifiable */
 assert.equal((await s.update(a.meta.id,{status:'relu'})).errors[0],'reviewer');
 assert.equal((await s.update(a.meta.id,{status:'relu',reviewer:'Awa D.'})).meta.status,'relu');
 assert.equal((await s.update('nope',{})).errors[0],'unknown');
 assert.ok(await s.remove(a.meta.id));assert.equal(await s.get(a.meta.id),null);assert.equal((await s.list()).length,1);
});
test('O4 : un profil ne voit pas les récits d’un autre',async()=>{
 const ad=O.memAdapter(),g=mk('guest',ad),p=mk('abc123',ad);
 await g.create(ok,audio);assert.equal((await p.list()).length,0);await p.create(ok,audio);
 assert.equal((await g.list()).length,1);assert.equal((await p.list()).length,1);
});
test('O5 : stockage défaillant : erreur claire, pas de fiche orpheline',async()=>{
 const ad=O.memAdapter();const bad=Object.assign({},ad,{put:async (k,v)=>{if(k.startsWith('meta:'))throw new Error('quota');return ad.put(k,v)}});
 const s=O.create({adapter:bad,profile:'g',langs:LANGS});
 de((await s.create(ok,audio)).errors,['storage']);assert.equal((await ad.keys()).length,0);
});
test('O6 : export texte : statut et avertissement honnêtes',()=>{
 const t=O.exportText(O.sanitize(Object.assign({},ok,{transcript:'Waxtaan',translation:'Conversation',created:Date.UTC(2026,9,26)})),'Wolof');
 assert.ok(t.includes('Statut : Brouillon')&&t.includes('Waxtaan')&&t.includes('Conversation')&&t.includes('2026-10-26')&&t.includes('sans transcription ni traduction automatique'));
 const r=O.exportText(O.sanitize(Object.assign({},ok,{status:'relu',reviewer:'Awa'})),'Wolof');assert.ok(r.includes('Relu par un locuteur (par Awa, déclaré)'));
});
test('O7 : fichier trop lourd refusé',async()=>{
 const s=mk();de((await s.create(ok,{blob:{size:O.MAX_BYTES+1},type:'audio/mpeg'})).errors,['toobig']);
});
