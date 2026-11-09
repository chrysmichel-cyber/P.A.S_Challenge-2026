/* Banque de questions rédigées à la main. Aucune interface ici : on ajoute une question en ajoutant un objet à ce tableau.
   Champs : id (unique), lang, lesson, category, difficulty (1 à 3), prompt (consigne), text (mot ou phrase affichée),
   options (4 propositions {id,text}), answer (id de la bonne), explanation, source, validation (brouillon | verification | valide | publie), say (texte à prononcer, facultatif).
   Les traductions ci-dessous sont celles du jeu de données du prototype : elles n’ont PAS été validées par un locuteur (statut « brouillon »).
   Les langues et leçons sans question ici sont complétées automatiquement à partir du vocabulaire (voir js/learn/quiz.js). */
window.LCA=window.LCA||{};
(function(){
 const SRC='Vocabulaire de démonstration du prototype (js/data/wolof.js), non validé';
 const q=(n,text,right,wrong,exp,dir)=>{const opts=[right].concat(wrong);
  const order=[2,0,3,1].map(k=>opts[(k+n)%4]);/* ordre fixe, bonne réponse à une place variable */
  const ids=['a','b','c','d'];const o=order.map((t,i)=>({id:ids[i],text:t}));
  return {id:'wolof.salutations.'+n,lang:'wolof',lesson:'salutations',category:'Salutations',difficulty:n<6?1:2,
   prompt:dir==='fw'?'Comment dit-on cela en wolof ?':'Que signifie ce mot ou cette expression en wolof ?',text:text,options:o,answer:o.find(x=>x.text===right).id,
   explanation:exp,source:SRC,validation:'brouillon',say:dir==='fw'?'':text}};
 window.LCA.quizBank=[
  q(1,'Salaam maalekum','Bonjour (que la paix soit sur vous)',['Merci','Pardon','À la prochaine'],'C’est la salutation de base : on la dit en arrivant chez quelqu’un ou en croisant un voisin.'),
  q(2,'Jërëjëf','Merci',['Oui','Non','Pardon'],'« Jërëjëf » sert à remercier.'),
  q(3,'Nanga def ?','Comment vas-tu ?',['Bienvenue','Comment va ta famille ?','Je vais bien'],'On demande des nouvelles avec « Nanga def ? ». À ne pas confondre avec « Ana sa waa kër ? » qui parle de la famille.'),
  q(4,'Waaw','Oui',['Non','Merci','Pardon'],'« Waaw » est la façon de dire oui.'),
  q(5,'Déedéet','Non',['Oui','Bienvenue','À la prochaine'],'« Déedéet » signifie non.'),
  q(6,'Baal ma','Pardon',['Merci','Bienvenue','Oui'],'« Baal ma » s’emploie pour s’excuser.'),
  q(7,'Dalal ak jàmm','Bienvenue',['À la prochaine','Pardon','Comment vas-tu ?'],'On accueille quelqu’un avec « Dalal ak jàmm ».'),
  q(8,'Ba beneen yoon','À la prochaine',['Bienvenue','Bonjour (que la paix soit sur vous)','Merci'],'C’est une formule d’au revoir : « jusqu’à une autre fois ».'),
  q(9,'Maa ngi fi rekk','Je vais bien (je suis juste ici)',['Comment vas-tu ?','Réponse au salut','Comment va ta famille ?'],'C’est la réponse habituelle à « Nanga def ? ».'),
  q(10,'Ana sa waa kër ?','Comment va ta famille ?',['Comment vas-tu ?','Je vais bien (je suis juste ici)','Bonjour (que la paix soit sur vous)'],'Prendre des nouvelles de la famille fait partie des salutations.')
 ];
})();
