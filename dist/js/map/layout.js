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
 return {spread,minGap}});
