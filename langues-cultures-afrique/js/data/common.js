/* Constantes et aides partagées par les fichiers de langue. */
window.LCA=window.LCA||{};
window.LCA.langs={};
(function(){
const GROUPS={s:'Salutations',f:'Nourriture',m:'Famille et village',n:'Nature et couleurs',c:'Compter de 1 à 10'};
const NUMFR=['Un (1)','Deux (2)','Trois (3)','Quatre (4)','Cinq (5)','Six (6)','Sept (7)','Huit (8)','Neuf (9)','Dix (10)'];
const nums=a=>a.map((w,i)=>['c',w,NUMFR[i]]);
const PK=['poisson','riz','eau','viande'];
const PKFR={poisson:'poisson',riz:'riz',eau:'eau',viande:'viande'};


 window.LCA.GROUPS=GROUPS;window.LCA.NUMFR=NUMFR;window.LCA.PK=PK;window.LCA.PKFR=PKFR;window.LCA.helpers={nums:nums};
})();

/* Valeurs par défaut pour une langue : une langue peut ne fournir que ce qui est documenté. Ce qui manque s'affiche « Contenu à compléter ». */
window.LCA.add=function(o){
 var h=o.hello||'';
 var d={names:{awa:'La conteuse',fatou:'La cuisinière',drum:'Le musicien',ibou:'L’enseignant(e)',hist:'Le gardien de la mémoire'},
  greet:{awa:h,fatou:h,drum:h,ibou:h,hist:h},drum:{name:'tambour',pat:'B.S.BSS.'},river:{wo:'',fr:'Le grand cours d’eau nourrit le village.'},
  board:['1 · 2 · 3','4 · 5'],words:[],tales:[],recipes:[],trad:[],history:[],figure:null,sources:[],contributors:[]};
 var r={};Object.keys(d).forEach(function(k){r[k]=d[k]});Object.keys(o).forEach(function(k){r[k]=o[k]});
 window.LCA.langs[o.id]=r;return r};
window.LCA.regionColors={ouest:'#f59a2e',nord:'#e6c15a',est:'#2dd4bf',centrale:'#38b6ff',australe:'#e879f9'};
