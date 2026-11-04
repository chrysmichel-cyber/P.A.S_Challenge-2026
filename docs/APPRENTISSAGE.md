# Système d’apprentissage : leçons, quiz, XP, badges

## Où est quoi
| Rôle | Fichier |
|---|---|
| Règles (XP, niveaux, badges, séries, déblocage, révision) | `js/learn/progression.js` (pur, testé sous Node) |
| Leçons et génération de questions | `js/learn/quiz.js` |
| Sauvegarde et migrations (stockage injectable) | `js/learn/storage.js` |
| Interface (hub, quiz, résultat, tableau de bord) | `js/learn/ui.js` |
| Parcours (niveaux, leçons, seuil de réussite) | `js/data/quiz/curriculum.js` |
| Questions rédigées à la main | `js/data/quiz/bank.js` |
| Branchement au jeu (enseignant, menu, sauvegarde) | `js/main.js` |

## Ajouter des questions (sans toucher à l’interface)
Ajouter un objet à `LCA.quizBank` dans `js/data/quiz/bank.js` : `id` unique, `lang`, `lesson` (clé de leçon du parcours), `category`, `difficulty` (1 à 3), `prompt`, `text`, `options` (4 × `{id,text}`), `answer`, `explanation`, `source`, `validation` (`brouillon`, `verification`, `valide`, `publie`). Dès qu’une leçon a 4 questions rédigées ou plus, elles remplacent la génération automatique. Sans question rédigée, les questions sont générées depuis le vocabulaire de la langue (au moins 4 mots dans la catégorie ; sinon la leçon reste « à compléter »).
Seul un contenu `valide` ou `publie` n’est pas signalé « provisoire ». Aucune langue n’a ce statut aujourd’hui.

## Règles d’expérience
- Bonne réponse à une question jamais vue : **10 XP** (une seule fois par question, à vie).
- Question ratée puis réussie plus tard (révision ou rejeu) : **5 XP**, une seule fois.
- Série de 3 bonnes réponses dans une leçon : **+5 XP** ; série de 5 : **+10 XP** (une fois par leçon et par palier).
- Leçon terminée : **+20 XP** (une fois par leçon). Leçon sans erreur : badge « Première leçon parfaite ».
- Rejouer une leçon ou recharger la page ne redonne aucun point. Valider deux fois la même question est ignoré.
- Une séance interrompue est enregistrée et reprise telle quelle.

## Niveaux (seuils dans `CONFIG.levels`)
Débutant 0 · Explorateur 100 · Apprenti linguiste 250 · Gardien des langues 500 · Maître des connaissances 900.

## Badges (conditions dans `CONFIG.badges`)
Première leçon terminée (1 leçon) · Dix bonnes réponses (10 questions différentes réussies) · Série de cinq · Première leçon parfaite · Explorateur des langues (leçon terminée dans 2 langues) · Collectionneur de connaissances (30 mots appris). Chaque badge garde sa date d’obtention.

## Déblocage
Chaque leçon demande la précédente réussie à 60 % (`passRate`). Les niveaux 3 (Dialogues) et 4 (Mise en situation) sont annoncés « à venir » : rien n’est inventé tant que des locuteurs n’ont pas fourni et validé les dialogues.
Récompense culturelle : une page de journal par leçon terminée, qui reprend uniquement le vocabulaire étudié (étiqueté provisoire).

## Sauvegarde
Clé `lca-v2`, schéma version 3 (`learn` ajouté). Une sauvegarde v2 est lue telle quelle, complétée par des valeurs par défaut, et copiée une fois dans `lca-v2.bak` avant la première écriture. `js/learn/storage.js` ne dépend que d’un objet `getItem/setItem` : on peut le remplacer par un appel d’API.

## Tests
`npm run lint` · `npm run validate` · `npm test` (20 tests Node, sans dépendance) · `npm run e2e` (navigateur réel, nécessite `npm i` pour Playwright) · `npm run test:all`.


## Niveaux 3 et 4 (v0.13)
- **Niveau 3 « Expressions et logique »** : expressions (salutations, formules), suites (nombres, régularités), intrus (catégories).
- **Niveau 4 « Mises en situation et culture »** : marché, village, contes, recettes, défi mixte.
- Chaque leçon : 10 questions déterministes à 4 propositions, difficulté progressive, correction expliquée après chaque réponse.
- Une leçon n'apparaît que si la langue a assez de contenu (≥ 4 mots pour le type concerné) ; sinon elle est marquée « à compléter ».
- Récompenses : XP habituel, **bonus de 50 XP** une fois quand toutes les leçons disponibles d'un niveau ≥ 2 sont réussies dans une langue, badges `niveau_3` et `niveau_4`.
- Progression sauvegardée (schéma v5) avec migration des anciennes sauvegardes.
- Contenus provisoires : les questions reposent sur des données non validées (voir VALIDATION.md).

## v0.19 — Atelier de langue
Révision par boîtes (10 min, 1 j, 3 j, 7 j, 16 j, 35 j), carnet, prononciation approximative (enveloppe d'énergie, hauteur, DTW), voix de référence (locuteur natif consentant, 2 avis d'autres locuteurs = « validée » déclarative), propositions de mots (jamais intégrées automatiquement).
