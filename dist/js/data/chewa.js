/* Langue : Chewa (chichewa). Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"chewa",name:"Chewa (chichewa)",where:"Malawi, Zambie, Mozambique",region:"australe",geo:{lon:33.8,lat:-13.5,lab:"r",zone:"Malawi et Zambie orientale"},hello:"Moni",code:"CH",
  words:[["s", "Moni", "Bonjour"],
   ["s", "Muli bwanji?", "Comment allez-vous ?"],
   ["s", "Zikomo", "Merci"],
   ["s", "Inde", "Oui"],
   ["s", "Ayi", "Non"],
   ["s", "Tionana", "À bientôt"],
   ["f", "Madzi", "Eau", "eau"],
   ["f", "Mpunga", "Riz", "riz"],
   ["f", "Nsomba", "Poisson", "poisson"],
   ["f", "Nyama", "Viande", "viande"],
   ["m", "Mayi", "Mère"],
   ["m", "Bambo", "Père"],
   ["m", "Mwana", "Enfant"],
   ["m", "Nyumba", "Maison"],
   ["n", "Mtengo", "Arbre"],
   ["n", "Dzuwa", "Soleil"],
   ["n", "Mvula", "Pluie"],
   ...nums(["chimodzi", "ziwiri", "zitatu", "zinayi", "zisanu", "zisanu ndi chimodzi", "zisanu ndi ziwiri", "zisanu ndi zitatu", "zisanu ndi zinayi", "khumi"])],tales:[],recipes:[],trad:[],
  history:["Chewa (chichewa) : Malawi, Zambie, Mozambique. Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
