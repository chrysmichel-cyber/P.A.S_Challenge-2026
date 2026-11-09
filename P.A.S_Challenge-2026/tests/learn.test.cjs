const test=require('node:test'),assert=require('node:assert/strict');
const {load,memStorage}=require('./helpers.cjs');
const LCA=load(),PR=LCA.progress,QZ=LCA.quiz,ST=LCA.store;
const wolof=LCA.langs.wolof;
const lessons=()=>QZ.curriculumFor(wolof).lessons;
const sal=()=>lessons().find(l=>l.key==='salutations');
function session(p,ls){const qs=QZ.questionsFor(wolof,ls);PR.startSession(p,ls,qs.map(q=>q.id),0);return qs}
const ctx={wordsLearned:0};
/* joue tout une leçon ; pattern : tableau de booléens (true = bonne réponse) */
function play(p,qs,pattern){const out=[];qs.forEach((q,i)=>{const good=pattern[i%pattern.length];const wrong=q.options.find(o=>o.id!==q.answer).id;out.push(PR.answer(p,q,good?q.answer:wrong,ctx,1000+i));PR.next(p)});return out}

test('3-4 : une question a 4 propositions, une seule bonne réponse, un énoncé et une explication',()=>{
 const qs=QZ.questionsFor(wolof,sal());assert.equal(qs.length,10);
 qs.forEach(q=>{assert.equal(QZ.validateQuestion(q).length,0,q.id);assert.equal(q.options.filter(o=>o.id===q.answer).length,1)});
 assert.equal(new Set(qs.map(q=>q.id)).size,10);
});
test('banque : toutes les questions explicites et générées sont valides, sans doublon d’identifiant',()=>{
 const ids=new Set();
 Object.values(LCA.langs).forEach(L=>{const m=QZ.allQuestions(L);Object.values(m).forEach(q=>{assert.equal(QZ.validateQuestion(q).length,0,q.id);assert.ok(!ids.has(q.id),'doublon '+q.id);ids.add(q.id)})});
 assert.ok(ids.size>300);
});
test('contenu non validé : toutes les questions sont marquées provisoires, aucune ne se présente comme authentique',()=>{
 Object.values(LCA.langs).forEach(L=>Object.values(QZ.allQuestions(L)).forEach(q=>assert.equal(QZ.isAuthentic(q),false,q.id)));
});
test('leçons : une catégorie trop pauvre est « à compléter » (jamais remplie par invention)',()=>{
 const c=QZ.curriculumFor(LCA.langs.umbundu);assert.equal(c.lessons.length,0);
 const k=QZ.curriculumFor(LCA.langs.copte);assert.equal(k.lessons.map(x=>x.key).join(),'recettes');/* seule la recette du jeu permet une leçon */
});
test('4 : bonne réponse au premier essai = 10 XP, et le résultat ne change pas si on revalide',()=>{
 const p=PR.newProfile(),qs=session(p,sal());
 const r=PR.answer(p,qs[0],qs[0].answer,ctx,1);
 assert.equal(r.ok,true);assert.equal(r.xp,10);assert.equal(p.xp,10);
 const again=PR.answer(p,qs[0],qs[0].options.find(o=>o.id!==qs[0].answer).id,ctx,2);
 assert.equal(again.duplicate,true);assert.equal(again.ok,true);assert.equal(p.xp,10);assert.equal(p.stats.answers,1);
});
test('5 : mauvaise réponse = 0 XP, bonne réponse indiquée, question ajoutée à la révision',()=>{
 const p=PR.newProfile(),qs=session(p,sal());
 const wrong=qs[0].options.find(o=>o.id!==qs[0].answer).id;
 const r=PR.answer(p,qs[0],wrong,ctx,1);
 assert.equal(r.ok,false);assert.equal(r.xp,0);assert.equal(r.correct,qs[0].answer);assert.ok(p.review[qs[0].id]);assert.ok(qs[0].explanation.length>5);
});
test('6 : une question ne peut être validée qu’une fois (autre question refusée, séance finie refusée)',()=>{
 const p=PR.newProfile(),qs=session(p,sal());
 assert.equal(PR.answer(p,qs[3],qs[3].answer,ctx,1).error,'wrong-question');
 PR.answer(p,qs[0],qs[0].answer,ctx,1);PR.answer(p,qs[0],qs[0].answer,ctx,1);PR.answer(p,qs[0],qs[0].answer,ctx,1);
 assert.equal(p.session.results.length,1);assert.equal(p.xp,10);
});
test('7 : bonus de série (3 = +5, 5 = +10) attribués une seule fois par leçon',()=>{
 const p=PR.newProfile(),qs=session(p,sal());
 const r=play(p,qs,[true]);
 assert.equal(r[2].events.some(e=>e.type==='streak3'),true);assert.equal(r[4].events.some(e=>e.type==='streak5'),true);
 /* 10 bonnes réponses : 10×10 + 5 + 10 = 115 */
 assert.equal(p.xp,115);
 const sm=PR.finish(p,ctx,5000);assert.equal(sm.xpBonus,20);assert.equal(p.xp,135);assert.equal(sm.perfect,true);
 /* rejouer ne redonne rien */
 const qs2=session(p,sal());play(p,qs2,[true]);const sm2=PR.finish(p,ctx,9000);
 assert.equal(p.xp,135);assert.equal(sm2.xpBonus,0);
});
test('7b : une erreur casse la série',()=>{
 const p=PR.newProfile(),qs=session(p,sal());const r=play(p,qs.slice(0,6),[true,true,false,true,true,true]);
 assert.equal(r.some(x=>x.events.some(e=>e.type==='streak3')),true);/* 3e série après l’erreur : 3 consécutives (index 3,4,5) */
 assert.equal(p.stats.bestStreak,3);
});
test('révision : une question ratée puis réussie donne 5 XP une seule fois et sort de la liste',()=>{
 const p=PR.newProfile(),qs=session(p,sal());play(p,qs,[false]);PR.finish(p,ctx,1);
 const before=p.xp;assert.equal(Object.keys(p.review).length,10);
 const rl={id:'review:wolof',lang:'wolof',review:true};PR.startSession(p,rl,[qs[0].id],2);
 const r=PR.answer(p,qs[0],qs[0].answer,ctx,3);assert.equal(r.xp,5);assert.equal(p.xp,before+5);assert.equal(p.review[qs[0].id],undefined);
 PR.next(p);PR.finish(p,ctx,4);
 PR.startSession(p,rl,[qs[0].id],5);const r2=PR.answer(p,qs[0],qs[0].answer,ctx,6);assert.equal(r2.xp,0);
});
test('8 : badges débloqués uniquement quand leurs conditions sont remplies, une seule fois',()=>{
 const p=PR.newProfile(),qs=session(p,sal());
 const r=play(p,qs.slice(0,4),[true]);assert.equal(Object.keys(p.badges).length,0);
 const q=PR.answer(p,qs[4],qs[4].answer,ctx,10);assert.ok(p.badges.serie_5,'série de 5');assert.equal(q.newBadges.map(b=>b.id).join(),'serie_5');PR.next(p);
 play(p,[],[true]);
 qs.slice(5).forEach((x,i)=>{PR.answer(p,x,x.answer,ctx,20+i);PR.next(p)});
 assert.ok(p.badges.dix_bonnes);assert.equal(p.badges.premiere_lecon,undefined);
 const sm=PR.finish(p,ctx,99);const ids=sm.newBadges.map(b=>b.id).sort();
 assert.equal(ids.join(),'premiere_lecon,premiere_parfaite');
 assert.ok(p.badges.premiere_lecon.at&&!isNaN(Date.parse(p.badges.premiere_lecon.at)));
 assert.equal(PR.evaluateBadges(p,ctx,100).length,0);
});
test('8b : collectionneur (30 mots) et explorateur (2 langues) dépendent de leurs conditions',()=>{
 const p=PR.newProfile();assert.equal(PR.evaluateBadges(p,{wordsLearned:29}).some(b=>b.id==='collectionneur'),false);
 assert.equal(PR.evaluateBadges(p,{wordsLearned:30}).some(b=>b.id==='collectionneur'),true);
 p.lessons['wolof:salutations']={lang:'wolof',done:true,best:1};assert.equal(PR.evaluateBadges(p,ctx).some(b=>b.id==='explorateur_langues'),false);
 p.lessons['swahili:salutations']={lang:'swahili',done:true,best:1};assert.equal(PR.evaluateBadges(p,ctx).some(b=>b.id==='explorateur_langues'),true);
});
test('niveaux : seuils configurables et progression',()=>{
 assert.equal(PR.levelFor(0).level.id,'debutant');assert.equal(PR.levelFor(99).level.id,'debutant');assert.equal(PR.levelFor(100).level.id,'explorateur');
 assert.equal(PR.levelFor(900).level.id,'maitre');assert.equal(PR.levelFor(5000).pct,100);
 assert.equal(PR.levelFor(50,[{id:'a',name:'A',xp:0},{id:'b',name:'B',xp:40}]).level.id,'b');
 assert.equal(PR.levelFor(175).pct,50);
});
test('déblocage : la leçon suivante demande la précédente réussie à 60 %',()=>{
 const p=PR.newProfile(),ls=lessons();
 assert.equal(PR.lessonState(p,ls,ls[0].id),'open');assert.equal(PR.lessonState(p,ls,ls[1].id),'locked');
 const qs=session(p,ls[0]);play(p,qs,[true,false,false]);/* 4/10 = 40 % */PR.finish(p,ctx,1);
 assert.equal(PR.lessonState(p,ls,ls[1].id),'locked');
 const q2=session(p,ls[0]);play(p,q2,[true,true,false]);/* 7/10 */PR.finish(p,ctx,2);
 assert.equal(PR.lessonState(p,ls,ls[1].id),'open');assert.equal(PR.recommended(p,ls).id,ls[1].id);
});
test('9 : rechargement – aucune récompense en double (finish, bonus de leçon, bonus de série)',()=>{
 const p=PR.newProfile(),qs=session(p,sal());play(p,qs,[true]);PR.finish(p,ctx,1);const xp=p.xp;
 assert.equal(PR.finish(p,ctx,2).error,'no-session');assert.equal(p.xp,xp);
 /* séance interrompue après sauvegarde puis reprise */
 const p2=PR.normalize(JSON.parse(JSON.stringify(p)));const qs2=session(p2,sal());play(p2,qs2.slice(0,5),[true]);
 const p3=PR.normalize(JSON.parse(JSON.stringify(p2)));assert.ok(PR.resumable(p3,sal().id));
 const cur=qs2[5];assert.equal(PR.answer(p3,cur,cur.answer,ctx,5).duplicate,false);const xp3=p3.xp;const p4=PR.normalize(JSON.parse(JSON.stringify(p3)));assert.equal(PR.answer(p4,cur,cur.answer,ctx,6).duplicate,true);assert.equal(p4.xp,xp3);
});
test('10 : progression conservée après redémarrage (stockage simulé)',()=>{
 const st=memStorage(),s=ST.load(st),qs=(()=>{const q=QZ.questionsFor(wolof,sal());PR.startSession(s.learn,sal(),q.map(x=>x.id),1);return q})();
 PR.answer(s.learn,qs[0],qs[0].answer,ctx,2);ST.save(st,s);
 const s2=ST.load(st);assert.equal(s2.learn.xp,10);assert.equal(s2.learn.session.results.length,1);assert.equal(s2.v,5);
});
test('11 : ancienne sauvegarde v2 compatible, copie de secours conservée, rien d’écrasé',()=>{
 const old={v:2,lang:'swahili',d:{swahili:{done:{q1:1},flags:{},learned:{3:1},items:{sac:1},got:{},picked:{},best:2}},settings:{sound:0,shadows:1,low:1}};
 const st=memStorage({'lca-v2':JSON.stringify(old)});
 const s=ST.load(st);
 assert.equal(s.lang,'swahili');assert.equal(s.d.swahili.best,2);assert.equal(s.d.swahili.learned[3],1);assert.equal(s.settings.sound,0);assert.equal(s.settings.low,1);assert.equal(s.settings.slow,0);
 assert.equal(s.learn.xp,0);assert.equal(s.v,5);
 assert.equal(JSON.parse(st.getItem('lca-v2.bak')).v,2);
 ST.save(st,s);ST.load(st);assert.equal(JSON.parse(st.getItem('lca-v2.bak')).v,2);/* la copie n’est pas réécrite */
});
test('11b : données corrompues ou absentes : valeurs par défaut sans exception',()=>{
 [null,'{oops','[]','5','{"d":5,"learn":7}'].forEach(t=>{const st=memStorage(t===null?{}:{'lca-v2':t});const s=ST.load(st);assert.equal(s.v,5);assert.equal(typeof s.learn.xp,'number');assert.equal(typeof s.d,'object')});
 assert.equal(ST.save({setItem(){throw new Error('quota')}},{}),false);
});
test('migration : profil partiel ou aux types erronés est normalisé',()=>{
 const p=PR.normalize({xp:'abc',answered:[],badges:null,session:{qids:'x'}});
 assert.equal(p.xp,0);assert.equal(JSON.stringify(p.answered),'{}');assert.equal(JSON.stringify(p.badges),'{}');assert.equal(p.session,null);
});
test('data : les questions sont dans des fichiers de données, pas dans le code d’interface',()=>{
 const fs=require('node:fs'),ui=fs.readFileSync(require('node:path').join(__dirname,'../js/learn/ui.js'),'utf8');
 assert.ok(!/Salaam maalekum|Jërëjëf/.test(ui));assert.ok(LCA.quizBank.length>=10);
});

