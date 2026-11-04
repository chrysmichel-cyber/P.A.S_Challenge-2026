/* Vie du village : habitants avec routines, marché, cuisine, artisanat, espaces de rassemblement, interactions pédagogiques, mixage sonore.
   Module pur (aucun accès au DOM) : navigateur (LCA.life) et Node (tests). Les rendus 3D et 2D lisent les mêmes données.
   Honnêteté culturelle : les décors, métiers et gestes sont des représentations STYLISÉES et générales, non propres à un peuple précis.
   Les mots des langues viennent uniquement des données existantes (brouillons non validés) ; quand un mot manque, il n'est pas inventé. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.life=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const inHours=(h,a,b)=>a<=b?(h>=a&&h<b):(h>=a||h<b);

/* Apparences (même format que les habitants existants). */
const LOOK={
 vendF:{top:0xd4513b,bottom:0x3b4a8c,skirt:1,wrap:0xe6b422,pat:1,skin:0x5a3a28,jewel:1},
 vendM:{top:0x3a9a6a,bottom:0x2b3a55,sleeve:true,cap:0xf4efe4,skin:0x4f3426},
 cook:{top:0x2e8b6a,bottom:0x6a3b8a,skirt:1,wrap:0xd4513b,pat:2,skin:0x5a3a28,jewel:1},
 potter:{top:0xb5532a,bottom:0x3a2a55,boubou:0xb5532a,skin:0x4a2f22},
 weaver:{top:0x3a6ea5,bottom:0x7a5a2a,boubou:0x3a6ea5,cap:0xf4efe4,skin:0x4f3426},
 chatA:{top:0xe0a020,bottom:0x2f7a5a,skirt:1,pat:3,wrap:0x3a6ea5,skin:0x5a3a28,jewel:1,old:1},
 chatB:{top:0xf2efe6,bottom:0x7a5a2a,boubou:0x2f6a5a,cap:0xd97a1f,skin:0x4a2f22,old:1},
 kidA:{top:0xd9462c,bottom:0x2b3a55,sleeve:true,hair:0x111111,skin:0x4a2f22},
 kidB:{top:0x3a9a6a,bottom:0x2b3a55,sleeve:true,afro:1,hair:0x111111,skin:0x5a3a28},
 kidC:{top:0xe8a317,bottom:0x6a3b8a,skirt:1,pat:0,skin:0x5a3a28,hair:0x111111},
 gardener:{top:0x7a8a3a,bottom:0x3a2a55,sleeve:true,cap:0xd9b24a,skin:0x4f3426},
 water:{top:0x3a6ea5,bottom:0x6a3b8a,skirt:1,wrap:0xe0a020,pat:1,skin:0x5a3a28,jewel:1},
 griot:{top:0x7a3b8a,bottom:0x3a2a55,boubou:0x7a3b8a,cap:0xf0e6d0,old:1,skin:0x4a2f22,staff:1}};
const POR=(bg,top,skin,wrap)=>({bg,top,skin,wrap});

/* Stations : chaque lieu a une liste de candidats pour son centre ; layout() garde le premier emplacement libre.
   props : décors (t = type, dx/dz = décalage, r = rotation, s = taille). res : habitants (act = activité, off = décalage, h = heures de présence). */
