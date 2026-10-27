/* Art 2D peint (style animation japonaise) : outils de dessin, décors prérendus, personnages cel-shadés.
   Tout est généré par du code, aucun fichier image externe. */
(function(LCA){
'use strict';
const TAU=Math.PI*2;
let seed=7;
const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const reseed=s=>{seed=(s*9301+49297)%2147483647||7};
const RR=(a,b)=>a+(b-a)*rnd();
const hx=n=>'#'+('000000'+(Math.round(n)|0).toString(16)).slice(-6);
const parse=c=>{if(typeof c==='number')c=hx(c);if(c[0]!=='#')return [128,128,128];if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255]};
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>('0'+Math.max(0,Math.min(255,Math.round(v))).toString(16)).slice(-2)).join('');
const mixC=(a,b,t)=>{a=parse(a);b=parse(b);return toHex(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t)};
const shade=(c,k)=>k<0?mixC(c,'#120a1e',-k):mixC(c,'#fff1cf',k);
const rgba=(c,a)=>{const p=parse(c);return 'rgba('+p[0]+','+p[1]+','+p[2]+','+a+')'};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(w));c.height=Math.max(2,Math.ceil(h));return c};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- pinceaux ---------- */
function blob(c,x,y,rx,ry,col,a,rot){c.save();c.globalAlpha=a===undefined?1:a;c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.005,rx),Math.max(.005,ry),rot||0,0,TAU);c.fill();c.restore()}
function softShadow(c,x,y,rx,ry,a){c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba(20,10,30,'+(a||.35)+')');g.addColorStop(.6,'rgba(20,10,30,'+((a||.35)*.5)+')');g.addColorStop(1,'rgba(20,10,30,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore()}
/* feuillage peint : amas de taches, plus clair en haut à gauche (soleil) */
function foliage(c,cx,cy,rx,ry,pal,n,sz){
 for(let i=0;i<n;i++){const a=rnd()*TAU,r=Math.sqrt(rnd());const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lit=clamp(.5+(-(y-cy)/ry*.38)+(-(x-cx)/rx*.22)+(rnd()-.5)*.35,0,.999);const col=pal[Math.floor(lit*pal.length)];
  blob(c,x,y,sz*(.6+rnd()*.8),sz*(.5+rnd()*.6),col,.92,rnd()*3)}
 for(let i=0;i<n*.25;i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*.8;blob(c,cx+Math.cos(a)*rx*r-rx*.12,cy+Math.sin(a)*ry*r-ry*.2,sz*.32,sz*.2,pal[pal.length-1],.75,rnd()*3)}}
function strokes(c,x,y,w,h,col,n,len,ang){c.save();c.strokeStyle=col;c.lineCap='round';for(let i=0;i<n;i++){const px=x+rnd()*w,py=y+rnd()*h;c.globalAlpha=.25+rnd()*.5;c.lineWidth=.6+rnd()*1.4;c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(ang||1.2)*len*(.4+rnd()),py+Math.sin(ang||1.2)*len*(.4+rnd()));c.stroke()}c.restore()}
function grain(c,w,h,n,dark,light){for(let i=0;i<n;i++){const x=rnd()*w,y=rnd()*h;c.fillStyle=rnd()<.5?dark:light;c.globalAlpha=.06+rnd()*.12;c.fillRect(x,y,1+rnd()*2,1+rnd()*2)}c.globalAlpha=1}

/* ---------- sprites prérendus ---------- */
const PPU=44; /* pixels par unité du monde pour les sprites */
function spr(wu,hu,fn){const cv=mk(wu*PPU,hu*PPU),c=cv.getContext('2d');c.translate(cv.width/2,cv.height);c.scale(PPU,PPU);fn(c,wu,hu);return {cv,wu,hu,tint:{}}}
/* dessine en unités : (0,0) = pied, y vers le haut négatif */

function treeAcacia(P){return spr(11,7,(c,w,h)=>{reseed(P.s||1);softShadow(c,0,-.05,4.2,.8,.22);
 c.fillStyle=P.trunk[1];c.beginPath();c.moveTo(-.25,0);c.quadraticCurveTo(-.2,-2.4,-1,-3.8);c.lineTo(-.55,-3.9);c.quadraticCurveTo(0,-2.6,.12,-1.6);c.quadraticCurveTo(.5,-2.8,1.3,-3.8);c.lineTo(1.7,-3.5);c.quadraticCurveTo(.5,-2.4,.35,0);c.fill();
 c.fillStyle=P.trunk[0];c.beginPath();c.moveTo(-.25,0);c.quadraticCurveTo(-.2,-2.4,-1,-3.8);c.lineTo(-.7,-3.8);c.quadraticCurveTo(-.05,-2.4,0,0);c.fill();
 foliage(c,0,-4.6,4.6,.95,P.leaf,150,.55);foliage(c,-1.4,-4.9,2.4,.6,P.leaf,50,.45);foliage(c,2.2,-4.7,2,.55,P.leaf,45,.45)})}
function treeBaobab(P){return spr(10,12,(c,w,h)=>{reseed(3);softShadow(c,0,-.05,4,.8,.25);
 const g=c.createLinearGradient(-2,0,2.4,0);g.addColorStop(0,P.trunk[0]);g.addColorStop(.55,P.trunk[1]);g.addColorStop(1,P.trunk[2]);c.fillStyle=g;
 c.beginPath();c.moveTo(-2.3,0);c.bezierCurveTo(-1.6,-2,-1.5,-4,-1.7,-6.6);c.lineTo(1.7,-6.6);c.bezierCurveTo(1.7,-4,1.9,-2,2.6,0);c.fill();
 strokes(c,-2,-6.5,4,6.5,P.trunk[2],60,.9,1.55);strokes(c,-2,-6.5,3,6.5,P.trunk[0],40,.8,1.5);
 c.strokeStyle=P.trunk[1];c.lineWidth=.38;c.lineCap='round';[[-1.3,-6.4,-3.2,-8.4],[-.4,-6.5,-1.2,-9],[.6,-6.5,1.6,-9.2],[1.4,-6.4,3.3,-8.2],[0,-6.5,.2,-8.6]].forEach(b=>{c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo((b[0]+b[2])/2,b[3]-.2,b[2],b[3]);c.stroke()});
 foliage(c,0,-9.4,4.4,1.7,P.leaf,170,.62)})}
