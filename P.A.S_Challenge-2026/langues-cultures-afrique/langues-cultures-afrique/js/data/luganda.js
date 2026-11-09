/* Langue : Luganda. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"luganda",name:"Luganda",where:"Ouganda (royaume du Buganda)",region:"est",geo:{lon:32.5,lat:0.3,lab:"r",zone:"Buganda"},hello:"Oli otya?",code:"LG",
  words:[["s", "Oli otya?", "Comment vas-tu ?"],
   ["s", "Weebale", "Merci"],
   ["s", "Yee", "Oui"],
   ["s", "Nedda", "Non"],
   ["f", "Amazzi", "Eau", "eau"],
   ["m", "Maama", "Mère"],
   ["m", "Taata", "Père"],
   ["m", "Omwana", "Enfant"],
   ["m", "Enju", "Maison"],
   ["n", "Omuti", "Arbre"],
   ["n", "Enjuba", "Soleil"],
   ["n", "Enkuba", "Pluie"],
   ["s", "Wasuze otya?", "Bonjour (le matin)"],
   ...nums(["emu", "bbiri", "ssatu", "nnya", "ttaano", "mukaaga", "musanvu", "munaana", "mwenda", "kkumi"])],tales:[],recipes:[],trad:[],
  history:["Luganda : Ouganda (royaume du Buganda). Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
