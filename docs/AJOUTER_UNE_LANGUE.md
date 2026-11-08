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
| `proverbs` | Proverbes : forme locale, traduction, sens, contexte, source et relecteur |
| `familyNames` | Noms et lignées explicitement autorisés à être publiés, avec source et relecture |
| `guides` | Repères culturels courts (salutations, mariage, tabous), avec thème, texte et source |
| `herbs` | Plantes : noms local/français, partie, usage culinaire, relecture et sources |

Catégories de mots : `s` salutations, `f` nourriture, `m` famille et village, `n` nature et couleurs, `c` nombres (exactement 10, de 1 à 10).
Clés d'ingrédient requises pour les quêtes : `eau`, `riz`, `poisson`, `viande`.

## Statut de validation

Chaque langue reçoit le statut `brouillon` au chargement (voir `main.js`, `L.status`). Les statuts prévus sont : `brouillon`, `verification`, `valide`, `publie`.
Une donnée générée par une IA n'est jamais authentique par défaut. Renseigner `sources` et `contributors` avant de passer un contenu en `valide`.

## Leçons et voix

Le parcours de courtes leçons est dans `js/data/quiz/curriculum.js` : salutations et nombres sont déjà les premières leçons. L'atelier de langue (`js/learn/lab.js`) permet à une personne qui se déclare locutrice d'enregistrer une voix de référence par mot, après consentement et en indiquant si la personne parle est un aîné, une enseignante ou un locuteur. Ces fichiers restent dans le stockage local du profil ; ils ne sont pas partagés avec les autres joueurs. Sans voix enregistrée, l'application annonce qu'elle utilise la synthèse vocale du navigateur. Les rôles et relectures sont déclaratifs, pas vérifiés par un serveur.

## Proverbes, noms, guides et plantes

Les champs facultatifs ci-dessous alimentent les rubriques « Un jour, un proverbe », « Noms de famille, prénoms et lignées », les codes culturels et l'herbier. N'ajoute pas de fait oral ou de traduction supposée comme s'il était certain.

- `proverbs`: `{text, fr, meaning, useCase, source, sourceUrl, reviewedBy}`. Le sens et la situation d'emploi doivent être relus par un locuteur ou une locutrice. Une citation sans source reste affichée comme brouillon.
- `familyNames`: `{name, kind, meaning, history, public, consent, source, sourceUrl, reviewedBy}`. L'interface ne publie une entrée que si `public` et `consent` valent `true`, avec une source et un nom de relecteur. Ne documente pas une lignée privée sans l'accord des personnes concernées.
- `guides`: `{topic, title, text, source, sourceUrl, reviewedBy}`. `topic` vaut `saluer`, `mariage` ou `tabous`. Précise les variations locales ; ne présente pas une coutume comme universelle.
- `herbs`: `{frName, localName, part, culinaryUse, source, sourceUrl, reviewedBy}`. Un `benefit` n'est affiché que s'il est accompagné d'un `benefitSourceUrl` de santé publique ou scientifique. L'herbier peut aussi reprendre les ingrédients végétaux des recettes, sans traduire le nom local s'il n'existe pas déjà dans le vocabulaire.

## Vidéos de recettes

Une recette peut contenir `videos: [{title, url, type, poster, presenter, consent, rights, source, sourceUrl}]`. La vidéo n'est montrée que si l'accord de diffusion (`consent: true`), les droits (`rights`) et une URL lisible sont présents. Demande le consentement de la personne filmée et vérifie aussi les droits sur l'image, la musique et le lieu avant d'ajouter une vidéo.

## Fiches du musée

Une notice de masque ou d'instrument peut fournir `forms`, `materials`, `colors`, `symbolism` et `performance`. Chaque champ doit refléter la notice officielle liée à la pièce. Si elle ne le documente pas, laisse-le vide : la salle indique alors que l'information manque à la notice consultée.


## Langues partielles, région et carte (v0.6)

Pour une nouvelle langue, utilise `LCA.add({...})` (voir `js/data/swahili.js`) : les champs absents prennent une valeur par défaut. Champs utiles en plus du vocabulaire :

- `region` : `ouest`, `nord`, `est`, `centrale` ou `australe` (détermine le décor et la couleur).
- `geo` : `{lon, lat, lab:'l'|'r', zone:'texte'}` : position de la pastille sur la carte (`lab` place le nom à gauche ou à droite).
- `history` : liste de paragraphes pour le gardien de la mémoire.
- `figure` : `{name, years, role, bio}` : une personnalité honorée.
- Ajouter le fichier dans `index.html` (avant `regions.js`) et l'identifiant dans `js/data/regions.js`.

Il est préférable de laisser vide (`[]`) ce qui n'est pas documenté. `npm run validate` signale les langues partielles en avertissement.
