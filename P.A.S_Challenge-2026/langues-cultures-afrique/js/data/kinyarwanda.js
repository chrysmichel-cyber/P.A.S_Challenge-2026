/* Langue : Kinyarwanda. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"kinyarwanda",name:"Kinyarwanda",where:"Rwanda",region:"est",geo:{lon:29.9,lat:-2,lab:"r",zone:"Rwanda"},hello:"Muraho",code:"KR",
  words:[["s", "Muraho", "Bonjour"],
   ["s", "Murakoze", "Merci"],
   ["s", "Murakaza neza", "Bienvenue"],
   ["s", "Yego", "Oui"],
   ["s", "Oya", "Non"],
   ["s", "Murabeho", "Au revoir"],
   ["f", "Amazi", "Eau", "eau"],
   ["f", "Umuceri", "Riz", "riz"],
   ["f", "Ifi", "Poisson", "poisson"],
   ["f", "Inyama", "Viande", "viande"],
   ["m", "Umwana", "Enfant"],
   ["m", "Inzu", "Maison"],
   ["n", "Igiti", "Arbre"],
   ["n", "Izuba", "Soleil"],
   ["n", "Imvura", "Pluie"],
   ["s", "Mwaramutse", "Bonjour (le matin)"],
   ["s", "Mwiriwe", "Bonsoir"],
   ...nums(["rimwe", "kabiri", "gatatu", "kane", "gatanu", "gatandatu", "karindwi", "umunani", "icyenda", "icumi"])],tales:[],recipes:[],trad:[],
  history:["Kinyarwanda : Rwanda. Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