const STATIONS=[
 {id:'market',name:'Le marché',zone:'marche',cand:[[16,26],[-16,30],[30,22],[-34,20],[22,-30]],radius:8,
  props:[{t:'stall',dx:-4.5,dz:0,r:.1,c:0},{t:'stall',dx:0,dz:-.6,r:0,c:1},{t:'stall',dx:4.5,dz:0,r:-.1,c:2},{t:'basket',dx:-2.2,dz:2.4,c:0},{t:'basket',dx:2.4,dz:2.8,c:1},{t:'basket',dx:-6.6,dz:2.2,c:2},{t:'jar',dx:6.8,dz:2.4,s:1},{t:'mat',dx:0,dz:4.2,s:1.4,c:3}],
  res:[{id:'vend1',role:'Vendeuse de fruits et légumes',act:'sell',look:'vendF',off:[-4.5,-.7],h:[7,18.5],face:0,por:POR('#2b4a6b','#d4513b','#5a3a28','#e6b422'),wares:'fruits'},
       {id:'vend2',role:'Vendeur de céréales et de poisson séché',act:'sell',look:'vendM',off:[4.5,-.7],h:[7,18.5],face:0,por:POR('#3b3a1d','#3a9a6a','#4f3426','#f4efe4'),wares:'grains'}]},
 {id:'cook',name:'La cour de cuisine',zone:'cuisine',cand:[[-8,16],[10,36],[-26,26],[34,10],[-6,34]],radius:5,
  props:[{t:'firepot',dx:0,dz:0,s:1},{t:'stool',dx:-1.8,dz:.8},{t:'stool',dx:1.8,dz:1.2},{t:'jar',dx:2.6,dz:-1.4,s:.9},{t:'basket',dx:-2.6,dz:-1.2,c:1},{t:'mortar',dx:-1.2,dz:-2.2}],
  res:[{id:'cook1',role:'Cuisinière',act:'cook',look:'cook',off:[0,-1.1],h:[6,21],por:POR('#5a2b1a','#2e8b6a','#5a3a28','#d4513b'),face:0}]},
 {id:'craft',name:'L’atelier d’artisanat',zone:'atelier',cand:[[-30,-8],[30,-8],[26,-34],[-26,-38],[34,26]],radius:5,
  props:[{t:'wheel',dx:-1.6,dz:0},{t:'jar',dx:-3.2,dz:-1.4,s:1},{t:'jar',dx:-3.8,dz:.4,s:.7},{t:'loom',dx:2.8,dz:0,r:.2},{t:'mat',dx:0,dz:2.8,s:1.2,c:2}],
  res:[{id:'potter',role:'Potier',act:'craft',look:'potter',off:[-1.6,1.1],h:[8,17.5],por:POR('#4a2b1a','#b5532a','#4a2f22','#f0e6d0'),face:Math.PI,craft:'poterie'},
       {id:'weaver',role:'Tisserand',act:'craft',look:'weaver',off:[2.8,1.2],h:[8,17.5],por:POR('#1f3550','#3a6ea5','#4f3426','#f4efe4'),face:Math.PI,craft:'tissage'}]},
 {id:'chat',name:'Le banc de l’arbre à palabres',zone:'palabres',cand:[[-14,-22],[12,-20],[-36,-18],[38,-4],[-6,40]],radius:4,
  props:[{t:'bench',dx:0,dz:0,r:0,s:1.3},{t:'mat',dx:3.4,dz:.6,s:1.1,c:1},{t:'stool',dx:-2.6,dz:1.5}],
  res:[{id:'chatA',role:'Voisine',act:'chat',look:'chatA',off:[-.7,0],h:[6,22],seated:true,por:POR('#7a3b1d','#e0a020','#5a3a28','#3a6ea5'),face:Math.PI},
       {id:'chatB',role:'Voisin',act:'chat',look:'chatB',off:[.7,0],h:[6,22],seated:true,por:POR('#2f4a3a','#f2efe6','#4a2f22','#d97a1f'),face:Math.PI}]},
 {id:'kids',name:'L’aire de jeux des enfants',zone:'jeux',cand:[[10,6],[-12,8],[18,-12],[-18,-30],[26,26]],radius:5,
  props:[{t:'mat',dx:0,dz:0,s:1.7,c:4}],
  res:[{id:'kid1',role:'Enfant',act:'play',look:'kidA',off:[1.8,0],h:[7,19],scale:.58,por:POR('#5a2a2a','#d9462c','#4a2f22',null),loop:2.6,sp:2.7},
       {id:'kid2',role:'Enfant',act:'play',look:'kidB',off:[-1.8,0],h:[7,19],scale:.54,por:POR('#2a4a3a','#3a9a6a','#5a3a28',null),loop:2.0,sp:2.3},
       {id:'kid3',role:'Enfant',act:'play',look:'kidC',off:[0,1.8],h:[7,19],scale:.52,por:POR('#4a3a1a','#e8a317','#5a3a28',null),loop:3.0,sp:2.9}]},
 {id:'fire',name:'Le feu du soir',zone:'feu',cand:[[-4,22],[6,-12],[-24,-30],[22,34],[-38,10]],radius:5,
  props:[{t:'fire',dx:0,dz:0,s:1},{t:'mat',dx:-2.8,dz:0,s:1,c:0},{t:'mat',dx:2.8,dz:0,s:1,c:2},{t:'stool',dx:0,dz:-3}],
  res:[{id:'griot',role:'Conteur du soir',act:'tell',look:'griot',off:[0,-3],h:[17,23],seated:true,por:POR('#3b2a55','#7a3b8a','#4a2f22','#f0e6d0'),face:0}]},
 {id:'garden',name:'Le jardin potager',zone:'jardin',cand:[[30,30],[-30,34],[-40,-26],[40,-18],[-34,2],[-47,20],[7,26],[16,-22]],radius:6,
  props:[{t:'garden',dx:-2.2,dz:0,c:0},{t:'garden',dx:2.2,dz:0,c:1},{t:'garden',dx:0,dz:3.4,c:2},{t:'fence',dx:0,dz:-2.4,s:1},{t:'basket',dx:4.6,dz:2.4,c:2}],
  res:[{id:'gardener',role:'Jardinier',act:'garden',look:'gardener',off:[0,1.6],h:[6,18],face:Math.PI,por:POR('#3a4a1d','#7a8a3a','#4f3426','#d9b24a')}]},
 {id:'pond',name:'Le point d’eau',zone:'eau',cand:[[-38,8],[38,-12],[-30,-14],[34,22],[-6,-36],[-35,-12],[-47,26],[-2,-13],[13,-22],[-23,17],[55,14]],radius:6,
  props:[{t:'pond',dx:0,dz:0,s:1},{t:'bridge',dx:0,dz:0,r:0},{t:'rocks',dx:3.4,dz:1.2},{t:'jar',dx:-3.8,dz:2.6,s:.9},{t:'mat',dx:3.6,dz:3.6,s:1,c:3}],
  res:[{id:'watercarrier',role:'Porteuse d’eau',act:'water',look:'water',off:[-3,3.6],h:[6,18],face:Math.PI*.5,por:POR('#1d3a5a','#3a6ea5','#5a3a28','#e0a020')}]}];
