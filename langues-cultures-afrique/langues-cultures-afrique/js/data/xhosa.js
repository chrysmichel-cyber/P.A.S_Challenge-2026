/* Langue : xhosa (isiXhosa). Données rédigées pour ce prototype, sans source ni validation linguistique (brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'xhosa',name:'Xhosa',where:'Afrique du Sud (Cap-Oriental)',region:'australe',geo:{lon:27.5,lat:-32.2,lab:'l',zone:'Cap-Oriental'},hello:'Molo',code:'XH',
  river:{wo:'Umlambo.',fr:'La rivière (umlambo) apporte l’eau (amanzi) au village.'},
  board:['nye · mbini · ntathu','ne · ntlanu'],
  words:[
   ['s','Molo','Bonjour (à une personne)'],['s','Molweni','Bonjour (à plusieurs)'],['s','Unjani ?','Comment vas-tu ?'],['s','Ndiphilile','Je vais bien'],['s','Enkosi','Merci'],['s','Ewe','Oui'],['s','Hayi','Non'],['s','Uxolo','Pardon'],['s','Hamba kakuhle','Va bien (au revoir)'],['s','Sala kakuhle','Reste bien (au revoir)'],
   ['f','Amanzi','Eau','eau'],['f','Irayisi','Riz','riz'],['f','Intlanzi','Poisson','poisson'],['f','Inyama','Viande','viande'],['f','Ubisi','Lait'],['f','Isonka','Pain'],['f','Ukutya','Nourriture'],
   ['m','Umama','Mère'],['m','Utata','Père'],['m','Umntwana','Enfant'],['m','Umhlobo','Ami(e)'],['m','Indoda','Homme'],['m','Indlu','Maison'],['m','Ilali','Village'],['m','Utitshala','Enseignant(e)'],['m','Isikolo','École'],
   ['n','Ilanga','Soleil'],['n','Inyanga','Lune'],['n','Imvula','Pluie'],['n','Umthi','Arbre'],['n','Intsimi','Champ'],['n','Umlambo','Rivière'],['n','Intaba','Montagne'],
   ...nums(['nye','mbini','ntathu','ne','ntlanu','ntandathu','sixhenxe','sibhozo','lithoba','lishumi'])],
  tales:[{title:'Proverbe xhosa',kind:'proverbes',vocab:[],paras:['*Umntu ngumntu ngabantu.* Une personne est une personne grâce aux autres personnes.'],moral:''}],
  recipes:[{name:'Umngqusho',intro:'Maïs concassé (samp) et haricots mijotés longuement. Plat associé à la cuisine xhosa. Recette simplifiée, environ 3 h avec trempage.',base:6,ing:[['Maïs concassé (samp)',400,'g'],['Haricots secs',250,'g'],['Oignon',1,''],['Beurre ou huile',40,'g'],['Sel',1,'c. à café'],['Eau (amanzi)',2,'l','amanzi']],steps:['Fais tremper le maïs et les haricots une nuit.','Égoutte, puis mets-les à cuire dans l’eau fraîche à feu doux pendant 2 h 30.','Fais revenir l’oignon dans le beurre.','Mélange l’oignon et le sel au maïs et aux haricots, puis laisse mijoter encore 20 minutes.']}],
  trad:[['Les clics','les consonnes à clic','Le xhosa utilise des consonnes à clic, notées c, q et x, que l’on retrouve dans plusieurs langues d’Afrique australe.'],['Qongqothwane','la chanson des clics','« Qongqothwane », ou « Click Song », est une chanson xhosa de mariage rendue célèbre dans le monde par Miriam Makeba.'],['Amasi','le lait fermenté','L’amasi est un lait fermenté consommé dans plusieurs communautés d’Afrique australe, notamment avec de la bouillie de maïs.']],
  history:['Le xhosa (isiXhosa) est une langue bantoue du groupe nguni, parlée surtout dans la province du Cap-Oriental, en Afrique du Sud.','Il est célèbre pour ses consonnes à clic, empruntées aux langues khoïsan voisines. C’est l’une des onze langues officielles du pays.'],
  figure:{name:'Nelson Mandela',years:'1918–2013',role:'Homme d’État',bio:'Né dans une famille thembu de langue xhosa, il a lutté contre l’apartheid, a passé 27 ans en prison, puis est devenu en 1994 le premier président de l’Afrique du Sud démocratique. Il a reçu le prix Nobel de la paix en 1993.'}});
})(window.LCA);
