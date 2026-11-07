/* Gardien de la mémoire : organise en chapitres illustrés ce que les données de la langue contiennent déjà
   (lieu, histoire, personnalité, traditions). Module pur : aucun contenu n’est ajouté ni inventé ici.
   Fonctionne dans le navigateur (LCA.elder) et sous Node (tests). */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.elder=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const initials=n=>String(n||'').split(/[\s-]+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');

/* region : nom de la région (ex. « Afrique de l’Ouest »). Retourne la liste ordonnée des chapitres non vides. */
function chapters(L,region){
 const ch=[],hist=(L.history||[]).filter(Boolean),trad=(L.trad||[]).filter(t=>t&&t[0]);
 ch.push({id:'ou',icon:'pin',title:'Où vit ce peuple ?',kicker:'Le lieu',blocks:[
  {t:'fact',k:'Pays et zones',v:L.where||(L.geo&&L.geo.zone)||''},
  {t:'fact',k:'Région',v:region||''},
  {t:'map',lang:L.id}].filter(b=>b.t==='map'||b.v)});
 const first=hist[0];
 ch.push({id:'langue',icon:'speech',title:'Sa langue',kicker:'La parole',blocks:[
  {t:'say',wo:L.hello||'',fr:'Pour dire bonjour'},
  first?{t:'text',v:first}:null,
  {t:'stats',items:[[(L.words||[]).length,'mots dans le jeu'],[(L.tales||[]).length,'conte(s)'],[(L.recipes||[]).length,'recette(s)']]}].filter(Boolean)});
 if(hist.length>1)ch.push({id:'histoire',icon:'scroll',title:'Un peu d’histoire',kicker:'Les repères',blocks:hist.slice(1).map(v=>({t:'text',v}))});
 if(L.figure&&L.figure.name)ch.push({id:'perso',icon:'star',title:'Une personnalité honorée',kicker:'Une figure',blocks:[{t:'person',name:L.figure.name,years:L.figure.years||'',role:L.figure.role||'',bio:L.figure.bio||'',ini:initials(L.figure.name)}]});
 if(trad.length)ch.push({id:'trad',icon:'drum',title:'Traditions',kicker:'Les coutumes',blocks:trad.map(t=>({t:'trad',name:t[0],sub:t[1]||'',v:t[2]||''}))});
 ch.push({id:'verif',icon:'check',title:'À vérifier',kicker:'Honnêteté',blocks:[{t:'note',v:'Ces récits sont des synthèses écrites pour ce prototype, sans source citée et sans validation par des historiens ou des locuteurs. Il faut les vérifier avec des sources fiables avant tout usage scolaire.'}]});
 return ch;
}
return {chapters,initials};
});
