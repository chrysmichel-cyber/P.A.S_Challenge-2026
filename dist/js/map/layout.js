/* Placement des pastilles de la carte : évite les chevauchements.
   Module pur (navigateur + Node). Entrée : points {id,x,y} en pixels du viewBox ; sortie : positions décalées + trait de rappel vers la position réelle.
   Les positions réelles restent la référence géographique ; le décalage n'est qu'un confort de lecture (indiqué par un trait fin). */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.mapLayout=f()}})(typeof self!=='undefined'?self:this,function(){
 function spread(pts,o){
  o=o||{};const R=o.minDist||23,W=o.W||380,H=o.H||392,pad=o.pad||12,iters=o.iters||160;
  const P=pts.map(p=>({id:p.id,ox:p.x,oy:p.y,x:p.x,y:p.y,pin:!!p.pin}));
  for(let it=0;it<iters;it++){
   let moved=false;
   for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
    const a=P[i],b=P[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=R)continue;
    if(d<0.01){const ang=((i*7+j*13)%360)*Math.PI/180;dx=Math.cos(ang);dy=Math.sin(ang);d=0.01}
    const push=(R-d)/2+0.05;dx/=Math.max(d,0.01);dy/=Math.max(d,0.01);
    a.x-=dx*push;a.y-=dy*push;b.x+=dx*push;b.y+=dy*push;moved=true}
   // rappel léger vers la position réelle : garde le décalage minimal
   P.forEach(p=>{p.x+=(p.ox-p.x)*0.04;p.y+=(p.oy-p.y)*0.04;p.x=Math.min(W-pad,Math.max(pad,p.x));p.y=Math.min(H-pad,Math.max(pad,p.y))});
   if(!moved&&it>20)break}
  return P.map(p=>({id:p.id,x:p.x,y:p.y,ox:p.ox,oy:p.oy,shift:Math.hypot(p.x-p.ox,p.y-p.oy)}))}
 function minGap(res){let m=Infinity;for(let i=0;i<res.length;i++)for(let j=i+1;j<res.length;j++)m=Math.min(m,Math.hypot(res[i].x-res[j].x,res[i].y-res[j].y));return m}
 /* Étiquettes lisibles : place un nom à côté de chaque pastille sans qu'il en recouvre une autre ni un autre nom.
    items : [{id,x,y,w,pri}] (w = largeur du nom en unités du viewBox), opts : {r,h,gap,box:{x0,y0,x1,y1}}.
    Les noms prioritaires (pri élevé) sont placés d'abord ; ceux qui ne trouvent aucune place libre sont simplement omis. */
 function labels(items,o){
  o=o||{};const r=o.r||6,h=o.h||13,gap=o.gap||2.5,box=o.box||{x0:0,y0:0,x1:380,y1:392};
  const hit=(a,b)=>a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
  const pins=items.map(p=>({x0:p.x-r-1,x1:p.x+r+1,y0:p.y-r-1,y1:p.y+r+1,id:p.id}));
  const placed=[],out={};
  items.slice().sort((a,b)=>(b.pri||0)-(a.pri||0)).forEach(p=>{
   const w=p.w,cand=[['r',p.x+r+gap,p.y-h/2],['l',p.x-r-gap-w,p.y-h/2],['t',p.x-w/2,p.y-r-gap-h],['b',p.x-w/2,p.y+r+gap]];
   for(const c of cand){const rc={x0:c[1],y0:c[2],x1:c[1]+w,y1:c[2]+h};
    if(rc.x0<box.x0||rc.x1>box.x1||rc.y0<box.y0||rc.y1>box.y1)continue;
    if(placed.some(q=>hit(rc,q)))continue;
    if(pins.some(q=>q.id!==p.id&&hit(rc,q)))continue;
    placed.push(rc);out[p.id]={side:c[0],x0:rc.x0,y0:rc.y0,w,h};break}});
  return out}
 return {spread,minGap,labels}});
