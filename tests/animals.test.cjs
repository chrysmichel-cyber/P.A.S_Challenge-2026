'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs');
const LCA=load();const AN=require(root+'/js/ambient/animals.js');
test('animaux : nom français toujours ; nom local seulement s’il est déjà documenté',()=>{
 assert.equal(AN.label('goat',null),'Chèvre · nom local à documenter');assert.equal(AN.label('inconnu',null),'Animal · nom local à documenter');
 const fake={words:[['n','Ex-poule','Poule'],['n','Ex-lait','Lait']]};
 assert.equal(AN.label('poule',fake),'Ex-poule · Poule');assert.equal(AN.label('vache',fake),'Vache · nom local à documenter');
 /* sur les données réelles : tout nom local affiché existe réellement dans la langue */
 Object.values(LCA.langs).forEach(L=>Object.keys(AN.FR).forEach(t=>{const n=AN.localName(L,t);if(n)assert.ok((L.words||[]).some(w=>String(w[1])===n))}));
});
