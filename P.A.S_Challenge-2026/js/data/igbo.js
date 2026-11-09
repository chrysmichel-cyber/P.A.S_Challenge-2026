/* Langue : Igbo. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"igbo",name:"Igbo",where:"Sud-est du Nigeria",region:"ouest",geo:{lon:7.5,lat:6,lab:"r",zone:"Pays igbo"},hello:"Ndewo",code:"IG",
  words:[["s", "Ndewo", "Bonjour"],
   ["s", "Kedu", "Comment vas-tu ?"],
   ["s", "Daalụ", "Merci"],
   ["s", "Nnọọ", "Bienvenue"],
   ["s", "Ee", "Oui"],
   ["s", "Mba", "Non"],
   ["f", "Mmiri", "Eau", "eau"],
   ["f", "Osikapa", "Riz", "riz"],
   ["f", "Azụ", "Poisson", "poisson"],
   ["f", "Anụ", "Viande", "viande"],
   ["m", "Nne", "Mère"],
   ["m", "Nna", "Père"],
   ["m", "Nwa", "Enfant"],
   ["m", "Ụlọ", "Maison"],
   ["n", "Osisi", "Arbre"],
   ["n", "Anyanwụ", "Soleil"],
   ...nums(["otu", "abụọ", "atọ", "anọ", "ise", "isii", "asaa", "asatọ", "itoolu", "iri"])],tales:[],recipes:[],trad:[],
  history:["Igbo : Sud-est du Nigeria. Langue de la famille nigéro-congolaise.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