/* Entrée du village : porte fixe au sud ; le point d'apparition est juste devant (à l'extérieur), personnage tourné vers l'intérieur (vers le nord, -z) : il franchit la porte en avançant. */
const GATE={x:0,z:35,spawn:{x:0,z:41.5},heading:Math.PI};
const GATE_STATION={id:'gate',name:'L’entrée du village',zone:'entree',cand:[[GATE.x,GATE.z]],radius:3,fixed:true,props:[{t:'gate',dx:0,dz:0,c:0}],res:[]};

/* Choisit pour chaque station le premier centre libre. ok(x,z,r) : le point est libre ; used : zones déjà prises. */
function layout(ok,opt){
 opt=opt||{};ok=ok||(()=>true);const out=[],taken=(opt.avoid||[]).slice();
 [GATE_STATION].concat(STATIONS).forEach(st=>{
  if(st.fixed){out.push({id:st.id,name:st.name,zone:st.zone,x:st.cand[0][0],z:st.cand[0][1],radius:st.radius,fixed:true,props:st.props.map(p=>Object.assign({},p,{x:st.cand[0][0]+p.dx,z:st.cand[0][1]+p.dz})),res:[]});taken.push([st.cand[0][0],st.cand[0][1],st.radius]);return}
  for(const c of st.cand){
   const pts=[[c[0],c[1],st.radius]].concat(st.props.map(p=>[c[0]+p.dx,c[1]+p.dz,1.1]));
   if(taken.some(t=>Math.hypot(c[0]-t[0],c[1]-t[1])<st.radius+t[2]+2))continue;
   if(!pts.every(p=>ok(p[0],p[1],p[2])))continue;
   taken.push([c[0],c[1],st.radius]);
   out.push({id:st.id,name:st.name,zone:st.zone,x:c[0],z:c[1],radius:st.radius,
    props:st.props.map(p=>Object.assign({},p,{x:c[0]+p.dx,z:c[1]+p.dz})),
    res:st.res.map(r=>Object.assign({},r,{st:st.id,x:c[0]+r.off[0],z:c[1]+r.off[1],kind:LOOK[r.look],scale:r.scale||1}))});
   break}});
 return out}
