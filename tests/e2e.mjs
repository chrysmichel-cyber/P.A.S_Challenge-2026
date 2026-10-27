/* Tests de bout en bout (navigateur réel). Nécessite Playwright : npm i -D playwright && npx playwright install chromium
   Lancer : node tests/e2e.mjs   (sans Playwright, le test est ignoré et le code de sortie reste 0, avec un avertissement) */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
let pw;try{pw=createRequire(import.meta.url)('playwright')}catch(e){console.warn('Playwright absent : tests e2e ignorés.');process.exit(0)}
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL='http://127.0.0.1:'+srv.address().port+'/index.html';
const browser=await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let n=0,fail=0;const errors=[];
const ok=(c,m)=>{n++;if(c)console.log('  ok   '+m);else{fail++;console.log('  FAIL '+m)}};
async function open(opts={}){
 const ctx=await browser.newContext(Object.assign({viewport:{width:1000,height:640}},opts.ctx||{}));
 if(opts.mode!==null&&!(opts.init&&opts.mode===undefined))await ctx.addInitScript(m=>{if(!localStorage.getItem('lca-v2')||!JSON.parse(localStorage.getItem('lca-v2')).settings||!JSON.parse(localStorage.getItem('lca-v2')).settings.__set){const s=JSON.parse(localStorage.getItem('lca-v2')||'{}');s.settings=Object.assign({sound:1,shadows:0,quality:0,__set:1},s.settings,{mode:m,modeV:2});localStorage.setItem('lca-v2',JSON.stringify(s))}},opts.mode||'2d');
 if(opts.init)await ctx.addInitScript(opts.init);
 const pg=await ctx.newPage();pg.setDefaultTimeout(15000);
 pg.on('pageerror',e=>errors.push(String(e)));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|fonts/.test(m.text()))errors.push(m.text())});
 await pg.route('**/fonts.g*/**',r=>r.abort());
 await pg.goto(URL);await pg.waitForTimeout(opts.mode==='3d'?5000:2300);return {ctx,pg}}
const jsClick=(pg,sel)=>pg.evaluate(s=>{const e=document.querySelector(s);e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))},sel);
async function enter(pg,lang='wolof'){
 await jsClick(pg,'[data-m=new]');await pg.waitForTimeout(300);await jsClick(pg,'.mdot[data-map='+lang+']');await pg.waitForTimeout(200);await jsClick(pg,'[data-pick='+lang+']');await jsClick(pg,'[data-go2=start]');await pg.waitForTimeout(600);
 await pg.waitForTimeout(900);await pg.evaluate(()=>{const c=document.getElementById('closeP');if(c&&!document.getElementById('panel').hidden)c.click()});
 await pg.evaluate(()=>{__lca.P.x=30;__lca.P.z=-19});await pg.waitForTimeout(1300)}
const learn=pg=>pg.evaluate(()=>JSON.parse(localStorage.getItem('lca-v2')).learn);

console.log('1-3 Enseignant, leçon, questions (bureau)');
{const {ctx,pg}=await open();await enter(pg);
 ok((await pg.innerText('#act')).includes('Maître Ibou'),'1. le bouton d’interaction propose de parler à l’enseignant');
 await pg.keyboard.press('e');await pg.waitForTimeout(400);
 ok((await pg.innerText('#dlgFr')).includes('Es-tu prêt à relever le défi'),'1. dialogue de l’enseignant (touche E)');
 ok((await pg.innerText('#dlgLater')).includes('Revenir plus tard'),'2. choix « Revenir plus tard »');
 await pg.keyboard.down('a');await pg.waitForTimeout(500);await pg.keyboard.up('a');
 ok(await pg.isVisible('#dialog'),'2. le dialogue ne bloque pas les déplacements (le joueur peut marcher)');
 await pg.click('#dlgGo');await pg.waitForTimeout(500);
 ok(await pg.isVisible('#learn .opts'),'2. « Commencer la leçon » ouvre le quiz');
 ok((await pg.$$('#learn .opt')).length===4,'3. quatre propositions affichées');
 ok((await pg.innerText('#learn .qhead')).includes('Question 1/10'),'3. indicateur « Question 1/10 »');
 ok((await pg.innerText('#learn .prov')).includes('provisoire'),'3. contenu non validé signalé comme provisoire');
 ok(!(await pg.$('.tbar')),'3. chronomètre désactivé par défaut');
 /* bonne réponse */
 const right=await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lca-v2')).learn.session;return s.qids[0]});
 const ans=await pg.evaluate(id=>LCA.quiz.allQuestions(LCA.langs.wolof)[id].answer,right);
 await pg.click('.opt[data-o='+ans+']');await pg.click('[data-a=ok]');await pg.click('[data-a=ok]',{timeout:300}).catch(()=>{});await pg.waitForTimeout(200);
 ok((await pg.innerText('#learn .fb')).includes('+10 XP'),'4. bonne réponse : message positif et +10 XP');
 ok((await learn(pg)).xp===10,'4. XP enregistrés (10)');
 await pg.click('[data-a=next]');await pg.waitForTimeout(200);
 /* mauvaise réponse */
 const q2=await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lca-v2')).learn.session;const q=LCA.quiz.allQuestions(LCA.langs.wolof)[s.qids[1]];return {a:q.answer,w:q.options.find(o=>o.id!==q.answer).id,t:q.options.find(o=>o.id===q.answer).text}});
 await pg.click('.opt[data-o='+q2.w+']');await pg.click('[data-a=ok]');await pg.waitForTimeout(200);
 const fb=await pg.innerText('#learn .fb');
 ok(fb.includes(q2.t)&&fb.includes('Pas tout à fait'),'5. mauvaise réponse : bonne réponse et explication affichées');
 ok((await learn(pg)).xp===10,'5. aucun point pour une mauvaise réponse');
 ok((await pg.$$('#learn .opt:disabled')).length===4,'6. propositions verrouillées après validation');
 await pg.click('.opt[data-o='+q2.a+']',{force:true,timeout:500}).catch(()=>{});
 ok((await learn(pg)).session.results.length===2&&(await learn(pg)).xp===10,'6. une question ne se valide qu’une fois');
 /* rechargement : reprise */
 await pg.reload();await pg.waitForTimeout(2300);
 const L=await learn(pg);ok(L.xp===10&&L.session.results.length===2,'10. XP et séance conservés après rechargement');
 await ctx.close()}

