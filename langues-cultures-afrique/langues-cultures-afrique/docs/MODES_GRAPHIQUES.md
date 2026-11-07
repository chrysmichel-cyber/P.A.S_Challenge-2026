# Modes graphiques : 2D peint et 3D

Le joueur choisit dans **Menu > Paramètres > Mode graphique** (préférence enregistrée dans la sauvegarde, `settings.mode` = `2d` ou `3d`). Changer de mode demande un rechargement : le jeu l’annonce, puis recharge la page. La sauvegarde n’est jamais réinitialisée.

## Ce qui est partagé (écrit une seule fois)
- Sauvegarde (`js/learn/storage.js`), progression d’apprentissage (`js/learn/*`), quêtes et récompenses (`main.js` : `questList`, `D()`), dialogues, panneaux, carte, minicarte, entrées clavier et joystick, boucle de déplacement (mêmes vitesses, mêmes collisions), interactions (`triggerInter`, `nearInter`), personnages (`NPC_DATA`) et leurs activités.
- Objets ramassés, XP, badges et quêtes sont stockés hors du rendu : un objet obtenu dans un mode l’est dans l’autre.

## Ce qui est propre à chaque rendu
- **2D** : `js/art2d.js` (pinceaux, sprites, personnages cel-shading) et `js/world2d.js` (sol en perspective, ciels, parallaxe, effets). Boucle `loop2D` dans `main.js`.
- **3D** : Three.js r128 (`vendor/three.min.js`), `init3D()` et `loop()` dans `main.js` (cinq décors par région, caméra à la troisième personne, ombres optionnelles).

## Qualité graphique
Bas : sans ombres, résolution 1×, moins de décor 2D. Moyen : ombres si activées, résolution ≤ 1,25× (3D) / 1,5× (2D). Élevé : résolution jusqu’à 2×. Si le rendu 3D tombe sous 22 images par seconde, le jeu propose de baisser la qualité ou de passer en 2D (une seule fois).

## Repli
Sans WebGL ou si la 3D échoue au démarrage, le jeu démarre en 2D, l’explique dans les Paramètres et désactive l’option 3D. La préférence du joueur n’est pas écrasée.

## Caméra 3D
Troisième personne, orbite au glisser, zoom molette ou pincement (4 à 12), anticipation du déplacement, la caméra est repoussée hors des bâtiments et ne descend pas sous le sol. La caméra 2D a ses propres mouvements (voir `README.md`).
