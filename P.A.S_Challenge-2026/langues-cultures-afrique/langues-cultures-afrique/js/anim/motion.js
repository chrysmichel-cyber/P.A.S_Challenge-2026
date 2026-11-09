/* Animation du personnage 3D : marche, course, saut (montée, descente, réception).
   Module pur : calcule des angles (radians) à partir de l'état du joueur ; le rendu les applique. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.motion=f()}})(typeof self!=='undefined'?self:this,function(){
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 /* s : {ph (phase de foulée), speed (m/s), onGround, vy, land (0..1, temps depuis la réception, 1 = fini), run (0..1 facteur de course)} */
 function pose(s){
  const sp=s.speed||0,run=clamp(s.run===undefined?(sp-5.4)/3.1:s.run,0,1),amp=clamp(sp/5,0,1.5);
  const sw=Math.sin(s.ph||0);
  const P={legL:sw*(.75+.45*run)*amp,legR:-sw*(.75+.45*run)*amp,armL:-sw*(.6+.5*run)*amp,armR:sw*(.6+.5*run)*amp,
   armZ:0,lean:run*.2*(amp>0?1:0),bob:Math.abs(Math.cos(s.ph||0))*(.035+.05*run)*(amp>0?1:0),squash:1,headNod:0};
  if(!s.onGround){
   const rising=(s.vy||0)>0;
   if(rising){P.armL=-2.6;P.armR=-2.6;P.legL=.7;P.legR=-.2;P.lean=.05;P.armZ=.15}
   else{P.armL=-1.2;P.armR=-1.2;P.armZ=.6;P.legL=.25;P.legR=-.1;P.lean=.12}
   P.bob=0;return P}
  const l=s.land===undefined?1:clamp(s.land,0,1);
  if(l<1){const k=Math.sin(l*Math.PI);P.squash=1-.14*k;P.legL+=.5*k;P.legR+=.5*k;P.lean+=.1*k;P.bob=-.05*k}
  return P}
 /* applique la pose à un personnage (userData : legL, legR, armL, armR) et au groupe */
 function apply(g,P){const u=g.userData;
  u.legL.rotation.x=P.legL;u.legR.rotation.x=P.legR;u.armL.rotation.x=P.armL;u.armR.rotation.x=P.armR;
  u.armL.rotation.z=P.armZ;u.armR.rotation.z=-P.armZ;
  g.rotation.x=P.lean;g.scale.y=(u.baseSy||1)*P.squash}
 return {pose,apply,clamp}});