function treePalm(P){return spr(7,9,(c,w,h)=>{reseed(5);softShadow(c,0,-.05,1.8,.4,.22);
 c.strokeStyle=P.trunk[1];c.lineWidth=.36;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(.5,-3,-.4,-7.2);c.stroke();
 c.strokeStyle=P.trunk[0];c.lineWidth=.14;c.beginPath();c.moveTo(-.1,0);c.quadraticCurveTo(.4,-3,-.5,-7.2);c.stroke();
 for(let i=0;i<9;i++){const a=-Math.PI+i/8*Math.PI,len=2.8+rnd()*.7;c.save();c.translate(-.4,-7.2);c.strokeStyle=P.leaf[1+(i%2)];c.lineWidth=.12;c.lineCap='round';
  const ex=Math.cos(a)*len,ey=Math.sin(a)*len*.55+len*.55;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(ex*.5,ey*.2-.9,ex,ey);c.stroke();
  c.strokeStyle=P.leaf[2];c.lineWidth=.04;for(let k=1;k<9;k++){const t=k/9,px=ex*t,py=(ey*.2-.9)*2*t*(1-t)+ey*t*t;c.beginPath();c.moveTo(px,py);c.lineTo(px+.25*(a<-1.57?-1:1)*0+.1,py+.4);c.moveTo(px,py);c.lineTo(px-.1,py+.4);c.stroke()}c.restore()}
 blob(c,-.35,-7,.28,.28,'#5a3a1e')})}
function treeBanana(P){return spr(5,5,(c,w,h)=>{reseed(9);softShadow(c,0,-.05,1.6,.35,.2);c.fillStyle=P.trunk[0];c.fillRect(-.14,-2.6,.28,2.6);
 for(let i=0;i<7;i++){const a=-Math.PI*.9+i/6*Math.PI*.8,len=2.2;c.save();c.translate(0,-2.6);c.rotate(a+Math.PI/2);c.fillStyle=P.leaf[i%P.leaf.length];c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(.5,-len*.5,.1,-len);c.quadraticCurveTo(-.4,-len*.5,0,0);c.fill();c.strokeStyle=P.leaf[0];c.lineWidth=.03;c.beginPath();c.moveTo(0,0);c.lineTo(.05,-len);c.stroke();c.restore()}})}
function treeForest(P,k){return spr(6,12,(c,w,h)=>{reseed(20+k);const th=8+rnd()*2.5;softShadow(c,0,-.05,2.2,.5,.3);
 c.fillStyle=P.trunk[1];c.beginPath();c.moveTo(-.5,0);c.quadraticCurveTo(-.25,-th*.5,-.3,-th);c.lineTo(.3,-th);c.quadraticCurveTo(.25,-th*.5,.55,0);c.fill();c.fillStyle=P.trunk[0];c.fillRect(-.35,-th,.3,th);
 foliage(c,0,-th-.6,2.6,2.2,P.leaf,150,.7);foliage(c,-1.2,-th+.6,1.9,1.4,P.leaf,60,.55);foliage(c,1.3,-th+1,1.8,1.3,P.leaf,60,.55);
 c.strokeStyle=P.leaf[0];c.globalAlpha=.55;c.lineWidth=.04;for(let i=0;i<7;i++){const x=RR(-1.6,1.6);c.beginPath();c.moveTo(x,-th+.6);c.lineTo(x+RR(-.15,.15),-th+RR(1.6,3));c.stroke()}c.globalAlpha=1})}
function bush(P,k){return spr(3.4,2.2,(c,w,h)=>{reseed(40+k);softShadow(c,0,-.04,1.4,.3,.25);foliage(c,0,-.85,1.35,.8,P.leaf,60,.42)})}
function fern(P){return spr(3,2,(c,w,h)=>{reseed(60);for(let i=0;i<9;i++){const a=-Math.PI*.95+i/8*Math.PI*.9,len=RR(1.3,1.9);c.save();c.translate(0,0);c.strokeStyle=P.leaf[1+(i%2)];c.lineWidth=.07;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*len*.5,-len*.9,Math.cos(a)*len,-len*.45);c.stroke();
  c.strokeStyle=P.leaf[2];c.lineWidth=.025;for(let k=1;k<8;k++){const t=k/8,px=Math.cos(a)*len*t,py=-len*.9*2*t*(1-t)-len*.45*t*t;c.beginPath();c.moveTo(px,py);c.lineTo(px+.14,py+.12);c.moveTo(px,py);c.lineTo(px-.14,py+.12);c.stroke()}c.restore()}})}
function aloe(P){return spr(2.6,3,(c,w,h)=>{reseed(70);softShadow(c,0,-.04,.9,.2,.25);c.fillStyle='#6a5a40';c.fillRect(-.12,-1.1,.24,1.1);
 for(let i=0;i<9;i++){const a=-Math.PI*.5+(i-4)*.26;c.save();c.translate(0,-1.1);c.rotate(a);c.fillStyle=i%2?'#5c8a4a':'#6a9a54';c.beginPath();c.moveTo(-.1,0);c.quadraticCurveTo(0,-1,0,-1.5);c.quadraticCurveTo(.1,-.8,.1,0);c.fill();c.restore()}
 c.fillStyle='#e8452a';c.fillRect(-.04,-2.6,.08,1.5);[[-.1,-2.4],[.1,-2.2],[-.08,-2.0],[.07,-1.8]].forEach(p=>blob(c,p[0],p[1],.1,.16,'#f06a2a'))})}
function kopje(P,k){return spr(8,6,(c,w,h)=>{reseed(80+k);softShadow(c,0,-.05,3.4,.7,.28);
 const rocks=[[-1.6,-1.1,1.8,1.1],[1.2,-1.3,2.1,1.3],[-.2,-2.7,1.7,1.1],[.9,-3.7,1.2,.9],[-2.4,-.5,1.1,.6]];
 rocks.forEach(r=>{const g=c.createLinearGradient(r[0]-r[2],r[1]-r[3],r[0]+r[2],r[1]+r[3]);g.addColorStop(0,P.rock[2]);g.addColorStop(.5,P.rock[1]);g.addColorStop(1,P.rock[0]);c.fillStyle=g;c.beginPath();c.moveTo(r[0]-r[2],r[1]+r[3]*.8);c.quadraticCurveTo(r[0]-r[2]*.9,r[1]-r[3]*1.1,r[0]-r[2]*.2,r[1]-r[3]);c.quadraticCurveTo(r[0]+r[2]*.8,r[1]-r[3]*1.05,r[0]+r[2],r[1]+r[3]*.8);c.closePath();c.fill();
  c.strokeStyle=P.rock[0];c.globalAlpha=.4;c.lineWidth=.04;c.beginPath();c.moveTo(r[0]-r[2]*.3,r[1]-r[3]*.9);c.lineTo(r[0]-r[2]*.1,r[1]+r[3]*.5);c.stroke();c.globalAlpha=1})})}