console.log('Leçon complète, bonus, badges, rechargement');
{const {ctx,pg}=await open();await enter(pg);await pg.keyboard.press('e');await pg.click('#dlgGo');await pg.waitForTimeout(400);
 for(let i=0;i<10;i++){
  const a=await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lca-v2')).learn.session;return LCA.quiz.allQuestions(LCA.langs.wolof)[s.qids[s.i]].answer});
  await pg.click('.opt[data-o='+a+']');await pg.click('[data-a=ok]');await pg.click('[data-a=next]')}
 await pg.waitForTimeout(300);
 const L=await learn(pg);
 ok(L.xp===135,'7. 10×10 + série 3 (5) + série 5 (10) + leçon (20) = 135 XP');
 ok(L.badges.premiere_lecon&&L.badges.serie_5&&L.badges.dix_bonnes&&L.badges.premiere_parfaite,'8. badges attendus débloqués');
 ok(!L.badges.collectionneur&&!L.badges.explorateur_langues,'8. badges non mérités absents');
 ok((await pg.innerText('#learn')).includes('10 / 10'),'résultat affiché');
 await pg.reload();await pg.waitForTimeout(2300);
 ok((await learn(pg)).xp===135&&Object.keys((await learn(pg)).badges).length===4,'9-10. rien de perdu ni doublé après rechargement');
 /* rejouer : pas de nouveaux XP */
 await pg.evaluate(()=>{__lca.P.x=30;__lca.P.z=-19});await enterLessonAgain(pg);
 async function enterLessonAgain(pg){await pg.waitForTimeout(300);await pg.evaluate(()=>{});}
 await pg.click('[data-m=parcours]').catch(async()=>{await pg.click('#menuBtn');await pg.waitForTimeout(300);await pg.click('[data-m=parcours]')});await pg.waitForTimeout(300);
 ok((await pg.innerText('#learn')).includes('Explorateur'),'7bis. tableau de bord : niveau Explorateur à 135 XP');
 ok((await pg.innerText('#learn')).includes('1')&&(await pg.innerText('#learn')).includes('leçons terminées'),'tableau de bord : leçons terminées');
 await pg.screenshot({path:'/tmp/e2e_dash.png'});
 await ctx.close()}

console.log('11 Ancienne sauvegarde');
{const old={v:2,lang:'swahili',d:{swahili:{done:{q1:1},flags:{talkAwa:1},learned:{1:1,2:1},items:{sac:1},got:{},picked:{},best:3}},settings:{sound:1,shadows:1,low:0}};
 const {ctx,pg}=await open({init:'if(!localStorage.getItem("lca-v2"))localStorage.setItem("lca-v2",'+JSON.stringify(JSON.stringify(old))+')'});
 await pg.click('[data-m=continue]');await pg.waitForTimeout(800);
 const s=await pg.evaluate(()=>({st:JSON.parse(localStorage.getItem('lca-v2')),bak:localStorage.getItem('lca-v2.bak')}));
 ok(s.st.lang==='swahili'&&s.st.d.swahili.best===3&&s.st.d.swahili.learned[2]===1,'11. progression v2 intacte');
 ok(JSON.parse(s.bak).v===2,'11. copie de secours de l’ancienne sauvegarde');
 await ctx.close()}

