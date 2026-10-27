/* Qualité graphique adaptative : détection des capacités de l'appareil, profils de rendu et dégradation automatique.
   Module pur (navigateur + Node). Les heuristiques sont des estimations : aucune mesure sur appareil réel n'a été faite ici. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.quality=f()}})(typeof self!=='undefined'?self:this,function(){
 const SOFT=/swiftshader|llvmpipe|software|softpipe|basic render|microsoft basic/i;
 /* env : {cores, mem (Go, peut manquer), dpr, mobile, w, h, saveData, renderer} → 0 (bas), 1 (moyen), 2 (élevé) */
 function score(e){e=e||{};let s=0;
  if(e.cores){if(e.cores<=2)s-=2;else if(e.cores<=4)s-=1;else if(e.cores>=8)s+=1}
  if(e.mem){if(e.mem<=2)s-=2;else if(e.mem<=4)s-=1;else if(e.mem>=8)s+=1}
  if(e.mobile)s-=1;
  if(e.saveData)s-=1;
  if(e.renderer&&SOFT.test(String(e.renderer)))s-=3;
  const px=(e.w||1000)*(e.h||700)*Math.pow(e.dpr||1,2);if(px>4.5e6)s-=1;
  return s}
 function detect(e){const s=score(e);return s<=-2?0:s>=1?2:1}
 const down=q=>Math.max(0,q-1);
 /* profil de rendu : budget de pixels, ombres, densité du décor (herbe, buissons, fleurs…) et distance d'affichage des arbres */
 function profile(q,dpr){q=[0,1,2].includes(q)?q:1;dpr=dpr||1;
  return {q,pixelRatio:Math.min(dpr,[1,1.25,2][q]),shadows:q>0,shadowMap:[512,1024,2048][q],density:[0.3,0.65,1][q],cull:[55,95,Infinity][q],fogFar:[170,210,240][q]}}
 /* décision après une mesure de fluidité : abaisser d'un cran si < 22 i/s (au plus une fois par fenêtre de mesure) */
 function adjust(o){o=o||{};if(!o.auto||!o.fps)return {q:o.q,changed:false,suggest2d:false};
  if(o.fps<22){if(o.q>0)return {q:o.q-1,changed:true,suggest2d:false};return {q:0,changed:false,suggest2d:true}}
  return {q:o.q,changed:false,suggest2d:false}}
 return {score,detect,down,profile,adjust}});
