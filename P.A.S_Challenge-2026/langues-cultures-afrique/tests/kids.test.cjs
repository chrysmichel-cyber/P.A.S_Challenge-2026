'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,root}=require('./helpers.cjs');
const LCA=load();const K=require(root+'/js/kids/kids.js'),QZ=LCA.quiz;
test('émojis : seulement pour des sens connus, jamais pour le reste',()=>{
 assert.equal(K.emojiFor('Eau'),'💧');assert.equal(K.emojiFor('Un (1)'),'1️⃣');assert.equal(K.emojiFor('Dix (10)'),'🔟');
 assert.equal(K.emojiFor('Comment vas-tu ?'),'');assert.equal(K.emojiFor(''),'');
});
test('quiz petits : deux propositions dont la bonne, résultat stable',()=>{
 let n=0;Object.values(LCA.langs).forEach(L=>{const qs=QZ.allQuestions(L);Object.values(qs).forEach(q=>{
  const t=K.twoOptions(q);n++;assert.equal(t.length,2);assert.ok(t.some(o=>o.id===q.answer));assert.equal(JSON.stringify(t),JSON.stringify(K.twoOptions(q)))})});
 assert.ok(n>500);
});
test('étoiles et encouragements',()=>{
 assert.equal(K.stars(10,10),3);assert.equal(K.stars(6,10),2);assert.equal(K.stars(0,10),1);assert.equal(K.stars(0,0),1);
 assert.ok(K.praise(0)&&K.tryAgain(7));
});