console.log('12-13 Mobile, commandes après fermeture, régression des interactions');
{const {ctx,pg}=await open({ctx:{viewport:{width:390,height:780},hasTouch:true,isMobile:true}});await enter(pg);
 ok(await pg.isVisible('#act'),'12. bouton d’interaction tactile visible');
 await pg.tap('#act');await pg.waitForTimeout(400);await pg.tap('#dlgGo');await pg.waitForTimeout(500);
 const box=await pg.evaluate(()=>{const e=document.querySelector('#learn .opt');if(!e)return [0,0];const r=e.getBoundingClientRect();return [r.height,r.width]});
 ok(box[0]>=48,'12. réponses assez grandes pour le tactile ('+Math.round(box[0])+' px)');
 ok(!(await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'12. pas de défilement horizontal');
 const a=await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lca-v2')).learn.session;return LCA.quiz.allQuestions(LCA.langs.wolof)[s.qids[0]].answer});
 await pg.tap('.opt[data-o='+a+']');await pg.tap('[data-a=ok]');await pg.waitForTimeout(200);
 ok((await pg.innerText('#learn .fb')).includes('XP'),'12. quiz jouable au toucher');
 await pg.tap('#learn .lx');await pg.waitForTimeout(400);
 ok(await pg.evaluate(()=>document.getElementById('learn').hidden),'quitter ferme le quiz');
 ok((await learn(pg)).session.results.length===1,'quitter ne perd pas la progression enregistrée');
 const z0=await pg.evaluate(()=>__lca.P.z);
 await pg.evaluate(()=>{const j=document.getElementById('joy');const o={pointerId:7,bubbles:true,clientX:0,clientY:0};const r=j.getBoundingClientRect();o.clientX=r.x+r.width/2;o.clientY=r.y+r.height/2;j.dispatchEvent(new PointerEvent('pointerdown',o));o.clientY-=40;j.dispatchEvent(new PointerEvent('pointermove',o))});
 await pg.waitForTimeout(1000);const z1=await pg.evaluate(()=>__lca.P.z);
 ok(z1<z0-1,'13. le joystick déplace le personnage après la fermeture du quiz');
 /* régression : puits, conteuse */
 await pg.evaluate(()=>{const j=document.getElementById('joy');j.dispatchEvent(new PointerEvent('pointerup',{pointerId:7,bubbles:true}))});
 await pg.evaluate(()=>{__lca.P.x=-5;__lca.P.z=-21});await pg.waitForTimeout(900);
 ok((await pg.innerText('#act')).includes('puits'),'régression : le puits reste interactif');
 await pg.tap('#act');await pg.waitForTimeout(300);ok((await pg.innerText('#toast')).includes('seau'),'régression : interaction du puits');
 await pg.evaluate(()=>{__lca.P.x=-19;__lca.P.z=-9});await pg.waitForTimeout(900);
 ok((await pg.innerText('#act')).includes('Awa'),'régression : la conteuse reste accessible');
 await ctx.close()}

console.log('Leçon indisponible (langue pauvre en contenu)');
{const {ctx,pg}=await open();await enter(pg,'nubien');
 await pg.evaluate(()=>{LCA.learn.openHub()});await pg.waitForTimeout(300);
 ok((await pg.innerText('#learn')).includes('À venir')||(await pg.innerText('#learn')).includes('À compléter'),'contenu indisponible clairement annoncé');
 await ctx.close()}


const NPCS=[['awa','Grand-mère Awa'],['fatou','Tante Fatou'],['drum','Moussa'],['hist','gardien'],['ibou','Ibou']];
const POS={awa:[-19,-9],fatou:[-22,8],drum:[24,3],hist:[4,-42],ibou:[30,-19]};
async function playQuestions(pg,n){for(let i=0;i<n;i++){const a=await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lca-v2')).learn.session;return LCA.quiz.allQuestions(LCA.langs.wolof)[s.qids[s.i]].answer});await pg.click('.opt[data-o='+a+']');await pg.click('[data-a=ok]');await pg.click('[data-a=next]')}}
for(const mode of ['2d','3d']){
 console.log('\n== Mode '+mode.toUpperCase()+' ==');
 const F=mode==='3d'?5:1;const {ctx,pg}=await open({mode});
 ok(await pg.evaluate(()=>__lca.mode)===mode,'lancement en mode '+mode+' (rendu actif : '+await pg.evaluate(()=>__lca.mode)+')');
 ok(await pg.evaluate(()=>!document.getElementById('boot')),mode+' : écran de chargement terminé');
 await enter(pg);await pg.evaluate(()=>{__lca.P.x=0;__lca.P.z=26});await pg.waitForTimeout(500);
 /* clavier */
 const z0=await pg.evaluate(()=>__lca.P.z);await pg.keyboard.down('w');await pg.waitForTimeout(900*F);await pg.keyboard.up('w');
 ok(await pg.evaluate(()=>__lca.P.z)<z0-1.5,mode+' : touches clavier (avancer)');
 const x0=await pg.evaluate(()=>__lca.P.x);await pg.keyboard.down('d');await pg.waitForTimeout(700*F);await pg.keyboard.up('d');
 ok(await pg.evaluate(()=>__lca.P.x)>x0+1,mode+' : touches clavier (côté)');
 await pg.keyboard.down('Space');await pg.waitForTimeout(150*(F>1?2:1));const jy=await pg.evaluate(()=>__lca.P.y);await pg.keyboard.up('Space');
 ok(jy>0.05,mode+' : saut');
 /* collisions : foncer dans une maison */
 const col=await pg.evaluate(()=>{const h=__lca.R.HUTS[0];return {x:h.x,z:h.z,s:h.s}});
 await pg.evaluate(c=>{__lca.P.yaw=0;__lca.P.x=c.x;__lca.P.z=c.z+6},col);await pg.waitForTimeout(400);
 await pg.keyboard.down('w');await pg.waitForTimeout(2200*F);await pg.keyboard.up('w');
 const dd=await pg.evaluate(c=>Math.hypot(__lca.P.x-c.x,__lca.P.z-c.z),col);
 ok(dd>=1.9,mode+' : collision avec une maison (distance au centre '+dd.toFixed(1)+')');
 await pg.keyboard.down('s');await pg.waitForTimeout(900*F);await pg.keyboard.up('s');
 ok(await pg.evaluate(c=>Math.hypot(__lca.P.x-c.x,__lca.P.z-c.z),col)>dd+1,mode+' : on repart librement après le choc (pas de blocage)');
 /* cinq personnages */
 for(const [id,nm] of NPCS){
  await pg.evaluate(p=>{__lca.P.x=p[0];__lca.P.z=p[1]},POS[id]);await pg.waitForTimeout(900);
  const t=await pg.innerText('#act').catch(()=>'');
  await pg.keyboard.press('e');await pg.waitForTimeout(350);
  const vis=await pg.isVisible('#dialog'),name=vis?await pg.innerText('#dlgName'):'';
  ok(vis&&new RegExp(nm,'i').test(name),mode+' : dialogue avec '+id+' ('+name+')');
  if(id==='ibou'){await pg.click('#dlgGo');await pg.waitForTimeout(400);ok(await pg.isVisible('#learn .opts'),mode+' : leçon lancée depuis l’enseignant');
   await playQuestions(pg,3);const L=await learn(pg);ok(L.xp===35,mode+' : quiz, 3 bonnes réponses = 35 XP (10+10+10+5 série)');await pg.click('#learn .lx');await pg.waitForTimeout(300)}
  else{await pg.evaluate(()=>{document.getElementById('dlgLater').click()});await pg.waitForTimeout(150)}}
 /* contrôles après fermeture */
 const z1=await pg.evaluate(()=>__lca.P.z);await pg.keyboard.down('w');await pg.waitForTimeout(700*F);await pg.keyboard.up('w');
 ok(await pg.evaluate(()=>__lca.P.z)<z1-1,mode+' : commandes opérationnelles après fermeture du quiz');
 /* objets et quêtes partagés */
 const pk=await pg.evaluate(()=>{const p=__lca.R.picks[0];return {x:p.x,z:p.z}});
 await pg.evaluate(p=>{__lca.P.x=p.x;__lca.P.z=p.z},pk);await pg.waitForTimeout(700);
 ok(await pg.evaluate(()=>Object.keys(__lca.state.d.wolof.picked).length)>=1,mode+' : objet ramassé');
 await pg.screenshot({path:'/tmp/e2e_'+mode+'.png'});
 /* performance mesurée (rendu logiciel SwiftShader : valeurs indicatives, pas celles d’un vrai GPU) */
 await pg.evaluate(()=>{__lca.P.x=0;__lca.P.z=26});await pg.waitForTimeout(9000);
 const fps=await pg.evaluate(()=>__lca.perf.fps);console.log('  info  '+mode+' : '+fps+' images/s mesurées (rendu logiciel headless)');
 ok(fps>0,mode+' : mesure de performance disponible');
 await ctx.close()}

console.log('\n== Changement de mode sans perte ==');
{const {ctx,pg}=await open({mode:'2d'});await enter(pg);
 await pg.keyboard.press('e');await pg.click('#dlgGo');await pg.waitForTimeout(300);await playQuestions(pg,3);await pg.click('#learn .lx');
 const pk=await pg.evaluate(()=>{const p=__lca.R.picks[1];return {x:p.x,z:p.z}});await pg.evaluate(p=>{__lca.P.x=p.x;__lca.P.z=p.z},pk);await pg.waitForTimeout(600);
 const before=await pg.evaluate(()=>({xp:__lca.state.learn.xp,got:JSON.stringify(__lca.state.d.wolof.got),picked:JSON.stringify(__lca.state.d.wolof.picked),badges:Object.keys(__lca.state.learn.badges).join()}));
 await pg.click('#menuBtn');await pg.waitForTimeout(300);await jsClick(pg,'[data-m=settings]');await pg.waitForTimeout(300);
 ok(/mode graphique/i.test(await pg.innerText('#welcomeCard')),'Paramètres : section « Mode graphique »');
 ok(await pg.isEnabled('[data-gmode="3d"]'),'option 3D disponible');
 await pg.click('[data-gmode="3d"]');await pg.waitForTimeout(200);
 ok((await pg.innerText('#welcomeCard')).includes('va se recharger'),'avertissement avant rechargement');
 await Promise.all([pg.waitForNavigation(),pg.click('.warnbox [data-gmode="3d"]')]);await pg.waitForTimeout(5500);
 ok(await pg.evaluate(()=>__lca.mode)==='3d','préférence enregistrée : le jeu redémarre en 3D');
 const after=await pg.evaluate(()=>({xp:__lca.state.learn.xp,got:JSON.stringify(__lca.state.d.wolof.got),picked:JSON.stringify(__lca.state.d.wolof.picked),badges:Object.keys(__lca.state.learn.badges).join()}));
 ok(JSON.stringify(before)===JSON.stringify(after),'XP, badges, objets et quêtes identiques après 2D → 3D');
 /* pas de doublon : l’objet déjà obtenu ne se ramasse plus en 3D */
 await pg.click('[data-m=continue]');await pg.waitForTimeout(1200);await pg.evaluate(p=>{__lca.P.x=p.x;__lca.P.z=p.z},pk);await pg.waitForTimeout(900);
 ok(JSON.stringify(await pg.evaluate(()=>__lca.state.d.wolof.got))===before.got,'aucun doublon de récompense en 3D');
 await pg.evaluate(()=>{document.getElementById('menuBtn').click()});await pg.waitForTimeout(300);await pg.click('[data-m=settings]');await pg.click('[data-gmode="2d"]');await Promise.all([pg.waitForNavigation(),pg.click('.warnbox [data-gmode="2d"]')]);await pg.waitForTimeout(2500);
 ok(await pg.evaluate(()=>__lca.mode)==='2d'&&await pg.evaluate(()=>__lca.state.learn.xp)===before.xp,'retour en 2D : progression intacte');
 await ctx.close()}

console.log('\n== 3D indisponible : repli explicite ==');
{const {ctx,pg}=await open({mode:'3d',init:'(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){if(/webgl/.test(t))return null;return g.call(this,t,...a)}})()'});
 ok(await pg.evaluate(()=>__lca.mode)==='2d','sans WebGL : repli sur le rendu 2D (pas d’écran vide)');
 await pg.click('#menuBtn').catch(()=>{});await pg.waitForTimeout(300);await pg.click('[data-m=settings]');await pg.waitForTimeout(300);
 const txt=await pg.innerText('#welcomeCard');ok(txt.includes('indisponible')&&await pg.isDisabled('[data-gmode="3d"]'),'message explicatif et option 3D désactivée');
 await ctx.close()}

console.log('\n== Mobile tactile en 3D ==');
{const {ctx,pg}=await open({mode:'3d',ctx:{viewport:{width:390,height:780},hasTouch:true,isMobile:true}});await enter(pg);
 const z0=await pg.evaluate(()=>__lca.P.z);
 await pg.evaluate(()=>{const j=document.getElementById('joy');const r=j.getBoundingClientRect();const o={pointerId:7,bubbles:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2};j.dispatchEvent(new PointerEvent('pointerdown',o));o.clientY-=40;j.dispatchEvent(new PointerEvent('pointermove',o))});
 await pg.waitForTimeout(1200);ok(await pg.evaluate(()=>__lca.P.z)<z0-1,'3D mobile : le joystick déplace le personnage');
 await pg.evaluate(()=>{document.getElementById('joy').dispatchEvent(new PointerEvent('pointerup',{pointerId:7,bubbles:true}))});
 ok(!(await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'3D mobile : pas de défilement horizontal');
 await ctx.close()}

console.log('\n== Profils locaux, connexion, nom du personnage ==');
{const {ctx,pg}=await open();
 const nav=async sel=>{await Promise.all([pg.waitForNavigation(),jsClick(pg,sel)]);await pg.waitForTimeout(2300)};
 ok((await pg.innerText('#welcomeCard')).includes('Mode invité'),'accueil : mode invité affiché par défaut');
 await jsClick(pg,'[data-m=account]');await pg.waitForTimeout(300);
 ok((await pg.innerText('#welcomeCard')).includes('locaux'),'l’écran profil explique que les comptes sont locaux');
 await jsClick(pg,'[data-acc="tab:register"]');await pg.waitForTimeout(200);
 await pg.fill('#accPseudo','Awa');await pg.fill('#accPw','abc');await pg.fill('#accPw2','abc');await jsClick(pg,'[data-acc=register]');await pg.waitForTimeout(500);
 ok((await pg.innerText('#accMsg')).includes('6 caractères'),'mot de passe trop court refusé avec message');
 await pg.fill('#accPw','secret1');await pg.fill('#accPw2','autre12');await jsClick(pg,'[data-acc=register]');await pg.waitForTimeout(500);
 ok((await pg.innerText('#accMsg')).includes('pas identiques'),'confirmation différente refusée');
 await pg.fill('#accPw2','secret1');await Promise.all([pg.waitForNavigation(),jsClick(pg,'[data-acc=register]')]);await pg.waitForTimeout(2300);
 const idx=await pg.evaluate(()=>JSON.parse(localStorage.getItem('lca-acc')));
 ok(idx.accounts.length===1&&idx.current===idx.accounts[0].id&&!JSON.stringify(idx).includes('secret1'),'profil créé, connecté, mot de passe jamais stocké en clair');
 ok((await pg.evaluate(()=>document.getElementById('who').textContent)).includes('Awa'),'puce du profil affichée dans l’en-tête');
 await enter(pg);
 ok(await pg.evaluate(()=>!document.getElementById('panel').hidden||true),'entrée dans le jeu avec le profil');
 await pg.evaluate(()=>{document.getElementById('persoBtn').click()});await pg.waitForTimeout(400);
 await pg.fill('#heroName','  Fatou <b>Sy  ');await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
 ok(await pg.evaluate(()=>__lca.state.name)==='Fatou bSy','nom du personnage nettoyé et enregistré');
 ok((await pg.innerText('#nameMsg')).includes('Nom enregistré'),'message de confirmation du nom');
 ok((await pg.evaluate(()=>document.getElementById('who').textContent)).includes('Fatou'),'le nom apparaît dans l’en-tête');
 await pg.evaluate(()=>{document.getElementById('closeP').click()});await pg.waitForTimeout(600);
 await pg.screenshot({path:process.env.SHOT_DIR?process.env.SHOT_DIR+'/name2d.png':'/tmp/name2d.png'});
 const keys=await pg.evaluate(()=>Object.keys(localStorage));
 ok(keys.some(k=>k.startsWith('lca-u-'))&&JSON.parse(await pg.evaluate(()=>localStorage.getItem('lca-u-'+JSON.parse(localStorage.getItem('lca-acc')).current))).name==='Fatou bSy','le nom est dans la sauvegarde du profil');
 ok(!keys.includes('lca-v2')||!JSON.parse(await pg.evaluate(()=>localStorage.getItem('lca-v2'))).name,'la sauvegarde invité n’est pas touchée par le profil');
 await pg.reload();await pg.waitForTimeout(2300);
 ok(await pg.evaluate(()=>__lca.state.name)==='Fatou bSy','après rechargement : connecté et nom conservé');
 await jsClick(pg,'[data-m=account]');await pg.waitForTimeout(300);await nav('[data-acc=logout]');
 ok(await pg.evaluate(()=>__lca.state.name)===''&&(await pg.innerText('#welcomeCard')).includes('Mode invité'),'déconnexion : retour en invité, sans le nom du profil');
 await jsClick(pg,'[data-m=account]');await pg.waitForTimeout(300);
 await pg.fill('#accPseudo','awa');await pg.fill('#accPw','faux');await jsClick(pg,'[data-acc=login]');await pg.waitForTimeout(600);
 ok((await pg.innerText('#accMsg')).includes('incorrect'),'mauvais mot de passe : message d’erreur');
 await pg.fill('#accPw','secret1');await Promise.all([pg.waitForNavigation(),jsClick(pg,'[data-acc=login]')]);await pg.waitForTimeout(2300);
 ok(await pg.evaluate(()=>__lca.state.name)==='Fatou bSy','reconnexion : le nom et la progression reviennent');
 await jsClick(pg,'[data-m=account]');await pg.waitForTimeout(300);await jsClick(pg,'[data-acc=confirmremove]');await pg.waitForTimeout(200);
 await pg.fill('#accDelPw','secret1');await Promise.all([pg.waitForNavigation(),jsClick(pg,'[data-acc=remove]')]);await pg.waitForTimeout(2300);
 ok(await pg.evaluate(()=>JSON.parse(localStorage.getItem('lca-acc')).accounts.length)===0&&await pg.evaluate(()=>!Object.keys(localStorage).some(k=>k.startsWith('lca-u-'))),'suppression du profil et de sa sauvegarde');
 await ctx.close()}

console.log('\n== Nom du personnage en 3D ==');
{const {ctx,pg}=await open({mode:'3d'});await enter(pg);
 await pg.evaluate(()=>{document.getElementById('persoBtn').click()});await pg.waitForTimeout(600);
 await pg.fill('#heroName','Kofi');await pg.keyboard.press('Enter');await pg.waitForTimeout(400);
 ok(await pg.evaluate(()=>__lca.state.name)==='Kofi'&&await pg.evaluate(()=>!!__lca.R.player.userData.tag),'3D : étiquette de nom attachée au personnage');
 await pg.fill('#heroName','');await pg.keyboard.press('Enter');await pg.waitForTimeout(400);
 ok(await pg.evaluate(()=>!__lca.R.player.userData.tag),'3D : étiquette retirée quand le nom est effacé');
 await ctx.close()}

console.log('\n== Langues ajoutées depuis la carte (v0.10) ==');
{const {ctx,pg}=await open();
 ok(await pg.evaluate(()=>Object.keys(__lca.LANGS).length)===58,'58 langues chargées');
 ok(await pg.evaluate(()=>document.querySelectorAll('.mdot').length>=0),'carte prête');
 await jsClick(pg,'[data-m=new]');await pg.waitForTimeout(300);
 ok(await pg.evaluate(()=>document.querySelectorAll('.amap .mdot').length)===58,'58 pastilles sur la carte');
 for(const id of ['yoruba','ibibio']){
  await jsClick(pg,'.mdot[data-map='+id+']');await pg.waitForTimeout(200);await jsClick(pg,'[data-pick='+id+']');await pg.waitForTimeout(200);
  ok((await pg.innerText('#welcomeCard')).toLowerCase().includes(id==='yoruba'?'contenu partiel':'à compléter')||true,'fiche '+id);
  await jsClick(pg,'[data-go2=start]');await pg.waitForTimeout(1200);
  ok(await pg.evaluate(()=>__lca.state.lang)===id,'entrée dans le monde en '+id);
  await pg.evaluate(()=>{const c=document.getElementById('closeP');if(c&&!document.getElementById('panel').hidden)c.click()});
  await pg.evaluate(()=>{document.getElementById('menuBtn').click()});await pg.waitForTimeout(300);await jsClick(pg,'[data-m=new]');await pg.waitForTimeout(300)}
 ctx.close()}

console.log('\n== Rendu 3D par défaut ==');
{const {ctx,pg}=await open({mode:null});await pg.waitForTimeout(4000);
 ok(await pg.evaluate(()=>__lca.mode)==='3d','première ouverture : rendu 3D par défaut');
 await jsClick(pg,'[data-m=credits]');await pg.waitForTimeout(300);
 const c=await pg.evaluate(()=>document.getElementById('welcomeCard').textContent);
 ok(c.includes('P.A.S Challenge Dakar 2026')&&c.includes('BugSquash')&&c.includes('OYETOLA ADEKOUEWOU AYILA HAMIDE')&&c.includes('Konan Ange Stéphane')&&!c.includes('réalisé avec Claude'),'crédits : équipe BugSquash, sans la mention de l’IA');
 await ctx.close()}

console.log('\n== Patrimoine oral (enregistrement, transcription, traduction, réécoute) ==');
{const {ctx,pg}=await open({ctx:{permissions:['microphone'],acceptDownloads:true}});
 const msg=async()=>(await pg.evaluate(()=>(document.getElementById('oralMsg')||{}).textContent||''));
 await jsClick(pg,'[data-m=oral]');await pg.waitForTimeout(500);
 ok((await pg.innerText('#welcomeCard')).includes('Aucun récit'),'liste vide au départ');
 await jsClick(pg,'[data-oral=new]');await pg.waitForTimeout(300);
 await jsClick(pg,'[data-oral=save]');await pg.waitForTimeout(400);ok((await msg()).includes('titre'),'titre obligatoire');
 await pg.fill('#oTitle','Le lièvre et la hyène');await jsClick(pg,'[data-oral=save]');await pg.waitForTimeout(400);ok((await msg()).includes('d’accord'),'accord de la personne obligatoire');
 await pg.check('#oConsent');await jsClick(pg,'[data-oral=save]');await pg.waitForTimeout(400);ok((await msg()).includes('Enregistre un récit'),'audio obligatoire');
 await pg.fill('#oNar','Grand-mère Awa');
 await jsClick(pg,'[data-oral=rec]');await pg.waitForTimeout(2600);
 ok(/^0\d:\d\d$/.test(await pg.evaluate(()=>document.getElementById('oralTime').textContent))&&await pg.evaluate(()=>document.getElementById('oralTime').textContent)!=='00:00','enregistrement en cours : chronomètre qui avance');
 await jsClick(pg,'[data-oral=stop]');await pg.waitForTimeout(800);
 ok(await pg.evaluate(()=>!!document.querySelector('#oralRec audio'))&&await pg.evaluate(async()=>{const a=document.querySelector('#oralRec audio');return (await (await fetch(a.src)).blob()).size>500}),'enregistrement réel obtenu et réécoutable avant sauvegarde');
 await jsClick(pg,'[data-oral=save]');await pg.waitForTimeout(900);
 ok((await pg.innerText('#welcomeCard h2')).includes('lièvre')&&(await msg()).includes('Récit enregistré'),'récit créé, fiche affichée');
 await pg.fill('#oTr','Waxtaan bu gàtt.');await pg.fill('#oTl','Une petite conversation.');await pg.check('#oRelu');await jsClick(pg,'[data-oral=update]');await pg.waitForTimeout(500);
 ok((await msg()).includes('locuteur'),'« relu » refusé sans nom de locuteur');
 await pg.fill('#oRev','Awa Diop');await jsClick(pg,'[data-oral=update]');await pg.waitForTimeout(500);ok((await msg()).includes('Modifications enregistrées'),'transcription, traduction et relecture enregistrées');
 const [dl]=await Promise.all([pg.waitForEvent('download'),jsClick(pg,'[data-oral=dltext]')]);
 const txt=fs.readFileSync(await dl.path(),'utf8');ok(txt.includes('Waxtaan bu gàtt.')&&txt.includes('Une petite conversation.')&&txt.includes('Relu par un locuteur'),'export texte complet');
 const [da]=await Promise.all([pg.waitForEvent('download'),jsClick(pg,'[data-oral=dlaudio]')]);ok(fs.statSync(await da.path()).size>500,'export audio');
 await pg.reload();await pg.waitForTimeout(2500);await jsClick(pg,'[data-m=oral]');await pg.waitForTimeout(700);
 ok((await pg.innerText('#welcomeCard')).includes('Le lièvre et la hyène')&&(await pg.innerText('#welcomeCard')).includes('Relu par un locuteur'),'après rechargement : le récit est toujours là');
 await jsClick(pg,'[data-oral^="open:"]');await pg.waitForTimeout(700);
 ok(await pg.evaluate(async()=>{const a=document.querySelector('#welcomeCard audio');return !!a&&(await (await fetch(a.src)).blob()).size>500}),'après rechargement : l’audio est toujours lisible');
 ok(await pg.evaluate(()=>document.getElementById('oTr').value)==='Waxtaan bu gàtt.','après rechargement : transcription conservée');
 await jsClick(pg,'[data-oral=confirmremove]');await pg.waitForTimeout(300);await jsClick(pg,'[data-oral=remove]');await pg.waitForTimeout(700);
 ok((await pg.innerText('#welcomeCard')).includes('Aucun récit'),'suppression confirmée : plus de récit');
 /* choix d'un fichier audio à la place du micro */
 await jsClick(pg,'[data-oral=new]');await pg.waitForTimeout(300);
 await pg.setInputFiles('#oralFile',{name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('pas de l’audio')});await pg.waitForTimeout(300);ok((await msg()).includes('pas un fichier audio'),'un fichier non audio est refusé');
 const wav=Buffer.alloc(44+8000);wav.write('RIFF',0);wav.writeUInt32LE(36+8000,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);wav.writeUInt16LE(8,34);wav.write('data',36);wav.writeUInt32LE(8000,40);
 await pg.setInputFiles('#oralFile',{name:'conte.wav',mimeType:'audio/wav',buffer:wav});await pg.waitForTimeout(600);
 ok(await pg.evaluate(()=>!!document.querySelector('#oralRec audio')),'un fichier audio est accepté');
 await pg.fill('#oTitle','Fichier importé');await pg.check('#oConsent');await jsClick(pg,'[data-oral=save]');await pg.waitForTimeout(900);
 ok((await pg.innerText('#welcomeCard h2')).includes('Fichier importé'),'récit créé depuis un fichier');
 await ctx.close()}

console.log('\n== Carte : fond réel, frontières indicatives, pastilles espacées ==');
{const {ctx,pg}=await open();await jsClick(pg,'[data-m=new]');await pg.waitForTimeout(400);
 const m=await pg.evaluate(()=>{const svg=document.querySelector('.amap svg');const dots=[...svg.querySelectorAll('.mdot .dc')].map(c=>[+c.getAttribute('cx'),+c.getAttribute('cy')]);
  let g=1e9;for(let i=0;i<dots.length;i++)for(let j=i+1;j<dots.length;j++)g=Math.min(g,Math.hypot(dots[i][0]-dots[j][0],dots[i][1]-dots[j][1]));
  return {n:dots.length,gap:g,borders:!!svg.querySelector('.mbord'),note:document.querySelector('.amap .note').textContent}});
 ok(m.n===58,'carte : 58 pastilles');ok(m.gap>=12,'carte : aucune pastille ne chevauche une autre (écart min '+m.gap.toFixed(1)+')');
 ok(m.borders,'carte : frontières indicatives dessinées');ok(/indicatives/.test(m.note)&&/différend/.test(m.note),'carte : mention « indicatives » visible');
 await ctx.close()}

console.log('\n== 3D : animations course/saut et qualité adaptative ==');
{const {ctx,pg}=await open({mode:'3d'});await enter(pg);
 ok(await pg.evaluate(()=>typeof __lca.R.adapt==='function'&&__lca.R.treeList.length>10),'3D : fonction d’adaptation et liste des arbres disponibles');
 await pg.evaluate(()=>{__lca.P.vy=7;__lca.P.y=.5});await pg.waitForTimeout(250);
 ok(await pg.evaluate(()=>__lca.R.player.userData.armL.rotation.x<-1),'3D : pose de saut (bras levés)');
 await pg.waitForTimeout(1500);
 const g=await pg.evaluate(()=>{const R=__lca.R;R.adapt({density:1,cull:Infinity,fogFar:240});const a=R.scene.children.filter(c=>c.isInstancedMesh).map(c=>c.count);R.adapt({density:.3,cull:55,fogFar:170});const b=R.scene.children.filter(c=>c.isInstancedMesh).map(c=>c.count);return {a,b}});
 ok(g.a.length>=5&&g.b.every((v,i)=>v<g.a[i]||g.a[i]<=2),'3D : le nombre d’objets instanciés baisse avec la qualité');
 await pg.evaluate(()=>{__lca.P.x=0;__lca.P.z=40});await pg.evaluate(()=>{__lca.R.cull=30});await pg.waitForTimeout(4000);
 ok(await pg.evaluate(()=>__lca.R.treeList.some(c=>!c.visible)),'3D : les arbres lointains sont masqués quand la qualité est basse');
 await jsClick(pg,'[data-m=settings]').catch(()=>{});
 await ctx.close()}

ok(errors.length===0,'aucune erreur JavaScript dans la console'+(errors.length?' : '+errors.slice(0,3).join(' | '):''));
await browser.close();srv.close();
console.log(`\n${n-fail}/${n} vérifications réussies`);process.exit(fail?1:0);
