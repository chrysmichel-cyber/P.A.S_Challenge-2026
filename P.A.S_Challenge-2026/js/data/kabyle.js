/* Langue : Kabyle. Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"kabyle",name:"Kabyle",where:"Kabylie (nord de l’Algérie)",region:"nord",geo:{lon:4.2,lat:36.4,lab:"r",zone:"Kabylie"},hello:"Azul",code:"KB",
  words:[["s", "Azul", "Bonjour"],
   ["s", "Tanemmirt", "Merci"],
   ...nums(["yiwen", "sin", "kraḍ", "kkuẓ", "smmus", "sḍis", "sa", "tam", "tẓa", "mraw"])],tales:[],recipes:[],trad:[],
  history:["Kabyle : Kabylie (nord de l’Algérie). Variété berbère (amazighe) du nord de l’Algérie.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
