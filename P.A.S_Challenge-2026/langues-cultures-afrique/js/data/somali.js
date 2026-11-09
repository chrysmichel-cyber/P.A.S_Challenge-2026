/* Langue : somali. Données rédigées pour ce prototype, sans source ni validation linguistique (brouillon). */
(function(LCA){
 const nums=LCA.helpers.nums;
 LCA.add({id:'somali',name:'Somali',where:'Somalie, Djibouti, Éthiopie, Kenya',region:'est',geo:{lon:46,lat:4,lab:'l',zone:'Corne de l’Afrique'},hello:'Salaan',code:'SO',
  river:{wo:'Webi.',fr:'Le fleuve (webi) apporte l’eau (biyo) aux bergers et aux fermiers.'},
  board:['kow · labo · saddex','afar · shan'],
  words:[
   ['s','Salaan','Salutation'],['s','Sidee tahay ?','Comment vas-tu ?'],['s','Waan fiicanahay','Je vais bien'],['s','Mahadsanid','Merci'],['s','Soo dhawow','Bienvenue'],['s','Haa','Oui'],['s','Maya','Non'],['s','Raali ahow','Excuse-moi'],['s','Nabad gelyo','Au revoir (que la paix t’accompagne)'],
   ['f','Biyo','Eau','eau'],['f','Bariis','Riz','riz'],['f','Kalluun','Poisson','poisson'],['f','Hilib','Viande','viande'],['f','Caano','Lait'],['f','Rooti','Pain'],['f','Cunto','Nourriture'],
   ['m','Hooyo','Mère'],['m','Aabo','Père'],['m','Ilmo','Enfant'],['m','Saaxiib','Ami(e)'],['m','Haweenay','Femme'],['m','Nin','Homme'],['m','Guri','Maison'],['m','Tuulo','Village'],['m','Macallin','Enseignant'],['m','Dugsi','École'],
   ['n','Qorrax','Soleil'],['n','Dayax','Lune'],['n','Roob','Pluie'],['n','Geed','Arbre'],['n','Beer','Champ cultivé'],['n','Webi','Fleuve'],['n','Buur','Montagne'],
   ...nums(['kow','labo','saddex','afar','shan','lix','todobo','siddeed','sagaal','toban'])],
  tales:[],
  recipes:[{name:'Bariis iyo hilib',intro:'Riz parfumé aux épices avec de la viande, plat courant dans la Corne de l’Afrique. Recette simplifiée, environ 1 h.',base:6,ing:[['Riz (bariis)',500,'g','bariis'],['Viande (hilib)',700,'g','hilib'],['Oignons',2,''],['Ail',3,'gousses'],['Cumin, cardamome, cannelle',2,'c. à soupe'],['Huile',60,'ml'],['Sel',1,'c. à café'],['Eau (biyo)',900,'ml','biyo']],steps:['Fais dorer les oignons dans l’huile, puis ajoute la viande, l’ail et les épices.','Couvre d’eau et cuis 30 minutes, jusqu’à ce que la viande soit tendre.','Ajoute le riz lavé et le sel, puis cuis à feu doux et à couvert jusqu’à absorption.']}],
  trad:[['La poésie','la parole en vers','La poésie orale tient une grande place dans la société somalie : on récite, on répond en vers, on transmet l’histoire et les débats par la poésie.'],['L’écriture latine','1972','La Somalie a adopté en 1972 une orthographe officielle en lettres latines pour écrire le somali.'],['Le pastoralisme','chameaux et troupeaux','Une grande partie de la vie rurale somalie est liée à l’élevage, notamment des chameaux.']],
  history:['Le somali est une langue couchitique de la famille afro-asiatique, parlée dans la Corne de l’Afrique.','Sa littérature a longtemps été surtout orale, en particulier la poésie. Une orthographe latine officielle a été adoptée en Somalie en 1972.'],
  figure:{name:'Mohamed Ibrahim Warsame « Hadraawi »',years:'1943–2022',role:'Poète',bio:'Poète somalien, parfois surnommé le « Shakespeare somalien ». Ses poèmes, récités et chantés, ont marqué plusieurs générations.'}});
})(window.LCA);