function rock(P,k){return spr(2,1.2,(c,w,h)=>{reseed(90+k);softShadow(c,0,-.03,.9,.2,.25);const g=c.createLinearGradient(-.8,-1,.8,0);g.addColorStop(0,P.rock[2]);g.addColorStop(1,P.rock[0]);c.fillStyle=g;c.beginPath();c.moveTo(-.85,0);c.quadraticCurveTo(-.7,-.95,-.1,-.85);c.quadraticCurveTo(.7,-.9,.85,0);c.closePath();c.fill()})}
function tuft(P,k){return spr(1.4,1.1,(c,w,h)=>{reseed(100+k);for(let i=0;i<9;i++){const x=RR(-.5,.5),len=RR(.5,1);c.strokeStyle=P.grass[Math.floor(rnd()*P.grass.length)];c.lineWidth=.07+rnd()*.05;c.lineCap='round';c.beginPath();c.moveTo(x*.4,0);c.quadraticCurveTo(x*.8,-len*.6,x+RR(-.15,.25),-len);c.stroke()}})}
function flowerPatch(P,k){return spr(1.4,.9,(c,w,h)=>{reseed(110+k);for(let i=0;i<6;i++){const x=RR(-.5,.5),y=-RR(.15,.65);c.strokeStyle=P.grass[1];c.lineWidth=.04;c.beginPath();c.moveTo(x,0);c.lineTo(x,y);c.stroke();blob(c,x,y,.08,.08,P.flowers[i%P.flowers.length]);blob(c,x-.02,y-.02,.03,.03,'#fff',.8)}})}
function reed(P){return spr(1.2,2.6,(c,w,h)=>{reseed(120);for(let i=0;i<6;i++){const x=RR(-.35,.35),len=RR(1.8,2.5);c.strokeStyle=P.grass[i%P.grass.length];c.lineWidth=.06;c.lineCap='round';c.beginPath();c.moveTo(x*.5,0);c.quadraticCurveTo(x,-len*.6,x+RR(-.2,.3),-len);c.stroke();if(i%3===0){c.strokeStyle='#6a4a2a';c.lineWidth=.1;c.beginPath();c.moveTo(x+RR(-.1,.1),-len);c.lineTo(x+RR(-.1,.1),-len-.35);c.stroke()}}})}
function termite(P){return spr(3,3,(c,w,h)=>{reseed(130);softShadow(c,0,-.04,1.2,.25,.25);const g=c.createLinearGradient(-1,0,1,0);g.addColorStop(0,'#c98a52');g.addColorStop(1,'#7a4a2c');c.fillStyle=g;c.beginPath();c.moveTo(-1.1,0);c.quadraticCurveTo(-.8,-1.6,-.2,-2.6);c.quadraticCurveTo(.5,-1.6,1.1,0);c.fill();strokes(c,-.9,-2.4,1.8,2.4,'#5a3420',16,.4,1.4)})}

/* ---------- bâtiments ---------- */
function hutRound(P,k){return spr(8.4,6.6,(c,w,h)=>{reseed(140+k);const W=P.wall[k%P.wall.length],Rf=P.roof[k%P.roof.length],B=P.band[k%P.band.length];softShadow(c,.3,-.05,3.9,.8,.3);
 const g=c.createLinearGradient(-2.3,0,2.4,0);g.addColorStop(0,shade(W,.18));g.addColorStop(.5,W);g.addColorStop(1,shade(W,-.35));c.fillStyle=g;
 c.beginPath();c.moveTo(-2.2,-.15);c.lineTo(-2.2,-2.3);c.lineTo(2.2,-2.3);c.lineTo(2.2,-.15);c.quadraticCurveTo(0,.25,-2.2,-.15);c.fill();
 strokes(c,-2.1,-2.2,4.2,2.1,shade(W,-.3),50,.5,1.55);strokes(c,-2.1,-2.2,3,2.1,shade(W,.25),35,.4,1.55);
 c.fillStyle=B;c.beginPath();c.moveTo(-2.2,-.7);c.lineTo(2.2,-.7);c.lineTo(2.2,-.35);c.lineTo(-2.2,-.35);c.fill();
 c.fillStyle=shade(B,.25);for(let i=0;i<9;i++)c.fillRect(-2.0+i*.5,-.62,.22,.12);
 /* porte */
 c.fillStyle='#2a1409';c.beginPath();c.moveTo(-.5,-.05);c.lineTo(-.5,-1.35);c.quadraticCurveTo(0,-1.95,.5,-1.35);c.lineTo(.5,-.05);c.fill();c.fillStyle='rgba(255,170,70,.35)';c.beginPath();c.moveTo(-.4,-.05);c.lineTo(-.4,-1.2);c.quadraticCurveTo(0,-1.6,.4,-1.2);c.lineTo(.4,-.05);c.fill();
 c.strokeStyle=shade(W,.3);c.lineWidth=.08;c.beginPath();c.moveTo(-.58,0);c.lineTo(-.58,-1.4);c.quadraticCurveTo(0,-2.1,.58,-1.4);c.lineTo(.58,0);c.stroke();
 /* toit de chaume */
 const tg=c.createLinearGradient(-3.6,-4,3.6,-2);tg.addColorStop(0,shade(Rf,.3));tg.addColorStop(.5,Rf);tg.addColorStop(1,shade(Rf,-.4));c.fillStyle=tg;
 c.beginPath();c.moveTo(-3.7,-2.0);c.quadraticCurveTo(-1.5,-3.1,-.15,-6.4);c.lineTo(.15,-6.4);c.quadraticCurveTo(1.6,-3.1,3.7,-2.0);c.quadraticCurveTo(0,-1.55,-3.7,-2.0);c.fill();
 for(let i=0;i<150;i++){const t=rnd(),x=(rnd()-.5)*2*(3.6*(1-t)+.1),y=-2.1-t*4.1;c.strokeStyle=rnd()<.5?shade(Rf,.35):shade(Rf,-.4);c.globalAlpha=.35+rnd()*.4;c.lineWidth=.04;c.beginPath();c.moveTo(x,y);c.lineTo(x+RR(-.15,.15)+(x>0?.2:-.2)*0,y+.45);c.stroke()}c.globalAlpha=1;
 c.fillStyle=shade(Rf,-.5);c.beginPath();c.moveTo(-3.7,-2.0);c.quadraticCurveTo(0,-1.55,3.7,-2.0);c.lineTo(3.6,-1.78);c.quadraticCurveTo(0,-1.3,-3.6,-1.78);c.fill();
 c.strokeStyle=shade(Rf,-.3);c.lineWidth=.1;c.beginPath();c.moveTo(0,-6.4);c.lineTo(0,-7);c.stroke();blob(c,0,-7.05,.14,.14,'#5a3a1e')})}
