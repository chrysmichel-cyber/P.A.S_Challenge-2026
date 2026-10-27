/* Langue : Kirundi. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"kirundi",name:"Kirundi",where:"Burundi",region:"est",geo:{lon:29.8,lat:-3.4,lab:"r",zone:"Burundi"},hello:"Amahoro",code:"RN",
  words:[["s", "Amahoro", "Bonjour, paix"],
   ["s", "Murakoze", "Merci"],
   ["s", "Ego", "Oui"],
   ["s", "Oya", "Non"],
   ["f", "Amazi", "Eau", "eau"],
   ["f", "Umuceri", "Riz", "riz"],
   ["f", "Inyama", "Viande", "viande"],
   ["m", "Inzu", "Maison"],
   ["n", "Igiti", "Arbre"],
   ["n", "Izuba", "Soleil"],
   ["n", "Imvura", "Pluie"],
   ["s", "Mwaramutse", "Bonjour (le matin)"],
   ...nums(["rimwe", "kabiri", "gatatu", "kane", "gatanu", "gatandatu", "karindwi", "umunani", "icenda", "icumi"])],tales:[],recipes:[],trad:[],
  history:["Kirundi : Burundi. Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
