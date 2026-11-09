/* Langue : amharique (transcription latine, l'écriture éthiopienne n'est pas encore intégrée). Brouillon, sans source ni validation. */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'amharique',name:'Amharique',where:'Éthiopie',region:'est',geo:{lon:38.7,lat:9,lab:'r',zone:'Hauts plateaux éthiopiens'},hello:'Selam',code:'AM',
  river:{wo:'Wenz.',fr:'La rivière (wenz) apporte l’eau (wuha) au village.'},
  board:['and · hulet · sost','arat · amist'],
  words:[
   ['s','Selam','Salut, paix'],['s','Tenayistilign','Bonjour (formel)'],['s','Dehna neh ?','Comment vas-tu ? (à un homme)'],['s','Dehna negn','Je vais bien'],['s','Ameseginalehu','Merci'],['s','Awo','Oui'],['s','Aydelem','Non'],['s','Yikirta','Pardon'],
   ['f','Wuha','Eau','eau'],['f','Ruz','Riz','riz'],['f','Asa','Poisson','poisson'],['f','Siga','Viande','viande'],['f','Wetet','Lait'],['f','Dabo','Pain'],['f','Injera','Galette de teff'],
   ['m','Enat','Mère'],['m','Abat','Père'],['m','Lij','Enfant'],['m','Wedaj','Ami(e)'],['m','Set','Femme'],['m','Wend','Homme'],['m','Bet','Maison'],['m','Astemari','Enseignant(e)'],
   ['n','Wenz','Rivière'],
   ...nums(['and','hulet','sost','arat','amist','sidist','sebat','simint','zetegn','asir'])],
  tales:[{title:'Proverbes éthiopiens',kind:'proverbes',vocab:[],paras:['*Dir biyabir anbessa yasir.* Quand les toiles d’araignée s’unissent, elles peuvent attacher un lion.','*Kes be kes inkulal be egru yihedal.* Peu à peu, l’œuf marchera sur ses pieds.'],moral:''}],
  recipes:[{name:'Doro wat',intro:'Ragoût de poulet épicé au berbéré, servi avec de l’injera. Recette très simplifiée, environ 2 h.',base:6,ing:[['Poulet découpé',1200,'g'],['Oignons',1000,'g'],['Berbéré (mélange d’épices)',4,'c. à soupe'],['Beurre clarifié épicé (niter kibbeh) ou huile',100,'g'],['Œufs durs',6,''],['Ail et gingembre',4,'gousses'],['Sel',1,'c. à café'],['Injera à servir',6,'portions']],steps:['Fais cuire les oignons hachés à sec à feu doux, sans matière grasse, jusqu’à ce qu’ils fondent.','Ajoute le beurre, l’ail, le gingembre et le berbéré, puis cuis 20 minutes.','Ajoute le poulet et un peu d’eau, puis laisse mijoter 45 minutes.','Ajoute les œufs durs et le sel. Sers avec l’injera.']}],
  trad:[['Le fidäl','l’écriture éthiopienne','L’amharique s’écrit avec l’écriture éthiopienne (fidäl), issue du ge’ez. Chaque signe note une consonne associée à une voyelle.'],['Injera','la galette partagée','L’injera est une galette souple qui sert d’assiette et de couvert : on prend la nourriture avec des morceaux de galette.'],['Buna','la cérémonie du café','La cérémonie du café éthiopienne est un moment de rencontre : le café est torréfié, moulu et servi en plusieurs tournées.']],
  history:['L’amharique est une langue sémitique de la famille afro-asiatique. C’est la langue de travail du gouvernement fédéral éthiopien.','Il s’écrit avec l’écriture éthiopienne (fidäl), issue du ge’ez, qui compte plus de 200 signes. Ce jeu utilise pour l’instant une transcription latine.'],
  figure:{name:'Haddis Alemayehu',years:'1910–2003',role:'Écrivain',bio:'Écrivain éthiopien, auteur du roman « Fikir Eske Mekabir » (1966), œuvre majeure de la littérature amharique.'}});
})(window.LCA);
