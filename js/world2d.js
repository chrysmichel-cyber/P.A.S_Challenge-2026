/* Moteur de rendu 2D peint : sol en perspective, décors par région, personnages, animaux, effets.
   Il ne connaît pas les quêtes : main.js lui donne l’état du joueur et lit les objets à ramasser, les collisions et les points d’interaction. */
(function(LCA){
'use strict';
const A=LCA.art,TAU=Math.PI*2;
const {rnd,reseed,RR,hx,mixC,shade,rgba,mk,clamp,blob,softShadow,foliage,strokes,spr,grain}=A;

/* ---------- thèmes visuels ---------- */
const TH={
 ouest:{sky:['#274a96','#5f86cc','#f0b07c','#ffe2b2'],sun:[.74,.12,'#fff0c0'],fog:'#efc79a',cloud:['#fff8ee','#f6e2d2','#c4a8bc','rgba(120,100,170,.5)'],
  ground:{base:'#a9803f',dark:'#7e5c2c',light:'#caa060',path:'#e0b878',grass:'#86973c',gdark:'#5c7430',green:.45},hills:'ouest',hcol:['#a7a0b8','#8b6a4c','#6f5a34'],
  water:['#3b87b0','#8fd0e8'],pal:{leaf:['#2f4a1c','#46701e','#69922c','#95b840','#c8dc6a'],trunk:['#b08a62','#8a6a46','#5a4028'],rock:['#5a4a3a','#8a7a6a','#bfae96'],grass:['#6a8a2c','#88a63a','#a9c458','#c9a850'],flowers:['#ff6fa8','#ffd23f','#ff7a3d','#fff','#b06cff']},
  hut:{box:0,wall:['#b97b46','#c98d52','#a86d3c'],roof:['#d8a24f','#cf9a45','#e0ad5d'],band:['#d9b46a','#7a3b2a','#2f6f6a']},flora:['baobab','palm','banana','acacia'],mini:['#8f8a3d','#3b87b0','#b97b46']},
 nord:{sky:['#2a6fb4','#76b0e0','#f3dba8','#fdeccb'],sun:[.7,.1,'#fffbe0'],fog:'#f2dcb0',cloud:['#ffffff','#f6efe2','#cbbfb8','rgba(150,130,160,.4)'],
  ground:{base:'#cfa86a',dark:'#a07c44',light:'#e8cc92',path:'#ecd9a8',grass:'#9aa650',gdark:'#728438',green:.14},hills:'nord',hcol:['#d9b98a','#d6b070','#c99d5a'],
  water:['#2fb0b8','#9ae6e6'],pal:{leaf:['#2d5a24','#47802c','#6ca03a','#98c24c','#cde06a'],trunk:['#b8946a','#8a6a46','#5a4028'],rock:['#7a6448','#a8906a','#d8c294'],grass:['#aab050','#c4c466','#d8d484','#a89a48'],flowers:['#ffd23f','#fff','#ff9a3d','#ff6fa8']},
  hut:{box:1,wall:['#e3c48f','#d8b27a','#cfa56a'],roof:['#c99a5a','#bf8f50','#d2a465'],band:['#2a7ab0','#8a4a2a','#2f8a7a']},flora:['palm'],mini:['#d9bb80','#2fb0b8','#e3c48f']},
 est:{sky:['#2860b8','#74a4dc','#f4bb7e','#ffe5b4'],sun:[.7,.11,'#fff3c4'],fog:'#f2cb98',cloud:['#fffaf0','#f8e4d0','#c8aab8','rgba(130,100,160,.5)'],
  ground:{base:'#b8883e',dark:'#865f2a',light:'#dab06a',path:'#e6c080',grass:'#c0a040',gdark:'#8a7a2c',green:.18},hills:'est',hcol:['#a8a4bc','#a88a58','#8a7040'],
  water:['#2a9ab0','#8ae0ea'],pal:{leaf:['#3a5a1c','#5a7e24','#82a432','#aac648','#d4e070'],trunk:['#a88a62','#7a5a3a','#4a3220'],rock:['#6a5a44','#9a8a70','#cfc0a0'],grass:['#c8a840','#dcbc54','#ecd274','#a89038'],flowers:['#ffd23f','#ff7a3d','#fff','#ff6fa8']},
  hut:{box:1,wall:['#f3ead8','#eadfc6','#e0d2b4'],roof:['#a84a2a','#b85a30','#8a3a24'],band:['#1f7aa0','#8a2a2a','#2a8a6a']},flora:['baobab','palm','banana','acacia'],mini:['#c9b04a','#2a9ab0','#f3ead8']},
 centrale:{sky:['#2a4a64','#608c9c','#aecaa8','#dbe8c6'],sun:[.66,.2,'#fff6d0'],fog:'#a8c8a4',cloud:['#f2f6ee','#d8e4d4','#a8bcae','rgba(70,100,100,.5)'],
  ground:{base:'#6a4a2c',dark:'#3c2a18',light:'#9a7648',path:'#b08c5c',grass:'#3f7a2a',gdark:'#27561e',green:.8},hills:'centrale',hcol:['#7a9aa0','#3a6a46','#27502e'],
  water:['#3a6a4a','#8ac0a0'],pal:{leaf:['#14381a','#1f5224','#2e7230','#4a9440','#82c25a'],trunk:['#8a7a62','#5e4e3a','#3a2c20'],rock:['#4a4a3c','#7a7a64','#a8a88c'],grass:['#2f6a24','#46882e','#68a844','#88c460'],flowers:['#ff6fa8','#ffd23f','#fff','#ff7a3d']},
  hut:{box:0,wall:['#9a6a3e','#8a5a32','#7a4a2a'],roof:['#7a7a3a','#6a6a30','#8a8a44'],band:['#5a3a22','#7a3b2a','#2f6f4a']},flora:['palm','banana'],mini:['#3f6a2a','#3a6a4a','#9a6a3e']},
 australe:{sky:['#164a9c','#5898dc','#f4d29c','#fff0d0'],sun:[.72,.12,'#fff8e0'],fog:'#f4dcb2',cloud:['#ffffff','#f8ece0','#cdbcc0','rgba(130,110,150,.4)'],
  ground:{base:'#b2603a',dark:'#7e3c22',light:'#d88c60',path:'#e8b088',grass:'#b0a048',gdark:'#7a8a34',green:.28},hills:'australe',hcol:['#a89cb0','#a8663e','#8a7a40'],
  water:['#2a7ab0','#8cd0ea'],pal:{leaf:['#3a5420','#587a2a','#7ea03a','#a6c452','#d0e078'],trunk:['#a08060','#7a5a3a','#4a3220'],rock:['#6a5848','#9a8670','#cfbca0'],grass:['#b6a444','#cabc5c','#dccf7c','#98883c'],flowers:['#ff6fa8','#ffd23f','#fff','#e8452a']},
  hut:{box:0,wall:['#cdb99c','#c2ac8c','#dccaa8'],roof:['#cfae64','#c29c54','#dab870'],band:['#c0392b','#2a6fb0','#e0b020']},flora:['baobab','acacia'],mini:['#b59a52','#2a7ab0','#cdb99c']}
};
const REGIONS=Object.keys(TH);

/* ---------- constantes du monde ---------- */
const GX0=-92,GZ0=-118,GW_U=184,GH_U=180,PPW=6; /* texture du sol : unités et pixels par unité */
const PATHS=[[0,48,0,0],[-26,7,0,2],[0,2,27,2],[0,0,-18,-11],[0,0,23,-17],[0,0,0,-58],[23,-17,48,-17],[27,2,38,-1.35]];
const HUTS=[[-10,-32,1,1],[9,-35,1.1,0],[-38,-30,1,1],[40,-30,1,0],[-42,0,1,1],[44,16,1,0],[-32,30,1,0],[34,32,1,1],[-12,-48,.9,0],[18,-46,.9,0],[-48,-14,.9,0],[52,-8,.9,0]];
const PICK_DEF=[['poisson',-6,18],['poisson',16,-26],['riz',10,12],['riz',-30,-8],['eau',-14,-26],['eau',34,6],['viande',4,-22],['viande',-4,32]];
const SPECIALS=[[-5,-24],[4,-44],[38,36],[-19,-10],[-22,6],[24,1],[24,-17],[0,0],[0,-55],[38,-5],[13,-9],[30,-26],[-24,-17],[-22,8.6],[-12,-1],[-30,-2],[-8,25],[52,34]];
const dseg=(px,pz,s)=>{const ax=s[0],az=s[1],dx=s[2]-ax,dz=s[3]-az,t=clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(px-ax-t*dx,pz-az-t*dz)};
const minPath=(x,z)=>Math.min(...PATHS.map(p=>dseg(x,z,p)));

/* ---------- sprites propres au rendu ---------- */
const mkBoat=(sail,col)=>spr(8,6,(c)=>{softShadow(c,0,-.05,3.2,.35,.25);c.fillStyle=shade(col,-.4);c.beginPath();c.moveTo(-3.4,-.7);c.quadraticCurveTo(-3,0,-1.6,0);c.lineTo(2,0);c.quadraticCurveTo(3.2,0,3.7,-.9);c.lineTo(3.4,-.9);c.quadraticCurveTo(0,-.4,-3.4,-.7);c.fill();
 const g=c.createLinearGradient(0,-1.1,0,0);g.addColorStop(0,shade(col,.25));g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.moveTo(-3.5,-.85);c.quadraticCurveTo(-3,-.05,-1.6,-.05);c.lineTo(2,-.05);c.quadraticCurveTo(3.3,-.05,3.8,-1.05);c.quadraticCurveTo(0,-.55,-3.5,-.85);c.fill();
 if(sail){c.fillStyle='#5d3a1e';c.fillRect(-.06,-4.6,.12,3.8);c.fillStyle='#f4eedd';c.beginPath();c.moveTo(.1,-4.5);c.quadraticCurveTo(2.4,-3,2.6,-1);c.lineTo(.1,-1);c.fill();c.fillStyle='rgba(120,100,150,.25)';c.beginPath();c.moveTo(.1,-4.5);c.quadraticCurveTo(1.4,-3.4,1.5,-1);c.lineTo(.1,-1);c.fill()}});
const mkFence=()=>spr(15,2.4,(c)=>{for(let i=0;i<8;i++){c.fillStyle='#5d3a1e';c.fillRect(-7+i*2-.09,-1.5,.18,1.5);c.fillStyle='#8a5a30';c.fillRect(-7+i*2-.09,-1.5,.07,1.5)}c.fillStyle='#7a4a26';c.fillRect(-7,-1.25,14,.14);c.fillRect(-7,-.75,14,.14)});
const mkColonnade=(col)=>spr(18,9,(c)=>{softShadow(c,0,-.05,8,.8,.25);for(let i=0;i<5;i++){const x=-7+i*3.5;const g=c.createLinearGradient(x-.6,0,x+.6,0);g.addColorStop(0,shade(col,.2));g.addColorStop(.6,col);g.addColorStop(1,shade(col,-.4));c.fillStyle=g;c.fillRect(x-.55,-6.2,1.1,6.2);c.fillStyle=shade(col,.1);c.fillRect(x-.85,-6.6,1.7,.5);c.fillRect(x-.85,-.4,1.7,.4);strokes(c,x-.5,-6,1,5.6,shade(col,-.3),8,.5,1.57)}
 c.fillStyle=col;c.fillRect(-8,-7.6,16,1);c.fillStyle=shade(col,-.3);c.fillRect(-8,-6.8,16,.2);c.fillStyle=shade(col,.2);c.fillRect(-8,-7.65,16,.12)});
const mkTower=(col)=>spr(6,12,(c)=>{softShadow(c,0,-.05,2.6,.5,.28);const g=c.createLinearGradient(-2,0,2,0);g.addColorStop(0,shade(col,.2));g.addColorStop(.6,col);g.addColorStop(1,shade(col,-.4));c.fillStyle=g;c.beginPath();c.moveTo(-2.4,0);c.lineTo(-1.8,-10);c.lineTo(1.8,-10);c.lineTo(2.4,0);c.fill();
 for(let i=0;i<4;i++){c.fillStyle=col;c.fillRect(-1.8+i*1.2,-10.8,.8,.8)}strokes(c,-2,-10,4,10,shade(col,-.3),30,.5,1.55);c.fillStyle='#24140c';c.beginPath();c.moveTo(-.4,0);c.lineTo(-.4,-1.8);c.quadraticCurveTo(0,-2.3,.4,-1.8);c.lineTo(.4,0);c.fill();c.fillStyle='#24140c';c.fillRect(-.3,-6,.6,1.1)});
const mkStoneTower=(col)=>spr(6,9,(c)=>{softShadow(c,0,-.05,2.8,.5,.28);const g=c.createLinearGradient(-2.4,0,2.4,0);g.addColorStop(0,shade(col,.2));g.addColorStop(.6,col);g.addColorStop(1,shade(col,-.4));c.fillStyle=g;c.beginPath();c.moveTo(-2.6,0);c.quadraticCurveTo(-2,-5,-1.6,-8);c.quadraticCurveTo(0,-8.8,1.6,-8);c.quadraticCurveTo(2,-5,2.6,0);c.fill();for(let r=0;r<9;r++){c.strokeStyle=shade(col,-.35);c.globalAlpha=.5;c.lineWidth=.05;c.beginPath();c.moveTo(-2.4+r*.12,-r*.95);c.lineTo(2.4-r*.12,-r*.95);c.stroke()}c.globalAlpha=1});
const mkStoneBlock=(col)=>spr(3,3.2,(c)=>{softShadow(c,0,-.04,1.4,.3,.25);const g=c.createLinearGradient(-1.2,0,1.2,0);g.addColorStop(0,shade(col,.2));g.addColorStop(1,shade(col,-.35));c.fillStyle=g;c.fillRect(-1.2,-2.6,2.4,2.6);c.strokeStyle=shade(col,-.4);c.lineWidth=.05;for(let r=1;r<4;r++){c.beginPath();c.moveTo(-1.2,-r*.65);c.lineTo(1.2,-r*.65);c.stroke()}for(let r=0;r<4;r++){c.beginPath();c.moveTo(r%2?-.3:.4,-r*.65);c.lineTo(r%2?-.3:.4,-(r+1)*.65);c.stroke()}});
const mkClothStall=()=>spr(6,4.6,(c)=>{reseed(500);softShadow(c,0,-.05,2.4,.4,.25);c.fillStyle='#5d3a1e';[-2.1,2.1].forEach(x=>c.fillRect(x-.07,-3.4,.14,3.4));c.fillRect(-2.2,-3.4,4.4,.12);
 for(let k=0;k<6;k++){const x=-1.8+k*.72;A.patFill(c,k,x,-3.3,.62,2.3);c.fillStyle='rgba(30,10,40,.2)';c.fillRect(x+.4,-3.3,.22,2.3)}});
const mkLantern=()=>spr(1.6,4.4,(c)=>{softShadow(c,0,-.03,.4,.1,.3);c.fillStyle='#6b4a2a';c.fillRect(-.07,-3.6,.14,3.6);const g=c.createRadialGradient(0,-3.8,0,0,-3.8,.9);g.addColorStop(0,'rgba(255,200,100,.9)');g.addColorStop(1,'rgba(255,170,60,0)');c.fillStyle=g;c.beginPath();c.arc(0,-3.8,.9,0,TAU);c.fill();c.fillStyle='#ffc060';c.beginPath();c.arc(0,-3.8,.2,0,TAU);c.fill()});
const mkSoilRow=(P)=>spr(2,1.4,(c)=>{for(let i=0;i<3;i++){const x=-.6+i*.6;c.strokeStyle=P.grass[1];c.lineWidth=.1;c.lineCap='round';c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+.1,-.7,x+.3,-1.1);c.stroke();c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x-.1,-.6,x-.35,-.95);c.stroke();c.fillStyle='#e8c34a';c.fillRect(x-.04,-.7,.08,.28)}});

