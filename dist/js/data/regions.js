/* Régions, langues associées et contour de carte. Les régions sont des regroupements de commodité, pas des ensembles culturels uniques. */
window.LCA.regions=[
 {id:'ouest',name:'Afrique de l’Ouest',note:'Sénégal, Gambie, Côte d’Ivoire, Burkina Faso, Mali',langs:['wolof','dioula','bambara','yoruba','igbo','hausa','fula','akan','ewe']},
 {id:'nord',name:'Afrique du Nord',note:'Maghreb, vallée du Nil',langs:['tamazight','copte','arabe','kabyle','shilha']},
 {id:'est',name:'Afrique de l’Est',note:'Côte swahilie, Corne de l’Afrique, hauts plateaux',langs:['swahili','amharique','somali','tigrinya','oromo','kikuyu','luo','luganda','kinyarwanda','kirundi','malagasy']},
 {id:'centrale',name:'Afrique centrale',note:'Bassin du Congo, Oubangui',langs:['lingala','kikongo','sango','kituba','tshiluba','umbundu']},
 {id:'australe',name:'Afrique australe',note:'Afrique du Sud, Zimbabwe',langs:['zoulou','xhosa','shona','chewa','bemba','tsonga','tswana','sotho','swazi','ndebele','afrikaans']}];
/* Contour schématique du continent et de Madagascar, en [longitude, latitude]. Approximation pour la carte, non cartographique. */
window.LCA.mapOutline={
 africa:[[-5.9,35.8],[-2,35.2],[3,36.8],[10,37.3],[11,36.8],[10.2,34],[11.5,33.2],[15,32.2],[19,30.5],[20,32.2],[23,32.8],[26,31.6],[29.9,31.2],[32.3,31.3],[34,28.5],[32.6,29.9],[33.6,27.5],[35.5,23.5],[37.2,19.5],[38.5,16],[39.5,15.5],[43.1,12.7],[44.5,10.5],[48,11.2],[51.3,11.8],[50.8,9],[48.5,5],[46,2],[42,-1],[40.5,-3],[39,-5],[39.5,-8],[40.5,-10.5],[40.6,-15],[37,-18],[35,-21],[35.5,-24],[32.8,-26],[32.9,-28.5],[30,-31],[27,-33.8],[22,-34.2],[18.5,-34.2],[17.8,-31],[15,-27],[14.5,-22],[11.8,-17],[13.5,-12],[12.3,-6],[9.5,-1],[9.4,3.5],[8.5,4.5],[5.5,5],[4,6.2],[1.2,6.1],[-2,4.8],[-4,5.2],[-7.5,4.4],[-11,6.8],[-13.2,8.5],[-15,10.5],[-16.7,12.3],[-17.5,14.7],[-16.5,19.5],[-17,21],[-15.8,23.7],[-13,27.7],[-9.8,29.7],[-9.6,31],[-8.5,33.5],[-6.8,34.1]],
 madagascar:[[49.3,-12],[50.4,-15.5],[49.5,-17.5],[47.2,-24.9],[45,-25.5],[43.7,-23],[44.3,-19.5],[46,-16],[47.7,-14]]};