/* Présence selon l'heure : marché et ateliers le jour, feu et conteur le soir, tout le monde dort la nuit. */
function present(res,h){return inHours(h,res.h[0],res.h[1])}
function phase(h){return h<5.5||h>=22?'nuit':h<8?'aube':h<17?'jour':h<19.5?'soir':'veillée'}
const PHASE_FR={nuit:'Le village dort.',aube:'Le village se réveille.',jour:'Le village est en pleine activité.',soir:'Le village se rassemble.',veillée:'C’est l’heure des histoires.'};
/* Événement du moment (indicatif, pour l'ambiance et les dialogues). */
function eventAt(h){return h>=8&&h<12?{id:'market',fr:'Jour de marché animé : les étals sont garnis.'}:h>=17&&h<22?{id:'gathering',fr:'Rassemblement autour du feu : on raconte des histoires.'}:null}

/* Animation d'un habitant (angles en radians), à partir de l'activité et du temps. Mouvements variés par phase individuelle. */
function pose(act,t,ph){
 const s=Math.sin,k=t+ph;
 switch(act){
  case 'cook':return {armR:-1.1+s(k*3.2)*.45,armL:-.7+s(k*3.2+1.6)*.25,head:s(k*.8)*.25,bob:s(k*3.2)*.012};
  case 'craft':return {armR:-1.0+s(k*2.6)*.55,armL:-1.0+s(k*2.6+3.1)*.55,head:-.25+s(k*.7)*.12,bob:0};
  case 'sell':return {armR:s(k*.9)>.7?-1.4+s(k*5)*.25:-.12+s(k*.5)*.1,armL:-.1+s(k*.6+1)*.08,head:s(k*.55)*.4,bob:s(k*1.3)*.006};
  case 'chat':return {armR:s(k*1.1)>.3?-.9+s(k*4)*.3:-.15,armL:s(k*.8+2)>.5?-.7+s(k*3.4)*.25:-.1,head:s(k*.9)*.35,bob:0};
  case 'tell':return {armR:-.6+s(k*1.6)*.7,armL:-.5+s(k*1.2+1)*.5,head:s(k*.6)*.3,bob:0};
  case 'garden':return {armR:-.9+s(k*2.2)*.6,armL:-.5+s(k*2.2+1.2)*.3,head:-.3+s(k*.6)*.12,bob:s(k*2.2)*.02};
  case 'water':return {armR:-.5+s(k*.8)*.25,armL:-.2+s(k*.7+1)*.15,head:s(k*.6)*.3,bob:s(k*1.4)*.008};
  case 'play':return {armR:s(k*6),armL:-s(k*6),head:s(k*2)*.2,bob:Math.abs(s(k*5))*.06};
  default:return {armR:0,armL:0,head:s(k*.5)*.15,bob:s(k*1.2)*.005}}}
/* Gestes parasites (fidget) : toutes les 8 à 14 s, un geste bref et différent (s'étirer, se gratter la tête, regarder autour, changer d'appui),
   ajouté à la pose de l'activité. Les activités qui occupent les mains (cuisine, atelier, jardin, jeu) ne reçoivent que les gestes de tête et d'appui. */
const BUSY={cook:1,craft:1,garden:1,play:1};
function fidget(act,t,ph){
 const L=8+((ph*3.7)%1+1)%1*6,u=t+ph*7,n=Math.floor(u/L),f=u-n*L,dur=2.6;
 if(f>dur)return {armR:0,armL:0,head:0,bob:0,kind:null};
 const b=Math.pow(Math.sin(Math.PI*f/dur),.6),pool=BUSY[act]?['look','shift']:['stretch','scratch','look','shift'],kind=pool[((n*7+Math.floor(ph*10))%pool.length+pool.length)%pool.length];
 switch(kind){
  case 'stretch':return {armR:-2.5*b,armL:-2.5*b,head:0,bob:0,kind};
  case 'scratch':return {armR:-2.1*b,armL:0,head:.3*b,bob:0,kind};
  case 'look':return {armR:0,armL:0,head:.8*Math.sin(f*2.4)*b,bob:0,kind};
  default:return {armR:0,armL:0,head:.15*b,bob:.01*Math.sin(f*3)*b,kind}}}
/* Pose complète : activité + geste parasite (le geste remplace le mouvement des bras seulement s'il est actif). */
function poseFull(act,t,ph){const p=pose(act,t,ph),f=fidget(act,t,ph);
 if(!f.kind)return p;const hand=f.kind==='stretch'||f.kind==='scratch';
 return {armR:hand?f.armR:p.armR,armL:f.kind==='stretch'?f.armL:p.armL,head:p.head+f.head,bob:p.bob+f.bob,fid:f.kind}}
