'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{root}=require('./helpers.cjs');
const S=require(root+'/js/learn/srs.js');const DAY=864e5,T0=1e12;
test('sync : une fiche par mot découvert, sans doublon',()=>{const s=S.empty();assert.equal(S.sync(s,{0:1,3:1,5:0},T0),2);assert.equal(S.sync(s,{0:1,3:1},T0),0);assert.deepEqual(Object.keys(s.cards).sort(),['0','3'])});
test('boîtes : bonne réponse monte et espace, oubli retombe en boîte 0',()=>{
 const s=S.empty();S.sync(s,{1:1},T0);let c=S.grade(s,1,'good',T0);assert.equal(c.box,1);assert.equal(c.due,T0+DAY);
 for(let i=0;i<5;i++)c=S.grade(s,1,'good',T0);assert.equal(c.box,5);
 c=S.grade(s,1,'again',T0);assert.equal(c.box,0);assert.equal(c.ko,1);assert.ok(c.due<T0+DAY);
});
test('« difficile » : même boîte, rappel plus proche',()=>{const s=S.empty();S.grade(s,2,'good',T0);S.grade(s,2,'good',T0);const c=S.grade(s,2,'hard',T0);assert.equal(c.box,2);assert.ok(c.due-T0<S.INTERVALS[2]&&c.due>T0)});
test('priorité : retard, difficultés et rareté d’usage pèsent sur l’ordre',()=>{
 const s=S.empty();S.sync(s,{1:1,2:1,3:1},T0);
 s.cards[1].due=T0-5*DAY;                              /* très en retard */
 s.cards[2].due=T0-DAY;s.cards[2].ko=6;s.cards[2].ok=1;  /* difficile pour le joueur */
 s.cards[3].due=T0-DAY;s.cards[3].ok=6;s.cards[3].uses=30; /* facile et très utilisé */
 const l=S.dueList(s,T0,10);assert.equal(l[0],1);assert.equal(l[2],3,'le mot facile et fréquent passe en dernier');assert.ok(l.indexOf(2)<l.indexOf(3));
 assert.deepEqual(S.dueList(s,T0-30*DAY,10),[],'rien n’est dû avant l’échéance');
});
test('statistiques et niveau de vocabulaire',()=>{
 const s=S.empty();S.sync(s,{0:1,1:1,2:1},T0);for(let i=0;i<4;i++)S.grade(s,0,'good',T0);S.grade(s,1,'again',T0);
 const st=S.stats(s,T0+40*DAY,10);assert.equal(st.discovered,3);assert.equal(st.mastered,1);assert.equal(st.exercises,5);assert.equal(st.accuracy,80);assert.equal(st.pct,30);
 assert.equal(S.levelFor(0).name,'Débutant');assert.equal(S.levelFor(16).name,'Élémentaire');assert.equal(S.levelFor(99).next,null);
 assert.equal(S.status(s.cards[0]),'maitrise');assert.equal(S.status(s.cards[1]),'en_cours');assert.equal(S.status(s.cards[2]),'nouveau');
});
test('normalize : sauvegarde corrompue sans exception',()=>{assert.deepEqual(S.normalize(null),S.empty());const n=S.normalize({cards:{1:{box:99,due:'x',ok:-3},2:null,3:5}});assert.equal(n.cards[1].box,5);assert.equal(n.cards[1].ok,0);assert.ok(!n.cards[2]&&!n.cards[3])});
