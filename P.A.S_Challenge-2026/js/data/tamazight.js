/* Langue : tamazight (amazigh). Variante utilisée ici : kabyle, à confirmer. Contenu partiel, brouillon non validé. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'tamazight',name:'Tamazight',variant:'kabyle (à confirmer)',where:'Maghreb (Algérie, Maroc, Tunisie, Libye), Sahel',region:'nord',geo:{lon:4,lat:36.3,lab:'r',zone:'Kabylie et Maghreb'},hello:'Azul',code:'TZ',
  board:['yiwen · sin · krad','kkuẓ · smmus'],
  words:[
   ['s','Azul','Salut'],['s','Tanemmirt','Merci'],['s','Ansuf','Bienvenue'],
   ['f','Aman','Eau','eau'],['f','Aksum','Viande','viande'],
   ['n','Adrar','Montagne'],['n','Asif','Rivière'],
   ...nums(['yiwen','sin','krad','kkuẓ','smmus','sdeṣ','sa','tam','tẓa','mraw'])],
  tales:[],
  recipes:[{name:'Couscous',intro:'Semoule cuite à la vapeur avec une sauce de légumes et de viande. Le couscous est inscrit au patrimoine immatériel de l’UNESCO (2020) par plusieurs pays du Maghreb. Recette simplifiée, environ 2 h.',base:6,ing:[['Semoule de blé',500,'g'],['Viande (agneau ou poulet)',800,'g','aksum'],['Carottes',3,''],['Navets',2,''],['Courgettes',2,''],['Pois chiches cuits',200,'g'],['Oignon',1,''],['Huile',60,'ml'],['Sel et épices',1,'c. à café'],['Eau',1.5,'l','aman']],steps:['Fais revenir la viande avec l’oignon dans l’huile, ajoute les épices, puis couvre d’eau et laisse mijoter 45 minutes.','Ajoute les légumes et les pois chiches, puis cuis encore 30 minutes.','Humidifie la semoule, sépare les grains et cuis-la à la vapeur au-dessus de la sauce, en l’aérant à la fourchette.','Sers la semoule avec la viande, les légumes et le bouillon.']}],
  trad:[['Tifinagh','l’alphabet amazigh','Le tifinagh est un alphabet utilisé pour écrire l’amazigh. Il est notamment utilisé au Maroc, où l’amazigh est langue officielle depuis 2011.'],['Yennayer','le nouvel an amazigh','Yennayer marque le début de l’année dans le calendrier agricole amazigh, autour du 12 janvier. En Algérie, c’est un jour férié depuis 2018.'],['Variétés','plusieurs langues','Le tamazight regroupe de nombreuses variétés (kabyle, chleuh, rifain, touareg et d’autres) qui ne sont pas toutes comprises entre elles.']],
  history:['Le tamazight, ou amazigh, désigne un ensemble de langues et de variétés berbères parlées au Maghreb et au Sahel. C’est la langue des populations autochtones d’Afrique du Nord.','Selon les pays, il s’écrit en tifinagh, en lettres latines ou en lettres arabes. Il est officiel au Maroc depuis 2011 et en Algérie depuis 2016.'],
  figure:{name:'Mouloud Mammeri',years:'1917–1989',role:'Écrivain et anthropologue',bio:'Écrivain et chercheur kabyle, il a recueilli de la poésie kabyle et publié en 1976 une grammaire de la langue berbère, « Tajerrumt n tmazight ». Il a défendu la reconnaissance de la culture amazighe.'}});
})(window.LCA);