/* Petits mouvements d'attente : de temps en temps, un habitant regarde autour de lui. */
function idleLook(t,ph){const c=Math.sin(t*.37+ph*3.1);return c>.82?Math.sin(t*2.2+ph)*.6:0}
/* Chemin circulaire des enfants qui jouent. */
function loopPos(st,r,t,ph){const a=t*(r.sp||2.4)/(r.loop||2.5)+ph;return {x:st.x+Math.cos(a)*(r.loop||2.5),z:st.z+Math.sin(a)*(r.loop||2.5),h:Math.atan2(-Math.sin(a),Math.cos(a))+Math.PI/2*0}}

/* Colliders des objets (mêmes valeurs en 2D et en 3D). Le pont laisse un couloir libre au-dessus de l'eau ; les bords du bassin bloquent. */
const COLL_T={stall:[[0,0,1.7]],jar:[[0,0,.45]],bench:[[0,0,1.1]],firepot:[[0,0,.8]],fire:[[0,0,.7]],wheel:[[0,0,.6]],loom:[[0,0,1]],
 gate:[[-2.6,0,.55],[2.6,0,.55]],fence:[[-1.8,0,.8],[1.8,0,.8]],pond:[[-2,-2.2,1.1],[0,-2.2,1.1],[2,-2.2,1.1],[-2,2.2,1.1],[0,2.2,1.1],[2,2.2,1.1],[-2.9,-1.3,.5],[2.9,-1.3,.5],[-2.9,1.3,.5],[2.9,1.3,.5]],rocks:[[0,0,.6]]};
function colliders(p){return (COLL_T[p.t]||[]).map(c=>({x:p.x+c[0]*(p.s||1),z:p.z+c[1]*(p.s||1),r:c[2]*(p.s||1)}))}

/* Point d'apparition : le plus proche point libre devant l'entrée (ok(x,z,r) fourni par le rendu : arbres, maisons, objets). Toujours défini. */
function spawn(ok){
 ok=ok||(()=>true);const b=GATE.spawn;
 for(let d=0;d<=14;d+=1){for(const dx of (d?[-d,d]:[0])){for(const dz of [0,-d*.5]){const x=clamp(b.x+dx,-60,60),z=clamp(b.z+dz,-44,43.5);if(ok(x,z,1.4))return {x,z,heading:GATE.heading}}}}
 return {x:b.x,z:b.z,heading:GATE.heading,forced:true}}

/* ====== Animaux du village : poules, chèvres, moutons (même liste pour la 2D et la 3D) ====== */
const ANIMALS=[
 {id:'hen1',type:'poule',st:'cook',off:[3.4,2.6],r:3.2,sp:.8},{id:'hen2',type:'poule',st:'cook',off:[-3.2,3.0],r:3.2,sp:.7},{id:'hen3',type:'poule',st:'garden',off:[5.4,-1.5],r:3,sp:.75},
 {id:'goat1',type:'goat',st:'kids',off:[5,5],r:5,sp:.9},{id:'goat2',type:'goat',st:'kids',off:[-5,4],r:5,sp:.8},{id:'goat3',type:'goat',st:'chat',off:[4,4],r:4,sp:.7},
 {id:'sheep1',type:'mouton',st:'pond',off:[0,-5],r:4.5,sp:.6},{id:'sheep2',type:'mouton',st:'pond',off:[3,-6],r:4.5,sp:.55},{id:'sheep3',type:'mouton',st:'garden',off:[-5,4],r:4,sp:.6}];
const ANIMAL_SCALE={poule:.55,goat:.9,mouton:.85};
function animalsFor(stations,ok){
 ok=ok||(()=>true);const out=[];
 ANIMALS.forEach(a=>{const st=stations.find(s=>s.id===a.st);if(!st)return;
  let x=st.x+a.off[0],z=st.z+a.off[1];if(!ok(x,z,.8)){x=st.x+a.off[0]*.5;z=st.z+a.off[1]*.5;if(!ok(x,z,.6))return}
  out.push(Object.assign({},a,{x,z,hx:x,hz:z,tx:x,tz:z,h:0,wait:0,moving:false,ph:Math.random()*6,scale:ANIMAL_SCALE[a.type]||1}))});
 return out}
