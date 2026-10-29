/* Langue : wolof. Données de démonstration rédigées pour ce prototype, sans source ni validation linguistique (statut : brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.langs.wolof={"region": "ouest", "geo": {"lon": -15.5, "lat": 14.8, "lab": "r", "zone": "Sénégal"}, "history": ["Le wolof est une langue de la branche atlantique de la famille nigéro-congolaise, parlée surtout au Sénégal, en Gambie et en Mauritanie.", "Au Sénégal, il est compris bien au-delà de ses locuteurs d’origine et sert de langue véhiculaire dans les villes."], "figure": {"name": "Cheikh Anta Diop", "years": "1923–1986", "role": "Historien et scientifique", "bio": "Savant sénégalais, il a étudié l’histoire africaine et défendu l’usage des langues africaines dans la science et l’enseignement. L’université de Dakar porte son nom."},id:'wolof',name:'Wolof',where:'Sénégal, Gambie, Mauritanie',hello:'Salaam maalekum',color:'#f59a2e',code:'WO',
 names:{awa:'Grand-mère Awa',fatou:'Tante Fatou',drum:'Moussa le tambour',ibou:'Maître Ibou'},
 greet:{awa:'Salaam maalekum, sama doom.',fatou:'Dalal ak jàmm !',drum:'Nanga def ?',ibou:'Salaam maalekum !'},
 drum:{name:'sabar',pat:'B.S.BSS.'},
 river:{wo:'Dex bi.',fr:'Le fleuve nourrit le village : on y pêche le poisson. Écoute l’eau (ndox) couler.'},
 board:['benn · ñaar · ñett','ñent · juróom'],
 words:[
  ['s','Salaam maalekum','Bonjour (que la paix soit sur vous)'],['s','Maalekum salaam','Réponse au salut'],['s','Nanga def ?','Comment vas-tu ?'],['s','Maa ngi fi rekk','Je vais bien (je suis juste ici)'],['s','Ana sa waa kër ?','Comment va ta famille ?'],['s','Jërëjëf','Merci'],['s','Waaw','Oui'],['s','Déedéet','Non'],['s','Baal ma','Pardon'],['s','Dalal ak jàmm','Bienvenue'],['s','Ba beneen yoon','À la prochaine'],
  ['f','Ndox','Eau','eau'],['f','Ceeb','Riz','riz'],['f','Jën','Poisson','poisson'],['f','Yapp','Viande','viande'],['f','Mburu','Pain'],['f','Meew','Lait'],['f','Ñam','Nourriture, repas'],['f','Lekk','Manger'],['f','Naan','Boire'],['f','Dama xiif','J’ai faim'],['f','Dama mar','J’ai soif'],['f','Dafa neex','C’est bon, c’est délicieux'],
  ['m','Yaay','Mère'],['m','Baay','Père'],['m','Doom','Enfant'],['m','Xarit','Ami(e)'],['m','Mag','Aîné(e), personne âgée'],['m','Jigéen','Femme'],['m','Góor','Homme'],['m','Kër','Maison'],['m','Dëkk','Village, ville'],['m','Jàngalekat','Enseignant'],
  ['n','Jant','Soleil'],['n','Weer','Lune'],['n','Suuf','Terre, sol'],['n','Garab','Arbre (et remède)'],['n','Dex','Rivière, fleuve'],['n','Tool','Champ'],['n','Weex','Blanc'],['n','Xonq','Rouge'],['n','Ñuul','Noir'],['n','Wert','Vert'],
  ...nums(['benn','ñaar','ñett','ñent','juróom','juróom-benn','juróom-ñaar','juróom-ñett','juróom-ñent','fukk'])],
 tales:[
  {title:'Leuk le lièvre et la hyène Bukki',vocab:[['Leuk','le lièvre'],['Bukki','la hyène'],['ndox','l’eau'],['dex','la rivière']],paras:[
   'À la fin de la saison sèche, il ne restait au village des bêtes qu’un seul puits. Chaque matin, *Bukki* la hyène s’y installait, grondait, montrait les dents, et personne n’osait boire.',
   '*Leuk* le lièvre, tout petit mais très malin, avait soif lui aussi. Il s’approcha en sautillant : « Grand frère Bukki, il y a un rival dans ce puits. Il dit que toute l’eau (*ndox*) est à lui. »',
   'Bukki se pencha et vit, tout au fond, une hyène aux crocs blancs qui le fixait. Il rugit, l’autre rugit. Il montra les dents, l’autre aussi.',
   'Fou de colère, Bukki cria : « Tu ne me fais pas peur ! » Mais son rival ne reculait pas. Alors Bukki prit la fuite et courut si loin qu’on ne le revit pas de la journée.',
   'Les animaux burent enfin, chacun à son tour. Leuk les regarda et dit : « Le puits ne grandit pas quand on crie. Il suffit de le partager. »'],
   moral:'La ruse et le partage valent mieux que la force.'},
  {title:'La calebasse du partage',vocab:[['meew','le lait'],['kër','la maison'],['teranga','l’hospitalité']],paras:[
   'Dans le village de Ndeye, une grande calebasse de lait (*meew*) venait de sa grand-mère. Ndeye la gardait à l’ombre, devant sa maison (*kër*).',
   'Un soir, un voyageur couvert de poussière frappa à sa porte. Selon la *teranga*, Ndeye lui offrit de l’eau, puis la calebasse. Il but, la remercia et reprit sa route.',
   'Le lendemain, deux autres voyageurs arrivèrent, puis cinq. Ndeye servit chacun. À chaque fois, elle s’attendait à trouver la calebasse vide. Elle restait pleine.',
   'Les voisins vinrent voir ce miracle. Ndeye sourit : « Elle n’est pleine que parce qu’on la donne. » Ce soir-là, tout le village but ensemble.'],
   moral:'Ce que l’on partage ne s’épuise pas.'}],
 recipes:[
  {name:'Ceebu jën',intro:'Riz au poisson, plat emblématique du Sénégal. Environ 1 h 30.',base:6,ing:[['Poisson blanc (thiof, dorade…)',1000,'g','jën'],['Riz brisé',500,'g','ceeb'],['Tomates fraîches',3,''],['Concentré de tomate',3,'c. à soupe'],['Oignons',2,''],['Carottes',3,''],['Manioc',300,'g'],['Chou',250,'g'],['Aubergines',2,''],['Ail',4,'gousses'],['Persil',1,'bouquet'],['Piment',1,''],['Huile',150,'ml','diw'],['Sel',1,'c. à café','xorom'],['Eau',1.5,'l','ndox']],steps:[
   'Pile le persil, l’ail et le piment en un hachis. Fais des entailles dans le poisson et garnis-les de ce hachis.','Fais dorer le poisson dans l’huile, puis réserve-le.','Dans la même huile, fais revenir les oignons. Ajoute le concentré, les tomates, puis l’eau. Laisse mijoter 20 minutes.','Cuis les légumes dans la sauce, puis retire-les.','Filtre la sauce, ajoute le riz lavé et cuis à feu doux jusqu’à absorption.','Sers sur un grand plat commun : le riz au centre, le poisson et les légumes autour. On mange ensemble.']},
  {name:'Maafe (mafé)',intro:'Ragoût de viande à la pâte d’arachide, servi avec du riz. Environ 1 h 15.',base:6,ing:[['Viande ou poulet',800,'g','yapp'],['Pâte d’arachide',200,'g'],['Oignons',2,''],['Tomates',3,''],['Concentré de tomate',2,'c. à soupe'],['Carottes',3,''],['Patate douce',300,'g'],['Huile',100,'ml','diw'],['Sel',1,'c. à café','xorom'],['Piment',1,''],['Eau',1,'l','ndox'],['Riz à servir',500,'g','ceeb']],steps:[
   'Fais dorer la viande avec les oignons dans l’huile.','Ajoute les tomates et le concentré, puis couvre d’eau. Laisse mijoter 30 minutes.','Délaie la pâte d’arachide dans une louche de bouillon, puis verse-la dans la marmite.','Ajoute les carottes et la patate douce. Cuis 25 minutes, jusqu’à ce que l’huile remonte.','Sers très chaud avec le riz.']}],
 trad:[
  ['Teranga','l’hospitalité','Teranga désigne l’accueil généreux : on offre l’eau, un coin à l’ombre et le repas avant même de demander qui est l’invité.'],
  ['Sabar','le tambour','Le sabar se joue avec une main et une baguette, aux mariages, baptêmes et fêtes. Ses rythmes rassemblent le village et font danser.'],
  ['Gewel','le griot','Les gewel gardent la mémoire des familles et des événements. Généalogies, chants et récits passent de bouche en bouche.'],
  ['Salutations','prendre le temps','On s’enquiert de la santé, de la famille, du travail. Saluer longuement est une marque de respect avant toute conversation.'],
  ['Le plat commun','manger ensemble','Le repas se partage souvent dans un grand plat autour duquel on s’assoit. Partager le plat, c’est partager le lien.']]};
})(window.LCA);
