/* Langue : Oromo. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"oromo",name:"Oromo",where:"Éthiopie, Kenya",region:"est",geo:{lon:37.5,lat:8.5,lab:"l",zone:"Pays oromo"},hello:"Akkam",code:"OR",
  words:[["s", "Akkam", "Bonjour"],
   ["s", "Nagaa", "Paix, salut"],
   ["s", "Galatoomi", "Merci"],
   ["s", "Eeyyee", "Oui"],
   ["s", "Lakkii", "Non"],
   ["f", "Bishaan", "Eau", "eau"],
   ["m", "Mana", "Maison"],
   ["n", "Muka", "Arbre"],
   ...nums(["tokko", "lama", "sadii", "afur", "shan", "jaha", "torba", "saddeet", "sagal", "kudhan"])],tales:[],recipes:[],trad:[],
  history:["Oromo : Éthiopie, Kenya. Langue afro-asiatique (branche couchitique).", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
