'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('./helpers.cjs');
const LCA=load(),PR=LCA.progress,QZ=LCA.quiz;
test('chaque leçon disponible a des cartes d’étude tirées des données',()=>{
 let n=0;
 Object.values(LCA.langs).forEach(L=>QZ.curriculumFor(L).lessons.forEach(ls=>{
  const st=QZ.studyFor(L,ls);n++;
  assert.ok(st.cards.length>0,L.id+' '+ls.id+' sans carte');
  st.cards.forEach(c=>{assert.ok(c.big&&c.small,L.id+' '+ls.id+' carte vide');
   if(c.wo)assert.ok((L.words||[]).some(w=>String(w[1])===c.wo)||(L.tales||[]).some(t=>(t.vocab||[]).some(v=>String(v[0])===c.wo)),'mot inventé : '+c.wo)})}));
 assert.ok(n>50);
});
test('apprendre d’abord : étudiée seulement après marquage, ou si déjà réussie/commencée',()=>{
 const p=PR.newProfile();
 assert.equal(PR.studied(p,'wolof:salutations'),false);
 PR.markStudied(p,'wolof:salutations');assert.equal(PR.studied(p,'wolof:salutations'),true);
 const q=PR.normalize({v:1,lessons:{'x:y':{done:true,best:1}}});assert.equal(PR.studied(q,'x:y'),true);/* ancienne sauvegarde */
 assert.equal(JSON.stringify(PR.normalize({v:1}).studied),'{}');
});