function houseBox(P,k){return spr(7.2,6.4,(c,w,h)=>{reseed(160+k);const W=P.wall[k%P.wall.length],Rf=P.roof[k%P.roof.length],B=P.band[k%P.band.length];softShadow(c,.3,-.05,3.5,.7,.3);
 const g=c.createLinearGradient(-2.6,0,2.6,0);g.addColorStop(0,shade(W,.14));g.addColorStop(.7,W);g.addColorStop(1,shade(W,-.32));c.fillStyle=g;c.fillRect(-2.6,-3.0,5.2,3.0);
 c.fillStyle=shade(W,-.45);c.beginPath();c.moveTo(2.6,-3);c.lineTo(3.3,-3.25);c.lineTo(3.3,-.25);c.lineTo(2.6,0);c.fill();
 strokes(c,-2.5,-2.9,5,2.8,shade(W,-.25),40,.5,1.5);strokes(c,-2.5,-2.9,3.6,2.8,shade(W,.2),30,.4,1.5);
 c.fillStyle=Rf;c.fillRect(-2.9,-3.5,5.8,.55);c.fillStyle=shade(Rf,-.35);c.fillRect(-2.9,-3.0,5.8,.14);c.fillStyle=shade(Rf,.3);c.fillRect(-2.9,-3.56,5.8,.1);
 c.fillStyle=W;c.fillRect(-1.9,-4.6,1.9,1.1);c.fillStyle=shade(W,-.3);c.fillRect(-1.9,-3.6,1.9,.12);
 c.fillStyle=B;c.fillRect(-.65,-2.1,1.3,2.1);c.fillStyle='#2a1409';c.beginPath();c.moveTo(-.5,0);c.lineTo(-.5,-1.65);c.quadraticCurveTo(0,-2.1,.5,-1.65);c.lineTo(.5,0);c.fill();
 [[-2.1,-2.2],[1.5,-2.2]].forEach(p=>{c.fillStyle=shade(W,.3);c.fillRect(p[0]-.05,p[1]-.05,.9,.9);c.fillStyle='#24140c';c.fillRect(p[0],p[1],.8,.8);c.fillStyle='rgba(255,180,90,.3)';c.fillRect(p[0],p[1],.8,.35)});
 c.fillStyle=B;c.fillRect(-2.6,-.4,5.2,.3);c.fillStyle=shade(B,.3);for(let i=0;i<10;i++)c.fillRect(-2.5+i*.52,-.34,.24,.1)})}
function school(P){return spr(13,8,(c,w,h)=>{reseed(180);softShadow(c,0,-.05,6,1,.3);
 const g=c.createLinearGradient(-5,0,5,0);g.addColorStop(0,'#e6cc9e');g.addColorStop(.7,'#d3b68c');g.addColorStop(1,'#8a6e4c');c.fillStyle=g;c.fillRect(-4.8,-3.6,9.6,3.6);
 strokes(c,-4.7,-3.5,9.4,3.4,'#a8895f',50,.5,1.5);
 c.fillStyle='#8f4b2b';c.beginPath();c.moveTo(-5.6,-3.5);c.lineTo(-1.8,-6.6);c.lineTo(1.8,-6.6);c.lineTo(5.6,-3.5);c.closePath();c.fill();c.fillStyle='#b8623a';c.beginPath();c.moveTo(-5.6,-3.5);c.lineTo(-1.8,-6.6);c.lineTo(-.4,-6.6);c.lineTo(-3,-3.5);c.fill();
 c.fillStyle='#c0502c';c.fillRect(-4.8,-.5,9.6,.5);c.fillStyle='#3a2412';c.beginPath();c.moveTo(-.6,0);c.lineTo(-.6,-2.2);c.quadraticCurveTo(0,-2.6,.6,-2.2);c.lineTo(.6,0);c.fill();
 [-3.3,-1.8,1.8,3.3].forEach(x=>{c.fillStyle='#e9d6b0';c.fillRect(x-.55,-2.9,1.1,1.2);c.fillStyle='#1f2f48';c.fillRect(x-.45,-2.8,.9,1);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(x-.45,-2.8,.9,.35)})})}
function stall(P,awn){return spr(5.4,4,(c,w,h)=>{reseed(200);softShadow(c,0,-.05,2.4,.5,.3);
 c.fillStyle='#5d3a1e';[-2.2,2.2].forEach(x=>c.fillRect(x-.07,-3,.14,3));c.fillStyle='#7a4a26';c.fillRect(-2.1,-1.1,4.2,1.1);c.fillStyle=shade('#7a4a26',.2);c.fillRect(-2.1,-1.15,4.2,.15);
 for(let i=0;i<9;i++){c.fillStyle=i%2?awn:shade(awn,.4);c.beginPath();c.moveTo(-2.6+i*.58,-3.05);c.lineTo(-2.05+i*.58,-3.05);c.lineTo(-2.1+i*.58,-2.4);c.lineTo(-2.65+i*.58,-2.4);c.fill()}
 c.fillStyle=awn;c.beginPath();c.moveTo(-2.7,-3.1);c.lineTo(2.7,-3.1);c.lineTo(2.9,-2.7);c.lineTo(-2.9,-2.7);c.fill()})}
function granary(P){return spr(4,5,(c,w,h)=>{reseed(210);softShadow(c,0,-.05,1.7,.35,.28);c.fillStyle='#5d3a1e';[-.9,.9].forEach(x=>c.fillRect(x-.1,-1,.2,1));
 const g=c.createLinearGradient(-1.4,0,1.4,0);g.addColorStop(0,'#dcb070');g.addColorStop(.6,'#c89a5a');g.addColorStop(1,'#8a6838');c.fillStyle=g;c.beginPath();c.moveTo(-1.3,-1);c.quadraticCurveTo(-1.5,-2.2,-1.2,-2.8);c.lineTo(1.2,-2.8);c.quadraticCurveTo(1.5,-2.2,1.3,-1);c.closePath();c.fill();
 strokes(c,-1.2,-2.8,2.4,1.8,'#8a6838',20,.4,1.5);c.fillStyle='#d8a24f';c.beginPath();c.moveTo(-1.9,-2.7);c.lineTo(0,-4.4);c.lineTo(1.9,-2.7);c.quadraticCurveTo(0,-2.4,-1.9,-2.7);c.fill();strokes(c,-1.8,-4.3,3.6,1.6,'#a8782e',30,.4,1.4)})}
