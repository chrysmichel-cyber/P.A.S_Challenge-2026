/* Langue : dioula. Données de démonstration rédigées pour ce prototype, sans source ni validation linguistique (statut : brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.langs.dioula={"region": "ouest", "geo": {"lon": -4.5, "lat": 9.5, "lab": "r", "zone": "Côte d’Ivoire, Burkina Faso"}, "history": ["Le dioula (jula) est une langue mandingue parlée en Côte d’Ivoire, au Burkina Faso et au Mali.", "Elle s’est diffusée avec les commerçants dioula et sert de langue véhiculaire en Afrique de l’Ouest."], "figure": {"name": "Samori Touré", "years": "v. 1830–1900", "role": "Chef et fondateur d’empire", "bio": "Chef mandingue, il a fondé l’empire wassoulou et a résisté pendant une quinzaine d’années aux troupes coloniales françaises avant d’être capturé en 1898. Son action est jugée de manières différentes selon les points de vue."},id:'dioula',name:'Dioula',where:'Côte d’Ivoire, Burkina Faso, Mali',hello:'I ni ce',color:'#5fd493',code:'DY',
 names:{awa:'Grand-mère Mariam',fatou:'Tante Fanta',drum:'Seydou le djembéfola',ibou:'Karamɔgɔ Souleymane'},
 greet:{awa:'I ni wula !',fatou:'Aw bisimila !',drum:'I ka kɛnɛ ?',ibou:'I ni ce !'},
 drum:{name:'jembe',pat:'BSS.BS.S'},
 river:{wo:'Ji.',fr:'L’eau (ji) du fleuve fait vivre le dugu : on y pêche le jɛgɛ et on y cultive le riz (malo).'},
 board:['kelen · fila · saba','naani · duuru'],
 words:[
  ['s','I ni sogoma','Bonjour (le matin)'],['s','I ni tile','Bonjour (l’après-midi)'],['s','I ni wula','Bonsoir'],['s','I ni ce','Salut, merci'],['s','I ka kɛnɛ ?','Comment vas-tu ?'],['s','Tɔɔrɔ si t’a la','Je vais bien (pas de souci)'],['s','Barika','Merci'],['s','Awɔ','Oui'],['s','Ayi','Non'],['s','Hakɛto','Excuse-moi, s’il te plaît'],['s','Aw bisimila','Bienvenue'],
  ['f','Ji','Eau','eau'],['f','Malo','Riz','riz'],['f','Jɛgɛ','Poisson','poisson'],['f','Sɔgɔ','Viande','viande'],['f','Nɔnɔ','Lait'],['f','Tɔ','Pâte de maïs ou de mil'],['f','Dumuni','Repas, nourriture'],['f','Dun','Manger'],['f','Min','Boire'],
  ['m','Ba','Mère'],['m','Fa','Père'],['m','Den','Enfant'],['m','Teri','Ami(e)'],['m','Cɛ','Homme'],['m','Muso','Femme'],['m','So','Maison'],['m','Dugu','Village'],['m','Jeli','Griot'],['m','Kalanso','École'],['m','Karamɔgɔ','Maître, enseignant'],
  ['n','Tile','Soleil, jour'],['n','Kalo','Lune, mois'],['n','Sanji','Pluie'],['n','Jiri','Arbre'],['n','Sɛnɛ','Champ, culture'],['n','Jembe','Djembé (tambour)'],['n','Jɛ','Blanc'],['n','Fin','Noir'],['n','Bilen','Rouge'],
  ...nums(['kelen','fila','saba','naani','duuru','wɔɔrɔ','wolonwula','segin','kɔnɔntɔn','tan'])],
 tales:[
  {title:'Le jembe qui ne voulait pas sonner',vocab:[['dugu','le village'],['jembe','le djembé'],['den','l’enfant'],['jeli','le griot']],paras:[
   'Dans le *dugu* de Kong, le grand *jembe* restait muet. Les jeunes frappaient fort, les anciens frappaient juste, mais la peau ne rendait aucun son.',
   'Une petite fille, *den* de la forgeronne, s’approcha. Elle ne frappa pas : elle posa la main à plat et attendit.',
   'Les enfants vinrent s’asseoir autour d’elle. Chacun frappa un seul coup, l’un après l’autre, sans se presser.',
   'Alors le jembe répondit, profond comme un orage. Les femmes chantèrent, les *jeli* racontèrent, et tout le village dansa jusqu’à l’aube.'],
   moral:'Le rythme naît quand chacun écoute les autres.'},
  {title:'La patience du champ',vocab:[['sɛnɛ','le champ'],['ji','l’eau'],['sanji','la pluie'],['malo','le riz']],paras:[
   'Deux frères avaient chacun un *sɛnɛ*. Le premier sema vite et se coucha tôt. Le second sema, puis alla chercher l’eau (*ji*) du fleuve chaque soir.',
   'Quand la *sanji* tarda, le premier perdit courage et abandonna son champ. Le second continua d’arroser, sans se plaindre.',
   'Les nuages finirent par venir. Le champ du second verdit, celui du premier resta nu.',
   'À la récolte, le second frère partagea son riz (*malo*) avec son aîné. « Tu m’as appris à attendre », lui dit celui-ci.'],
   moral:'La patience fait pousser ce que la hâte abandonne.'}],
 recipes:[
  {name:'Tô et sauce gombo',intro:'Pâte de maïs ou de mil servie avec une sauce de gombo. Environ 1 h.',base:6,ing:[['Farine de maïs ou de mil',500,'g','tɔ'],['Eau pour le tô',1,'l','ji'],['Gombos',400,'g'],['Poisson fumé',150,'g','jɛgɛ'],['Oignon',1,''],['Tomates',2,''],['Soumbala (condiment)',1,'c. à soupe'],['Huile',80,'ml'],['Piment',1,''],['Sel',1,'c. à café'],['Eau pour la sauce',300,'ml']],steps:[
   'Coupe les gombos en rondelles.','Fais revenir l’oignon et les tomates dans l’huile. Ajoute les gombos, le poisson fumé, le soumbala, le piment et l’eau. Laisse mijoter 20 minutes.','Pour le tô, porte l’eau salée à ébullition. Verse la farine en pluie en remuant avec un bâton solide jusqu’à obtenir une pâte lisse.','Laisse cuire 10 minutes à feu doux en remuant, puis forme des boules.','Sers le tô avec la sauce, et mange avec la main droite.']},
  {name:'Tigadɛgɛna',intro:'Sauce à la pâte d’arachide avec du poulet, servie avec du riz. Environ 1 h.',base:6,ing:[['Poulet découpé',1000,'g','sɔgɔ'],['Pâte d’arachide',150,'g'],['Oignons',2,''],['Tomates',2,''],['Ail',3,'gousses'],['Piment',1,''],['Huile',80,'ml'],['Sel',1,'c. à café'],['Eau',800,'ml','ji'],['Riz à servir',500,'g','malo']],steps:[
   'Fais dorer le poulet avec les oignons et l’ail.','Ajoute les tomates écrasées et laisse réduire 10 minutes.','Délaie la pâte d’arachide dans un peu d’eau chaude et verse-la sur le poulet avec le reste de l’eau.','Ajoute le piment et le sel. Laisse mijoter 35 minutes à feu doux.','Sers sur le riz.']}],
 trad:[
  ['Jembe','le djembé','Le djembé, tambour en forme de calice à peau tendue, se joue à mains nues. Il vient de l’espace mandingue et accompagne fêtes, cérémonies et danses.'],
  ['Jeli','le griot','Les jeli transmettent l’histoire des familles et des peuples par la parole, le chant et la musique.'],
  ['Les salutations','ni ce','Se saluer prend du temps : on demande des nouvelles de la santé, de la famille, des champs. Passer ce moment est une marque de respect.'],
  ['Dugutigi','le chef du village','Le dugutigi réunit les anciens pour régler les questions du village. On le consulte et on l’écoute avant de décider.'],
  ['Le commerce','jula','Le mot jula désigne aussi les commerçants. Pendant des siècles, ils ont relié villes et marchés de l’Afrique de l’Ouest, et leur langue est devenue une langue de commerce.']]};
})(window.LCA);