/* ---------- renderer ---------- */
function createRenderer(canvas){
 const ctx=canvas.getContext('2d');
 let W=800,H=600,dpr=1,ppu=50,F=900,camH=5,hy=240,cx0=400,camX=0,cz=18,oy=0,theme='ouest',th=TH.ouest,S={},ents=[],coll=[],huts=[],picks=[],hid=[],inter=[],hits=[],low=false;
 let skyC=null,groundC=null,bgC=[],sunBlink=0;
 const dyn={wand:[],anim:[],perch:[],birds:[],flies:[],puffs:[],leaves:[],clouds:[],bflies:[],fish:{t:-3,x:0,z:-84},fireK:1,wellT:0,mortT:0,fieldT:0,shakers:[]};
 const labels={};
 /* étiquettes de texte */
 const lkf=()=>H<460?.66:H<640?.82:1;
 function label(text){const k=text;if(labels[k])return labels[k];const c=mk(10,10),x=c.getContext('2d');let fs=40;x.font='700 '+fs+'px Figtree,system-ui,sans-serif';while(x.measureText(text).width>420&&fs>18){fs-=2;x.font='700 '+fs+'px Figtree,system-ui,sans-serif'}
  const tw=x.measureText(text).width+34;c.width=Math.ceil(tw);c.height=64;const g=c.getContext('2d');g.font='700 '+fs+'px Figtree,system-ui,sans-serif';g.fillStyle='rgba(12,20,44,.78)';g.beginPath();if(g.roundRect)g.roundRect(0,6,tw,52,22);else g.rect(0,6,tw,52);g.fill();g.strokeStyle='rgba(255,220,160,.5)';g.lineWidth=2;g.stroke();g.fillStyle='#fff6e6';g.textAlign='center';g.textBaseline='middle';g.fillText(text,tw/2,33);return labels[k]=c}

 /* ----- construction du thème ----- */
 function build(id){
  theme=TH[id]?id:'ouest';th=TH[theme];const P=th.pal;S={};ents=[];coll=[];huts=[];inter=[];hits=[];
  dyn.wand=[];dyn.anim=[];dyn.perch=[];dyn.birds=[];dyn.flies=[];dyn.puffs=[];dyn.leaves=[];dyn.clouds=[];dyn.bflies=[];dyn.shakers=[];
  reseed(11);
  S.hutR=[0,1,2].map(k=>A.hutRound(th.hut,k));S.hutB=[0,1,2].map(k=>A.houseBox(th.hut,k));S.school=A.school(P);
  const MUSEUM_DRAW={
   nord:(c)=>{const R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};const W='#f2ecdf',W2='#dcd1bb',B='#2d6fa8',B2='#1d4f7c',G='#c9a24a',D='#2a1d15';
    softShadow(c,0,-.05,6.4,.95,.24);R(-6.5,-.5,13,.5,'#cfc3aa');R(-6,-.85,12,.35,'#e3d9c4');
    R(-5.2,-5.2,10.4,4.35,W);R(-5.3,-4.1,10.6,.32,B);R(-5.35,-3.8,10.7,.08,G);R(-5.4,-5.5,10.8,.3,W2);for(let i=-3;i<=3;i++)R(i*1.4-.1,-6.0,.2,.5,W);
    const dome=(x,y,r,col,sy)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,r,r*(sy||1),0,Math.PI,0);c.fill()};
    [-5.2,5.2].forEach(x=>{R(x-.6,-5.9,1.2,5.05,W);R(x-.7,-6.1,1.4,.22,W2);dome(x,-6.1,.62,B,1.2);R(x-.03,-7.6,.06,.5,G)});
    R(-2.1,-7.4,4.2,1.9,W);R(-2.25,-7.5,4.5,.2,B);dome(0,-7.5,2.05,B2,1.05);R(-.04,-9.6,.08,.9,G);c.fillStyle=G;c.beginPath();c.arc(0,-9.7,.17,0,7);c.fill();
    [-1.5,-.5,.5,1.5].forEach(x=>R(x-.17,-7.2,.34,.8,D));
    R(-2.2,-6,4.4,5.15,'#f8f3e8');R(-2.35,-6.2,4.7,.3,B);[-1.6,-.8,0,.8,1.6].forEach((x,i)=>R(x-.24,-6.6,.48,.34,i%2?G:B));
    c.fillStyle=D;c.beginPath();c.moveTo(-1.05,-.85);c.lineTo(-1.05,-2.9);c.arc(0,-2.9,1.05,Math.PI,0);c.lineTo(1.05,-.85);c.fill();
    c.strokeStyle=B;c.lineWidth=.2;c.beginPath();c.moveTo(-1.22,-.85);c.lineTo(-1.22,-2.9);c.arc(0,-2.9,1.22,Math.PI,0);c.lineTo(1.22,-.85);c.stroke();
    R(-.95,-2.8,.9,1.95,B2);R(.05,-2.8,.9,1.95,B2);R(-.03,-2.8,.06,1.95,G);for(let i=0;i<5;i++){R(-.9,-1.0-i*.36,.8,.05,G);R(.1,-1.0-i*.36,.8,.05,G)}
    [-3.9,3.9].forEach(x=>{R(x-.6,-4.1,1.2,1.6,D);c.strokeStyle=G;c.lineWidth=.04;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(x+k*.22,-4.1);c.lineTo(x+k*.22,-2.5);c.stroke();c.beginPath();c.moveTo(x-.6,-3.3+k*.3);c.lineTo(x+.6,-3.3+k*.3);c.stroke()}R(x-.75,-4.25,1.5,.18,B);R(x-.75,-2.5,1.5,.18,B)});
    [-4.3,4.3].forEach(x=>{R(x-.35,-.75,.7,.75,'#b5452a');c.strokeStyle='#3f7a34';c.lineWidth=.12;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x,-.75);c.lineTo(x+i*.55,-1.7);c.stroke()}});
   },
   est:(c)=>{const R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};const C='#e9dcc0',C2='#cdbc98',Wd='#4a2c18',Br='#d9a441';
    softShadow(c,0,-.05,6.4,.95,.24);R(-6.5,-.5,13,.5,'#bdb092');R(-6,-.85,12,.35,'#d6c9a8');
    R(-5.2,-5.6,10.4,4.75,C);R(-5.3,-1.9,10.6,.2,C2);R(-5.35,-5.95,10.7,.35,C2);for(let i=-4;i<=4;i++)R(i*1.2-.35,-6.5,.7,.55,C);
    [-5.2,5.2].forEach(x=>{R(x-.75,-7.2,1.5,6.35,C);R(x-.85,-7.5,1.7,.3,C2);c.fillStyle=C2;c.beginPath();c.moveTo(x-.45,-7.5);c.lineTo(x+.45,-7.5);c.lineTo(x,-8.6);c.fill()});
    [-3.3,-2.2,2.2,3.3].forEach(x=>{R(x-.35,-4.7,.7,1.3,C2);R(x-.22,-4.55,.44,.95,'#8a7a5c')});
    R(-2.5,-6.6,5,5.75,C);R(-2.65,-6.9,5.3,.3,C2);
    R(-1.5,-5.4,3,4.55,Wd);R(-1.2,-5.1,2.4,4.25,'#6a3e20');R(-.03,-5.0,.06,4.1,'#e8b43c');
    for(let r=0;r<6;r++)for(let k=-4;k<=4;k++)if(k){c.fillStyle=Br;c.beginPath();c.arc(k*.26,-1.3-r*.42,.05,0,7);c.fill()}
    R(-1.6,-5.7,3.2,.3,Wd);for(let k=-3;k<=3;k++)R(k*.4-.06,-5.95,.12,.3,Br);
    c.strokeStyle='#e8b43c';c.lineWidth=.08;c.strokeRect(-1.2,-5.1,2.4,4.25);
    [-3.4,3.4].forEach(x=>{R(x-1.2,-.85,2.4,.5,C2);R(x-1.2,-1.2,2.4,.4,C)});
    R(-1.6,-6.2,3.2,.12,Wd);for(let k=-6;k<=6;k++)R(k*.24-.03,-6.55,.06,.4,Wd);
    [-3.9,3.9].forEach(x=>{R(x-.55,-3.4,1.1,1.3,'#2a1d15');[-1,1].forEach(s=>R(x+s*.6-.1,-3.45,.2,1.4,'#2f8f86'))});
    R(-.03,-9.2,.06,2,'#5e3a22');R(.03,-9.2,.8,.5,'#b5452a');
    [-1.3,1.3].forEach(x=>{c.fillStyle='#3f7a34';c.beginPath();c.ellipse(x,-.3,.4,.3,0,0,7);c.fill()});
   },
   centrale:(c)=>{const R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)},Poly=(pts,f)=>{c.fillStyle=f;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()};const Cl='#a8683c',Cl2='#8c5430',Raf='#d9b66a',Th='#b8964a',Th2='#967734',Wd='#5a3a22',kub=['#b5452a','#f0dcae','#2a1d15','#d9a441'];
    softShadow(c,0,-.05,6.4,.95,.24);R(-6.4,-.75,12.8,.75,Wd);for(let i=-6;i<=5;i++)R(i*1.05,-.7,.05,.65,'#3e2616');
    R(-1.6,-.4,3.2,.4,'#6a4528');R(-1.3,-.6,2.6,.25,'#7a5233');
    R(-5.1,-4.9,10.2,4.15,Cl);for(let i=-12;i<=12;i++)R(i*.4-.09,-4.7,.18,3.7,i%2?Raf:Cl2);for(let i=-12;i<=12;i++){R(i*.4-.17,-4.8,.34,.34,kub[(i+12)%4]);R(i*.4-.17,-1.6,.34,.34,kub[(i+13)%4])}
    Poly([[-6.4,-4.9],[6.4,-4.9],[3.6,-8.4],[-3.6,-8.4]],Th);Poly([[-6.6,-4.7],[6.6,-4.7],[6.4,-5.2],[-6.4,-5.2]],Th2);
    c.strokeStyle='#7a5f28';c.lineWidth=.05;for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(i*.95,-4.9);c.lineTo(i*.55,-8.4);c.stroke()}
    R(-.05,-9.4,.1,1.1,Wd);
    [-1.9,1.9].forEach(x=>{R(x-.22,-4.9,.44,4.15,Wd);for(let r=0;r<5;r++)R(x-.3,-1.2-r*.75,.6,.1,'#d9a441')});
    R(-2.4,-5.05,4.8,.35,Wd);R(-1.8,-5.5,3.6,.4,Th2);
    R(-1.1,-3.2,2.2,2.45,'#2a1d15');R(-.85,-3.0,1.7,2.2,'#3a2414');R(-.04,-3.0,.08,2.2,'#e8b43c');
    c.fillStyle='#5a3a22';c.beginPath();c.ellipse(0,-4.1,.5,.8,0,0,7);c.fill();c.strokeStyle='#e8b43c';c.lineWidth=.06;c.stroke();R(-.3,-4.4,.2,.07,'#f0dcae');R(.1,-4.4,.2,.07,'#f0dcae');R(-.04,-4.35,.08,.6,'#e8b43c');R(-.18,-3.6,.36,.08,'#b5452a');
    [-3.9,3.9].forEach(x=>{R(x-.5,-3.7,1,1.2,'#2a1d15');R(x-.6,-2.55,1.2,.14,Raf);R(x-.6,-3.85,1.2,.14,Raf)});
    [-4.6,4.6].forEach(x=>{R(x-.4,-.6,.8,.6,Cl2);c.strokeStyle='#3f7a34';c.lineWidth=.12;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x,-.6);c.lineTo(x+i*.35,-1.5);c.stroke()}});
   },
   australe:(c)=>{const R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)},Poly=(pts,f)=>{c.fillStyle=f;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()};const S1='#8a7d6b',S2='#7a6e5d',S3='#9a8d78',N=['#d2352b','#1d5fa8','#f2c230','#2e8b57','#201a16'];
    softShadow(c,0,-.05,6.4,.95,.24);R(-6.5,-.5,13,.5,'#6f6454');R(-6,-.85,12,.35,'#80745f');
    for(let r=0;r<6;r++)R(-5.2,-1.6-r*.74+.74,10.4,.74,[S1,S2,S3][r%3]);
    c.strokeStyle='#5a5042';c.lineWidth=.04;for(let r=0;r<6;r++)for(let k=-9;k<=9;k++){c.beginPath();c.moveTo(k*.58+(r%2)*.29,-.86-r*.74);c.lineTo(k*.58+(r%2)*.29,-.12-r*.74);c.stroke()}
    for(let i=-9;i<=9;i++){c.fillStyle=i%2?S3:S2;c.save();c.translate(i*.54,-5.0);c.rotate(Math.PI/4);c.fillRect(-.21,-.21,.42,.42);c.restore()}R(-5.3,-5.5,10.6,.3,S1);
    Poly([[-6.7,-.85],[-3.7,-.85],[-4.2,-7.2],[-6.2,-7.2]],S3);Poly([[-6.2,-7.2],[-4.2,-7.2],[-5.2,-8.1]],S2);
    R(3.6,-.85,2.8,0,S2);Poly([[4.4,-.85],[6.0,-.85],[5.7,-6.2],[4.7,-6.2]],S2);
    R(-2.6,-6.7,5.2,1.2,S2);Poly([[-3.3,-6.6],[3.3,-6.6],[0,-9.2]],'#b8964a');R(-.04,-10,.08,.9,'#5e3a22');
    R(-2.3,-5.6,4.6,4.75,'#f4efe4');R(-2.4,-5.8,4.8,.2,N[4]);for(let i=0;i<8;i++){c.fillStyle=N[i%4];c.save();c.translate(-2.0+i*.57,-5.3);c.rotate(Math.PI/4);c.fillRect(-.26,-.26,.52,.52);c.restore()}
    for(let k=0;k<5;k++){R(-2.2,-1.4-k*.8,.5,.5,N[(k+1)%4]);R(1.7,-1.4-k*.8,.5,.5,N[(k+2)%4])}
    R(-1.15,-4.3,2.3,.16,N[0]);R(-1.15,-4.05,2.3,.16,N[1]);
    R(-1,-3.2,2,2.35,'#2a1d15');R(-.9,-3.1,.85,2.15,'#5e3a22');R(.05,-3.1,.85,2.15,'#5e3a22');R(-.03,-3.1,.06,2.15,'#e8b43c');
    c.fillStyle='#5a3a22';c.beginPath();c.ellipse(0,-4.95,.4,.6,0,0,7);c.fill();R(-.04,-5.2,.08,.45,'#e8b43c');
    [-3.9,3.9].forEach(x=>{R(x-.5,-3.7,1,1.2,'#2a3f55');R(x-.6,-2.55,1.2,.14,N[2]);R(x-.6,-3.85,1.2,.14,N[2])});
    [-4.2,4.2].forEach(x=>{R(x-.35,-.7,.7,.7,S2);c.strokeStyle='#6f9456';c.lineWidth=.14;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x,-.7);c.lineTo(x+i*.55,-1.7);c.stroke()}});
   }
  };
  const museumSign=(c,ty)=>{c.fillStyle='#3d2a1c';c.fillRect(-3,ty,6,.85);c.strokeStyle='#e8b43c';c.lineWidth=.08;c.strokeRect(-2.95,ty+.05,5.9,.75);c.fillStyle='#fff1d2';c.font='700 .46px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('MUSÉE DES MASQUES',0,ty+.44)};
  MUSEUM_DRAW.ouest=(c)=>{
   const R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)},Poly=(pts,f)=>{c.fillStyle=f;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()};
   const WALL='#c98f5b',WALL2='#b67a49',TRIM='#f0dcae',WOOD='#5e3a22',DARK='#2a1d15';
   softShadow(c,0,-.05,6.4,.95,.24);
   /* socle à degrés */
   R(-6.5,-.5,13,.5,'#8e6844');R(-6,-.85,12,.35,'#a87c52');
   /* corps */
   const g=c.createLinearGradient(-5.2,0,5.2,0);g.addColorStop(0,'#a06a3c');g.addColorStop(.5,WALL);g.addColorStop(1,'#946237');R(-5.2,-5.4,10.4,4.55,g);R(-5.3,-3.1,10.6,.22,TRIM);R(-5.4,-5.7,10.8,.3,TRIM);
   /* poutres saillantes */
   [-2.2,-4.0].forEach(y=>{[-1,1].forEach(s=>{R(s>0?5.2:-5.62,y,.42,.16,WOOD)})});
   /* parapet crénelé */
   for(let i=-4;i<=4;i++)R(i*1.15-.4,-6.2,.8,.5,WALL2);
   /* contreforts effilés */
   [-5.2,5.2].forEach(x=>{Poly([[x-.85,-.85],[x+.85,-.85],[x+.5,-6.3],[x-.5,-6.3]],WALL2);Poly([[x-.55,-6.3],[x+.55,-6.3],[x,-7.5]],WALL2);R(x-.04,-8,.08,.55,WOOD);R(x-.7,-3.1,1.4,.2,TRIM)});
   [-3.2,3.2].forEach(x=>{Poly([[x-.55,-.85],[x+.55,-.85],[x+.34,-5.9],[x-.34,-5.9]],WALL2);Poly([[x-.4,-5.9],[x+.4,-5.9],[x,-6.6]],WALL2)});
   /* porche central */
   const pg=c.createLinearGradient(-2.2,0,2.2,0);pg.addColorStop(0,'#b87f4c');pg.addColorStop(.5,'#d49a62');pg.addColorStop(1,'#a8703f');R(-2.2,-7,4.4,6.15,pg);R(-2.4,-7.3,4.8,.4,TRIM);[-1.7,-.85,0,.85,1.7].forEach(x=>R(x-.3,-7.8,.6,.55,WALL2));
   /* porte en arc */
   c.fillStyle=DARK;c.beginPath();c.moveTo(-1.05,-.85);c.lineTo(-1.05,-3.1);c.arc(0,-3.1,1.05,Math.PI,0);c.lineTo(1.05,-.85);c.closePath();c.fill();
   c.strokeStyle=TRIM;c.lineWidth=.2;c.beginPath();c.moveTo(-1.2,-.85);c.lineTo(-1.2,-3.1);c.arc(0,-3.1,1.2,Math.PI,0);c.lineTo(1.2,-.85);c.stroke();
   R(-.04,-3.2,.08,2.35,'#e8b43c');R(-1.35,-.95,2.7,.2,'#c9b08a');
   /* masque sculpté */
   c.fillStyle=WOOD;c.beginPath();c.ellipse(0,-5.55,.55,.85,0,0,7);c.fill();c.strokeStyle='#e8b43c';c.lineWidth=.07;c.stroke();
   R(-.3,-5.85,.2,.07,TRIM);R(.1,-5.85,.2,.07,TRIM);R(-.04,-5.8,.08,.7,'#e8b43c');R(-.2,-5.0,.4,.09,'#b5452a');
   [-1,1].forEach(s=>{c.strokeStyle=WOOD;c.lineWidth=.12;c.beginPath();c.moveTo(s*.4,-6.25);c.lineTo(s*.75,-6.95);c.stroke()});
   /* fenêtres */
   [-3.9,3.9].forEach(x=>{R(x-.55,-3.95,1.1,1.25,'#3c6f78');c.strokeStyle=TRIM;c.lineWidth=.1;c.strokeRect(x-.6,-4,1.2,1.35);[-1,1].forEach(s=>R(x+s*.62-.1,-4,.2,1.35,'#2f8f86'))});
   /* bannières */
   [[-1.75,'#b5452a'],[1.75,'#2f8f86']].forEach(([x,col])=>{R(x-.3,-4.7,.6,2.1,col);R(x-.34,-4.8,.68,.1,'#e8b43c');Poly([[x-.3,-2.6],[x,-2.9],[x+.3,-2.6]],col)});
   /* pots */
   [-6.1,6.1].forEach(x=>{Poly([[x-.4,0],[x+.4,0],[x+.5,-.75],[x-.5,-.75]],'#b5452a');c.fillStyle='#3f7a34';c.beginPath();c.arc(x,-1.2,.62,0,7);c.fill();c.fillStyle='#62a04a';c.beginPath();c.arc(x-.15,-1.35,.35,0,7);c.fill()});
   /* enseigne */
   R(-3,-9,6,.85,'#3d2a1c');c.strokeStyle='#e8b43c';c.lineWidth=.08;c.strokeRect(-2.95,-8.95,5.9,.75);
   c.fillStyle='#fff1d2';c.font='700 .46px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('MUSÉE DES MASQUES',0,-8.56)};
  Object.keys(MUSEUM_DRAW).forEach(k=>{if(k!=='ouest'){const f=MUSEUM_DRAW[k],ty=({nord:-10.9,est:-9.6,centrale:-10.9,australe:-11.3})[k];MUSEUM_DRAW[k]=c=>{f(c);museumSign(c,ty)}}});
  S.museum=spr(15,12.4,MUSEUM_DRAW[theme]||MUSEUM_DRAW.ouest);

  S.wayfinding=spr(5.6,4.2,(c)=>{softShadow(c,0,-.05,2.2,.8,.2);c.fillStyle='#654126';c.fillRect(-.12,-3.5,.24,3.5);c.fillStyle='#744a2b';c.fillRect(-2.5,-3.7,5,.95);c.fillStyle='#e6ca8c';c.lineWidth=.08;c.strokeRect(-2.5,-3.7,5,.95);c.fillStyle='#fff1d2';c.font='700 .43px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('MUSÉE',-.35,-3.22);c.beginPath();c.moveTo(.85,-3.22);c.lineTo(1.75,-3.22);c.lineTo(1.48,-3.02);c.moveTo(1.75,-3.22);c.lineTo(1.48,-3.42);c.strokeStyle='#fff1d2';c.lineWidth=.1;c.stroke()});
  S.stall1=A.stall(P,'#e8892b');S.stall2=A.stall(P,'#3b8a8c');S.cloth=mkClothStall();S.gran=A.granary(P);
  S.jars=['#b5532a','#c9703a','#9a4a2a'].map(c=>A.jar(c));S.well=A.wellSpr();S.lantern=mkLantern();S.fence=mkFence();
  S.bush=[0,1,2].map(k=>A.bush(P,k));S.tuft=[0,1,2,3].map(k=>A.tuft(P,k));S.flower=[0,1,2].map(k=>A.flowerPatch(P,k));S.rock=[0,1,2].map(k=>A.rock(P,k));S.reed=A.reed(P);S.crop=mkSoilRow(P);
  S.baobab=A.treeBaobab(P);S.acacia=[1,2,3].map(k=>A.treeAcacia({leaf:P.leaf,trunk:P.trunk,s:k}));S.palm=[1,2].map(k=>A.treePalm(P));S.banana=A.treeBanana(P);
  S.boat=[mkBoat(theme==='nord'||theme==='est',theme==='nord'?'#c9a25a':theme==='est'?'#e8dcc0':'#7a4a26'),mkBoat(theme==='nord'||theme==='est','#7a4a26')];
  const add=(sp,x,z,sc,o)=>{const e=Object.assign({sp,x,z,sc:sc||1},o||{});ents.push(e);return e};
  const addColl=(x,z,r)=>coll.push({x,z,r});
  const freeSpot=(r,minR)=>{for(let k=0;k<90;k++){const tx=(rnd()-.5)*146,tz=-56+rnd()*96;if(Math.hypot(tx,tz)<(minR||10))continue;let bad=false;SPECIALS.forEach(s=>{if(Math.hypot(tx-s[0],tz-s[1])<8)bad=true});HUTS.forEach(h=>{if(Math.hypot(tx-h[0],tz-h[1])<7)bad=true});coll.forEach(c=>{if(Math.hypot(tx-c.x,tz-c.z)<c.r+r)bad=true});if(bad||minPath(tx,tz)<3.6)continue;return [tx,tz]}return null};
  /* habitations */
  HUTS.forEach((h,i)=>{const e=add(th.hut.box?S.hutB[i%3]:S.hutR[i%3],h[0],h[1],h[2]*1.0);huts.push({x:h[0],z:h[1],s:h[2]});addColl(h[0],h[1],2.6*h[2]);if(h[3])dyn.puffs.push({x:h[0]+.8,z:h[1]+.1,y:th.hut.box?3.4:5.2,age:i*1.3,life:8,k:1})});
  add(S.museum,38,-5,1.12,{label:'Musée des masques',ly:11.6});huts.push({x:38,z:-5,s:1.35});LCA.museum.footprint(38,-5).forEach(c=>addColl(c.x,c.z,c.r));inter.push({id:'museum',type:'museum',name:'la porte du musée',x:38,z:-1.35,key:1,nr:4.2,msg:'Tu franchis la porte du musée des masques.'});
  add(S.wayfinding,27.4,.55,1,{label:'Musée des masques →',ly:4.1});
  {const e=add(th.hut.box?S.hutB[1]:S.hutR[1],-24,-17,1.5,{label:'Maison des contes',ly:th.hut.box?7.4:8.2});huts.push({x:-24,z:-17,s:1.5});addColl(-24,-17,3.9);dyn.puffs.push({x:-23,z:-17.1,y:7,age:2,life:8,k:1.3})}
  add(S.school,30,-26,1,{label:'École du village',ly:7.6});[-3,0,3].forEach(o=>addColl(30+o,-26,2.8));
  add(S.stall1,-22,8.6,1,{label:'Cuisine traditionnelle',ly:4.6});[-1.2,0,1.2].forEach(o=>addColl(-22+o,8.6,.9));
  add(S.stall2,-8,25,1,{label:'Poteries',ly:4.6});[-1.2,0,1.2].forEach(o=>addColl(-8+o,25,.9));
  add(S.cloth,-30,-2,1,{label:'Tissus',ly:4.8});addColl(-32,-2,.4);addColl(-28,-2,.4);
  [[36,22],[-44,-12],[-26,40]].forEach(p=>{add(S.gran,p[0],p[1],1);addColl(p[0],p[1],1.5)});
  [[-16,22],[20,24],[30,10],[-34,-22],[16,-34],[-4,-26]].forEach(p=>{for(let k=0;k<3;k++)add(S.jars[(k+(p[0]|0))&1?k%3:(k+1)%3],p[0]+(k-1)*.9+rnd()*.3,p[1]+rnd()*.8,.9+rnd()*.5);addColl(p[0],p[1]+.3,1.6)});
  add(S.fence,38.4,-12,1);
  add(S.well,-5,-24,1);addColl(-5,-24,1.5);inter.push({id:'well',type:'well',name:'le puits',x:-5,z:-24,re:/^eau\b/i,key:1,nr:3.6,msg:'Le seau remonte, plein d’eau fraîche.',hh:3.6,ww:2.4});
  /* lanternes et guirlandes */
  [[-10,-7],[10,-7],[10,11],[-10,11]].forEach(p=>{add(S.lantern,p[0],p[1],1);addColl(p[0],p[1],.3)});
  /* pierre à moudre */
  inter.push({id:'mortar',type:'mortar',name:'le mortier',x:-27.5,z:10.5,key:1,nr:3.6,msg:'On pile le grain : toc, toc, toc.',hh:1.6,ww:1.4});
  inter.push({id:'fire',type:'fire',name:'le feu',x:-12,z:-1,re:/^feu/i,key:1,nr:3.6,msg:'Le feu crépite et monte.',hh:2,ww:2});addColl(-12,-1,1);
  dyn.puffs.push({x:-12,z:-1,y:1.2,age:0,life:7,k:.8},{x:-12,z:-1,y:1.2,age:3.5,life:7,k:.8});
  /* champ */
  {const fx=52,fz=34;for(let r=0;r<5;r++)for(let k=0;k<6;k++)add(S.crop,fx-5.5+k*2.2,fz-3.6+r*1.8,1,{crop:1,sway:.04});inter.push({id:'field',type:'field',name:'le champ',x:fx,z:fz,re:/^champ/i,key:1,nr:8,msg:'Tu arroses les cultures : elles se redressent.',hh:1.6,ww:13,field:1})}
  /* flore selon la région */
  const fl=th.flora;
  const tree=(sp,x,z,name,h,sc,r)=>{const e=add(sp,x,z,sc||1,{tree:1,sway:0,name});addColl(x,z,r||.5);inter.push({id:'t'+ents.length,type:'tree',name,x,z,re:/^arbre/i,h:h||5,ent:e,ww:3,hh:h||5,nr:0});return e};
  if(fl.indexOf('baobab')>-1)tree(S.baobab,13,-9,'Baobab',9,1,2.7);
  if(fl.indexOf('palm')>-1)[[-30,-54],[-18,-56],[14,-54],[26,-52],[40,-50],[-46,-48],[-52,10],[52,0],[50,-20],[-50,-24],[36,38],[-40,40]].forEach((p,i)=>tree(S.palm[i%2],p[0],p[1],'Palmier',7,.9+rnd()*.3,.4));
  if(fl.indexOf('banana')>-1)[[-34,16],[-36,20],[46,28],[48,24],[-20,-40],[-33,-38]].forEach(p=>tree(S.banana,p[0],p[1],'Bananier',3,1,.4));
  if(fl.indexOf('acacia')>-1){let n=0,t=0;while(n<22&&t<500){t++;const sp=freeSpot(3,12);if(!sp)continue;tree(S.acacia[n%3],sp[0],sp[1],'Acacia',5,.8+rnd()*.5,.5);n++}}
  /* extras par région */
  if(theme==='nord'){for(let k=0;k<16;k++){const sp=freeSpot(1.5,12);if(sp)tree(S.palm[k%2],sp[0],sp[1],'Palmier-dattier',7,.9+rnd()*.3,.4)}
   const col=A.mkColon?null:null;add(mkColonnade('#d8c39a'),41,-44,1);for(let k=0;k<5;k++)addColl(34+k*3.5,-44,.8);add(mkTower('#d2b07a'),-54,-24,1);addColl(-54,-24,3.4)}
  if(theme==='est'){for(let k=0;k<20;k++){const sp=freeSpot(3,14);if(sp)tree(S.acacia[k%3],sp[0],sp[1],'Acacia',5,1.1+rnd()*.5,.5)}
   const t=A.termite(P);for(let k=0;k<7;k++){const sp=freeSpot(1.5,16);if(sp){add(t,sp[0],sp[1],.7+rnd()*.5);addColl(sp[0],sp[1],1)}}}
  if(theme==='centrale'){S.forest=[0,1,2,3].map(k=>A.treeForest(P,k));for(let k=0;k<62;k++){const sp=freeSpot(2.5,k<30?24:14);if(sp)tree(S.forest[k%4],sp[0],sp[1],'Arbre de la forêt',9,.9+rnd()*.5,.7)}
   const fr=A.fern(P);for(let k=0;k<50;k++){const sp=freeSpot(1,8);if(sp)add(fr,sp[0],sp[1],.8+rnd()*.7)}
   for(let k=0;k<7;k++)dyn.clouds.push({x:-60+k*20,z:-40+rnd()*60,y:1.8+rnd()*1.5,mist:1,sp:.3+rnd()*.3,ph:rnd()*6})}
  if(theme==='australe'){for(let k=0;k<9;k++){const sp=freeSpot(4,16);if(sp){add(A.kopje(P,k),sp[0],sp[1],1+rnd()*.5);addColl(sp[0],sp[1],3.2)}}
   const al=A.aloe(P);for(let k=0;k<26;k++){const sp=freeSpot(1.2,10);if(sp){add(al,sp[0],sp[1],.8+rnd()*.6);addColl(sp[0],sp[1],.5)}}
   const blk=mkStoneBlock('#9a8a72');for(let k=0;k<22;k++){const a=.25+k/22*4.6,wx=-58+Math.cos(a)*9.5,wz=-47+Math.sin(a)*9.5;add(blk,wx,wz,.9);addColl(wx,wz,1)}add(mkStoneTower('#9a8a72'),-58,-47,1);addColl(-58,-47,2.4)}
  /* buissons, roseaux, herbe, fleurs, rochers */
  const dens=low?.5:1;const NPCS=[[-19,-10.5],[-22,6.4],[24,1.2],[4,-44],[30,-22],[0,0]];const nearNpc=(x,z,r)=>NPCS.some(n=>Math.hypot(x-n[0],z-n[1])<r);
  for(let k=0;k<110*dens;k++){const x=(rnd()-.5)*150,z=-58+rnd()*100;if(minPath(x,z)<3||Math.hypot(x,z)<10||nearNpc(x,z,5)||HUTS.some(h=>Math.hypot(x-h[0],z-h[1])<4.5))continue;add(S.bush[k%3],x,z,.7+rnd()*.7,{bush:1})}
  for(let k=0;k<70*dens;k++){const x=(rnd()-.5)*146,z=-58.5-rnd()*3;if(Math.abs(x)<4)continue;add(S.reed,x,z,.8+rnd()*.6,{sway:.05})}
  for(let k=0;k<460*dens;k++){const x=(rnd()-.5)*170,z=-60+rnd()*112;if(minPath(x,z)<2.4||HUTS.some(h=>Math.hypot(x-h[0],z-h[1])<3.4))continue;add(S.tuft[k%4],x,z,1+rnd()*1.1,{sway:.07,grass:1})}
  for(let k=0;k<90*dens;k++){const x=(rnd()-.5)*150,z=-56+rnd()*100;if(minPath(x,z)<3||Math.hypot(x,z)<8||nearNpc(x,z,3))continue;add(S.flower[k%3],x,z,1+rnd()*.7,{sway:.04})}
  for(let k=0;k<44*dens;k++){const x=(rnd()-.5)*140,z=k<20?-60+rnd()*4:-50+rnd()*90;if(minPath(x,z)<3||Math.hypot(x,z)<14||nearNpc(x,z,4))continue;{const rs=.6+rnd()*1.2;add(S.rock[k%3],x,z,rs);addColl(x,z,Math.max(.4,.5*rs))}}
  /* objets à ramasser */
  picks=PICK_DEF.map((p,i)=>({t:p[0],i,x:p[1],z:p[2],got:false}));
  /* personnages et animaux */
  const W0=(o,pts,sp,s)=>dyn.wand.push({o,pts,i:1,sp,x:pts[0][0],z:pts[0][1],ph:rnd()*6,s:s||1,fx:1,fz:0,ft:0});
  W0({skin:0x5a3a28,top:0x2e8b6a,bottom:0x6a3b8a,skirt:1,pat:2,wrap:0xd4513b,jewel:1},[[-12,14],[-4,4],[8,4],[14,16],[2,24],[-10,20]],1.5);
  W0({skin:0x4f3426,top:0x3a6ea5,bottom:0x7a5a2a,boubou:0x3a6ea5,cap:0xf4efe4},[[-14,-4],[-6,-14],[8,-20],[16,-8],[6,6]],1.6);
  W0({skin:0x5a3a28,top:0xe0a020,bottom:0x2f7a5a,skirt:1,pat:3,wrap:0x3a6ea5,pack:0x7a3b2a,jewel:1},[[18,20],[26,12],[16,8],[8,14]],1.4);
  W0({skin:0x4a2f22,top:0xd9462c,bottom:0x2b3a55,sleeve:true,hair:0x111111},[[6,12],[10,18],[4,22],[2,16]],2.6,.58);
  W0({skin:0x5a3a28,top:0x3a9a6a,bottom:0x2b3a55,sleeve:true,afro:1,hair:0x111111},[[-6,10],[-2,16],[-8,20],[-10,14]],2.4,.54);
  W0({skin:0x4f3426,top:0xb5532a,bottom:0x3a2a55,boubou:0xb5532a,cap:0x2f9e8f},[[-30,20],[-20,28],[-34,34],[-40,24]],1.3);
  dyn.chick={x:12,z:9,pts:[[12,9],[15,11],[17,8],[13,6]],i:1,ph:0};
  const AD=[{th:['ouest','nord','centrale','australe'],type:'goat',pts:[[-17,25],[-13,27],[-20,28]],sp:4.6},{th:['est','australe','nord'],type:'antilope',pts:[[28,26],[31,29],[26,31]],sp:7.5},{th:['est'],type:'girafe',pts:[[-40,-22],[-36,-17]],sp:3.2},{th:['ouest','centrale','nord','est','australe'],type:'vache',pts:[[38,-9],[42,-4],[36,-3]],sp:0,still:1}];
  AD.forEach(d=>{if(d.th.indexOf(theme)<0)return;d.pts.forEach(p=>dyn.anim.push({type:d.type,x:p[0],z:p[1],home:p,sp:d.sp,mode:0,ph:rnd()*6,dir:rnd()<.5?1:-1,still:d.still}))});
  [[-26,30,0],[39,-12,1],[13,-9,2]].forEach((f,fi)=>{if(fi===2&&fl.indexOf('baobab')<0)return;for(let k=0;k<5;k++){const hx2=f[0]+(k-2)*.7,hz=(fi===1?-12:fi===2?-9:f[1])+(k%2)*.5,hy2=fi===1?1.5:fi===2?9.2:0;dyn.perch.push({x:hx2,z:hz,y:hy2,home:[hx2,hy2,hz],mode:0,t:0,dir:[0,0],col:['#6a4a3a','#3a4a6a','#a0502a','#2a6a5a','#5a5a5a'][k],fl:fi})}});
  for(let i=0;i<7;i++)dyn.birds.push({cx:-20+rnd()*60,cz:-50+rnd()*40,r:12+rnd()*18,h:14+rnd()*10,sp:.12+rnd()*.12,a:rnd()*6});
  for(let i=0;i<9;i++)dyn.bflies.push({cx:-20+rnd()*50,cz:-20+rnd()*40,r:3+rnd()*6,a:rnd()*6,sp:.5+rnd()*.6,col:['#ffd23f','#ff7a3d','#fff','#b06cff'][i%4]});
  for(let i=0;i<(low?50:110);i++)dyn.flies.push({x:(rnd()-.5)*90,y:.5+rnd()*3,z:-40+rnd()*80,ph:rnd()*6});
  for(let i=0;i<22;i++)dyn.leaves.push({t:9,x:0,y:0,z:0,vx:0,vz:0,ph:0});
  for(let i=0;i<7;i++)dyn.clouds.push({x:-110+i*35,z:-170-rnd()*30,y:42+rnd()*26,sp:.5+rnd()*.5,k:i%3,sc:1.2+rnd()*1.2,mist:0});
  S.cloudSpr=[0,1,2].map(k=>A.cloud(k,th.cloud));S.glow=A.soft('#ffd9a0',3,.9);S.mist=A.soft('#e8f4e0',6,.9);
  buildGround();buildBackdrop();
 }

 /* ----- sol peint ----- */
 function buildGround(){
  const g=th.ground,GWp=GW_U*PPW,GHp=GH_U*PPW;groundC=mk(GWp,GHp);const c=groundC.getContext('2d');reseed(31);
  const X=x=>(x-GX0)*PPW,Z=z=>(z-GZ0)*PPW;
  c.fillStyle=g.base;c.fillRect(0,0,GWp,GHp);
  /* rive lointaine, rivière */
  const gl=c.createLinearGradient(0,Z(-118),0,Z(-100));gl.addColorStop(0,shade(g.gdark,-.1));gl.addColorStop(1,mixC(g.grass,g.gdark,.5));c.fillStyle=gl;c.fillRect(0,Z(-118),GWp,Z(-100)-Z(-118));
  /* taches de terre et d’herbe */
  const patch=(n,col,amin,amax,rmin,rmax,zmin,zmax)=>{for(let i=0;i<n;i++){const x=GX0+rnd()*GW_U,z=zmin+rnd()*(zmax-zmin);blob(c,X(x),Z(z),RR(rmin,rmax),RR(rmin,rmax)*.7,col,RR(amin,amax),rnd()*3)}};
  patch(500,g.dark,.1,.28,14,60,-100,58);patch(420,g.light,.1,.26,14,60,-100,58);
  for(let i=0;i<620;i++){const x=GX0+rnd()*GW_U,z=-100+rnd()*158;const d=Math.hypot(x,z+10);const gp=clamp(.22+g.green*.9*clamp((d-14)/34,0,1)+Math.sin(x*.09+1)*Math.sin(z*.08)*.4,0,.95);if(rnd()<gp)blob(c,X(x),Z(z),RR(14,50),RR(10,32),rnd()<.5?g.grass:g.gdark,RR(.12,.4),rnd()*3)}
  /* plaza et chemins */
  const pc=mixC(g.path,g.base,.35);blob(c,X(0),Z(2),16*PPW,13*PPW,pc,.55);
  c.lineCap='round';PATHS.forEach(p=>{c.strokeStyle=shade(g.path,-.25);c.globalAlpha=.55;c.lineWidth=4.8*PPW;c.beginPath();c.moveTo(X(p[0]),Z(p[1]));c.lineTo(X(p[2]),Z(p[3]));c.stroke();c.strokeStyle=g.path;c.globalAlpha=.95;c.lineWidth=3.6*PPW;c.beginPath();c.moveTo(X(p[0]),Z(p[1]));c.lineTo(X(p[2]),Z(p[3]));c.stroke();c.strokeStyle=shade(g.path,.25);c.globalAlpha=.4;c.lineWidth=1.6*PPW;c.beginPath();c.moveTo(X(p[0]),Z(p[1]));c.lineTo(X(p[2]),Z(p[3]));c.stroke()});c.globalAlpha=1;
  /* traces et cailloux sur les chemins */
  for(let i=0;i<1400;i++){const p=PATHS[i%PATHS.length],t=rnd(),x=p[0]+(p[2]-p[0])*t+RR(-1.8,1.8),z=p[1]+(p[3]-p[1])*t+RR(-1.8,1.8);c.fillStyle=rnd()<.5?shade(g.path,-.3):shade(g.path,.3);c.globalAlpha=.5;c.beginPath();c.ellipse(X(x),Z(z),RR(1,4),RR(.8,2.4),rnd()*3,0,TAU);c.fill()}c.globalAlpha=1;
  /* brins d’herbe peints */
  for(let i=0;i<9000;i++){const x=GX0+rnd()*GW_U,z=-100+rnd()*158;if(minPath(x,z)<2.4)continue;const d=Math.hypot(x,z+10);if(rnd()>.25+g.green*.8*clamp((d-10)/30,0,1))continue;const px=X(x),py=Z(z),L=RR(4,10);c.strokeStyle=rnd()<.5?g.grass:shade(g.grass,.3);c.globalAlpha=RR(.3,.7);c.lineWidth=RR(1,2);c.beginPath();c.moveTo(px,py);c.lineTo(px+RR(-3,3),py-L);c.stroke()}c.globalAlpha=1;
  /* rivière */
  const wg=c.createLinearGradient(0,Z(-102),0,Z(-62));wg.addColorStop(0,shade(th.water[0],.15));wg.addColorStop(.5,th.water[0]);wg.addColorStop(1,shade(th.water[0],-.2));c.fillStyle=wg;
  c.beginPath();c.moveTo(0,Z(-62));for(let x=GX0;x<=GX0+GW_U;x+=4)c.lineTo(X(x),Z(-62+Math.sin(x*.07)*.9));c.lineTo(GWp,Z(-102));for(let x=GX0+GW_U;x>=GX0;x-=4)c.lineTo(X(x),Z(-102+Math.sin(x*.05+1)*1.1));c.closePath();c.fill();
  c.strokeStyle=shade(g.dark,-.15);c.lineWidth=5;c.globalAlpha=.6;c.beginPath();for(let x=GX0;x<=GX0+GW_U;x+=4){const px=X(x),py=Z(-62+Math.sin(x*.07)*.9);x===GX0?c.moveTo(px,py):c.lineTo(px,py)}c.stroke();c.globalAlpha=1;
  for(let i=0;i<500;i++){const x=GX0+rnd()*GW_U,z=-102+rnd()*38;c.strokeStyle=th.water[1];c.globalAlpha=RR(.1,.35);c.lineWidth=RR(1,2.5);c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(x)+RR(8,24),Z(z));c.stroke()}c.globalAlpha=1;
  /* ponton */
  c.fillStyle='#7a4f28';c.fillRect(X(-1.6),Z(-64),3.2*PPW,10.5*PPW);for(let k=0;k<22;k++){c.fillStyle=k%2?'#8a5a30':'#6a4220';c.fillRect(X(-1.6),Z(-64)+k*.48*PPW,3.2*PPW,.4*PPW)}c.fillStyle='#4a2c14';[-1.7,1.7].forEach(x=>{for(let k=0;k<5;k++)c.fillRect(X(x)-3,Z(-63+k*2.2),6,10)});
  /* champ labouré */
  c.fillStyle=shade(g.dark,-.1);c.globalAlpha=.9;c.fillRect(X(45),Z(30),14*PPW,8.4*PPW);c.globalAlpha=1;for(let r=0;r<5;r++){c.strokeStyle=shade(g.dark,-.35);c.lineWidth=3;c.beginPath();c.moveTo(X(45),Z(30.9+r*1.8));c.lineTo(X(59),Z(30.9+r*1.8));c.stroke()}
  if(theme==='nord'){blob(c,X(-46),Z(-38),6.5*PPW,4.6*PPW,'#1c8a94',.95);blob(c,X(-46),Z(-38),5.2*PPW,3.6*PPW,'#4ac8cc',.8);blob(c,X(-47),Z(-38.8),2.4*PPW,1.2*PPW,'#bff4f0',.5)}
  grain(c,GWp,GHp,3000,'#000','#fff')}

 /* ----- ciel et arrière-plans ----- */
 function hillPath(c,w,baseY,amp,freqs,seedv){c.beginPath();c.moveTo(0,baseY+400);for(let x=0;x<=w;x+=6){let y=0;freqs.forEach((f,i)=>{y+=Math.sin(x*f+seedv*(i+1)*1.7)*amp/(i+1)});c.lineTo(x,baseY-y-amp*.5)}c.lineTo(w,baseY+400);c.closePath()}
 function buildBackdrop(){
  const BW=2600,BH=420;bgC=[];const t=th.hills;
  for(let L=0;L<3;L++){const cv=mk(BW,BH),c=cv.getContext('2d');reseed(70+L*9);const col=th.hcol[L];
   const base=BH-30-L*0,amp=[70,52,34][L],fr=[[.0042,.011,.026],[.006,.014,.03],[.009,.02,.045]][L];
   if(t==='nord'&&L===0){[[500,150],[1150,95],[1750,120]].forEach(p=>{c.fillStyle=mixC(col,'#fff',.15);c.beginPath();c.moveTo(p[0]-p[1],base);c.lineTo(p[0],base-p[1]*.62);c.lineTo(p[0]+p[1],base);c.fill();c.fillStyle=mixC(col,'#000',.12);c.beginPath();c.moveTo(p[0],base-p[1]*.62);c.lineTo(p[0]+p[1],base);c.lineTo(p[0]+p[1]*.15,base);c.fill()})}
   if(t==='est'&&L===0){c.fillStyle=col;c.beginPath();c.moveTo(500,base);c.lineTo(840,base-250);c.lineTo(1180,base);c.fill();c.fillStyle='#f4f8ff';c.beginPath();c.moveTo(755,base-215);c.lineTo(840,base-250);c.lineTo(925,base-215);c.lineTo(880,base-198);c.lineTo(840,base-210);c.lineTo(800,base-196);c.fill();c.fillStyle='rgba(120,130,170,.25)';c.beginPath();c.moveTo(840,base-250);c.lineTo(1180,base);c.lineTo(900,base);c.fill()}
   if(t==='australe'&&L===0){c.fillStyle=col;c.beginPath();c.moveTo(300,base);c.lineTo(420,base-170);c.lineTo(1500,base-175);c.lineTo(1640,base);c.fill();c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<9;k++){c.beginPath();c.ellipse(520+k*115,base-175+Math.sin(k)*6,90,16,0,0,TAU);c.fill()}c.fillStyle='rgba(90,70,110,.22)';c.beginPath();c.moveTo(1000,base-172);c.lineTo(1500,base-175);c.lineTo(1640,base);c.lineTo(1100,base);c.fill()}
   if(t==='ouest'&&L===1){c.fillStyle=shade(col,-.1);c.fillRect(1500,base-150,190,150);c.fillStyle=shade(col,.15);c.fillRect(1500,base-150,60,150);c.fillStyle='rgba(240,250,255,.8)';c.fillRect(1590,base-140,16,110);c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse(1598,base-26,30,12,0,0,TAU);c.fill()}
   const gr=c.createLinearGradient(0,base-amp*1.6,0,base+30);gr.addColorStop(0,mixC(col,th.fog,.38-L*.1));gr.addColorStop(1,mixC(col,th.fog,.1));c.fillStyle=gr;
   if(t==='nord'&&L>0){hillPath(c,BW,base,amp*.75,[fr[0]*.8,fr[1]*.5],L*3)}else hillPath(c,BW,base,amp,fr,L*3+1);c.fill();
   if(t==='centrale'&&L>0){for(let i=0;i<340;i++){const x=rnd()*BW;let y=0;fr.forEach((f,k)=>{y+=Math.sin(x*f+(L*3+1)*(k+1)*1.7)*amp/(k+1)});const py=base-y-amp*.5;blob(c,x,py+RR(-6,14),RR(14,30),RR(10,20),shade(col,RR(-.25,.18)),.8)}}
   if((t==='est'||t==='australe'||t==='ouest')&&L===2){for(let i=0;i<14;i++){const x=rnd()*BW;let y=0;fr.forEach((f,k)=>{y+=Math.sin(x*f+(L*3+1)*(k+1)*1.7)*amp/(k+1)});const py=base-y-amp*.5;c.fillStyle='#2a2a1a';c.globalAlpha=.55;c.fillRect(x-1.5,py-26,3,26);c.beginPath();c.ellipse(x,py-28,24,5,0,0,TAU);c.fill();c.globalAlpha=1}}
   c.globalCompositeOperation='source-atop';const hz=c.createLinearGradient(0,base-amp*1.4,0,base+10);hz.addColorStop(0,rgba(th.fog,0));hz.addColorStop(1,rgba(th.fog,.55-L*.12));c.fillStyle=hz;c.fillRect(0,0,BW,BH);c.globalCompositeOperation='source-over';
   bgC.push(cv)}
  skyC=null}
 function buildSky(){
  skyC=mk(W,Math.max(H,10));const c=skyC.getContext('2d');const g=c.createLinearGradient(0,0,0,hy);th.sky.forEach((s,i)=>g.addColorStop([0,.35,.8,1][i],s));c.fillStyle=g;c.fillRect(0,0,W,H);
  const sx=W*th.sun[0],sy=hy-H*th.sun[1];const sg=c.createRadialGradient(sx,sy,0,sx,sy,H*.55);sg.addColorStop(0,rgba(th.sun[2],.95));sg.addColorStop(.12,rgba(th.sun[2],.55));sg.addColorStop(.4,rgba('#ffcc88',.16));sg.addColorStop(1,'rgba(255,200,140,0)');c.fillStyle=sg;c.fillRect(0,0,W,hy+40);
  c.fillStyle=th.sun[2];c.beginPath();c.arc(sx,sy,H*.035,0,TAU);c.fill();
  /* cirrus peints */
  reseed(55);c.lineCap='round';for(let i=0;i<46;i++){const y=RR(.05,.75)*hy,x=rnd()*W,l=RR(80,260);c.strokeStyle='rgba(255,255,255,'+RR(.05,.16)+')';c.lineWidth=RR(2,7);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+l*.5,y-RR(4,16),x+l,y-RR(0,10));c.stroke()}
  /* rayons de lumière */
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const a=2.0+i*.17,len=H*1.3;const rg=c.createLinearGradient(sx,sy,sx+Math.cos(a)*len,sy+Math.sin(a)*len);rg.addColorStop(0,'rgba(255,230,170,.13)');rg.addColorStop(1,'rgba(255,230,170,0)');c.fillStyle=rg;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(a-.035)*len,sy+Math.sin(a-.035)*len);c.lineTo(sx+Math.cos(a+.035)*len,sy+Math.sin(a+.035)*len);c.fill()}c.restore()}

 /* ----- mise en page ----- */
 function resize(w,h,d,opt){W=w;H=h;dpr=d||1;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';skyC=null;low=!!(opt&&opt.low)}
 function layout(shift,cam){
  const zm=(cam&&cam.zoom)||1,pt=(cam&&cam.pitch)||0;
  const portrait=H>W*1.1;ppu=(portrait?clamp(W/8.6,30,60):clamp(Math.min(.074*H,W/12),24,72));const D=18;F=ppu*D*zm;const sx=shift&&shift.x||0,sy=shift&&shift.y||0;
  camH=(portrait?.27:.34)*H/ppu;oy=sy*H;const foot=H*(portrait?.63:.74)+oy;hy=foot-camH*ppu*zm+pt*H;cx0=W*(.5+sx)}

 /* ----- projection ----- */
 const proj=(x,z,y)=>{const dd=cz-z;if(dd<2.4)return null;const sc=F/dd;return {sx:cx0+(x-camX)*sc,sy:hy+camH*sc-(y||0)*sc,sc,dd}};

 /* ----- dessin ----- */
 function drawSprite(sp,sx,sy,sc,dd,tintAmt,sway,flip){
  const w=sp.cv.width/A.PPU*sc,h=sp.cv.height/A.PPU*sc;
  ctx.save();ctx.translate(sx,sy);if(sway){ctx.transform(1,0,sway,1,0,0)}if(flip)ctx.scale(-1,1);
  ctx.drawImage(sp.cv,-w/2,-h,w,h);
  if(tintAmt>.03){let t=sp.tint[theme];if(!t){t=mk(sp.cv.width,sp.cv.height);const c=t.getContext('2d');c.drawImage(sp.cv,0,0);c.globalCompositeOperation='source-atop';c.fillStyle=th.fog;c.fillRect(0,0,t.width,t.height);sp.tint[theme]=t}ctx.globalAlpha=tintAmt;ctx.drawImage(t,-w/2,-h,w,h);ctx.globalAlpha=1}
  ctx.restore()}
 const fogAmt=dd=>clamp((dd-38)/190,0,.62);

 function quad(c,type,x,y,s,dir,ph,graze){/* animaux de profil, vers la droite si dir>0 */
  c.save();c.translate(x,y);c.scale(s*dir,s);const w=Math.sin(ph)*.35;
  const P={goat:{col:'#cdbba0',dk:'#8a7458',len:1.1,hh:.9,leg:.55,neck:.35,sc:.9},antilope:{col:'#c9965a',dk:'#6a4426',len:1.5,hh:1.2,leg:.85,neck:.55,sc:1},girafe:{col:'#e0b050',dk:'#8a5a2a',len:1.9,hh:2.5,leg:2.2,neck:2.4,sc:1.1},vache:{col:'#6a4a32',dk:'#2a1c12',len:1.7,hh:1.15,leg:.65,neck:.35,sc:1},mouton:{col:'#efe8d8',dk:'#4a3d34',len:1.1,hh:.9,leg:.5,neck:.3,sc:.85}}[type];
  c.scale(P.sc,P.sc);softShadowLocal(c,0,0,P.len*.9);
  const legs=[[-P.len*.38,-1],[-P.len*.28,1],[P.len*.3,1],[P.len*.4,-1]];
  legs.forEach((l,i)=>{c.strokeStyle=i%2?P.dk:shade(P.dk,.1);c.lineWidth=.12;c.lineCap='round';c.beginPath();c.moveTo(l[0],-P.leg);c.lineTo(l[0]+Math.sin(ph+i*1.6)*.25*(graze?0:1),-.04);c.stroke()});
  const g=c.createLinearGradient(0,-P.leg-.6,0,-P.leg+.4);g.addColorStop(0,shade(P.col,.2));g.addColorStop(1,shade(P.col,-.25));c.fillStyle=g;c.strokeStyle=OUT2;c.lineWidth=.035;c.beginPath();c.ellipse(0,-P.leg-.05,P.len*.52,.34,0,0,TAU);c.fill();c.stroke();
  if(type==='mouton'){c.fillStyle='#f7f2e6';for(let i=0;i<8;i++){c.beginPath();c.arc(-P.len*.4+i*P.len*.115,-P.leg-.05+Math.sin(i*2.1)*.12,.2,0,TAU);c.fill()}}
  const nx=P.len*.45,ny=-P.leg-.1,hx2=nx+P.neck*.35,hy2=ny-P.neck+(graze?P.neck*.9:0);
  c.strokeStyle=P.col;c.lineWidth=.2;c.beginPath();c.moveTo(nx-.05,ny);c.lineTo(hx2,hy2);c.stroke();
  c.fillStyle=P.col;c.beginPath();c.ellipse(hx2+.1,hy2-.02,.2,.12,.3,0,TAU);c.fill();c.stroke();c.fillStyle='#1a1008';c.beginPath();c.arc(hx2+.12,hy2-.05,.025,0,TAU);c.fill();
  if(type==='mouton'){c.fillStyle=P.dk;c.beginPath();c.ellipse(hx2+.1,hy2-.02,.22,.14,.3,0,TAU);c.fill();c.fillRect(hx2-.05,hy2-.05,.1,.12)}
  if(type==='goat'||type==='antilope'||type==='vache'){c.strokeStyle='#e8dcc0';c.lineWidth=.04;c.beginPath();c.moveTo(hx2,hy2-.1);c.quadraticCurveTo(hx2-.1,hy2-.35,hx2-.2,hy2-.3);c.stroke()}
  c.strokeStyle=P.dk;c.lineWidth=.05;c.beginPath();c.moveTo(-P.len*.5,-P.leg-.1);c.lineTo(-P.len*.6,-P.leg+.2);c.stroke();
  if(type==='girafe'){c.fillStyle='#8a5a2a';c.globalAlpha=.55;for(let i=0;i<10;i++){c.beginPath();c.ellipse(RR(-.7,.7),-P.leg-.05+RR(-.18,.18),.1,.08,0,0,TAU);c.fill()}for(let i=0;i<6;i++){c.beginPath();c.ellipse(nx+RR(0,.3)*(i/6),ny-i*.37,.08,.07,0,0,TAU);c.fill()}c.globalAlpha=1}
  c.restore()}
 const OUT2='#3a2a1c';
 function softShadowLocal(c,x,y,r){c.save();c.translate(x,y);c.scale(1,.18);const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(20,10,30,.4)');g.addColorStop(1,'rgba(20,10,30,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.restore()}
 function bird(c,x,y,s,ph,col){c.save();c.translate(x,y);c.strokeStyle=col||'#2a2a30';c.lineWidth=Math.max(1,s*.07);c.lineCap='round';const f=Math.sin(ph)*.6;c.beginPath();c.moveTo(-s*.5,-f*s*.5);c.quadraticCurveTo(-s*.2,-s*.25-f*s*.3,0,0);c.quadraticCurveTo(s*.2,-s*.25-f*s*.3,s*.5,-f*s*.5);c.stroke();c.restore()}
 function perched(c,x,y,s,col,flying,ph){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.strokeStyle='#2a1a16';c.lineWidth=.04;c.beginPath();c.ellipse(0,-.2,.2,.15,0,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(.17,-.34,.09,0,TAU);c.fill();c.stroke();c.fillStyle='#e0a020';c.beginPath();c.moveTo(.25,-.36);c.lineTo(.36,-.33);c.lineTo(.25,-.31);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(.2,-.37,.025,0,TAU);c.fill();
  c.fillStyle=shade(col,-.3);c.beginPath();if(flying){const f=Math.sin(ph)*.6;c.moveTo(-.05,-.3);c.quadraticCurveTo(-.1,-.7-f*.4,-.35,-.6-f*.6);c.lineTo(-.15,-.28)}else{c.moveTo(-.18,-.25);c.lineTo(-.4,-.12);c.lineTo(-.1,-.15)}c.fill();c.restore()}

 /* décors de vie du village (marché, cuisine, atelier, banc, feu) : dessinés en direct, formes simples */
 const PALL=['#d4513b','#e0a020','#2f9e8f','#3a6ea5','#9a4fa0'],FRUC=['#e8a317','#d4513b','#7ac043','#f2d24a','#8a3a8a'];
 function drawHen(c,x,y,s,dir,ph,moving,rest){c.save();c.translate(x,y);c.scale(s*dir,s);softShadowLocal(c,0,0,.4);const bob=moving?Math.abs(Math.sin(ph*2))*.05:0,pk=!moving&&!rest?Math.max(0,Math.sin(ph*2.4)):0;c.lineJoin='round';c.strokeStyle='#2a1a16';c.lineWidth=.025;
  c.strokeStyle='#e0a020';c.lineWidth=.04;[-.08,.1].forEach((lx,i)=>{c.beginPath();c.moveTo(lx,-.22-bob);c.lineTo(lx+(moving?Math.sin(ph*2+i*3)*.1:0),0);c.stroke()});
  c.strokeStyle='#2a1a16';c.lineWidth=.025;c.fillStyle='#f4efe4';c.beginPath();c.ellipse(0,-.38-bob,.3,.22,0,0,TAU);c.fill();c.stroke();c.fillStyle='#e8e0cc';c.beginPath();c.moveTo(-.26,-.45-bob);c.lineTo(-.46,-.62-bob);c.lineTo(-.22,-.3-bob);c.fill();
  const hx=.26+pk*.14,hy=-.62-bob+pk*.36;c.fillStyle='#f4efe4';c.beginPath();c.arc(hx,hy,.12,0,TAU);c.fill();c.stroke();c.fillStyle='#cf2a2a';c.beginPath();c.arc(hx-.02,hy-.13,.05,0,TAU);c.fill();c.fillStyle='#e0a020';c.beginPath();c.moveTo(hx+.1,hy-.02);c.lineTo(hx+.22,hy+.02);c.lineTo(hx+.1,hy+.05);c.fill();c.fillStyle='#1a1008';c.beginPath();c.arc(hx+.04,hy-.03,.018,0,TAU);c.fill();c.restore()}
 function drawLifeProp(c,p,v,t,hour){const s=v.sc;c.save();c.translate(v.sx,v.sy);c.scale(s,s);c.lineJoin='round';c.strokeStyle='#2a1a16';c.lineWidth=.04;
  const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h)},E=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();c.stroke()};
  {const W={stall:2.3,bench:1.3,loom:1,jar:.5,gate:2.9,fence:2.4,firepot:.6,fire:.6,wheel:.6,mortar:.4,stool:.4,basket:.55,rocks:.8};
   if(W[p.t]&&hour>5.5&&hour<18.5){const off=(hour-12)/6.5*W[p.t]*.5;c.save();c.globalAlpha=.55-.25*Math.abs(hour-12)/6.5;softShadowLocal(c,off,0,W[p.t]*.62);c.restore()}}
  switch(p.t){
   case 'gate':{const col=PALL[(p.c||0)%5];[-2.6,2.6].forEach(x=>{const g=c.createLinearGradient(x-.24,0,x+.24,0);g.addColorStop(0,'#8a5a30');g.addColorStop(1,'#4a2f1a');c.fillStyle=g;c.fillRect(x-.24,-3.3,.48,3.3);c.strokeRect(x-.24,-3.3,.48,3.3);E(x,-3.45,.4,.2,'#8a5a30')});
    R_(-3.1,-3.35,6.2,.28,'#6b4a2a');c.fillStyle=col;c.fillRect(-.95,-3.1,1.9,.9);c.strokeRect(-.95,-3.1,1.9,.9);c.fillStyle='#f2d24a';c.fillRect(-.95,-3.0,1.9,.1);
    if(hour>=17||hour<6){[-2.6,2.6].forEach(x=>{const fl=1+.18*Math.sin(t*11+x);const g=c.createRadialGradient(x,-3.9,0,x,-3.9,1.3);g.addColorStop(0,'rgba(255,190,90,.6)');g.addColorStop(1,'rgba(255,170,60,0)');c.fillStyle=g;c.beginPath();c.arc(x,-3.9,1.3,0,TAU);c.fill();c.fillStyle='#ff9a1a';c.beginPath();c.ellipse(x,-3.8,.12,.22*fl,0,0,TAU);c.fill()})}break}
   case 'garden':{c.fillStyle='#5a3a22';c.beginPath();c.moveTo(-1.8,-.85);c.lineTo(1.8,-.85);c.lineTo(2,.05);c.lineTo(-2,.05);c.closePath();c.fill();c.stroke();const lf=['#4f9a3a','#7ac043','#3a8a4a'][(p.c||0)%3];
    for(let r=0;r<3;r++)for(let i=0;i<6;i++){const x=-1.4+i*.56+(r-1)*.1,y=-.72+r*.34,sw=Math.sin(t*1.4+i+r)*.03;E(x+sw,y-.2,.13,.2,lf);if((i+r)%3===0)E(x,y-.4,.05,.05,FRUC[(i+r)%5])}break}
   case 'fence':{for(let i=0;i<9;i++)R_(-2.55+i*.625,-.9,.1,.9,'#6b4a2a');R_(-2.5,-.7,5,.07,'#8a5a30');R_(-2.5,-.38,5,.07,'#8a5a30');break}
   case 'pond':{c.fillStyle='#2a7fb0';c.beginPath();c.ellipse(0,-.05,2.6,.9,0,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(180,230,250,.55)';c.lineWidth=.05;for(let i=0;i<3;i++){const k=((t*.35+i/3)%1);c.globalAlpha=1-k;c.beginPath();c.ellipse(-.6+i*.6,-.05,.3+k*1.2,.1+k*.4,0,0,TAU);c.stroke()}c.globalAlpha=1;c.lineWidth=.04;c.strokeStyle='#2a1a16';
    for(let i=0;i<14;i++){const a=i/14*TAU;E(Math.cos(a)*2.65,-.05+Math.sin(a)*.95,.22,.12,i%2?'#8a8a85':'#77766f')}break}
   case 'bridge':{R_(-2.9,-.5,5.8,.34,'#9a6a3a');for(let i=0;i<9;i++){c.strokeStyle='#5a3a1e';c.beginPath();c.moveTo(-2.5+i*.62,-.5);c.lineTo(-2.5+i*.62,-.16);c.stroke()}c.strokeStyle='#2a1a16';
    [-2.8,0,2.8].forEach(x=>R_(x-.05,-1.0,.1,.55,'#6b4a2a'));R_(-2.85,-1.0,5.7,.07,'#8a5a30');break}
   case 'rocks':{E(0,-.3,.55,.35,'#7d7b74');E(.7,-.18,.36,.22,'#8a8882');E(-.5,-.16,.3,.2,'#6f6d67');break}
   case 'stall':{const col=PALL[(p.c||0)%5];R_(-1.5,-2.2,.12,2.2,'#6b4a2a');R_(1.38,-2.2,.12,2.2,'#6b4a2a');R_(-1.5,-.85,3,.85,'#8a5a30');
    for(let i=0;i<7;i++)E(-1.2+i*.4,-.98,.17,.15,FRUC[(i+(p.c||0))%5]);c.fillStyle=col;c.beginPath();c.moveTo(-1.95,-2.15);c.lineTo(1.95,-2.15);c.lineTo(1.7,-2.75);c.lineTo(-1.7,-2.75);c.closePath();c.fill();c.stroke();
    for(let i=0;i<8;i++){c.fillStyle=i%2?'#f4efe4':col;c.beginPath();c.moveTo(-1.95+i*.4875,-2.15);c.lineTo(-1.95+(i+1)*.4875,-2.15);c.lineTo(-1.95+(i+.5)*.4875,-1.85);c.closePath();c.fill()}break}
   case 'basket':{E(0,-.1,.5,.16,'#c9a15a');c.fillStyle='#c9a15a';c.beginPath();c.moveTo(-.5,-.1);c.lineTo(-.38,-.45);c.lineTo(.38,-.45);c.lineTo(.5,-.1);c.closePath();c.fill();c.stroke();for(let i=0;i<5;i++)E(-.3+i*.15,-.5-(i%2)*.06,.14,.12,FRUC[(i+(p.c||0))%5]);break}
   case 'jar':{const k=p.s||1;E(0,-.5*k,.42*k,.5*k,'#b5532a');R_(-.17*k,-1.15*k,.34*k,.3*k,'#a04a26');E(0,-1.17*k,.22*k,.07*k,'#7a3b1d');break}
   case 'mat':{const k=p.s||1;c.fillStyle=PALL[(p.c||0)%5];c.beginPath();c.ellipse(0,0,.95*k,.3*k,0,0,TAU);c.fill();c.strokeStyle='#f2d98a';c.lineWidth=.05;c.beginPath();c.ellipse(0,0,.75*k,.22*k,0,0,TAU);c.stroke();break}
   case 'stool':{E(0,-.46,.3,.09,'#8a5a30');R_(-.2,-.46,.05,.46,'#6b4a2a');R_(.15,-.46,.05,.46,'#6b4a2a');break}
   case 'bench':{const k=p.s||1;R_(-1.2*k,-.55,2.4*k,.12,'#8a5a30');R_(-1.0*k,-.43,.12,.43,'#6b4a2a');R_(.88*k,-.43,.12,.43,'#6b4a2a');break}
   case 'mortar':{c.fillStyle='#7a5a30';c.beginPath();c.moveTo(-.3,-.55);c.lineTo(.3,-.55);c.lineTo(.22,0);c.lineTo(-.22,0);c.closePath();c.fill();c.stroke();R_(.05,-1.2,.1,.8,'#c9a15a');break}
   case 'firepot':case 'fire':{const big=p.t==='fire',k=big?1.3:1,on=big?(hour>=16.5||hour<6.5):(hour>=6&&hour<21);
    R_(-.5,-.16,1,.14,'#4a2f1a');if(on){const fl=1+.18*Math.sin(t*11+p.x)+.1*Math.sin(t*17);if(big){const g=c.createRadialGradient(0,-.5,0,0,-.5,2.6);g.addColorStop(0,'rgba(255,170,60,.45)');g.addColorStop(1,'rgba(255,170,60,0)');c.fillStyle=g;c.beginPath();c.arc(0,-.5,2.6,0,TAU);c.fill()}
     c.fillStyle='#ff9a1a';c.beginPath();c.moveTo(-.28*k,-.16);c.quadraticCurveTo(-.2*k,-.5*fl*k,0,-.95*fl*k);c.quadraticCurveTo(.22*k,-.5*fl*k,.28*k,-.16);c.closePath();c.fill();c.fillStyle='#ffe08a';c.beginPath();c.moveTo(-.12*k,-.16);c.quadraticCurveTo(0,-.5*fl*k,.12*k,-.16);c.closePath();c.fill()}
    if(!big){E(0,-.75,.46,.4,'#3a2f2a');R_(-.34,-1.18,.68,.07,'#5a4a40');if(on){const fr=(t*.4+p.x)%1;c.globalAlpha=.5*(1-fr);E(0,-1.5-fr*.8,.22+fr*.2,.16,'#e8eef0');c.globalAlpha=1}}break}
   case 'wheel':{R_(-.5,-.45,1,.45,'#8a5a30');E(0,-.5,.5,.12,'#a07040');E(0,-.78,.28,.26,'#b5532a');break}
   case 'loom':{R_(-.95,-1.75,.1,1.75,'#6b4a2a');R_(.85,-1.75,.1,1.75,'#6b4a2a');R_(-.95,-1.75,1.9,.1,'#6b4a2a');R_(-.85,-1.4,1.7,.9,'#d4513b');for(let i=0;i<4;i++)R_(-.85,-1.2+i*.22,1.7,.07,i%2?'#f2d24a':'#2f9e8f');break}}
  c.restore()}
 function render(f){
  const t=f.t,dt=f.dt,P=f.P;const cam=f.cam||{};layout(f.shift,cam);cz=P.z+18+(cam.back||0);camX+=(P.x+(cam.look||0)-camX)*Math.min(1,dt*7);if(f.snap)camX=P.x+(cam.look||0);
  if(!skyC||skyC.height!==Math.max(H,10)||skyC.width!==W||skyC._hy!==hy){buildSky();skyC._hy=hy}
  {const sh=cam.shake||0,k=1+(sh>0?.014:0);ctx.setTransform(dpr*k,0,0,dpr*k,(sh>0?(Math.random()-.5)*sh*7-W*.007:0)*dpr,(sh>0?(Math.random()-.5)*sh*7-H*.007:0)*dpr)}ctx.imageSmoothingEnabled=true;hits.length=0;
  /* ciel */
  ctx.drawImage(skyC,0,0);
  /* nuages */
  const cl=dyn.clouds;cl.forEach(c=>{if(c.mist)return;c.x+=dt*c.sp;if(c.x>140)c.x=-140});
  const bgScale=H/720;
  [2,1,0].forEach(L=>{if(L===1)drawClouds(false);const cv=bgC[L];if(!cv)return;const k=[.012,.03,.07][L];const w=cv.width*bgScale*.9,h=cv.height*bgScale*.9;const ox=-(camX*ppu*k)-(w-W)/2;ctx.drawImage(cv,ox,hy-h+14*bgScale,w,h)});
  /* sol en perspective */
  ctx.fillStyle=mixC(th.fog,th.ground.gdark,.45);ctx.fillRect(0,hy,W,H-hy);
  const gctx=groundC,step=low?3:2;const bh=camH*F;
  for(let y=Math.ceil(hy)+1;y<H;y+=step){const dd=bh/(y-hy);if(dd>cz-GZ0+30)continue;const z=cz-dd;const sy=(z-GZ0)*PPW;if(sy<0||sy>=gctx.height-1)continue;const half=(W/2)*dd/F,xl=camX-(cx0-0)*dd/F+0;const sx0=(camX+(0-cx0)*dd/F-GX0)*PPW,sw=(W*dd/F)*PPW;
   ctx.drawImage(gctx,sx0,sy,sw,Math.max(1,step*dd*dd/bh*PPW),0,y,W,step)}
  /* brume d’horizon */
  const hz=ctx.createLinearGradient(0,hy-20,0,hy+Math.max(60,H*.16));hz.addColorStop(0,rgba(th.fog,0));hz.addColorStop(.18,rgba(th.fog,.7));hz.addColorStop(1,rgba(th.fog,0));ctx.fillStyle=hz;ctx.fillRect(0,hy-20,W,Math.max(60,H*.16)+20);
  if(theme==='centrale'){ctx.fillStyle='rgba(180,220,190,.12)';ctx.fillRect(0,hy,W,H-hy)}
  /* eau scintillante */
  {for(let i=0;i<46;i++){const z=-62-((i*7.3+t*.6)%38),x=((i*37.7)%150)-75+Math.sin(t*.5+i)*1.5;const p=proj(x,z,0);if(!p)continue;ctx.fillStyle='rgba(255,255,255,'+(.25+.25*Math.sin(t*3+i))+')';ctx.fillRect(p.sx,p.sy,p.sc*.9,Math.max(1,p.sc*.04))}}
  /* ----- liste des éléments à trier ----- */
  const L=[];
  const vis=(x,z,m)=>{const dd=cz-z;if(dd<3||dd>230)return null;const sc=F/dd,sx=cx0+(x-camX)*sc;if(sx<-m*sc-60||sx>W+m*sc+60)return null;return {dd,sc,sx,sy:hy+camH*sc}};
  ents.forEach(e=>{const v=vis(e.x,e.z,7);if(!v)return;if(e.bush&&v.dd<16)return;L.push({dd:v.dd,k:0,e,v})});
  /* animaux */
  dyn.anim.forEach(a=>{const v=vis(a.x,a.z,3);if(v)L.push({dd:v.dd,k:1,a,v})});
  dyn.wand.forEach(w=>{const v=vis(w.x,w.z,2);if(v)L.push({dd:v.dd,k:2,w,v})});
  if(dyn.chick){const v=vis(dyn.chick.x,dyn.chick.z,1);if(v)L.push({dd:v.dd,k:3,v})}
  f.npcs.forEach(n=>{const v=vis(n.x,n.z,2);if(v)L.push({dd:v.dd,k:4,n,v})});
  {const v=vis(P.x,P.z,2);if(v)L.push({dd:v.dd-.01,k:5,v})}
  (f.remote||[]).forEach(q=>{const v=vis(q.x,q.z,2);if(v)L.push({dd:v.dd,k:11,q,v})});
  picks.forEach(p=>{if(p.got)return;const v=vis(p.x,p.z,2);if(v)L.push({dd:v.dd,k:6,p,v})});
  const LI=f.life;if(LI&&LI.st){LI.st.forEach(s=>s.props.forEach(p=>{const v=vis(p.x,p.z,3);if(v)L.push({dd:v.dd+({mat:.4,garden:.5,bridge:.9,pond:1.4}[p.t]||0),k:13,p,v})}));(LI.animals||[]).forEach(a=>{const v=vis(a.x,a.z,2);if(v)L.push({dd:v.dd,k:15,a,v})});LI.people.forEach(r=>{if(!r.vis)return;const v=vis(r.px,r.pz,2);if(v)L.push({dd:v.dd,k:14,r,v})})}
  hid.forEach(h=>{if(h.got||!(h.rv>0))return;const v=vis(h.x,h.z,2);if(v)L.push({dd:v.dd,k:12,h,v})});
  dyn.perch.forEach(b=>{if(b.hide)return;const v=vis(b.x,b.z,1);if(v)L.push({dd:v.dd,k:7,b,v})});
  [[-20,-64.5],[22,-66]].forEach((b,i)=>{const v=vis(b[0],b[1],5);if(v)L.push({dd:v.dd,k:8,i,b,v})});
  {const v=vis(-12,-1,2);if(v)L.push({dd:v.dd,k:9,v})}
  {const v=vis(0,0,6);if(v)L.push({dd:v.dd,k:10,v})}
  L.sort((a,b)=>b.dd-a.dd);
  const fx=f;
  let htag=null;
  for(const it of L){const v=it.v,fg=fogAmt(it.dd);
   if(it.k===0){const e=it.e;let sway=e.sway||0;if(sway){sway=sway*Math.sin(t*1.7+e.x*.35+e.z*.27);const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d<2.6)sway+=(dx/(d||1))*(1-d/2.6)*.5}
    if(e.shake>0){e.shake-=dt;sway+=Math.sin(t*28)*.05*Math.max(0,e.shake)/1.6;if(e.shake<=0)e.shake=0}
    if(e.crop&&dyn.fieldT>0)sway*=1+dyn.fieldT;
    const sc=v.sc*e.sc*(e.crop&&dyn.fieldT>0?1+Math.sin(Math.min(1,dyn.fieldT/2.4)*Math.PI)*.35:1);
    drawSprite(e.sp,v.sx,v.sy,sc,v.dd,fg,sway);
    if(e.label&&v.dd<120){const lb=label(e.label),lw=lkf()*clamp(v.sc*2.6,70,130),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-e.ly*v.sc*e.sc-lh,lw,lh)}
    if(e.tree||e.crop===undefined&&e.tree){hits.push({root:inter.find(i=>i.ent===e)||null,x0:v.sx-v.sc*e.sc*e.sp.wu*.3,x1:v.sx+v.sc*e.sc*e.sp.wu*.3,y0:v.sy-v.sc*e.sc*e.sp.hu,y1:v.sy,dd:v.dd})}}
   else if(it.k===1){const a=it.a;const sc=v.sc;ctx.save();quad(ctx,a.type,v.sx,v.sy,sc,a.dir,a.ph,a.mode===0&&Math.sin(t*.5+a.ph)>.2);ctx.restore();
    if(v.dd<40&&LCA.animals){const lb=label(LCA.animals.label(a.type,LCA.animals.cur)),lw=lkf()*clamp(sc*2.1,58,118),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-sc*(a.type==='girafe'?3.6:1.9)-lh,lw,lh)}}
   else if(it.k===2){const w=it.w;const fc=Math.abs(w.fx)>Math.abs(w.fz)?'s':(w.fz>0?'f':'b');A.drawPerson(ctx,A.kindToOpts(w.o),v.sx,v.sy,v.sc*w.s*1.0,fc,w.ph,1,t,w.fx<0)}
   else if(it.k===3){const c=dyn.chick;ctx.save();ctx.translate(v.sx,v.sy-Math.abs(Math.sin(t*9))*v.sc*.05);ctx.scale(v.sc*.8,v.sc*.8);ctx.fillStyle='#f4efe4';ctx.strokeStyle='#2a1a16';ctx.lineWidth=.04;ctx.beginPath();ctx.ellipse(0,-.3,.3,.24,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(.25,-.55,.12,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#cf2a2a';ctx.fillRect(.22,-.7,.06,.1);ctx.fillStyle='#e0a020';ctx.fillRect(.36,-.55,.08,.04);ctx.restore()}
   else if(it.k===4){const n=it.n;
    if(n.id==='hist'){ctx.save();ctx.translate(v.sx,v.sy);ctx.scale(1,.28);ctx.fillStyle='#b5532a';ctx.beginPath();ctx.arc(0,0,v.sc*1.3,0,TAU);ctx.fill();ctx.strokeStyle='#f2d98a';ctx.lineWidth=v.sc*.08;ctx.beginPath();ctx.arc(0,0,v.sc*1.1,0,TAU);ctx.stroke();ctx.restore()}
    ctx.save();ctx.translate(v.sx,v.sy);ctx.scale(1,.3);ctx.strokeStyle='rgba(63,184,164,'+(.6+.25*Math.sin(t*3))+')';ctx.lineWidth=v.sc*.08;ctx.beginPath();ctx.arc(0,0,v.sc*(.95+.06*Math.sin(t*3)),0,TAU);ctx.stroke();ctx.restore();
    if(n.drumTop){ctx.save();ctx.translate(v.sx+v.sc*.7,v.sy);const s=v.sc;ctx.fillStyle='#7a4426';ctx.strokeStyle='#2a1a16';ctx.lineWidth=s*.03;ctx.beginPath();ctx.moveTo(-.3*s,-.9*s);ctx.lineTo(-.24*s,-.05*s);ctx.lineTo(.24*s,-.05*s);ctx.lineTo(.3*s,-.9*s);ctx.fill();ctx.stroke();ctx.fillStyle='#e8d9b8';ctx.beginPath();ctx.ellipse(0,-.9*s,.3*s,.09*s,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
    const o=A.kindToOpts(n.kind);const near=n.near;const fg=!n.kind.drum&&LCA.life?LCA.life.fidget('chat',t,(n.p?n.p.x:0)*.13):null,fx=fg&&fg.kind?{w:1,armL:fg.kind==='stretch'?fg.armL:0,armR:(fg.kind==='stretch'||fg.kind==='scratch')?fg.armR:0,head:fg.head,headX:0}:null;A.drawPerson(ctx,o,v.sx,v.sy,v.sc,'f',near?t*5:t*1.2,near?.25:.04,t,n.flip,fx);
    hits.push({npc:n.id,x0:v.sx-v.sc*.5,x1:v.sx+v.sc*.5,y0:v.sy-v.sc*2.1,y1:v.sy,dd:v.dd});
    if(v.dd<90){const lb=label(n.name),lw=lkf()*clamp(v.sc*3,80,150),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-v.sc*2.35-lh,lw,lh)}}
   else if(it.k===5){const ixs=P.idle&&P.idle.sit>.05?P.idle:null;ctx.save();if(ixs){ctx.beginPath();ctx.rect(v.sx-v.sc*2,v.sy-v.sc*4,v.sc*4,v.sc*(3.55+.45*(1-ixs.sit)));ctx.clip();ctx.translate(0,v.sc*.3*ixs.sit)}A.drawPerson(ctx,f.avatar,v.sx,v.sy-P.y*v.sc,v.sc,P.face,P.ph,P.amp,t,P.flip,P.idle);ctx.restore();if(f.heroName){const lb=label(f.heroName),lw=lkf()*clamp(v.sc*1.8,56,104),lh=lw*lb.height/lb.width;htag=[lb,v.sx-lw/2,v.sy-P.y*v.sc-v.sc*2.12-lh,lw,lh]}if(P.y>.05){ctx.save();ctx.translate(v.sx,v.sy);ctx.scale(1,.2);ctx.fillStyle='rgba(20,10,30,.25)';ctx.beginPath();ctx.arc(0,0,v.sc*.5,0,TAU);ctx.fill();ctx.restore()}}
   else if(it.k===13){drawLifeProp(ctx,it.p,it.v,t,f.hour);}
   else if(it.k===15){const a=it.a,v=it.v,rest=f.hour>=20||f.hour<5.5,dir=Math.sin(a.h)>=0?1:-1,sc=v.sc*(a.type==='poule'?1:a.scale);
    if(a.type==='poule')drawHen(ctx,v.sx,v.sy,v.sc,dir,a.ph,a.moving,rest);else{ctx.save();quad(ctx,a.type,v.sx,v.sy,sc,dir,a.ph,!a.moving&&!rest&&Math.sin(a.ph*.9)>.2);ctx.restore()}
    if(v.dd<30&&LCA.animals){const lb=label(LCA.animals.label(a.type,LCA.animals.cur)),lw=lkf()*clamp(v.sc*2,56,110),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-v.sc*(a.type==='poule'?1.2:1.9)-lh,lw,lh)}}
   else if(it.k===14){const r=it.r,v=it.v,sc=v.sc*r.scale,fc=r.moving?(Math.abs(Math.cos(r.ry))>Math.abs(Math.sin(r.ry))?(Math.cos(r.ry)>0?'f':'b'):'s'):(r.face===0||r.face===undefined?'f':'b'),ps=r.pose||{armR:0,armL:0,bob:0};
    ctx.save();if(r.seated){ctx.beginPath();ctx.rect(v.sx-sc*2,v.sy-sc*4,sc*4,sc*3.55);ctx.clip();ctx.translate(0,sc*.3)}
    A.drawPerson(ctx,A.kindToOpts(r.kind),v.sx,v.sy-(ps.bob||0)*sc,sc,fc,r.moving?t*r.sp*3+r.ph:t*(r.act==='cook'?3.2:r.act==='craft'?2.6:1.1)+r.ph,r.moving?1:(r.act==='cook'||r.act==='craft'?.3:r.act==='chat'||r.act==='tell'||r.act==='sell'?.14:.04),t,Math.sin(r.ry)<0,r.pose&&r.pose.fid?{w:1,armL:r.pose.fid==='stretch'?r.pose.armL:0,armR:(r.pose.fid==='stretch'||r.pose.fid==='scratch')?r.pose.armR:0,head:r.pose.head,headX:0}:null);ctx.restore();
    if(v.dd<26){const lb=label(r.role),lw=lkf()*clamp(v.sc*2.4,64,120),lh=lw*lb.height/lb.width;ctx.globalAlpha=.9;ctx.drawImage(lb,v.sx-lw/2,v.sy-sc*2.6-lh,lw,lh);ctx.globalAlpha=1}}
   else if(it.k===12){const h=it.h,rv=h.rv,s=v.sc,bob=Math.sin(t*2.2+h.i)*.1;ctx.save();ctx.translate(v.sx,v.sy);
    ctx.save();ctx.scale(1,.28);ctx.strokeStyle='rgba(255,233,168,'+(.85*rv).toFixed(2)+')';ctx.lineWidth=s*.06;ctx.beginPath();ctx.arc(0,0,s*.6*(.6+.4*rv),0,TAU);ctx.stroke();ctx.restore();
    const gg=ctx.createRadialGradient(0,-s*.85,0,0,-s*.85,s*1.25);gg.addColorStop(0,'rgba('+h.rgb+','+(.65*rv).toFixed(2)+')');gg.addColorStop(1,'rgba('+h.rgb+',0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,-s*.85,s*1.25,0,TAU);ctx.fill();
    ctx.translate(0,-s*(.85+bob));ctx.rotate(t*1.4+h.i);const q=s*(.2+.2*rv);ctx.fillStyle='rgba('+h.rgb+','+(.5+.5*rv).toFixed(2)+')';ctx.strokeStyle='rgba(255,255,255,'+(.9*rv).toFixed(2)+')';ctx.lineWidth=q*.12;
    ctx.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?q*.38:q;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
   else if(it.k===6){const p=it.p;const bob=Math.sin(t*2.4+p.i)*.12,s=v.sc;ctx.save();ctx.translate(v.sx,v.sy);ctx.save();ctx.scale(1,.28);ctx.strokeStyle='rgba(90,200,255,.9)';ctx.lineWidth=s*.07;ctx.beginPath();ctx.arc(0,0,s*.7,0,TAU);ctx.stroke();ctx.restore();
    const gg=ctx.createRadialGradient(0,-s*.8,0,0,-s*.8,s*1.3);gg.addColorStop(0,'rgba(120,210,255,.55)');gg.addColorStop(1,'rgba(120,210,255,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,-s*.8,s*1.3,0,TAU);ctx.fill();
    ctx.translate(0,-s*(.85+bob));ctx.scale(s,s);pickIcon(ctx,p.t,t+p.i);ctx.restore();
    if(v.dd<42&&LCA.animals){const lb=label(LCA.animals.itemLabel(p.t,LCA.animals.cur)),lw=lkf()*clamp(v.sc*2.6,70,140),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-v.sc*2.1-lh,lw,lh)}}
   else if(it.k===7){const b=it.b;const bs=v.sc*1.0;if(b.mode===1||(b.mode===2&&b.t>5))perched(ctx,v.sx,v.sy-b.y*v.sc,bs,b.col,true,t*26);else perched(ctx,v.sx,v.sy-b.y*v.sc,bs,b.col,false,0)}
   else if(it.k===8){const b=it.b,i=it.i;drawSprite(S.boat[i],v.sx,v.sy+Math.sin(t*1.4+i)*v.sc*.05,v.sc*.9,v.dd,fg,Math.sin(t*1.1+i)*.02)}
   else if(it.k===9){const s=v.sc;ctx.save();ctx.translate(v.sx,v.sy);
    /* feu de camp */
    ctx.save();ctx.scale(1,.28);const lg=ctx.createRadialGradient(0,0,0,0,0,s*3.6);lg.addColorStop(0,'rgba(255,170,70,.55)');lg.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=lg;ctx.beginPath();ctx.arc(0,0,s*3.6,0,TAU);ctx.fill();ctx.restore();
    for(let k=0;k<6;k++){const a=k*1.05;blob(ctx,Math.cos(a)*.85*s,Math.sin(a)*.3*s-.1*s,.22*s,.14*s,'#6a6a66')}
    ctx.strokeStyle='#4a2e1a';ctx.lineWidth=.14*s;ctx.lineCap='round';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(Math.cos(k*2.1)*.5*s,-.1*s);ctx.lineTo(-Math.cos(k*2.1)*.5*s,-.35*s);ctx.stroke()}
    const fk=dyn.fireK,fl=(1+Math.sin(t*14)*.1+Math.sin(t*23)*.06)*fk;[['#ff8a1c',.55,1.15],['#ffb83a',.4,.85],['#fff0a0',.22,.55]].forEach(q=>{ctx.fillStyle=q[0];ctx.beginPath();ctx.moveTo(-q[1]*s,-.2*s);ctx.quadraticCurveTo(-q[1]*.9*s,-q[2]*s*fl*.7,Math.sin(t*9)*.08*s,-q[2]*s*fl*1.3);ctx.quadraticCurveTo(q[1]*.9*s,-q[2]*s*fl*.7,q[1]*s,-.2*s);ctx.closePath();ctx.fill()});
    ctx.restore();
    hits.push({root:inter.find(i=>i.id==='fire'),x0:v.sx-v.sc*.9,x1:v.sx+v.sc*.9,y0:v.sy-v.sc*1.8,y1:v.sy,dd:v.dd})}
   else if(it.k===11){const q=it.q,fx=Math.sin(q.h),fz=Math.cos(q.h),fc=Math.abs(fx)>Math.abs(fz)?'s':(fz>0?'f':'b');
    A.drawPerson(ctx,q.o,v.sx,v.sy,v.sc,fc,q.ph,q.moving?1:.05,t,fx<0);
    if(v.dd<110){const lb=label(q.name),lw=lkf()*clamp(v.sc*1.8,56,104),lh=lw*lb.height/lb.width;ctx.drawImage(lb,v.sx-lw/2,v.sy-v.sc*2.12-lh,lw,lh)}}
   else if(it.k===10){drawBunting(t)}}
  if(htag)ctx.drawImage(htag[0],htag[1],htag[2],htag[3],htag[4]);/* le nom reste visible devant le décor */
  /* éléments interactifs sans sprite dédié : puits, mortier, champ */
  inter.forEach(i=>{if(i.type==='well'){const v=vis(i.x,i.z,4);if(v){hits.push({root:i,x0:v.sx-v.sc*1.4,x1:v.sx+v.sc*1.4,y0:v.sy-v.sc*3.6,y1:v.sy,dd:v.dd});if(dyn.wellT>0){const u=dyn.wellT/3,by=1-Math.sin((1-u)*Math.PI);ctx.fillStyle='#7a4a26';ctx.fillRect(v.sx-v.sc*.2,v.sy-v.sc*(2.5-Math.sin((1-u)*Math.PI)*1.1),v.sc*.4,v.sc*.3)}}}
   else if(i.type==='mortar'){const v=vis(i.x,i.z,2);if(v){const s=v.sc;ctx.save();ctx.translate(v.sx,v.sy);softShadowLocal(ctx,0,0,s*.7);const g=ctx.createLinearGradient(-.3*s,0,.3*s,0);g.addColorStop(0,'#a0805a');g.addColorStop(1,'#5a3a22');ctx.fillStyle=g;ctx.strokeStyle='#2a1a16';ctx.lineWidth=s*.03;ctx.beginPath();ctx.moveTo(-.32*s,-.7*s);ctx.lineTo(-.22*s,0);ctx.lineTo(.22*s,0);ctx.lineTo(.32*s,-.7*s);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#3a2414';ctx.beginPath();ctx.ellipse(0,-.7*s,.32*s,.08*s,0,0,TAU);ctx.fill();
    const up=dyn.mortT>0?Math.abs(Math.sin(t*9))*.45:0;ctx.strokeStyle='#5d3a1e';ctx.lineWidth=s*.09;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(.06*s,-.65*s);ctx.lineTo(.12*s,(-1.55-up)*s);ctx.stroke();ctx.restore();hits.push({root:i,x0:v.sx-v.sc*.6,x1:v.sx+v.sc*.6,y0:v.sy-v.sc*1.7,y1:v.sy,dd:v.dd})}}
   else if(i.type==='field'){const v=vis(i.x,i.z,8);if(v)hits.push({root:i,x0:v.sx-v.sc*6,x1:v.sx+v.sc*6,y0:v.sy-v.sc*1.6,y1:v.sy+v.sc*3,dd:v.dd})}
   else if(i.type==='museum'){const v=vis(i.x,i.z,7);if(v)hits.push({root:i,x0:v.sx-v.sc*2.8,x1:v.sx+v.sc*2.8,y0:v.sy-v.sc*7,y1:v.sy,dd:v.dd})}});
  /* oiseaux en vol, papillons, lucioles, feuilles, brume */
  dyn.birds.forEach(b=>{b.a+=dt*b.sp;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=b.h+Math.sin(b.a*2)*1.2;const p=proj(x,z,y);if(p)bird(ctx,p.sx,p.sy,p.sc*.9,t*9+b.a*5,theme==='centrale'?'#1a2a22':'#2a2a38')});
  dyn.bflies.forEach(b=>{b.a+=dt*b.sp;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a*1.3)*b.r,y=.9+Math.sin(b.a*2)*.4;const p=proj(x,z,y);if(!p)return;const w=Math.abs(Math.sin(t*14+b.a))*.18;ctx.fillStyle=b.col;ctx.strokeStyle='rgba(40,20,20,.6)';ctx.lineWidth=1;[-1,1].forEach(sd=>{ctx.beginPath();ctx.ellipse(p.sx+sd*p.sc*w*.5,p.sy,Math.max(1,p.sc*w),p.sc*.1,sd*.5,0,TAU);ctx.fill()})});
  dyn.leaves.forEach(l=>{if(l.t<2.6){l.t+=dt;l.y-=dt*1.5;l.x+=l.vx*dt;l.z+=l.vz*dt;const p=proj(l.x+Math.sin(t*3+l.ph)*.25,l.z,l.y);if(p&&l.y>0){ctx.save();ctx.translate(p.sx,p.sy);ctx.rotate(t*3+l.ph);ctx.fillStyle=th.pal.leaf[3];ctx.beginPath();ctx.ellipse(0,0,p.sc*.12,p.sc*.05,0,0,TAU);ctx.fill();ctx.restore()}}});
  dyn.puffs.forEach(p0=>{p0.age+=dt;if(p0.age>p0.life)p0.age=0;const k=p0.age/p0.life;const p=proj(p0.x+k*3+Math.sin(p0.age)*.3,p0.z,p0.y+k*7);if(!p)return;const r=p.sc*(.5+k*2.4)*p0.k;const g=ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r);const a=Math.sin(k*Math.PI)*.32;g.addColorStop(0,'rgba(230,220,208,'+a+')');g.addColorStop(1,'rgba(230,220,208,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,TAU);ctx.fill()});
  /* brume au sol (centrale) */
  dyn.clouds.forEach(c=>{if(!c.mist)return;c.x+=Math.sin(t*.1+c.ph)*dt*.8;const p=proj(c.x,c.z,c.y);if(!p)return;const r=p.sc*18;const g=ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r);g.addColorStop(0,'rgba(226,240,228,.22)');g.addColorStop(1,'rgba(226,240,228,0)');ctx.fillStyle=g;ctx.fillRect(p.sx-r,p.sy-r*.5,r*2,r)});
  /* poisson */
  {const fs=dyn.fish;fs.t+=dt;if(fs.t>0&&fs.t<1.1){const u=fs.t/1.1,p=proj(fs.x+u*3,fs.z,.2+Math.sin(u*Math.PI)*2);if(p){ctx.save();ctx.translate(p.sx,p.sy);ctx.rotate(-Math.cos(u*Math.PI)*.9);ctx.fillStyle='#d8eaf4';ctx.strokeStyle='#3a5a70';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,p.sc*.45,p.sc*.16,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#9ec4dc';ctx.beginPath();ctx.moveTo(-p.sc*.4,0);ctx.lineTo(-p.sc*.7,-p.sc*.2);ctx.lineTo(-p.sc*.7,p.sc*.2);ctx.fill();ctx.restore()}
   const s0=proj(fs.x+(u<.5?0:3),fs.z,0);if(s0&&(u<.3||u>.85)){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s0.sx,s0.sy,s0.sc*(.6+u),s0.sc*.15,0,0,TAU);ctx.stroke()}}
   else if(fs.t>=1.1){fs.t=-(2.5+Math.random()*4);fs.x=-24+Math.random()*48;fs.z=-72-Math.random()*14}}
  /* lucioles */
  ctx.save();ctx.globalCompositeOperation='lighter';dyn.flies.forEach(b=>{const x=b.x+Math.sin(t*.4+b.ph)*1.5,y=b.y+Math.sin(t*.7+b.ph*2)*.5,z=b.z+Math.cos(t*.3+b.ph)*1.5;const p=proj(x,z,y);if(!p||p.dd>90)return;const r=clamp(p.sc*.05,1,4);const g=ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r*3);g.addColorStop(0,'rgba(255,230,140,.7)');g.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=g;ctx.fillRect(p.sx-r*3,p.sy-r*3,r*6,r*6)});ctx.restore();
  /* guide de quête : balise */
  if(f.tgt){const p=proj(f.tgt.x,f.tgt.z,0);if(p){const d=Math.hypot(P.x-f.tgt.x,P.z-f.tgt.z);if(d>3){ctx.save();ctx.globalCompositeOperation='lighter';const bg=ctx.createLinearGradient(0,p.sy-p.sc*16,0,p.sy);bg.addColorStop(0,'rgba(255,179,71,0)');bg.addColorStop(1,'rgba(255,179,71,'+(.38+.12*Math.sin(t*3))+')');ctx.fillStyle=bg;ctx.fillRect(p.sx-p.sc*.5,p.sy-p.sc*16,p.sc,p.sc*16);ctx.strokeStyle='rgba(255,190,90,.9)';ctx.lineWidth=p.sc*.08;ctx.beginPath();ctx.ellipse(p.sx,p.sy-Math.abs(Math.sin(t*2))*p.sc*.3,p.sc*1.1,p.sc*.3,0,0,TAU);ctx.stroke();ctx.restore()}}}
  /* nuages animés en avant-plan lointain */
  /* étalonnage : chaleur, vignette */
  const vg=ctx.createRadialGradient(W/2,H*.55,Math.min(W,H)*.45,W/2,H*.55,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(20,8,30,0)');vg.addColorStop(1,'rgba(20,8,30,.38)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  const wg2=ctx.createLinearGradient(0,0,0,H);wg2.addColorStop(0,'rgba(255,200,140,0)');wg2.addColorStop(1,'rgba(255,170,90,.08)');ctx.fillStyle=wg2;ctx.fillRect(0,0,W,H)}
 function drawClouds(){const t=performance.now()/1000;dyn.clouds.forEach(c=>{if(c.mist)return;const p=proj(c.x,c.z,c.y);if(!p)return;const sp=S.cloudSpr[c.k];const w=sp.cv.width/A.PPU*p.sc*c.sc*1.2,h=sp.cv.height/A.PPU*p.sc*c.sc*1.2;ctx.drawImage(sp.cv,p.sx-w/2,Math.min(p.sy-h,hy-h*.3)+0,w,h)})}
 function drawBunting(t){const P4=[[-10,-7],[10,-7],[10,11],[-10,11]],cols=['#e8a317','#d4513b','#2f9e8f','#3b8bd9','#f4efe4','#7a2e65'];
  for(let s=0;s<4;s++){const a=P4[s],b=P4[(s+1)%4];const pts=[];for(let k=0;k<=28;k++){const u=k/28;pts.push(proj(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,3.55-Math.sin(u*Math.PI)*.8+Math.sin(t*1.5+k*.4)*.03))}
   if(pts.some(p=>!p))continue;ctx.strokeStyle='#4a2e1a';ctx.lineWidth=Math.max(1,pts[0].sc*.03);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.sx,p.sy):ctx.moveTo(p.sx,p.sy));ctx.stroke();
   for(let k=1;k<28;k+=2){const p=pts[k],w=p.sc*.34,h=p.sc*.5;ctx.fillStyle=cols[(k+s)%6];ctx.strokeStyle='rgba(40,20,20,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.sx-w,p.sy);ctx.lineTo(p.sx+w,p.sy);ctx.lineTo(p.sx+Math.sin(t*2+k)*w*.2,p.sy+h);ctx.closePath();ctx.fill();ctx.stroke()}}}
 function pickIcon(c,type,t){c.lineJoin='round';c.strokeStyle='#2a1a16';c.lineWidth=.04;
  if(type==='poisson'){c.rotate(Math.sin(t*2)*.12);c.fillStyle='#a9ccdd';c.beginPath();c.ellipse(0,0,.38,.17,0,0,TAU);c.fill();c.stroke();c.fillStyle='#7fa4b8';c.beginPath();c.moveTo(-.32,0);c.lineTo(-.58,-.17);c.lineTo(-.58,.17);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(.2,-.04,.04,0,TAU);c.fill();c.fillStyle='#111';c.beginPath();c.arc(.21,-.04,.02,0,TAU);c.fill()}
  else if(type==='riz'){c.fillStyle='#eee0c0';c.beginPath();c.moveTo(-.28,.3);c.lineTo(-.22,-.28);c.quadraticCurveTo(0,-.45,.22,-.28);c.lineTo(.28,.3);c.closePath();c.fill();c.stroke();c.strokeStyle='#8a6a3a';c.lineWidth=.06;c.beginPath();c.moveTo(-.24,-.2);c.lineTo(.24,-.2);c.stroke()}
  else if(type==='eau'){c.fillStyle='#c9703a';c.beginPath();c.moveTo(-.14,-.35);c.quadraticCurveTo(-.4,-.15,-.34,.1);c.quadraticCurveTo(-.3,.34,0,.34);c.quadraticCurveTo(.3,.34,.34,.1);c.quadraticCurveTo(.4,-.15,.14,-.35);c.closePath();c.fill();c.stroke();c.fillStyle='#6fcaff';c.beginPath();c.ellipse(0,-.34,.14,.04,0,0,TAU);c.fill()}
  else{c.fillStyle='#b5473a';c.beginPath();c.ellipse(0,0,.34,.24,0,0,TAU);c.fill();c.stroke();c.fillStyle='#f4efe4';c.fillRect(.3,-.05,.28,.1);c.strokeRect(.3,-.05,.28,.1);c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(-.1,-.1,.14,.07,0,0,TAU);c.fill()}}

 /* ----- simulation légère ----- */
 function update(dt,t,P,flags){
  dyn.wand.forEach(w=>{const p=w.pts[w.i],dx=p[0]-w.x,dz=p[1]-w.z,d=Math.hypot(dx,dz);if(d<.4)w.i=(w.i+1)%w.pts.length;else{w.x+=dx/d*w.sp*dt;w.z+=dz/d*w.sp*dt;w.fx=dx/d;w.fz=dz/d;w.ph+=dt*w.sp*3.2}});
  if(dyn.chick){const c=dyn.chick,p=c.pts[c.i],dx=p[0]-c.x,dz=p[1]-c.z,d=Math.hypot(dx,dz);if(d<.3)c.i=(c.i+1)%c.pts.length;else{c.x+=dx/d*.9*dt;c.z+=dz/d*.9*dt}}
  dyn.anim.forEach(a=>{if(a.still)return;const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);if(d<7.5){a.mode=1}
   if(a.mode===1){const l=d||1;a.x+=dx/l*a.sp*dt;a.z+=dz/l*a.sp*dt;a.dir=dx>=0?1:-1;a.ph+=dt*a.sp*2.4;if(d>16)a.mode=2}
   else if(a.mode===2){const hx2=a.home[0]-a.x,hz=a.home[1]-a.z,hd=Math.hypot(hx2,hz);if(hd<.6)a.mode=0;else{a.x+=hx2/hd*1.4*dt;a.z+=hz/hd*1.4*dt;a.dir=hx2>=0?1:-1;a.ph+=dt*3}}});
  dyn.perch.forEach(b=>{const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);
   if(b.mode===0){if(d<6.5){b.mode=1;b.t=0;const l=d||1;b.dir=[dx/l+(Math.random()-.5)*.8,dz/l+(Math.random()-.5)*.8]}}
   else if(b.mode===1){b.t+=dt;b.x+=b.dir[0]*5*dt;b.z+=b.dir[1]*5*dt;b.y+=(b.t<2?3.2:-.2)*dt;if(b.t>5){b.mode=2;b.t=0}}
   else{b.t+=dt;if(b.t>5&&d>10){const hx2=b.home[0]-b.x,hy2=b.home[1]-b.y,hz=b.home[2]-b.z,hd=Math.hypot(hx2,hy2,hz);if(hd<.3){b.mode=0;b.x=b.home[0];b.y=b.home[1];b.z=b.home[2]}else{b.x+=hx2/hd*5*dt;b.y+=hy2/hd*5*dt;b.z+=hz/hd*5*dt}}}});
  if(dyn.wellT>0)dyn.wellT-=dt;if(dyn.mortT>0)dyn.mortT-=dt;if(dyn.fieldT>0)dyn.fieldT-=dt;dyn.fireK+=(1-dyn.fireK)*Math.min(1,dt*1.6)}
 /* ----- interaction ----- */
 function trigger(root,P){
  const it=root,r={msg:it.msg||'',re:it.re};
  if(it.type==='tree'){if(it.ent)it.ent.shake=1.6;let n=0;dyn.leaves.forEach(l=>{if(l.t>=2.6&&n<9){l.t=0;l.vx=(Math.random()-.5)*1.6;l.vz=(Math.random()-.5)*1.6;l.ph=Math.random()*6;l.x=it.x+(Math.random()-.5)*2;l.y=(it.h||5)*.9;l.z=it.z+.5;n++}});r.msg='Tu secoues '+(it.name==='Acacia'?'l’acacia':'l’arbre')+' : des feuilles tombent.'}
  else if(it.type==='well')dyn.wellT=3;else if(it.type==='mortar')dyn.mortT=3;else if(it.type==='fire')dyn.fireK=2.1;else if(it.type==='field')dyn.fieldT=2.4;
  return r}
 function hit(px,py){let best=null;for(const h of hits){if(px>=h.x0&&px<=h.x1&&py>=h.y0&&py<=h.y1){if(!best||h.dd<best.dd)best=h}}return best}
 function nearInter(x,z){let best=null,bd=99;inter.forEach(i=>{if(!i.key)return;const d=Math.hypot(x-i.x,z-i.z);if(d<(i.nr||3.6)&&d<bd){bd=d;best=i}});return best}
 return {resize,render,update,build,hit,trigger,nearInter,get coll(){return coll},get huts(){return huts},get picks(){return picks},setHidden(l){hid=l||[]},get hid(){return hid},get inter(){return inter},get th(){return th},get theme(){return theme},
  setLow(v){low=!!v},themes:TH,shake(){},get cam(){return {x:camX,hy,ppu}}}}
LCA.createRenderer=createRenderer;
})(window.LCA=window.LCA||{});
