/* Parcours pédagogique. Configurable : on peut remplacer ou compléter les leçons d’une langue dans « overrides ».
   Une leçon sans assez de mots documentés (4 minimum) est affichée « à compléter » : rien n’est inventé pour la remplir.
   cat = groupe de mots de la langue (s, f, m, n, c). Les niveaux 3 et 4 sont fabriqués à partir du contenu déjà présent dans le jeu (phrases, nombres, groupes de mots, contes, recettes) : aucune information nouvelle n’est ajoutée. kind : words (défaut), phrases, numbers, odd, scenario, tales, recipes, mixed. */
window.LCA=window.LCA||{};
window.LCA.curriculum={
 passRate:.6,
 levels:[
  {n:1,title:'Premiers mots',lessons:[
   {id:'salutations',title:'Salutations et politesse',cat:'s'},
   {id:'nombres',title:'Compter de 1 à 10',cat:'c'}]},
  {n:2,title:'La vie quotidienne',lessons:[
   {id:'famille',title:'Famille et village',cat:'m'},
   {id:'nourriture',title:'Nourriture et marché',cat:'f'},
   {id:'nature',title:'Nature et couleurs',cat:'n'}]},
  {n:3,title:'Expressions et logique',lessons:[
   {id:'expressions',title:'Expressions de politesse',cat:'s',kind:'phrases',needs:'au moins 4 expressions de plusieurs mots'},
   {id:'suite',title:'Compter : avant et après',cat:'c',kind:'numbers',needs:'les nombres de 1 à 10'},
   {id:'intrus',title:'Trouver l’intrus',kind:'odd',needs:'au moins 3 mots dans un groupe et 1 mot dans un autre'}]},
  {n:4,title:'Mises en situation et culture',lessons:[
   {id:'marche',title:'Au marché',cat:'f',kind:'scenario',needs:'au moins 4 mots de nourriture'},
   {id:'village',title:'Au village',cat:'m',kind:'scenario',needs:'au moins 4 mots de famille et de village'},
   {id:'contes',title:'Les contes',kind:'tales',needs:'un conte avec du vocabulaire'},
   {id:'recettes',title:'Les recettes',kind:'recipes',needs:'une recette'},
   {id:'defi',title:'Le grand défi',kind:'mixed',needs:'assez de mots dans plusieurs groupes'}]}],
 overrides:{}
};
