/* Animations d'inactivité du personnage joueur (module pur, navigateur : LCA.idle ; Node : tests).
   Après `cfg.thresh` secondes (60 par défaut) sans déplacement ni interaction, le personnage enchaîne des gestes variés
   (regarder autour, changer de posture, s'étirer, bâiller, regarder ses mains, s'asseoir si un siège est proche), jamais deux fois
   le même de suite. Dès qu'il y a une action, le geste s'efface en ~0,25 s (poids `w` qui tombe à 0) puis l'état est remis à zéro.
   `update` fait avancer l'état ; `pose` renvoie des angles (radians, mêmes conventions que walkAnim) à mélanger avec le poids `w`. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.idle=f()}})(typeof self!=='undefined'?self:this,function(){
 const cfg={thresh:60,gapMin:4,gapMax:9};
 const KINDS=['look','shift','stretch','yawn','hands','sit'];
 const DUR={look:4.2,shift:3,stretch:3.6,yawn:3.2,hands:4.2,sit:600};
 const FR={look:'regarde autour de lui',shift:'change de posture',stretch:'s’étire',yawn:'bâille',hands:'regarde ses mains',sit:'s’assoit'};
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const bump=p=>{p=clamp(p,0,1);return Math.pow(Math.sin(Math.PI*p),.6)};
 function create(){return {t:0,cur:null,age:0,gap:0,last:null,w:0,n:0}}
 function pick(s,canSit,rnd){
  const pool=KINDS.filter(k=>k!==s.last&&(k!=='sit'||canSit));
  return pool[Math.floor(rnd()*pool.length)%pool.length]}
 function update(s,dt,o){
  o=o||{};const rnd=o.rnd||Math.random,th=o.thresh===undefined?cfg.thresh:o.thresh;
  if(o.active){s.t=0;s.gap=0;if(s.cur){s.w=Math.max(0,s.w-dt/.25);if(s.w<=0){s.cur=null;s.age=0}}else s.w=0;if(!s.cur){s.last=null;s.n=0}return s}
  s.t+=dt;
  if(s.t<th){s.w=Math.max(0,s.w-dt/.25);if(s.w<=0)s.cur=null;return s}
  if(!s.cur){
   if(s.gap>0){s.gap-=dt;s.w=0;return s}
   s.cur=s.n===0?(o.canSit?'sit':'look'):pick(s,!!o.canSit,rnd);s.age=0;s.n++}
  s.age+=dt;const d=DUR[s.cur];
  if(s.cur==='sit'&&!o.canSit){s.age=d}                          /* le siège a disparu : on se relève */
  const fadeOut=s.cur==='sit'?1:clamp((d-s.age)/.4,0,1);
  s.w=Math.min(fadeOut,clamp(s.age/.4,0,1)*1);
  if(s.age>=d){s.last=s.cur;s.cur=null;s.age=0;s.w=0;s.gap=cfg.gapMin+rnd()*(cfg.gapMax-cfg.gapMin)}
  return s}
 /* Angles bruts (poids non appliqué) ; arm* négatif = bras levé vers l'avant/le haut. */
 function pose(s,t){
  const P={kind:s.cur,w:s.w,head:0,headX:0,armL:0,armR:0,armZ:0,lean:0,legL:0,legR:0,bob:0,sit:0};
  if(!s.cur)return P;const d=DUR[s.cur],p=clamp(s.age/d,0,1),sin=Math.sin;
  switch(s.cur){
   case 'look':P.head=.95*sin(p*Math.PI*2.2)*bump(p*1.1);P.headX=.08*sin(p*Math.PI*2.2+1);break;
   case 'shift':P.lean=.05*sin(p*Math.PI*2);P.legL=.14*bump(p);P.legR=-.05*bump(p);P.armL=.12*sin(p*Math.PI*2);P.armR=-.12*sin(p*Math.PI*2);P.head=.2*sin(p*Math.PI*2);break;
   case 'stretch':{const b=bump(p);P.armL=-2.9*b;P.armR=-2.9*b;P.armZ=.35*b;P.lean=-.12*b;P.headX=-.3*b;break}
   case 'yawn':{const b=bump(p);P.armR=-1.9*b;P.headX=-.4*b+.25*Math.max(0,p-.75)*4*(1-p)*b;P.head=.1*sin(p*9)*b;P.lean=-.04*b;break}
   case 'hands':{const b=bump(Math.min(1,p*1.15));P.armL=-1.25*b;P.armR=-1.25*b+.18*sin(p*Math.PI*5)*b;P.headX=.45*b;P.armZ=.1*b;break}
   case 'sit':{const b=clamp(s.age/.6,0,1);P.sit=b;P.legL=-1.45*b;P.legR=-1.45*b;P.bob=-.42*b;P.armL=-.55*b;P.armR=-.55*b;P.headX=.06*b;P.head=.35*sin(t*.5)*b;break}
  }
  return P}
 /* mélange : renvoie chaque angle multiplié par le poids */
 const scaled=(P)=>({kind:P.kind,w:P.w,head:P.head*P.w,headX:P.headX*P.w,armL:P.armL*P.w,armR:P.armR*P.w,armZ:P.armZ*P.w,lean:P.lean*P.w,legL:P.legL*P.w,legR:P.legR*P.w,bob:P.bob*P.w,sit:P.sit*P.w});
 return {cfg,KINDS,DUR,FR,create,update,pose,scaled,bump}});