/* Un pas de déplacement : l'animal choisit un point proche de chez lui, y va, s'arrête, picore ou broute, repart. rnd() injectable pour les tests. */
function wander(a,dt,rnd,ok){
 rnd=rnd||Math.random;
 if(a.wait>0){a.wait-=dt;a.moving=false;return a}
 const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);
 if(d<.15){a.wait=1+rnd()*4;const ang=rnd()*6.283,r=rnd()*a.r;const nx=a.hx+Math.cos(ang)*r,nz=a.hz+Math.sin(ang)*r;if(!ok||ok(nx,nz,.6)){a.tx=nx;a.tz=nz}a.moving=false;return a}
 const st=Math.min(d,a.sp*dt),nx=a.x+dx/d*st,nz=a.z+dz/d*st;
 if(ok&&!ok(nx,nz,.5)){a.tx=a.x;a.tz=a.z;a.wait=.5;a.moving=false;return a}
 a.x=nx;a.z=nz;a.h=Math.atan2(dx,dz);a.moving=true;return a}

/* ====== Interactions pédagogiques ====== */
const WARES={fruits:['mangues','bananes','papayes','oranges','tomates','piments','gombos','aubergines'],grains:['mil','sorgho','riz','arachides','haricots','poisson séché','sel']};
const GARDEN=['mil','maïs','haricots','gombos','piments','manioc','légumes-feuilles'];
const CRAFTS={
 poterie:['La poterie : on façonne l’argile à la main ou sur un tour, on la laisse sécher, puis on la cuit au feu.','Marmites, jarres et bols servent à cuisiner, à transporter et à garder l’eau fraîche.'],
 tissage:['Le tissage : des fils tendus sur un métier sont croisés avec la navette pour former une bande de tissu.','Les couleurs et les motifs varient beaucoup d’un peuple à l’autre ; ici, c’est une image générale.']};
