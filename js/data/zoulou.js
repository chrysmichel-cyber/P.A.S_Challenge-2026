/* Langue : zoulou (isiZulu). Données rédigées pour ce prototype, sans source ni validation linguistique (brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'zoulou',name:'Zoulou',where:'Afrique du Sud (KwaZulu-Natal)',region:'australe',geo:{lon:30.8,lat:-28.6,lab:'r',zone:'KwaZulu-Natal'},hello:'Sawubona',code:'ZU',
  river:{wo:'Umfula.',fr:'La rivière (umfula) apporte l’eau (amanzi) au village.'},
  board:['kunye · kubili · kuthathu','kune · kuhlanu'],
  words:[
   ['s','Sawubona','Bonjour (à une personne)'],['s','Sanibonani','Bonjour (à plusieurs)'],['s','Unjani ?','Comment vas-tu ?'],['s','Ngiyaphila','Je vais bien'],['s','Ngiyabonga','Merci'],['s','Yebo','Oui'],['s','Cha','Non'],['s','Ngiyaxolisa','Je suis désolé(e)'],['s','Hamba kahle','Va bien (au revoir)'],['s','Sala kahle','Reste bien (au revoir)'],
   ['f','Amanzi','Eau','eau'],['f','Irayisi','Riz','riz'],['f','Inhlanzi','Poisson','poisson'],['f','Inyama','Viande','viande'],['f','Ubisi','Lait'],['f','Isinkwa','Pain'],['f','Ukudla','Nourriture'],
   ['m','Umama','Mère'],['m','Ubaba','Père'],['m','Ingane','Enfant'],['m','Umngane','Ami(e)'],['m','Indoda','Homme'],['m','Indlu','Maison'],['m','Umuzi','Village, foyer'],['m','Uthisha','Enseignant'],['m','Isikole','École'],
   ['n','Ilanga','Soleil'],['n','Inyanga','Lune'],['n','Imvula','Pluie'],['n','Isihlahla','Arbre'],['n','Insimu','Champ'],['n','Umfula','Rivière'],['n','Intaba','Montagne'],
   ...nums(['kunye','kubili','kuthathu','kune','kuhlanu','isithupha','isikhombisa','isishiyagalombili','isishiyagalolunye','ishumi'])],
  tales:[{title:'Proverbes zoulous',kind:'proverbes',vocab:[],paras:['*Umuntu ngumuntu ngabantu.* Une personne est une personne grâce aux autres personnes. C’est l’idée d’ubuntu.','*Indlela ibuzwa kwabaphambili.* Le chemin se demande à ceux qui sont passés avant.'],moral:''}],
  recipes:[{name:'Uphuthu',intro:'Bouillie de maïs épaisse et granuleuse, servie avec une sauce ou du lait caillé. Recette simplifiée, environ 30 minutes.',base:6,ing:[['Farine de maïs',500,'g'],['Eau (amanzi)',750,'ml','amanzi'],['Sel',1,'c. à café']],steps:['Porte l’eau salée à ébullition.','Verse la farine en pluie, sans remuer, et laisse cuire 5 minutes à couvert.','Remue avec une fourchette pour obtenir une texture granuleuse.','Couvre et laisse cuire 20 minutes à feu très doux. Sers avec une sauce ou du lait caillé.']}],
  trad:[['Ubuntu','l’humanité partagée','Ubuntu exprime l’idée qu’une personne existe à travers ses liens avec les autres. Le proverbe « Umuntu ngumuntu ngabantu » en est la formule courante.'],['Isicathamiya','le chant a cappella','L’isicathamiya est un style de chant choral a cappella né chez les travailleurs zoulous. Le groupe Ladysmith Black Mambazo l’a fait connaître dans le monde.'],['Perles','le message des couleurs','Les ouvrages de perles zoulous sont souvent associés à des motifs et des couleurs qui portent des significations selon le contexte.']],
  history:['Le zoulou (isiZulu) est une langue bantoue du groupe nguni, parlée surtout dans la province du KwaZulu-Natal.','C’est l’une des onze langues officielles de l’Afrique du Sud et la langue maternelle la plus répandue du pays.'],
  figure:{name:'Mazisi Kunene',years:'1930–2006',role:'Poète',bio:'Poète sud-africain, il a composé en zoulou l’épopée consacrée à Shaka, traduite ensuite en anglais sous le titre « Emperor Shaka the Great ». Il a défendu l’écriture dans les langues africaines.'}});
})(window.LCA);
