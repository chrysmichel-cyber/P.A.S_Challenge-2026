/* Langue : Peul (fula). Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"fula",name:"Peul (fula)",where:"Ceinture sahélienne, du Sénégal au Cameroun",region:"ouest",geo:{lon:-12,lat:12,lab:"l",zone:"Fouta-Djalon et Sahel"},hello:"Jam tan",code:"FU",
  words:[["s", "Jam tan", "La paix seulement (réponse de salutation)"],
   ["s", "A jaaraama", "Merci"],
   ["s", "Eey", "Oui"],
   ["s", "Alaa", "Non"],
   ["f", "Ndiyam", "Eau", "eau"],
   ...nums(["gootel", "didi", "tati", "nay", "jowi", "jeegom", "jeedidi", "jeetati", "jeenay", "sappo"])],tales:[],recipes:[],trad:[],
  history:["Peul (fula) : Ceinture sahélienne, du Sénégal au Cameroun. Langue de la famille nigéro-congolaise, parlée sur une très vaste zone.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
