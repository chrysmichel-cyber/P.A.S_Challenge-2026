# Ajouter une langue

Le moteur du jeu ne contient aucune donnée linguistique. Une langue se définit dans **un seul fichier** de `js/data/`.

## Étapes

1. Copier `js/data/bambara.js` vers `js/data/ma-langue.js` et changer la clé (`LCA.langs.ma_langue`) et l'`id`.
2. Remplir les champs ci-dessous. **Ne pas inventer** de traduction : laisser le contenu absent plutôt que de le deviner.
3. Ajouter `<script src="js/data/ma-langue.js"></script>` dans `index.html`, avant `regions.js`.
4. Ajouter l'identifiant de la langue dans la région concernée de `js/data/regions.js`.
5. Lancer `npm run validate`. Le script signale identifiants manquants, doublons, catégories inconnues, ingrédients absents et références invalides.

## Champs d'une langue

| Champ | Rôle |
|---|---|
| `id`, `name`, `where`, `hello`, `color`, `code` | Identité, zone documentée, salutation, couleur et sigle (2 lettres) |
| `names` | Noms des 4 personnages du village : `awa` (contes), `fatou` (cuisine), `drum` (musique), `ibou` (école) |
| `greet` | Phrase d'accueil de chaque personnage, dans la langue |
| `drum` | Nom de l'instrument et motif rythmique sur 8 temps (`B` grave, `S` clair, `.` silence) |
| `river`, `board` | Phrase du fleuve et texte du tableau de l'école |
| `words` | Liste `[catégorie, forme écrite, traduction française, clé d'ingrédient optionnelle]` |
| `tales` | Contes : titre, vocabulaire, paragraphes, morale |
| `recipes` | Recettes : nom, présentation, ingrédients, étapes |
| `trad` | Traditions : titre, sous-titre, texte |

Catégories de mots : `s` salutations, `f` nourriture, `m` famille et village, `n` nature et couleurs, `c` nombres (exactement 10, de 1 à 10).
Clés d'ingrédient requises pour les quêtes : `eau`, `riz`, `poisson`, `viande`.

## Statut de validation

Chaque langue reçoit le statut `brouillon` au chargement (voir `main.js`, `L.status`). Les statuts prévus sont : `brouillon`, `verification`, `valide`, `publie`.
Une donnée générée par une IA n'est jamais authentique par défaut. Renseigner `sources` et `contributors` avant de passer un contenu en `valide`.

## Audio

Aucun fichier audio n'est fourni. Les voix actuelles utilisent la synthèse vocale du navigateur avec une écriture phonétique approchée (`respell` dans `main.js`). Pour ajouter des enregistrements d'un locuteur natif, prévoir un champ `audio` par mot et lire le fichier avant de se rabattre sur la synthèse. Vérifier les droits des enregistrements.


## Langues partielles, région et carte (v0.6)

Pour une nouvelle langue, utilise `LCA.add({...})` (voir `js/data/swahili.js`) : les champs absents prennent une valeur par défaut. Champs utiles en plus du vocabulaire :

- `region` : `ouest`, `nord`, `est`, `centrale` ou `australe` (détermine le décor et la couleur).
- `geo` : `{lon, lat, lab:'l'|'r', zone:'texte'}` : position de la pastille sur la carte (`lab` place le nom à gauche ou à droite).
- `history` : liste de paragraphes pour le gardien de la mémoire.
- `figure` : `{name, years, role, bio}` : une personnalité honorée.
- Ajouter le fichier dans `index.html` (avant `regions.js`) et l'identifiant dans `js/data/regions.js`.

Il est préférable de laisser vide (`[]`) ce qui n'est pas documenté. `npm run validate` signale les langues partielles en avertissement.
