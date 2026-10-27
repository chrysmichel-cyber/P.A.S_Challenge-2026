/* Langue : Akan (twi). Contenu minimal, rédigé pour ce prototype sans source ni validation linguistique (brouillon). À compléter avec des locuteurs. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:"akan",name:"Akan (twi)",where:"Ghana, Côte d’Ivoire",region:"ouest",geo:{lon:-1.6,lat:6.7,lab:"l",zone:"Pays akan"},hello:"Akwaaba",code:"AK",
  words:[["s", "Akwaaba", "Bienvenue"],
   ["s", "Maakye", "Bonjour (le matin)"],
   ["s", "Ɛte sɛn?", "Comment vas-tu ?"],
   ["s", "Medaase", "Merci"],
   ["s", "Aane", "Oui"],
   ["s", "Daabi", "Non"],
   ["f", "Nsuo", "Eau", "eau"],
   ["m", "Maame", "Mère"],
   ["m", "Papa", "Père"],
   ["m", "Abofra", "Enfant"],
   ["m", "Ofie", "Maison"],
   ["n", "Dua", "Arbre"],
   ["n", "Owia", "Soleil"],
   ...nums(["baako", "mmienu", "mmiɛnsa", "anan", "anum", "nsia", "nson", "nwɔtwe", "nkron", "edu"])],tales:[],recipes:[],trad:[],
  history:["Akan (twi) : Ghana, Côte d’Ivoire. Langue de la famille nigéro-congolaise.", "Cette langue figure sur la carte des langues d’Afrique de plus de 4 millions de locuteurs natifs (2024) fournie pour ce projet. Le vocabulaire proposé est volontairement très limité et doit être relu par un locuteur."]});
})(window.LCA);
