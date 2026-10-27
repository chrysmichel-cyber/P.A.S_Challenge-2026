/* Langue : kikongo. Contenu très partiel : seuls quelques éléments sont proposés, le reste est à compléter. Brouillon non validé. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'kikongo',name:'Kikongo',where:'RDC (Kongo-Central), Congo-Brazzaville, Angola',region:'centrale',geo:{lon:14.6,lat:-5.6,lab:'l',zone:'Bas-Congo et ancien royaume du Kongo'},hello:'Mbote',code:'KG',
  board:['mosi · zole · tatu','iya · tanu'],
  words:[
   ['s','Mbote','Bonjour'],['s','Matondo','Merci'],
   ['f','Maza','Eau (à vérifier)','eau'],
   ['m','Mama','Mère'],['m','Tata','Père'],['m','Mwana','Enfant'],['m','Nzo','Maison'],
   ...nums(['mosi','zole','tatu','iya','tanu','sambanu','nsambwadi','nana','ivwa','kumi'])],
  tales:[],
  recipes:[{name:'Saka-saka',intro:'Feuilles de manioc pilées et mijotées, plat courant dans le bassin du Congo. Recette simplifiée, environ 1 h 30.',base:6,ing:[['Feuilles de manioc pilées',500,'g'],['Poisson fumé ou viande',250,'g'],['Oignons',2,''],['Ail',3,'gousses'],['Huile de palme',60,'ml'],['Pâte d’arachide',2,'c. à soupe'],['Sel et piment',1,'c. à café'],['Eau',500,'ml']],steps:['Fais revenir les oignons et l’ail dans l’huile de palme.','Ajoute les feuilles, le poisson fumé et l’eau, puis laisse mijoter 1 heure à feu doux.','Ajoute la pâte d’arachide, le sel et le piment, puis cuis encore 15 minutes. Sers avec du manioc ou du riz.']}],
  trad:[['Le royaume du Kongo','XIVe–XIXe siècle','Le royaume du Kongo s’est développé autour de l’embouchure du fleuve Congo. Son souverain portait le titre de manikongo, et sa capitale était Mbanza Kongo.']],
  history:['Le kikongo est une langue bantoue associée à l’ancien royaume du Kongo, autour de l’embouchure du fleuve Congo, dans l’actuelle RDC, au Congo-Brazzaville et en Angola.','Il en existe plusieurs variétés. Le kituba, issu du kikongo, sert de langue véhiculaire en RDC et au Congo-Brazzaville.'],
  figure:{name:'Dona Beatriz Kimpa Vita',years:'v. 1684–1706',role:'Prophétesse',bio:'Femme kongo qui prêchait un christianisme africain et voulait réunifier un royaume du Kongo déchiré par la guerre civile. Elle a été exécutée en 1706. On parle de mouvement antonien.'}});
})(window.LCA);
