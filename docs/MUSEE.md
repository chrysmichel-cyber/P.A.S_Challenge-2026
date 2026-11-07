# Musée des masques (v0.20)

Chaque village a sa salle : `LCA.museum.forLang` (js/museum/collection.js) classe les masques en trois niveaux — **le peuple du village** (champ `langs` du masque), **la région**, **ailleurs en Afrique** — et le texte d'introduction dit honnêtement ce qui manque.

## Ce que fait le musée
- Salle 3D immersive (jusqu'à 6 masques au mur + instruments), clic sur une pièce pour l'inspecter.
- Visionneuse : onglet **Photo** (zoom molette/boutons, déplacement, précédent/suivant, vignettes) et **Modèle 3D** (relief tournant).

## Limites
- Seul le masque yoruba est rattaché à un village ; les autres villages voient d'abord leur région, puis les autres régions.
- Le « modèle 3D » est un relief calculé à partir d'une photo (luminosité = profondeur) : une approximation, pas un scan. Le détourage est imparfait (léger halo sur le masque kuba).
- Images : Met Open Access (domaine public), notices à faire relire.

## Ajouter un masque
`node scripts/add-mask.mjs <objectID> [langId,…]` (réseau requis) télécharge l'image libre et affiche la notice à coller dans `js/museum/masks.js` ; compléter les champs entre crochets. Le script refuse tout objet hors domaine public. Son analyseur est testé (tests/museum.test.cjs) ; l'appel réseau réel n'a pas pu être testé depuis le bac à sable.

## v0.20.1 — collisions et façade du musée
Le musée est un volume plein (cercles de collision sans trou), les cailloux bloquent le joueur dans les deux rendus, et les personnages (PNJ) bloquent aussi en 3D. Façade redessinée (2D et 3D). Testé : balayage de l’empreinte (test unitaire) et marche contre les 4 murs, des cailloux et en 2D/3D (Playwright, scripts hors dépôt). Non testé : collision contre les PNJ en 3D en jeu.
