'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs'),fs=require('node:fs');
const LCA=load();const E=require(root+'/js/memoire/elder.js');
test('gardien : chapitres construits uniquement avec les données de la langue',()=>{
 Object.values(LCA.langs).forEach(L=>{
  const ch=E.chapters(L,'Région');
  assert.ok(ch.length>=3,L.id+' : trop peu de chapitres');
  assert.equal(ch[ch.length-1].id,'verif','le dernier chapitre rappelle la vérification');
  const txt=JSON.stringify(ch);
  (L.history||[]).forEach(h=>assert.ok(txt.includes(JSON.stringify(h).slice(1,-1)),L.id+' : histoire absente'));
  if(L.figure)assert.ok(txt.includes(JSON.stringify(L.figure.name).slice(1,-1)));
  ch.forEach(c=>assert.ok(c.blocks.length>0,L.id+' '+c.id+' vide'));
 });
 assert.equal(E.initials('Cheikh Anta Diop'),'CA');
});
