/* Langue : shona. Données rédigées pour ce prototype, sans source ni validation linguistique (brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'shona',name:'Shona',where:'Zimbabwe',region:'australe',geo:{lon:30.5,lat:-18.5,lab:'r',zone:'Zimbabwe'},hello:'Mhoro',code:'SH',
  river:{wo:'Rwizi.',fr:'La rivière (rwizi) apporte l’eau (mvura) au village.'},
  board:['potsi · piri · tatu','ina · shanu'],
  words:[
   ['s','Mhoro','Bonjour'],['s','Mhoroi','Bonjour (à plusieurs, ou par respect)'],['s','Makadii ?','Comment allez-vous ?'],['s','Ndiripo','Je vais bien'],['s','Ndatenda','Merci'],['s','Hongu','Oui'],['s','Kwete','Non'],['s','Tichaonana','À bientôt'],
   ['f','Mvura','Eau','eau'],['f','Mupunga','Riz','riz'],['f','Hove','Poisson','poisson'],['f','Nyama','Viande','viande'],['f','Mukaka','Lait'],['f','Sadza','Bouillie épaisse de maïs'],['f','Kudya','Manger'],
   ['m','Amai','Mère'],['m','Baba','Père'],['m','Mwana','Enfant'],['m','Shamwari','Ami(e)'],['m','Mukadzi','Femme'],['m','Murume','Homme'],['m','Imba','Maison'],['m','Musha','Village, foyer'],['m','Mudzidzisi','Enseignant(e)'],['m','Chikoro','École'],
   ['n','Zuva','Soleil, jour'],['n','Mwedzi','Lune'],['n','Muti','Arbre'],['n','Munda','Champ'],['n','Rwizi','Rivière'],['n','Gomo','Montagne'],
   ...nums(['potsi','piri','tatu','ina','shanu','tanhatu','nomwe','sere','pfumbamwe','gumi'])],
  tales:[{title:'Proverbes shona',kind:'proverbes',vocab:[],paras:['*Chara chimwe hachitswanyi inda.* Un seul doigt n’écrase pas un pou : l’union fait la force.','*Kugara hunzwana.* Vivre ensemble, c’est se comprendre.'],moral:''}],
  recipes:[{name:'Sadza ne nyama',intro:'Bouillie épaisse de maïs servie avec un ragoût de viande. Plat de base au Zimbabwe. Recette simplifiée, environ 1 h.',base:6,ing:[['Farine de maïs',500,'g'],['Eau (mvura)',1.2,'l','mvura'],['Viande (nyama)',800,'g','nyama'],['Oignons',2,''],['Tomates',3,''],['Huile',60,'ml'],['Sel',1,'c. à café']],steps:['Fais dorer la viande avec les oignons dans l’huile.','Ajoute les tomates et un peu d’eau, puis laisse mijoter 40 minutes.','Pour le sadza, porte l’eau à ébullition, délaie quelques cuillères de farine, puis verse peu à peu le reste en remuant fermement.','Cuis 10 minutes à feu doux en remuant, puis forme des boules. Sers avec le ragoût.']}],
  trad:[['Mbira','l’instrument à lamelles','La mbira est un instrument à lamelles métalliques joué avec les pouces. Elle occupe une grande place dans la musique shona et dans certaines cérémonies.'],['Sadza','le plat de base','Le sadza, bouillie épaisse de maïs, accompagne la plupart des repas au Zimbabwe. On le mange traditionnellement avec les doigts.'],['Great Zimbabwe','les ruines de pierre','Les ruines de Great Zimbabwe, enceintes de pierre bâties à partir du XIe siècle, sont généralement associées aux ancêtres des Shona.']],
  history:['Le shona désigne un ensemble de variétés bantoues (karanga, zezuru, manyika et d’autres) parlées surtout au Zimbabwe.','Une forme écrite standard s’est construite au XXe siècle à partir de ces variétés. Le shona est l’une des langues officielles du Zimbabwe.'],
  figure:{name:'Solomon Mutswairo',years:'1924–2005',role:'Écrivain',bio:'Écrivain zimbabwéen, auteur de « Feso » (1956), considéré comme le premier roman en shona. Il a écrit les paroles en shona de l’hymne national, « Simudzai Mureza WeZimbabwe ».'}});
})(window.LCA);
