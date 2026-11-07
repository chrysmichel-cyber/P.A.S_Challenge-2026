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
test('v0.19 : narrateur non indiqué sans accord, région, métadonnées d’origine conservées',async()=>{
 const st=O.create({adapter:O.memAdapter(),profile:'p',langs:{wolof:1}});
 const r=await st.create({title:'Conte',lang:'wolof',narrator:'Awa',narratorOk:false,region:'Sénégal',consent:true,origName:'micro.webm',origSource:'micro',sha256:'a'.repeat(64),share:'communaute'},{blob:{size:10},type:'audio/webm'});
 assert.ok(r.ok);assert.equal(r.meta.narrator,'','nom retiré sans accord');assert.equal(r.meta.region,'Sénégal');assert.equal(r.meta.origName,'micro.webm');assert.equal(r.meta.sha256,'a'.repeat(64));
 const u=await st.update(r.meta.id,{title:'Conte 2',sha256:'b'.repeat(64),origName:'x'});assert.equal(u.meta.sha256,'a'.repeat(64),'l’empreinte de l’original ne change pas');assert.equal(u.meta.origName,'micro.webm');
 assert.equal(O.sanitize({narrator:'Awa'}).narratorOk,true,'anciens récits : nom conservé');
});
test('v0.19 : validation communautaire (2 locuteurs distincts, relu, partagé, pas de contestation)',()=>{
 let m=O.sanitize({title:'T',lang:'wolof',consent:true,share:'communaute',status:'relu',reviewer:'X',narrator:'Awa',narratorOk:true});
 assert.equal(O.communityStatus(m).id,'a_valider');
 assert.equal(O.vote(m,{name:'A',native:false},'ok').error,'native');assert.equal(O.vote(m,{name:'Awa',native:true},'ok').error,'self');assert.equal(O.vote(O.sanitize({title:'T'}),{name:'A',native:true},'ok').error,'private');
 let v=O.vote(m,{name:'Moussa',native:true},'ok');m=Object.assign({},m,{votes:v.votes});assert.equal(O.communityStatus(m).id,'a_valider');
 v=O.vote(m,{name:'moussa',native:true},'ok');assert.equal(Object.keys(v.votes).length,1,'un seul avis par personne');
 v=O.vote(m,{name:'Fatou',native:true},'ok');m=Object.assign({},m,{votes:v.votes});assert.equal(O.communityStatus(m).id,'valide');assert.ok(O.communityStatus(m).publishable);
 v=O.vote(m,{name:'Ibou',native:true},'bad','faux');m=Object.assign({},m,{votes:v.votes});assert.equal(O.communityStatus(m).id,'conteste');assert.ok(!O.communityStatus(m).publishable);
 assert.equal(O.communityStatus(Object.assign({},m,{share:'prive'})).id,'prive');
});
test('v0.19 : bibliothèque (recherche, filtres) et paquet d’échange',()=>{
 const a=O.sanitize({title:'Le lièvre',lang:'wolof',region:'Sénégal',transcript:'il était',consent:true,narrator:'Awa',narratorOk:false}),b=O.sanitize({title:'La pluie',lang:'bambara',region:'Mali',consent:true});
 assert.equal(O.search([a,b],{q:'lievre'}).length,1,'sans accent');assert.equal(O.search([a,b],{lang:'bambara'}).length,1);assert.equal(O.search([a,b],{region:'mali'}).length,1);assert.equal(O.search([a,b],{q:'awa'}).length,0,'le nom non consenti n’est pas cherchable');
 const bun=O.toBundle(Object.assign({},a,{narrator:'Awa'}),'QUJDREVGR0g=','audio/webm');assert.equal(bun.meta.narrator,'','le paquet respecte le refus de nommer');
 const r=O.fromBundle(JSON.parse(JSON.stringify(bun)));assert.ok(r.ok&&r.meta.imported);
 assert.equal(O.fromBundle({format:'x'}).error,'format');assert.equal(O.fromBundle(Object.assign({},bun,{meta:Object.assign({},bun.meta,{consent:false})})).error,'consent');assert.equal(O.fromBundle(Object.assign({},bun,{audio:{type:'a',b64:'<script>'}})).error,'audio');
});
