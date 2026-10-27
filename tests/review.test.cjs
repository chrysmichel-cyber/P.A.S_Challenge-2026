const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers.cjs');
const LCA=load(),R=LCA.review;
const me=(s,n,nat)=>R.setReviewer(s,{name:n,native:nat!==false,qualification:'locutrice'});
const W=[['s','Jërëjëf','Merci'],['s','Waaw','Oui'],['f','Ceeb','Riz']];

test('R1 : un relecteur doit se déclarer locuteur ; sinon aucun avis n’est enregistré',()=>{
 const s=R.empty();assert.equal(R.submit(s,'wolof','Waaw','Oui','ok').error,'reviewer');
 me(s,'Awa',false);assert.equal(R.submit(s,'wolof','Waaw','Oui','ok').error,'native');
 assert.equal(R.setReviewer(s,{name:'  ',native:true}).error,'name');
});
test('R2 : règles de statut : à vérifier, relu une fois, validé à 2 relecteurs distincts, contesté',()=>{
 const s=R.empty();assert.equal(R.statusOf(s,'wolof','Waaw','Oui').status,'a_verifier');
 me(s,'Awa');R.submit(s,'wolof','Waaw','Oui','ok');assert.equal(R.statusOf(s,'wolof','Waaw','Oui').status,'en_cours');
 R.submit(s,'wolof','Waaw','Oui','ok');assert.equal(R.statusOf(s,'wolof','Waaw','Oui').status,'en_cours');/* le même relecteur ne compte qu'une fois */
 me(s,'Moussa');R.submit(s,'wolof','Waaw','Oui','ok');assert.equal(R.statusOf(s,'wolof','Waaw','Oui').status,'valide');
 me(s,'Fatou');R.submit(s,'wolof','Waaw','Oui','bad');assert.equal(R.statusOf(s,'wolof','Waaw','Oui').status,'conteste');
});
test('R3 : une correction exige une proposition et n’est jamais appliquée au contenu',()=>{
 const s=R.empty();me(s,'Awa');assert.equal(R.submit(s,'wolof','Ceeb','Riz','fix').error,'suggestion');
 const before=JSON.stringify(LCA.langs.wolof.words);
 R.submit(s,'wolof','Ceeb','Riz','fix',{suggestion:'Ceeb bi',note:'avec l’article'});
 const st=R.statusOf(s,'wolof','Ceeb','Riz');assert.equal(st.status,'conteste');assert.equal(st.suggestions[0].text,'Ceeb bi');
 assert.equal(JSON.stringify(LCA.langs.wolof.words),before);
});
test('R4 : bilan par langue : jamais « valide » tout seul',()=>{
 const s=R.empty();me(s,'Awa');me(s,'Awa');R.submit(s,'wolof','Jërëjëf','Merci','ok');
 let sm=R.summary(s,'wolof',W);assert.equal(sm.reviewed,1);assert.equal(sm.language,'verification');
 me(s,'Moussa');W.forEach(w=>R.submit(s,'wolof',w[1],w[2],'ok'));me(s,'Awa');W.forEach(w=>R.submit(s,'wolof',w[1],w[2],'ok'));
 sm=R.summary(s,'wolof',W);assert.equal(sm.valide,3);assert.equal(sm.language,'verification');
 assert.equal(R.summary(R.empty(),'wolof',W).language,'brouillon');
});
test('R5 : export et import : seuls les avis du relecteur sont exportés ; import validé et sans effet sur le contenu',()=>{
 const s=R.empty();me(s,'Awa');R.submit(s,'wolof','Waaw','Oui','ok');me(s,'Moussa');R.submit(s,'wolof','Waaw','Oui','ok');R.submit(s,'wolof','Ceeb','Riz','fix',{suggestion:'Ceeb bi'});
 const f=R.exportFile(s,null,5);assert.equal(f.items.length,2);assert.equal(f.reviewer.name,'Moussa');assert.equal(f.declaredOnly,true);
 const t=R.empty(),r=R.importFile(t,JSON.parse(JSON.stringify(f)));assert.equal(r.added,2);assert.equal(R.statusOf(t,'wolof','Waaw','Oui').status,'en_cours');
 assert.equal(t.reviewer,null);/* l'import ne change pas l'identité locale */
 ['x',null,{},{format:'nzassa-review',version:1,items:[],reviewer:{name:'A',native:false}},{format:'nzassa-review',version:2,items:[]}].forEach(bad=>{assert.ok(R.importFile(R.empty(),bad).errors.length>0)});
 const g=R.importFile(R.empty(),{format:'nzassa-review',version:1,reviewer:{name:'B',native:true},items:[{lang:'wolof',form:'a',fr:'b',decision:'hack'},{lang:5},null]});
 assert.equal(g.added,0);assert.equal(g.skipped,3);
});
test('R6 : données corrompues : normalisation sans exception',()=>{
 [null,undefined,5,'x',[],{items:5},{items:{wolof:{k:{by:{a:{d:'zzz'}}}}}},{reviewer:{name:'<b>x'},items:{}}].forEach(x=>{const n=R.normalize(x);assert.equal(typeof n.items,'object')});
 const n=R.normalize(JSON.parse(JSON.stringify(Object.assign(R.empty(),{reviewer:{name:'Awa',native:true}}))));assert.equal(n.reviewer.name,'Awa');
});
