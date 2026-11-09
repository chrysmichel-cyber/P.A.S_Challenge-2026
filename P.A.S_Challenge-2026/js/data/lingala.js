/* Langue : lingala. Données de démonstration rédigées pour ce prototype, sans source ni validation linguistique (statut : brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.langs.lingala={"region": "centrale", "geo": {"lon": 18, "lat": -0.5, "lab": "r", "zone": "Fleuve Congo"}, "history": ["Le lingala est une langue bantoue du fleuve Congo, devenue véhiculaire en RDC et au Congo-Brazzaville.", "Il est très présent dans les villes et dans la musique. La rumba congolaise est largement chantée en lingala."], "figure": {"name": "Franco Luambo Makiadi", "years": "1938–1989", "role": "Musicien", "bio": "Guitariste, chanteur et chef d’orchestre (TPOK Jazz), il a chanté en lingala et reste une figure majeure de la rumba congolaise."},id:'lingala',name:'Lingala',where:'RDC, Congo-Brazzaville',hello:'Mbote',color:'#38b6ff',code:'LN',
 names:{awa:'Mama Béatrice',fatou:'Tante Solange',drum:'Papa Léon le percussionniste',ibou:'Molakisi Pascal'},
 greet:{awa:'Mbote, mwana na ngai.',fatou:'Boyei malamu !',drum:'Ozali boni ?',ibou:'Mbote !'},
 drum:{name:'ngoma',pat:'B.SB.SS.'},
 river:{wo:'Ebale.',fr:'Le fleuve (ebale) nourrit le mboka : on y pêche le mbisi. Écoute le mai couler.'},
 board:['moko · mibale · misato','minei · mitano'],
 words:[
  ['s','Mbote','Bonjour'],['s','Ozali boni ?','Comment vas-tu ?'],['s','Nazali malamu','Je vais bien'],['s','Matondi','Merci'],['s','Matondi mingi','Merci beaucoup'],['s','Iyo','Oui'],['s','Te','Non'],['s','Limbisa ngai','Pardon'],['s','Boyei malamu','Bienvenue'],['s','Tokomonana','À bientôt'],
  ['f','Mai','Eau','eau'],['f','Loso','Riz','riz'],['f','Mbisi','Poisson','poisson'],['f','Nyama','Viande','viande'],['f','Mampa','Pain'],['f','Bilei','Nourriture, repas'],['f','Kolia','Manger'],['f','Komela','Boire'],['f','Pondu','Feuilles de manioc'],['f','Fufu','Pâte de manioc'],
  ['m','Mama','Mère, maman'],['m','Papa','Père'],['m','Mwana','Enfant'],['m','Moninga','Ami(e)'],['m','Mwasi','Femme'],['m','Mobali','Homme'],['m','Ndako','Maison'],['m','Mboka','Village, pays'],['m','Eteyelo','École'],['m','Molakisi','Enseignant'],
  ['n','Moi','Soleil, jour'],['n','Sanza','Lune, mois'],['n','Mbula','Pluie'],['n','Nzete','Arbre'],['n','Ebale','Rivière, fleuve'],['n','Elanga','Champ'],['n','Ngomba','Montagne'],
  ...nums(['moko','mibale','misato','minei','mitano','motoba','sambo','mwambe','libwa','zomi'])],
 tales:[
  {title:'Le pêcheur et l’ebale',vocab:[['ebale','le fleuve'],['mai','l’eau'],['mbisi','le poisson'],['mboka','le village']],paras:[
   'Au bord du grand *ebale*, un pêcheur nommé Bosco partait chaque aube avec sa pirogue. Avant de jeter son filet, il versait un peu de *mai* dans le fleuve et disait : « Merci. »',
   'Les autres pêcheurs riaient : « Pourquoi remercier l’eau ? » Bosco répondait : « Elle me donne le *mbisi*, je lui donne mon respect. »',
   'Une saison, la pêche fut pauvre partout, sauf pour Bosco, dont les filets revenaient pleins. Il partagea ses poissons avec tout le *mboka*.',
   'Depuis ce jour, chaque pêcheur du village verse un peu d’eau avant de partir.'],
   moral:'Ce que la nature donne se reçoit avec gratitude et se partage.'},
  {title:'Les deux amis et la montagne',vocab:[['baninga','les amis'],['ngomba','la montagne'],['mai','l’eau']],paras:[
   'Deux *baninga*, Pita et Joseph, décidèrent de grimper la *ngomba* qui dominait leur village.',
   'Pita courait devant. À mi-pente, il glissa et se tordit la cheville. Joseph, plus lent, l’avait rattrapé.',
   'Joseph lui offrit son bâton et un peu de *mai*. Ils avancèrent ensemble, pas à pas.',
   'Au sommet, ils virent le fleuve briller au loin. « Seul, je n’y serais pas arrivé », dit Pita.'],
   moral:'On va plus loin ensemble.'}],
 recipes:[
  {name:'Poulet moambe',intro:'Poulet mijoté dans une sauce crémeuse de noix de palme, servi avec du riz ou de la chikwangue. Environ 1 h 30.',base:6,ing:[['Poulet découpé',1200,'g'],['Crème de noix de palme (moambe)',400,'g'],['Oignons',2,''],['Ail',4,'gousses'],['Tomates',2,''],['Piment',1,''],['Sel',1,'c. à café'],['Eau',500,'ml','mai'],['Riz à servir',500,'g','loso']],steps:[
   'Fais revenir le poulet avec les oignons et l’ail.','Ajoute les tomates et laisse cuire 10 minutes.','Verse la crème de noix de palme et l’eau. Remue bien.','Laisse mijoter 45 à 60 minutes à feu doux, en remuant de temps en temps, jusqu’à ce que l’huile rouge remonte.','Ajuste le sel et le piment, puis sers avec le riz.']},
  {name:'Pondu',intro:'Feuilles de manioc mijotées avec du poisson fumé, servies avec du fufu. Environ 1 h 30.',base:6,ing:[['Feuilles de manioc hachées',500,'g','pondu'],['Poisson fumé',150,'g','mbisi'],['Oignons',2,''],['Ail',4,'gousses'],['Huile de palme',60,'ml'],['Pâte d’arachide',2,'c. à soupe'],['Piment',1,''],['Sel',1,'c. à café'],['Eau',500,'ml','mai']],steps:[
   'Fais revenir les oignons et l’ail dans l’huile de palme.','Ajoute les feuilles de manioc hachées, le poisson fumé et l’eau.','Couvre et laisse mijoter 1 heure à feu doux.','Ajoute la pâte d’arachide, le piment et le sel. Cuis encore 15 minutes.','Sers avec du fufu.']}],
 trad:[
  ['Rumba congolaise','la musique','La rumba congolaise est inscrite par l’UNESCO au patrimoine culturel immatériel de l’humanité. Elle fait danser Kinshasa et Brazzaville.'],
  ['Ngoma et likembe','les instruments','Le ngoma est un tambour, le likembe un instrument à lamelles que l’on pince avec les pouces. Tous deux accompagnent chants et danses.'],
  ['La SAPE','l’élégance','La SAPE est un art de s’habiller avec élégance et de défiler avec fierté, très présent à Kinshasa et Brazzaville.'],
  ['Liboke','cuisson en feuilles','Le liboke est un paquet de feuilles dans lequel on cuit un poisson ou de la viande avec des épices, à la braise ou à la vapeur.'],
  ['Manger ensemble','le partage','Le repas se prend en famille autour de plats communs : fufu, poisson, légumes. On mange souvent avec les mains, et on invite le passant.']]};
})(window.LCA);