const NOTE='Description générale et stylisée, non propre à un peuple précis.';
const wordsOf=(L,g)=>(L.words||[]).map((w,i)=>({g:w[0],wo:w[1],fr:w[2],i})).filter(w=>w.g===g);
/* Un dialogue : {pages:[{wo,fr,say}], learn:[indices de mots], go, later}. Jamais de mot inventé. */
function dialog(st,res,L,ctx){
 ctx=ctx||{};const pages=[],learn=[],name=(L&&L.name)||'cette langue',greet=(L&&L.hello)||'';
 const push=(fr,w)=>{pages.push({fr,wo:w?w.wo:'',say:w?w.wo:''});if(w)learn.push(w.i)};
 if(res.act==='sell'){
  const foods=wordsOf(L,'f'),list=WARES[res.wares]||WARES.fruits;
  push('« Bienvenue au marché ! » '+(greet?'On te salue en '+name+' : '+greet+'.':''),null);
  if(foods.length>=2){const a=foods.slice(0,3);push('Sur l’étal, des produits et leurs noms en '+name+' : '+a.map(w=>w.wo+' ('+w.fr.toLowerCase()+')').join(', ')+'.',a[0]);
   if(foods.length>3){const b=foods.slice(3,6);push('Autres mots du marché et de la cuisine : '+b.map(w=>w.wo+' ('+w.fr.toLowerCase()+')').join(', ')+'.',b[0])}}
  else push('Ici on vend : '+list.slice(0,5).join(', ')+'. Les noms de ces produits en '+name+' ne sont pas encore documentés dans le jeu : rien n’a été inventé.',null);
  push('Les marchés sont des lieux de rencontre autant que de commerce. '+NOTE,null);
 }else if(res.act==='cook'){
  const r=L&&L.recipes&&L.recipes[0];
  push('« Viens voir ! » On cuisine au feu de bois dans une marmite, avec un mortier et un pilon pour écraser les épices.',null);
  if(r)push('Au menu du pays : '+r.name+'. '+(r.intro||'')+' Ouvre l’onglet Recettes pour la préparer pas à pas.',null);
  else push('Aucune recette n’est encore documentée pour '+name+' : le contenu est à compléter avec des locuteurs.',null);
  const f=wordsOf(L,'f');if(f.length)push('Mot de cuisine en '+name+' : '+f[0].wo+' ('+f[0].fr.toLowerCase()+').',f[0]);
  push(NOTE,null);
 }else if(res.act==='craft'){
  const c=CRAFTS[res.craft]||CRAFTS.poterie;c.forEach(t=>push(t,null));push(NOTE,null);
 }else if(res.act==='chat'){
  const s=wordsOf(L,'s');
  if(s.length>=2){push('Les voisins se saluent et bavardent en '+name+' : « '+s[0].wo+' » ('+s[0].fr.toLowerCase()+').',s[0]);push('Ils répondent : « '+s[1].wo+' » ('+s[1].fr.toLowerCase()+').',s[1])}
  else push('Les voisins bavardent à l’ombre. Les salutations en '+name+' sont encore à documenter : rien n’a été inventé.',null);
  push('À l’ombre, on prend des nouvelles de chacun. Saluer avant de parler est une marque de respect dans de nombreuses cultures.',null);
 }else if(res.act==='play'){
  const n=wordsOf(L,'c');
  if(n.length>=3){push('Les enfants comptent en jouant : '+n.slice(0,3).map(w=>w.wo+' ('+w.fr.toLowerCase()+')').join(', ')+'.',n[0])}
  else push('Les enfants courent et rient. Les nombres en '+name+' ne sont pas encore tous documentés dans le jeu.',null);
 }else if(res.act==='garden'){
  const f=wordsOf(L,'f');push('Dans le jardin, on cultive : '+GARDEN.slice(0,5).join(', ')+'. On sarcle, on arrose et on récolte au fil des saisons.',null);
  if(f.length)push('Mot de la nourriture en '+name+' : '+f[0].wo+' ('+f[0].fr.toLowerCase()+').',f[0]);else push('Les noms de ces plantes en '+name+' ne sont pas encore documentés dans le jeu : rien n’a été inventé.',null);
  push(NOTE,null);
 }else if(res.act==='water'){
  const w=(L&&L.words||[]).map((r,i)=>({g:r[0],wo:r[1],fr:r[2],k:r[3],i})).find(r=>r.k==='eau');
  push('Le point d’eau sert à boire, à cuisiner et à laver. On y vient chaque jour avec des jarres.',null);
  if(w)push('L’eau, en '+name+' : '+w.wo+'.',w);else push('Le mot « eau » en '+name+' n’est pas encore documenté dans le jeu : rien n’a été inventé.',null);
  push(NOTE,null);
 }else if(res.act==='tell'){
  const t=L&&L.tales&&L.tales[0];
  if(t){push('« Écoute bien… » Ce soir : '+t.title+'.',null);(t.paras||[]).slice(0,2).forEach(p=>push(p.replace(/\*/g,''),null));push('Retrouve la suite dans l’onglet Contes.',null)}
  else{const h=L&&L.history&&L.history[0];push('« Écoute bien… » '+(h||'Aucun conte n’est encore documenté pour '+name+'.'),null)}
 }else push('Bonjour !',null);
 return {pages,learn,go:'Suivant',later:'Au revoir'}}

/* ====== Mixage sonore par zone (gains 0–1) ====== */
function mix(p,hour,daylight,st){
 const near=(id,r)=>{const s=(st||[]).find(x=>x.id===id);if(!s)return 0;return clamp(1-Math.hypot(p.x-s.x,p.z-s.z)/r,0,1)};
 const day=clamp(daylight,0,1),hum=day>.3;
 return {
  wind:+(.22+.1*(1-day)).toFixed(3),
  birds:+(day*.42*(1-.6*near('market',14))).toFixed(3),
  crickets:+((1-day)*.4).toFixed(3),
  market:+(near('market',17)*(hour>=7&&hour<18.5?1:0)*.9).toFixed(3),
  cook:+(near('cook',10)*(hour>=6&&hour<21?1:0)*.7).toFixed(3),
  fire:+(Math.max(near('fire',10),near('cook',6))*.8).toFixed(3),
  voices:+(Math.max(near('chat',10),near('kids',9))*(hum?1:.2)*.7).toFixed(3),
  water:+(clamp((-40-p.z)/14,0,1)*.8).toFixed(3)}}

return {fidget,poseFull,STATIONS,GATE,colliders,COLL_T,LOOK,spawn,ANIMALS,animalsFor,wander,layout,present,phase,PHASE_FR,eventAt,pose,idleLook,loopPos,dialog,mix,inHours,WARES,CRAFTS};
});