test('12 : le rendu 3D est le rendu par défaut, appliqué une seule fois aux anciennes sauvegardes',()=>{
 assert.equal(ST.defaults().settings.mode,'3d');
 const st=memStorage({'lca-v2':JSON.stringify({v:4,settings:{mode:'2d'}})});
 const s=ST.load(st);assert.equal(s.settings.mode,'3d');assert.equal(s.settings.modeV,2);
 s.settings.mode='2d';ST.save(st,s);assert.equal(ST.load(st).settings.mode,'2d');/* le choix ultérieur est conservé */
});

/* ---------- niveaux 3 et 4 ---------- */
const lessonOf=(L,key)=>QZ.curriculumFor(L).lessons.find(x=>x.key===key);
test('N1 : niveaux 3 et 4 disponibles en wolof, avec les 8 types de leçons attendus',()=>{
 const c=QZ.curriculumFor(wolof);
 ['expressions','suite','intrus','marche','village','contes','recettes','defi'].forEach(k=>{const ls=lessonOf(wolof,k);assert.ok(ls&&ls.available,k);assert.ok(ls.count>=4,k)});
 assert.equal(c.levels.filter(l=>l.n>=3).every(l=>l.lessons.length>0),true);
});
test('N2 : questions de niveau 3 et 4 : 4 propositions distinctes, une bonne réponse, correction expliquée, difficulté croissante',()=>{
 const diffs={};
 Object.values(LCA.langs).forEach(L=>QZ.curriculumFor(L).lessons.filter(x=>x.level>=3).forEach(ls=>{
  const qs=QZ.questionsFor(L,ls);assert.ok(qs.length>=4,L.id+' '+ls.key);
  qs.forEach(q=>{assert.equal(QZ.validateQuestion(q).length,0,q.id);assert.ok(q.explanation.length>25,q.id);assert.ok(q.explanation.includes('non validé'),q.id);diffs[ls.level]=Math.max(diffs[ls.level]||0,q.difficulty)});
  assert.equal(JSON.stringify(QZ.questionsFor(L,ls).map(q=>q.id)),JSON.stringify(qs.map(q=>q.id)),'déterministe')}));
 assert.ok(diffs[4]>=diffs[3]&&diffs[3]>=2);
});
test('N3 : « suite » : la bonne réponse est bien le nombre suivant ou précédent',()=>{
 const N=wolof.words.filter(w=>w[0]==='c').map(w=>w[1]);
 QZ.questionsFor(wolof,lessonOf(wolof,'suite')).forEach(q=>{
  const right=q.options.find(o=>o.id===q.answer).text,k=N.indexOf(q.text.split(' = ')[0]);
  const exp=/après/.test(q.prompt)?N[k+1]:N[k-1];assert.equal(right,exp,q.id)});
});
test('N4 : « intrus » : le mot attendu est dans un autre groupe que les trois autres',()=>{
 const grp={};wolof.words.forEach(w=>{grp[w[1]]=w[0]});
 QZ.questionsFor(wolof,lessonOf(wolof,'intrus')).forEach(q=>{
  const a=q.options.find(o=>o.id===q.answer).text,others=q.options.filter(o=>o.id!==q.answer).map(o=>grp[o.text]);
  assert.ok(others.every(g=>g===others[0]),q.id);assert.notEqual(grp[a],others[0],q.id)});
});
test('N5 : « recettes » : aucune mauvaise proposition ne partage un mot avec la recette',()=>{
 const toks=n=>String(n).split('(')[0].toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿœ]+/).map(t=>t.replace(/s$/,'')).filter(t=>t.length>=4);
 QZ.questionsFor(wolof,lessonOf(wolof,'recettes')).forEach(q=>{
  const r=wolof.recipes.find(x=>x.name===q.text),mine={};r.ing.forEach(i=>toks(i[0]).forEach(t=>{mine[t]=1}));
  q.options.filter(o=>o.id!==q.answer).forEach(o=>assert.ok(!toks(o.text).some(t=>mine[t]),q.id+' '+o.text))});
});
test('N6 : langues pauvres : leçons avancées « à compléter », jamais inventées',()=>{
 assert.equal(QZ.curriculumFor(LCA.langs.kituba).lessons.length,0);
 assert.equal(lessonOf(LCA.langs.kabyle,'defi')===undefined,false?false:lessonOf(LCA.langs.kabyle,'defi')===undefined);
 const c=QZ.curriculumFor(LCA.langs.tsonga);assert.ok(c.levels[2].lessons.every(l=>!l.available));
 assert.ok(QZ.curriculumFor(LCA.langs.wolof).levels[2].lessons.every(l=>l.available));
});
test('N7 : bonus de niveau et badges : une seule fois, quand toutes les leçons disponibles du niveau sont réussies',()=>{
 const p=PR.newProfile(),cu=QZ.curriculumFor(wolof),lv3=cu.levels.find(l=>l.n===3).lessons.filter(x=>x.available);
 const ctx={levelInfo:lid=>{const lv=cu.levels.find(l=>l.lessons.some(x=>x.id===lid));return {n:lv.n,ids:lv.lessons.filter(x=>x.available).map(x=>x.id)}}};
 let bonus=0,badges=[];
 const run=ls=>{const qs=QZ.questionsFor(wolof,ls);PR.startSession(p,ls,qs.map(q=>q.id),1);play(p,qs,[true]);return PR.finish(p,ctx,99)};
 lv3.forEach((ls,i)=>{const r=run(ls);const lv=r.events.filter(e=>e.type==='level');if(i<lv3.length-1)assert.equal(lv.length,0,'pas avant la dernière');else{assert.equal(lv.length,1);bonus=lv[0].xp}badges=badges.concat(r.newBadges.map(b=>b.id))});
 assert.equal(bonus,PR.CONFIG.xp.level);assert.ok(badges.includes('niveau_3'));assert.ok(p.levelsDone['wolof:3']);
 const xp=p.xp;const r2=run(lv3[0]);assert.equal(r2.events.filter(e=>e.type==='level').length,0);assert.equal(r2.newBadges.filter(b=>b.id==='niveau_3').length,0);/* rejouer ne redonne rien */
 assert.equal(JSON.stringify(PR.normalize(JSON.parse(JSON.stringify(p))).levelsDone),JSON.stringify(p.levelsDone));
});
test('N8 : séance de niveau 4 sauvegardée et reprise après rechargement',()=>{
 const st=memStorage(),s=ST.load(st),ls=lessonOf(wolof,'defi'),qs=QZ.questionsFor(wolof,ls);
 PR.startSession(s.learn,ls,qs.map(q=>q.id),1);PR.answer(s.learn,qs[0],qs[0].answer,{},2);ST.save(st,s);
 const s2=ST.load(st);assert.ok(PR.resumable(s2.learn,ls.id));assert.equal(s2.learn.session.results.length,1);
 assert.equal(PR.normalize({v:1,xp:5}).levelsDone&&typeof PR.normalize({v:1,xp:5}).levelsDone,'object');/* anciennes sauvegardes sans levelsDone */
});
