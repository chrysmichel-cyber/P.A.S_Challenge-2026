/* Noms des animaux du village. Le nom français est affiché ; un nom dans la langue étudiée n’apparaît que s’il figure déjà dans ses données
   (rien n’est traduit ni inventé ici). Module pur : navigateur (LCA.animals) et Node (tests). */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.animals=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const FR={goat:'Chèvre',antilope:'Antilope',girafe:'Girafe',vache:'Vache',poule:'Poule',mouton:'Mouton',oiseau:'Oiseau'};
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]+/g,' ').trim();
/* Nom dans la langue L si le vocabulaire documenté contient l’animal (traduction française identique), sinon null. */
function localName(L,type){
 const fr=FR[type];if(!fr||!L)return null;const key=norm(fr);
 const rows=L.words||[];for(let i=0;i<rows.length;i++){const w=rows[i];if(norm(String(w[2]).split(',')[0])===key)return String(w[1])}
 return null}
/* Texte de l’étiquette : « Chèvre » ou « Chèvre · Aŋa » si le nom local est documenté. */
function label(type,L){const fr=FR[type]||'Animal',lo=localName(L,type);return lo?fr+' · '+lo:fr}
return {FR,localName,label,norm};
});