function jar(col){return spr(1.2,1.4,(c,w,h)=>{softShadow(c,0,-.03,.5,.12,.3);const g=c.createLinearGradient(-.5,0,.5,0);g.addColorStop(0,shade(col,.3));g.addColorStop(.6,col);g.addColorStop(1,shade(col,-.4));c.fillStyle=g;c.beginPath();c.moveTo(-.2,-1.2);c.quadraticCurveTo(-.55,-.9,-.5,-.45);c.quadraticCurveTo(-.4,0,0,0);c.quadraticCurveTo(.4,0,.5,-.45);c.quadraticCurveTo(.55,-.9,.2,-1.2);c.closePath();c.fill();c.fillStyle=shade(col,-.5);c.fillRect(-.22,-1.26,.44,.1);c.strokeStyle=shade(col,.45);c.lineWidth=.04;c.beginPath();c.moveTo(-.42,-.6);c.quadraticCurveTo(0,-.45,.42,-.6);c.stroke()})}
function wellSpr(){return spr(4,4.4,(c,w,h)=>{reseed(220);softShadow(c,0,-.05,1.8,.4,.3);const g=c.createLinearGradient(-1.2,0,1.2,0);g.addColorStop(0,'#b8a88e');g.addColorStop(1,'#6a5a46');c.fillStyle=g;c.beginPath();c.ellipse(0,-.5,1.25,.38,0,0,TAU);c.fill();c.fillRect(-1.25,-1.2,2.5,.7);c.beginPath();c.ellipse(0,-1.2,1.25,.38,0,0,TAU);c.fillStyle='#d2c2a6';c.fill();c.fillStyle='#1d4a68';c.beginPath();c.ellipse(0,-1.2,.95,.27,0,0,TAU);c.fill();
 strokes(c,-1.2,-1.2,2.4,.7,'#4a3a2a',16,.2,1.5);c.fillStyle='#5d3a1e';[-1.1,1.1].forEach(x=>c.fillRect(x-.07,-3.5,.14,2.4));c.fillRect(-1.25,-3.6,2.5,.14);c.strokeStyle='#c9b080';c.lineWidth=.03;c.beginPath();c.moveTo(0,-3.5);c.lineTo(0,-2.5);c.stroke();c.fillStyle='#7a4a26';c.fillRect(-.2,-2.5,.4,.3)})}
