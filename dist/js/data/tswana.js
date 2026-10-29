/* Langue : Tswana (setswana). Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"tswana",name:"Tswana (setswana)",where:"Botswana, Afrique du Sud",region:"australe",geo:{lon:24.5,lat:-24,lab:"l",zone:"Botswana"},hello:"Dumela",code:"TW",
  words:[["s", "Dumela", "Bonjour"],
   ["s", "O kae?", "Comment vas-tu ?"],
   ["s", "Ke teng", "Je vais bien"],
   ["s", "Ke a leboga", "Merci"],
   ["s", "Ee", "Oui"],
   ["s", "Nnyaa", "Non"],
   ["s", "Tsamaya sentle", "Va en paix"],
   ["f", "Metsi", "Eau", "eau"],
   ["f", "Nama", "Viande", "viande"],
   ["m", "Mme", "Mère"],
   ["m", "Rre", "Père"],
   ["m", "Ngwana", "Enfant"],
   ["m", "Ntlo", "Maison"],
   ["n", "Setlhare", "Arbre"],
   ["n", "Letsatsi", "Soleil"],
   ["n", "Pula", "Pluie"],
   ...nums(["nngwe", "pedi", "tharo", "nne", "tlhano", "thataro", "supa", "robedi", "robongwe", "lesome"])],tales:[],recipes:[],trad:[],
  history:["Tswana (setswana) : Botswana, Afrique du Sud. Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
