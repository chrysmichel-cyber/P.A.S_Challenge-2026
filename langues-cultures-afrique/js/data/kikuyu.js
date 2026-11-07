/* Langue : Kikuyu. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"kikuyu",name:"Kikuyu",where:"Centre du Kenya",region:"est",geo:{lon:36.8,lat:-0.4,lab:"r",zone:"Hauts plateaux du Kenya"},hello:"Wĩ mwega?",code:"KK",
  words:[["s", "Wĩ mwega?", "Comment vas-tu ?"],
   ["s", "Nĩ wega", "Je vais bien"],
   ["s", "Ngatho", "Merci"],
   ...nums(["ĩmwe", "igĩrĩ", "ithatũ", "inya", "ithano", "ithathatũ", "mũgwanja", "ĩnyanya", "kenda", "ikũmi"])],tales:[],recipes:[],trad:[],
  history:["Kikuyu : Centre du Kenya. Langue bantoue.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