function cloud(k,tone){return spr(11,4,(c,w,h)=>{reseed(300+k);const n=16;
 for(let i=0;i<n;i++){const x=RR(-4.2,4.2),y=-RR(.6,2.6)*(1-Math.abs(x)/6),r=RR(.8,1.7);const g=c.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);g.addColorStop(0,tone[0]);g.addColorStop(.7,tone[1]);g.addColorStop(1,tone[2]);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
 c.globalCompositeOperation='source-atop';const gg=c.createLinearGradient(0,-3.4,0,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(1,tone[3]);c.fillStyle=gg;c.fillRect(-6,-4,12,4)})}
function soft(col,r,a){return spr(r*2,r*2,(c)=>{const g=c.createRadialGradient(0,-r,0,0,-r,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(0,-r,r,0,TAU);c.fill()})}

/* ---------- personnages (cel-shading) ---------- */
const OUT='#2a1a16';
function kindToOpts(k){const f=!!k.skirt;return {fem:f,skin:k.skin,top:k.top,bottom:k.bottom||0x333333,skirt:k.skirt,pat:k.pat,boubou:k.boubou,sleeve:k.sleeve||!!k.boubou||!!k.shirt,shirt:k.shirt,
 hs:k.afro?'afro':(f?'chignon':'court'),hairCol:k.old?0xd8d8d8:(k.hair||k.hairCol||0x151515),hat:k.wrap?'foulard':(k.cap?'calot':'none'),hatCol:k.wrap||k.cap||0,jewel:k.jewel,pack:k.pack,old:k.old,staff:k.staff,drum:k.drum,shoe:0x2a1e16}}
const PATS=[['#e8a317','#1e5f8a','#fff3d6'],['#d4513b','#f4d35e','#2b2d42'],['#2f9e8f','#fff3d6','#c1440e'],['#3b4a8c','#f2b134','#ffffff'],['#7a2e65','#f5c26b','#1b1b1b']];
function patFill(c,i,x,y,w,h){const C=PATS[(i||0)%5];c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle=C[0];c.fillRect(x,y,w,h);
 for(let yy=y;yy<y+h;yy+=.2){c.fillStyle=C[1];if(((yy-y)/.2|0)%3===0)c.fillRect(x,yy,w,.08)}for(let xx=x;xx<x+w;xx+=.22)for(let yy=y;yy<y+h;yy+=.34){c.fillStyle=C[2];c.beginPath();c.arc(xx+.08,yy+.12,.04,0,TAU);c.fill()}c.restore()}
function limb(c,x1,y1,x2,y2,w,col,sh){c.save();c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=w+.05;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
 if(sh){c.strokeStyle=sh;c.globalAlpha=.55;c.lineWidth=w*.45;c.beginPath();c.moveTo(x1+w*.22,y1);c.lineTo(x2+w*.22,y2);c.stroke()}c.restore()}
/* o: options ; face: 'f' | 'b' | 's' (profil vers la droite) ; ph: phase de marche ; amp: 0..1 */
function drawPerson(c,o,x,y,s,face,ph,amp,t,flip){
 const skin=hx(o.skin),sk2=shade(skin,-.26),sk3=shade(skin,.16),top=hx(o.top),top2=shade(top,-.3),top3=shade(top,.2),bot=hx(o.bottom),bot2=shade(bot,-.3);
 const hairC=hx(o.hairCol||0x151515),hair2=shade(hairC,.3),hair3=shade(hairC,-.35);const fem=!!o.fem,side=face==='s',back=face==='b';
 const sw=Math.sin(ph)*amp,bob=Math.abs(Math.cos(ph))*.045*amp;
 c.save();c.translate(x,y);c.scale(s*(flip?-1:1),s);c.lineJoin='round';c.lineCap='round';
 /* ombre au sol */
 c.save();c.scale(1,.2);const sg=c.createRadialGradient(0,0,0,0,0,.8);sg.addColorStop(0,'rgba(20,10,30,.5)');sg.addColorStop(1,'rgba(20,10,30,0)');c.fillStyle=sg;c.beginPath();c.arc(0,0,.8,0,TAU);c.fill();c.restore();
 c.translate(0,-bob);
 const hipY=-.92,shY=-1.52,hw=side?.12:(fem?.17:.19),sh=side?.14:(fem?.25:.31);
 const robe=!!o.boubou,skirt=!!o.skirt;
 /* sac à dos (de dos / profil) */
 if(o.pack&&(back||side)){c.fillStyle=hx(o.pack);c.strokeStyle=OUT;c.lineWidth=.04;const bx=side?-.32:-.2;c.beginPath();c.roundRect?c.roundRect(bx,-1.5,side?.22:.4,.62,.07):c.rect(bx,-1.5,.4,.62);c.fill();c.stroke()}
 /* jambes */
 const legs=[[-1,0],[1,1]];
 if(!robe&&!skirt||(skirt&&!o.pat&&false)){legs.forEach(l=>{const sd=l[0],lift=Math.max(0,sd*sw)*.12,sx=side?sd*sw*.22:sd*.1;const fx=sx+(side?0:sd*.0),fy=-lift;
  const hxp=side?0:sd*hw*.55;limb(c,hxp,hipY,hxp+fx*.6,-.1+fy*-.2+fy,.19,bot,bot2);
  c.fillStyle=hx(o.shoe||0x2a1e16);c.strokeStyle=OUT;c.lineWidth=.035;c.beginPath();c.ellipse(hxp+fx*.6+(side?.07:0),-.04+fy,side?.15:.12,.065,0,0,TAU);c.fill();c.stroke()})}
 else{ /* jambes sous jupe/robe : seulement les pieds et mollets */
  legs.forEach(l=>{const sd=l[0],lift=Math.max(0,sd*sw)*.1,sx=side?sd*sw*.18:sd*.09;limb(c,side?sx*.6:sd*hw*.5,-.55,side?sx:sd*hw*.5+sx*.4,-.1-lift,.12,skin,sk2);
   c.fillStyle=hx(o.shoe||0x2a1e16);c.beginPath();c.ellipse((side?sx:sd*hw*.5)+(side?.06:0),-.04-lift,side?.14:.1,.06,0,0,TAU);c.fill()})}
 /* bas de tenue */
 if(skirt||robe){const len=robe?.92:(o.pat!==undefined?.78:.58),top0=hipY-.02,bw=robe?.43:.38;c.beginPath();c.moveTo(-.2,top0);c.lineTo(.2,top0);c.quadraticCurveTo(bw+.05,top0+len*.6,bw+.02+(Math.sin(t*2)*.01),top0+len);c.lineTo(-bw-.02,top0+len);c.quadraticCurveTo(-bw-.05,top0+len*.6,-.2,top0);c.closePath();
  if(robe){const g=c.createLinearGradient(-bw,0,bw,0);g.addColorStop(0,hx(o.boubou));g.addColorStop(1,shade(hx(o.boubou),-.35));c.fillStyle=g}
  else if(o.pat!==undefined){c.save();c.clip();patFill(c,o.pat,-.6,top0,1.2,len+.1);c.restore();c.fillStyle='rgba(30,10,40,.2)';c.beginPath();c.moveTo(.05,top0);c.lineTo(.2,top0);c.quadraticCurveTo(bw+.05,top0+len*.6,bw+.02,top0+len);c.lineTo(.0,top0+len);c.closePath();c.fill();c.beginPath();c.moveTo(-.2,top0);c.lineTo(.2,top0);c.quadraticCurveTo(bw+.05,top0+len*.6,bw+.02,top0+len);c.lineTo(-bw-.02,top0+len);c.quadraticCurveTo(-bw-.05,top0+len*.6,-.2,top0);c.closePath();c.fillStyle='rgba(0,0,0,0)'}
  else{const g=c.createLinearGradient(-bw,0,bw,0);g.addColorStop(0,bot);g.addColorStop(1,bot2);c.fillStyle=g}
  if(o.pat===undefined||robe)c.fill();c.strokeStyle=OUT;c.lineWidth=.04;c.stroke();
  if(robe){c.strokeStyle='#e8c15a';c.lineWidth=.04;c.beginPath();c.moveTo(-bw-.01,top0+len-.06);c.lineTo(bw+.01,top0+len-.06);c.stroke()}}
 /* torse */
 const tw=side?.2:sh;c.beginPath();c.moveTo(-tw,shY+.04);c.quadraticCurveTo(-tw-.02,shY+.3,-hw-(fem?0:.02),hipY);c.lineTo(hw+(fem?0:.02),hipY);c.quadraticCurveTo(tw+.02,shY+.3,tw,shY+.04);c.quadraticCurveTo(0,shY-.07,-tw,shY+.04);c.closePath();
 const tcol=robe?hx(o.boubou):top;const tg=c.createLinearGradient(-tw,0,tw,0);tg.addColorStop(0,shade(tcol,.12));tg.addColorStop(.55,tcol);tg.addColorStop(1,shade(tcol,-.35));c.fillStyle=tg;c.fill();c.strokeStyle=OUT;c.lineWidth=.04;c.stroke();
 if(!side&&!back){c.strokeStyle=shade(tcol,-.35);c.lineWidth=.025;c.beginPath();c.moveTo(0,shY+.05);c.lineTo(0,hipY);c.stroke();
  if(robe){c.fillStyle='#e8c15a';c.fillRect(-.08,shY+.1,.16,.5);c.strokeStyle='#e8c15a';c.lineWidth=.04;c.beginPath();c.arc(0,shY+.02,.1,0,Math.PI);c.stroke()}
  else{c.fillStyle=skin;c.beginPath();c.moveTo(-.1,shY+.02);c.quadraticCurveTo(0,shY+.2,.1,shY+.02);c.fill()}}
 if(o.pack&&face==='f'){c.strokeStyle='#1c1c1c';c.lineWidth=.07;[-1,1].forEach(sd=>{c.beginPath();c.moveTo(sd*.15,shY+.02);c.lineTo(sd*.11,hipY-.1);c.stroke()})}
 /* bras */
 const sleeveCol=o.sleeve||robe?tcol:skin,sleeve2=o.sleeve||robe?shade(tcol,-.3):sk2;
 [[-1,sw],[1,-sw]].forEach(a=>{const sd=a[0],sg2=a[1];const ax=side?0:sd*(tw+.04),ex=ax+(side?sg2*.28:sd*.06),ey=shY+.65+(o.drum?-.12:0)+(side?-Math.abs(sg2)*.07:0);
  if(side&&sd<0&&false)return;
  limb(c,ax,shY+.1,ex,ey,.15,sleeveCol,sleeve2);
  c.fillStyle=skin;c.strokeStyle=OUT;c.lineWidth=.03;c.beginPath();c.arc(ex,ey+.05,.08,0,TAU);c.fill();c.stroke()});
 if(o.staff){c.strokeStyle='#5d3a1e';c.lineWidth=.06;c.beginPath();c.moveTo(.5,-.02);c.lineTo(.52,-1.95);c.stroke();blob(c,.52,-1.98,.07,.07,'#f2c14e')}
 /* cou */
 c.fillStyle=sk2;c.fillRect(-.07,shY-.12,.14,.17);
 /* tête */
 const hy=-1.76,hr=.215;c.save();c.translate(side?.02:0,hy);
 /* cheveux arrière */
 const hs=o.hs||'court';
 if(hs==='afro'){blob(c,0,-.04,.33,.31,hair3);blob(c,-.04,-.08,.3,.27,hairC);blob(c,-.1,-.15,.14,.09,hair2,.6)}
 if(hs==='longs'||hs==='tresses'){c.fillStyle=hairC;c.beginPath();c.moveTo(-.25,-.1);c.quadraticCurveTo(-.3,.3,-.2,.6);c.lineTo(.2,.6);c.quadraticCurveTo(.3,.3,.25,-.1);c.fill();if(hs==='tresses'){c.strokeStyle=hair3;c.lineWidth=.025;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-.2+i*.065,-.05);c.lineTo(-.22+i*.07,.6);c.stroke()}}}
 if(hs==='chignon')blob(c,side?-.1:0,-.3,.12,.1,hairC);
 /* oreilles */
 if(!side){[-1,1].forEach(sd=>{blob(c,sd*.2,.0,.045,.065,skin);c.strokeStyle=OUT;c.lineWidth=.025;c.beginPath();c.ellipse(sd*.2,.0,.045,.065,0,0,TAU);c.stroke();if(o.jewel||fem&&o.jewel!==0&&false)blob(c,sd*.21,.09,.03,.03,'#f2c14e')})}
 /* visage */
 c.beginPath();if(side){c.moveTo(-.16,-.14);c.quadraticCurveTo(-.18,.14,-.02,.24);c.quadraticCurveTo(.12,.26,.17,.12);c.lineTo(.2,.02);c.lineTo(.17,-.04);c.quadraticCurveTo(.2,-.14,.08,-.2);c.quadraticCurveTo(-.1,-.24,-.16,-.14)}
 else{c.moveTo(-.2,-.08);c.quadraticCurveTo(-.21,.12,-.1,.22);c.quadraticCurveTo(0,.29,.1,.22);c.quadraticCurveTo(.21,.12,.2,-.08);c.quadraticCurveTo(.19,-.24,0,-.24);c.quadraticCurveTo(-.19,-.24,-.2,-.08)}
 c.closePath();const fg=c.createLinearGradient(-.2,-.2,.2,.25);fg.addColorStop(0,sk3);fg.addColorStop(.45,skin);fg.addColorStop(1,sk2);c.fillStyle=fg;c.fill();c.strokeStyle=OUT;c.lineWidth=.035;c.stroke();
 if(side){blob(c,-.1,.02,.06,.09,sk2,.5);blob(c,-.1,.03,.035,.055,skin)}
 if(!back){
  /* yeux d’animation */
  const eye=(ex,ey,wd,sdir)=>{c.fillStyle='#fffaf0';c.beginPath();c.ellipse(ex,ey,wd,wd*.78,0,0,TAU);c.fill();
   const ir=c.createRadialGradient(ex+sdir*.005,ey-.01,0,ex,ey,wd*.75);ir.addColorStop(0,'#6a3a1c');ir.addColorStop(.6,'#2a1408');ir.addColorStop(1,'#120804');c.fillStyle=ir;c.beginPath();c.ellipse(ex+sdir*wd*.12,ey+.004,wd*.62,wd*.7,0,0,TAU);c.fill();
   c.fillStyle='#fff';c.beginPath();c.arc(ex+sdir*wd*.12-wd*.2,ey-wd*.25,wd*.2,0,TAU);c.fill();c.beginPath();c.arc(ex+wd*.25,ey+wd*.25,wd*.09,0,TAU);c.fill();
   c.strokeStyle='#150a06';c.lineWidth=.04;c.beginPath();c.moveTo(ex-wd*1.05,ey-wd*.05);c.quadraticCurveTo(ex,ey-wd*1.05,ex+wd*1.05,ey-wd*.1);c.stroke();
   if(fem){c.lineWidth=.03;c.beginPath();c.moveTo(ex+sdir*wd,ey-wd*.1);c.lineTo(ex+sdir*(wd+.04),ey-wd*.45);c.stroke()}};
  if(side){eye(.085,.0,.05,1);c.strokeStyle='#1a0e08';c.lineWidth=.03;c.beginPath();c.moveTo(.04,-.1);c.quadraticCurveTo(.1,-.13,.14,-.09);c.stroke();c.strokeStyle=sk2;c.lineWidth=.03;c.beginPath();c.moveTo(.18,.0);c.lineTo(.2,.05);c.lineTo(.16,.07);c.stroke();c.strokeStyle=fem?'#a23a46':'#4a1f1a';c.lineWidth=.035;c.beginPath();c.moveTo(.08,.15);c.lineTo(.15,.14);c.stroke()}
  else{eye(-.085,.0,.052,1);eye(.085,.0,.052,1);c.strokeStyle='#1a0e08';c.lineWidth=.032;[-1,1].forEach(sd=>{c.beginPath();c.moveTo(sd*.04,-.1);c.quadraticCurveTo(sd*.09,-.13,sd*.14,-.095);c.stroke()});
   c.strokeStyle=sk2;c.lineWidth=.03;c.beginPath();c.moveTo(.0,.04);c.quadraticCurveTo(.03,.08,-.01,.09);c.stroke();
   c.strokeStyle=fem?'#b23a4a':'#5a241e';c.lineWidth=.04;c.beginPath();c.moveTo(-.055,.155);c.quadraticCurveTo(0,.185,.055,.155);c.stroke();if(fem){c.fillStyle='rgba(200,60,80,.25)';c.beginPath();c.ellipse(0,.162,.05,.016,0,0,TAU);c.fill()}
   c.fillStyle='rgba(220,90,80,.12)';[-1,1].forEach(sd=>{c.beginPath();c.ellipse(sd*.12,.09,.055,.03,0,0,TAU);c.fill()})}
  if(o.beard&&!fem){c.fillStyle=hair3;c.beginPath();if(side){c.moveTo(-.02,.06);c.quadraticCurveTo(.04,.26,.15,.18);c.lineTo(.17,.1);c.quadraticCurveTo(.1,.14,.02,.08)}else{c.moveTo(-.2,.04);c.quadraticCurveTo(-.2,.26,0,.3);c.quadraticCurveTo(.2,.26,.2,.04);c.quadraticCurveTo(.12,.15,0,.14);c.quadraticCurveTo(-.12,.15,-.2,.04)}c.fill()}
  if(o.glasses){c.strokeStyle='#1a1a1a';c.lineWidth=.03;if(side){c.beginPath();c.arc(.085,.0,.065,0,TAU);c.stroke();c.beginPath();c.moveTo(.02,-.01);c.lineTo(-.14,-.03);c.stroke()}else{[-1,1].forEach(sd=>{c.beginPath();c.arc(sd*.085,.0,.065,0,TAU);c.stroke()});c.beginPath();c.moveTo(-.02,-.01);c.lineTo(.02,-.01);c.stroke()}}}
 /* cheveux avant */
 const hf=(path)=>{c.fillStyle=hairC;path();c.fill();c.strokeStyle=OUT;c.lineWidth=.03;c.stroke()};
 if(hs==='court'||hs==='longs'||hs==='tresses'||hs==='chignon'){c.beginPath();c.moveTo(-.22,-.02);c.quadraticCurveTo(-.26,-.28,-.02,-.3);c.quadraticCurveTo(.26,-.3,.22,-.02);c.quadraticCurveTo(.2,-.14,.1,-.13);c.quadraticCurveTo(.0,-.2,-.1,-.12);c.quadraticCurveTo(-.2,-.12,-.22,-.02);c.closePath();
   c.fillStyle=hairC;c.fill();c.strokeStyle=OUT;c.lineWidth=.03;c.stroke();c.strokeStyle=hair2;c.globalAlpha=.7;c.lineWidth=.025;c.beginPath();c.moveTo(-.12,-.24);c.quadraticCurveTo(-.02,-.28,.1,-.24);c.stroke();c.globalAlpha=1}
 else if(hs==='afro'){c.fillStyle=hairC;c.beginPath();c.moveTo(-.25,-.04);c.quadraticCurveTo(-.34,-.34,0,-.37);c.quadraticCurveTo(.34,-.34,.25,-.04);c.quadraticCurveTo(.2,-.17,0,-.15);c.quadraticCurveTo(-.2,-.17,-.25,-.04);c.fill();blob(c,-.1,-.3,.1,.05,hair2,.7)}
 else if(hs==='rase'){c.fillStyle=hair3;c.globalAlpha=.7;c.beginPath();c.moveTo(-.2,-.06);c.quadraticCurveTo(-.2,-.25,0,-.25);c.quadraticCurveTo(.2,-.25,.2,-.06);c.quadraticCurveTo(.1,-.15,0,-.15);c.quadraticCurveTo(-.1,-.15,-.2,-.06);c.fill();c.globalAlpha=1}
 if(back&&hs!=='afro'){c.fillStyle=hairC;c.beginPath();c.ellipse(0,-.02,.22,.25,0,0,TAU);c.fill();c.strokeStyle=hair2;c.globalAlpha=.5;c.lineWidth=.03;c.beginPath();c.arc(-.05,-.1,.1,3.6,5.2);c.stroke();c.globalAlpha=1}
 else if(back){blob(c,0,-.02,.3,.28,hairC)}
 /* couvre-chefs */
 const hc=hx(o.hatCol||0xd4513b);
 if(o.hat==='bonnet'){c.fillStyle=hc;c.strokeStyle=OUT;c.lineWidth=.03;c.beginPath();c.moveTo(-.24,-.06);c.quadraticCurveTo(-.26,-.34,0,-.36);c.quadraticCurveTo(.26,-.34,.24,-.06);c.closePath();c.fill();c.stroke();c.fillStyle=shade(hc,-.25);c.fillRect(-.24,-.1,.48,.07);blob(c,0,-.38,.06,.06,shade(hc,.3))}
 else if(o.hat==='paille'){c.fillStyle='#d8b45a';c.strokeStyle=OUT;c.lineWidth=.03;c.beginPath();c.ellipse(0,-.17,.44,.09,0,0,TAU);c.fill();c.stroke();c.fillStyle='#c9a244';c.beginPath();c.moveTo(-.2,-.17);c.quadraticCurveTo(-.2,-.38,0,-.38);c.quadraticCurveTo(.2,-.38,.2,-.17);c.fill();c.stroke();c.fillStyle='#8a4a2a';c.fillRect(-.2,-.24,.4,.04)}
 else if(o.hat==='foulard'){c.fillStyle=hc;c.strokeStyle=OUT;c.lineWidth=.03;c.beginPath();c.moveTo(-.24,-.02);c.quadraticCurveTo(-.28,-.3,0,-.32);c.quadraticCurveTo(.28,-.3,.24,-.02);c.quadraticCurveTo(.1,-.1,0,-.09);c.quadraticCurveTo(-.1,-.1,-.24,-.02);c.fill();c.stroke();c.beginPath();c.ellipse(.1,-.34,.11,.08,.4,0,TAU);c.fill();c.stroke();c.strokeStyle=shade(hc,.4);c.lineWidth=.02;c.beginPath();c.moveTo(-.16,-.18);c.lineTo(.12,-.26);c.moveTo(-.2,-.1);c.lineTo(.16,-.2);c.stroke()}
 else if(o.hat==='casquette'||o.hat==='calot'){c.fillStyle=hc;c.strokeStyle=OUT;c.lineWidth=.03;c.beginPath();c.moveTo(-.23,-.06);c.quadraticCurveTo(-.24,-.3,0,-.31);c.quadraticCurveTo(.24,-.3,.23,-.06);c.closePath();c.fill();c.stroke();if(o.hat==='casquette'&&!back){c.fillStyle=shade(hc,-.2);c.beginPath();c.ellipse(side?.2:0,-.06,side?.14:.2,.045,0,0,TAU);c.fill();c.stroke()}else{c.fillStyle=shade(hc,.25);c.fillRect(-.23,-.1,.46,.05)}}
 c.restore();
 /* collier */
 if(o.jewel&&!back&&!side){c.strokeStyle='#f2c14e';c.lineWidth=.035;c.beginPath();c.arc(0,shY-.02,.12,.15,Math.PI-.15);c.stroke()}
 if(o.pack&&face==='f'){}
 c.restore()}

LCA.art={rnd,reseed,RR,hx,parse,mixC,shade,rgba,mk,clamp,blob,softShadow,foliage,strokes,grain,spr,PPU,TAU,
 treeAcacia,treeBaobab,treePalm,treeBanana,treeForest,bush,fern,aloe,kopje,rock,tuft,flowerPatch,reed,termite,hutRound,houseBox,school,stall,granary,jar,wellSpr,cloud,soft,
 drawPerson,kindToOpts,patFill,PATS};
})(window.LCA=window.LCA||{});
