const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const I=require('../js/i18n.js');
test('trois langues proposées : français, anglais, portugais',()=>{assert.deepEqual(Object.keys(I.LANGS),['fr','en','pt'])});
test('le français est rendu tel quel et une chaîne inconnue n’est jamais inventée',()=>{
 assert.equal(I.tr('Quêtes','fr'),'Quêtes');assert.equal(I.tr('Texte jamais vu','en'),'Texte jamais vu');assert.equal(I.tr('Texte jamais vu','pt'),'Texte jamais vu');
});
test('libellés connus traduits en anglais et en portugais, espaces conservés',()=>{
 assert.equal(I.tr('Quêtes','en'),'Quests');assert.equal(I.tr('Quêtes','pt'),'Missões');assert.equal(I.tr('  Précédent ','pt'),'  Anterior ');
});
test('motifs avec nombres',()=>{
 assert.equal(I.tr('Quête 3 sur 11','en'),'Quest 3 of 11');assert.equal(I.tr('À 55 m','pt'),'A 55 m');
 assert.equal(I.tr('Musée des masques · Wolof','pt'),'Museu das máscaras · Wolof');
 assert.match(I.tr('6 masques · 3 instruments · photos de collections en accès libre','en'),/photos from open-access collections$/);
});
test('le dictionnaire est fourni (au moins 150 libellés)',()=>{assert.ok(I.size()>150,String(I.size()))});
test('les textes de l’écran de démarrage sont tous traduits',()=>{
 ['Bienvenue dans N’Zassa','Langue du jeu','Affichage','Rendu 2D','Rendu 3D','Commencer','3D indisponible sur cet appareil.'].forEach(s=>{assert.notEqual(I.tr(s,'en'),s,s);assert.notEqual(I.tr(s,'pt'),s,s)});
});
