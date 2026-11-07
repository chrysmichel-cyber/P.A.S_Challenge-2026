/* Langue : bambara. Données de démonstration rédigées pour ce prototype, sans source ni validation linguistique (statut : brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.langs.bambara={"region": "ouest", "geo": {"lon": -6.5, "lat": 13, "lab": "r", "zone": "Mali"}, "history": ["Le bambara (bamanankan) est une langue mandingue, langue nationale du Mali et langue la plus parlée du pays, comme langue maternelle ou véhiculaire.", "Elle est proche du dioula et du malinké."], "figure": {"name": "Biton Coulibaly", "years": "XVIIIe siècle", "role": "Fondateur du royaume de Ségou", "bio": "Considéré comme le fondateur du royaume bambara de Ségou, au XVIIIe siècle. Les dates exactes de son règne sont débattues."},id:'bambara',name:'Bambara',where:'Mali (langue bamanankan)',hello:'I ni ce',color:'#c77dff',code:'BM',
 names:{awa:'Grand-mère Nana',fatou:'Tante Aminata',drum:'Sidiki le joueur de djembé',ibou:'Karamɔgɔ Modibo'},
 greet:{awa:'I ni sogoma, n den.',fatou:'Aw bisimila !',drum:'I ka kɛnɛ ?',ibou:'I ni ce !'},
 drum:{name:'djembé',pat:'B.SBS.S.'},
 river:{wo:'Baji.',fr:'Le fleuve (baji) nourrit le dugu : on y pêche le jɛgɛ. Écoute l’eau (ji) couler.'},
 board:['kelen · fila · saba','naani · duuru'],
 words:[
  ['s','I ni sogoma','Bonjour (le matin)'],['s','I ni tile','Bonjour (l’après-midi)'],['s','I ni wula','Bonsoir'],['s','I ni ce','Bonjour, merci (salutation de base)'],['s','I ka kɛnɛ ?','Comment vas-tu ?'],['s','Tɔɔrɔ si t’a la','Je vais bien (pas de souci)'],['s','Barika','Merci'],['s','Awɔ','Oui'],['s','Ayi','Non'],['s','Hakɛto','Excuse-moi, s’il te plaît'],['s','Aw bisimila','Bienvenue'],
  ['f','Ji','Eau','eau'],['f','Malo','Riz','riz'],['f','Jɛgɛ','Poisson','poisson'],['f','Sogo','Viande','viande'],['f','Nɔnɔ','Lait'],['f','Tɔ','Pâte de mil ou de maïs'],['f','Dumuni','Repas, nourriture'],['f','Dun','Manger'],['f','Min','Boire'],
  ['m','Ba','Mère'],['m','Fa','Père'],['m','Den','Enfant'],['m','Teri','Ami(e)'],['m','Cɛ','Homme'],['m','Muso','Femme'],['m','So','Maison'],['m','Dugu','Village'],['m','Jeli','Griot'],['m','Kalan so','École'],['m','Karamɔgɔ','Enseignant, maître'],
  ['n','Tile','Soleil, jour'],['n','Kalo','Lune, mois'],['n','Sanji','Pluie'],['n','Jiri','Arbre'],['n','Foro','Champ'],['n','Baji','Fleuve'],['n','Kulu','Colline'],['n','Jɛ','Blanc'],['n','Fin','Noir'],['n','Bilen','Rouge'],
  ...nums(['kelen','fila','saba','naani','duuru','wɔɔrɔ','wolonwula','segin','kɔnɔntɔn','tan'])],
 tales:[
  {title:'Le jeune griot et le ngɔni',vocab:[['ngɔni','le luth des griots'],['jeli','le griot'],['dugu','le village'],['den','l’enfant']],paras:[
   'Dans un *dugu* au bord du fleuve, un *den* voulait devenir *jeli*. Il avait reçu le *ngɔni* de son grand-père, mais ses doigts ne trouvaient pas les notes.',
   'Chaque soir, il jouait faux. Les voisins riaient doucement. Le garçon voulait tout abandonner.',
   'Sa grand-mère lui dit : « Un griot ne joue pas pour être applaudi. Il joue pour que les autres se souviennent. » Elle lui chanta les noms des familles du village, un à un.',
   'Le garçon répéta ces noms avec son ngɔni, lentement. Peu à peu, la mélodie vint. Au bout d’une saison, tout le dugu s’asseyait pour l’écouter.'],
   moral:'On devient porteur de mémoire en écoutant d’abord ceux qui nous précèdent.'},
  {title:'Le partage du riz',vocab:[['malo','le riz'],['dumuni','le repas'],['ji','l’eau'],['teri','l’ami']],paras:[
   'Un jour de fête, une femme cuisait un grand plat de *malo*. Un voyageur affamé arriva et s’arrêta devant sa cour.',
   '« Je n’ai rien à te donner, dit-elle d’abord, ce *dumuni* est pour ma famille. » Puis elle vit la poussière sur ses pieds et lui apporta de l’eau (*ji*).',
   'Le voyageur but, puis s’assit à l’écart. Elle revint avec une part de riz : « Mange avec nous. Un *teri* est un parent qu’on n’a pas encore rencontré. »',
   'À la fin du repas, le voyageur raconta les routes qu’il avait parcourues. Les enfants n’oublièrent jamais cette soirée.'],
   moral:'Ce que l’on donne à l’étranger revient en amitié.'}],
 recipes:[
  {name:'Tigadɛgɛna',intro:'Sauce à la pâte d’arachide, avec du poulet ou de la viande, servie avec du riz. Plat très répandu en Afrique de l’Ouest. Environ 1 h.',base:6,ing:[['Poulet ou viande',1000,'g','sogo'],['Pâte d’arachide',150,'g'],['Oignons',2,''],['Tomates',2,''],['Ail',3,'gousses'],['Piment',1,''],['Huile',80,'ml'],['Sel',1,'c. à café'],['Eau',800,'ml','ji'],['Riz à servir',500,'g','malo']],steps:[
   'Fais dorer la viande avec les oignons et l’ail dans l’huile.','Ajoute les tomates écrasées et laisse réduire 10 minutes.','Délaie la pâte d’arachide dans un peu d’eau chaude et verse-la dans la marmite avec le reste de l’eau.','Ajoute le piment et le sel. Laisse mijoter 35 minutes à feu doux.','Sers sur le riz.']},
  {name:'Riz au poisson',intro:'Riz cuit avec une sauce tomate et du poisson. Environ 1 h 15.',base:6,ing:[['Poisson',800,'g','jɛgɛ'],['Riz',500,'g','malo'],['Tomates',3,''],['Oignons',2,''],['Concentré de tomate',2,'c. à soupe'],['Huile',100,'ml'],['Sel',1,'c. à café'],['Piment',1,''],['Eau',1,'l','ji']],steps:[
   'Fais dorer le poisson dans l’huile, puis réserve-le.','Fais revenir les oignons, ajoute le concentré, les tomates et l’eau. Laisse mijoter 15 minutes.','Ajoute le riz lavé, le sel et le piment. Cuis à feu doux jusqu’à absorption.','Pose le poisson sur le riz, couvre 10 minutes et sers.']}],
 trad:[
  ['Bògòlanfini','le tissu teint à la boue','Le bògòlanfini (tissu de boue) est une toile de coton teinte avec des décoctions de feuilles et de la boue fermentée. Il est associé au Mali.'],
  ['Ngɔni','le luth','Le ngɔni est un luth à cordes pincées joué notamment par les jeli. Il accompagne les récits et les chants.'],
  ['Jeli','le griot','Les jeli gardent la mémoire des familles et des événements, par la parole, le chant et la musique.'],
  ['Les salutations','i ni ce','Se saluer prend du temps : on demande des nouvelles de la famille, de la santé et du travail. C’est une marque de respect avant toute conversation.'],
  ['Le repas partagé','dumuni','Le repas se partage souvent autour d’un grand plat. Offrir à manger à l’étranger fait partie de l’hospitalité.']]};
})(window.LCA);
