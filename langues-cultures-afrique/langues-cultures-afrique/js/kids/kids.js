/* Mode petits (dès 3 ans) : images (émojis) pour les mots qui s’y prêtent, quiz à deux choix, encouragements.
   Module pur : navigateur (LCA.kids) et Node (tests). Aucune traduction ni contenu culturel n’est ajouté :
   les émojis illustrent seulement le sens FRANÇAIS déjà présent dans les données. */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else{root.LCA=root.LCA||{};root.LCA.kids=m}})(typeof window!=='undefined'?window:this,function(){
'use strict';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,' ').replace(/\(.*?\)/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const E={eau:'💧',riz:'🍚',poisson:'🐟',viande:'🍖',pain:'🍞',lait:'🥛',mere:'👩',pere:'👨',enfant:'🧒',maison:'🏠',arbre:'🌳',soleil:'☀️',lune:'🌙',pluie:'🌧️',
 blanc:'⬜',noir:'⬛',rouge:'🟥',vert:'🟩',bleu:'🟦',jaune:'🟨',ami:'🤝',femme:'👩',homme:'👨',enseignant:'🧑‍🏫',maitre:'🧑‍🏫',ecole:'🏫',village:'🏘️',
 riviere:'🏞️',fleuve:'🏞️',colline:'⛰️',montagne:'🏔️',champ:'🌾','champ cultive':'🌾',terre:'🌍',manger:'🍽️',boire:'🥤',repas:'🍲',nourriture:'🍲',
 djembe:'🥁',tambour:'🥁',griot:'🎤',bonjour:'👋',merci:'🙏',oui:'👍',non:'👎',bienvenue:'🤗',poule:'🐔',vache:'🐄',chevre:'🐐',girafe:'🦒',oiseau:'🐦',
 'un':'1️⃣','deux':'2️⃣','trois':'3️⃣','quatre':'4️⃣','cinq':'5️⃣','six':'6️⃣','sept':'7️⃣','huit':'8️⃣','neuf':'9️⃣','dix':'🔟'};
/* Émoji d’un sens français (« Eau », « Un (1) »…), ou '' s’il n’y a pas d’image sûre. */
function emojiFor(fr){const k=norm(fr);if(E[k])return E[k];const f=k.split(' ')[0];return E[f]&&/^(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)$/.test(f)?E[f]:'';}
/* Deux propositions seulement (la bonne + une mauvaise), choisies de façon déterministe ; l’ordre d’origine est conservé. */
function twoOptions(q){
 const right=q.options.find(o=>o.id===q.answer),wrong=q.options.filter(o=>o.id!==q.answer);
 let h=0;String(q.id).split('').forEach(c=>{h=(h*31+c.charCodeAt(0))>>>0});
 const pick=wrong[h%wrong.length];
 return q.options.filter(o=>o===right||o===pick);
}
const PRAISE=['Bravo !','Super !','Génial !','Bien joué !','Formidable !'];
const TRY=['Presque !','Tu y es presque !','On regarde ensemble !'];
const praise=n=>PRAISE[Math.abs(n|0)%PRAISE.length],tryAgain=n=>TRY[Math.abs(n|0)%TRY.length];
/* Étoiles gagnées sur une leçon : 3 si parfait, 2 si au moins 60 %, 1 sinon (toujours au moins une : on encourage). */
function stars(score,total){if(!total)return 1;const r=score/total;return r>=1?3:r>=.6?2:1}
return {emojiFor,twoOptions,praise,tryAgain,stars,norm};
});
