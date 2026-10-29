# N’Zassa — « Un continent, mille cultures, une aventure. »

Jeu d’aventure culturelle et éducatif : on explore des villages d’Afrique, on parle à leurs habitants, on ramasse des ingrédients, on écoute des contes, on apprend des mots, on passe des quiz et on enregistre des récits. **58 langues**, cinq régions, un rendu **3D** (par défaut) et un rendu **2D** peint, une seule progression.

Projet pour le **P.A.S Challenge Dakar 2026**, équipe **BugSquash** : GUINDO CHRYS MICHEL CHECK, Kouame Akissi Noëlle Desiree, Konan Ange Stéphane, OYETOLA ADEKOUEWOU AYILA HAMIDE.

> **À lire d’abord : les contenus de langues sont des brouillons.** Mots, contes, recettes et textes d’histoire ont été rédigés pour ce prototype par une IA. Ils ne sont ni sourcés ni validés par des locuteurs, et ne doivent pas être pris pour des données linguistiques authentiques. Le jeu l’affiche (« Brouillon », « Contenu partiel », « à compléter ») au lieu d’inventer. La prononciation est une voix de synthèse approximative.

---

## 1. Lancer le jeu

Prérequis : [Node.js](https://nodejs.org) 18 ou plus.

```bash
npm install
npm run dev        # ouvre http://127.0.0.1:5173
```

Sans Node : `python -m http.server 8000` dans ce dossier, puis <http://localhost:8000>. Ouvrir `index.html` par double-clic (`file://`) ne convient pas à tous les navigateurs. Connexion internet conseillée (polices et bibliothèque 3D hébergées dans le dossier `vendor/`, polices Google avec repli système).

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur local avec rechargement |
| `npm run validate` | Contrôle technique des données de langues |
| `npm run lint` | Vérification de syntaxe et de propreté du code |
| `npm test` | Tests unitaires (Node) |
| `npm run e2e` | Tests de bout en bout dans un navigateur (Playwright) |
| `npm run test:all` | Tout ce qui précède |
| `npm run build` / `npm run preview` | Copie statique dans `dist/` et aperçu |

## 2. Commandes de jeu

| Action | Clavier | Téléphone |
|---|---|---|
| Marcher | ZQSD, WASD ou flèches | Joystick à l’écran |
| Courir | Maj | non disponible |
| Sauter | Espace | non disponible |
| Parler / interagir | E | Bouton d’action |
| Menu | M | Bouton menu |
| Pause | P ou Échap | Bouton pause |
| Tourner / décaler la vue | Glisser la souris | Glisser |
| Zoomer | Molette | Pincement |

## 3. Les fonctionnalités

### 3.1 Menu d’accueil
Bannière et identité N’Zassa, puis : **Nouvelle aventure** (carte pour choisir un peuple et créer son personnage), **Continuer**, **Patrimoine oral**, **Régions**, **Apprendre** (carnet de mots), **Mon parcours**, **Collection**, **Profil**, **Paramètres**, **Crédits**. La touche M rouvre le menu à tout moment.

### 3.2 Carte de l’Afrique et 58 langues
Une carte schématique place chaque langue à sa zone (pastilles ; un toucher affiche le nom et la fiche). Les langues sont rangées en cinq régions, chacune avec son décor :

| Région | Décor | Langues |
|---|---|---|
| Ouest | savane, baobabs, cases rondes ocre | wolof, dioula, bambara, yoruba, igbo, ibibio, tiv, haoussa, kanouri, peul, songhaï, mooré, akan, baoulé, éwé |
| Nord | dunes, oasis, palmiers-dattiers, maisons cubiques | tamazight, copte, nubien, arabe, kabyle, chleuh |
| Est | savane dorée, acacias, girafes | swahili, amharique, somali, tigrigna, oromo, sidamo, dinka, nuer, kamba, kikuyu, luhya, kalenjin, luo, luganda, kinyarwanda, kirundi, sukuma, malgache |
| Centre | forêt dense, fougères, brume | lingala, kikongo, sango, nande, kituba, tshiluba, umbundu |
| Sud | terre rouge, rochers, aloès | zoulou, xhosa, shona, makhuwa, chewa, bemba, tsonga, tswana, sotho, swati, ndébélé, afrikaans |

Les 15 premières langues ont un contenu plus riche ; les 43 ajoutées depuis la carte des langues d’Afrique n’ont qu’un vocabulaire minimal, voire aucun mot (voir `docs/LANGUES_AJOUTEES.md`). Chaque langue garde sa propre progression.

### 3.3 Le village et ses habitants
- **Grand-mère Awa** : conteuse. **Fatou** : cuisinière. **Moussa** : joueur de tambour. **Maître Ibou** : enseignant, devant l’école. **Le gardien de la mémoire** : raconte l’histoire de la langue et une personnalité honorée.
- **11 quêtes guidées** par langue (flèche et distance dans l’interface) : saluer, ramasser des ingrédients, écouter un conte, préparer une recette, jouer le rythme, passer le quiz…
- **Objets à ramasser** (anneau bleu) : poisson, riz, eau, viande, etc., gardés dans l’**inventaire**.
- **Décor vivant** : herbe qui bouge et s’écarte, arbres qu’on peut secouer, puits, mortier, feu de camp, champ, oiseaux, animaux, poissons sauteurs. Certaines interactions donnent un mot de la langue.

### 3.4 Panneaux (barre du bas)
**Quêtes**, **Inventaire**, **Contes** (texte, vocabulaire, moral, lecture à voix haute), **Recettes** (quantités ajustables, étapes), **Traditions**, **Apprendre** (cartes de mots, quiz rapide). Le bouton de la silhouette en haut à droite ouvre **Mon personnage**.

### 3.5 Mon personnage et son nom
Sexe, couleur de peau, coiffure et couleur, tenue (simple, boubou, pagne, jupe…), couvre-chef, lunettes, bijoux, barbe, sac à dos. Le **nom du personnage** (16 caractères : lettres, chiffres, espace, apostrophe, tiret) s’affiche au-dessus de lui en 2D et en 3D, dans l’en-tête et dans les dialogues.

### 3.6 École, quiz, XP, niveaux, badges
Maître Ibou propose des **leçons de 10 questions à choix multiple**, avec correction immédiate, explication et révision des erreurs. **XP** : 10 pour une première bonne réponse, 5 au deuxième essai, +5 pour 3 bonnes de suite, +10 pour 5 de suite, +20 à la fin d’une leçon (chaque bonus une seule fois). **5 niveaux** (0, 100, 250, 500, 900 XP), **6 badges**, déblocage de la leçon suivante à 60 %. Tableau de bord **Mon parcours**. La séance est sauvegardée et reprend après fermeture. Un bandeau « Contenu provisoire » rappelle que les questions viennent de contenus non validés. Détails : `docs/APPRENTISSAGE.md`.

### 3.7 Voix
Lecture des mots et des contes par la synthèse vocale du navigateur (choix de la voix, mode « voix lente » dans Paramètres). Il n’existe pas de voix native pour la plupart de ces langues : la prononciation est approchée.

### 3.8 Deux rendus, une progression
- **3D (par défaut)** : village explorable à la troisième personne, collisions, caméra qui suit et évite les obstacles, pincement pour zoomer. Plus gourmand ; repli automatique sur la 2D si WebGL manque.
- **2D peint** : style inspiré de l’animation japonaise, généré par le code, plus léger.
Changement dans Paramètres > Mode graphique (avec confirmation et rechargement) sans perte de progression. **Qualité** Bas / Moyen / Élevé (ombres, résolution, densité du décor). Détails : `docs/MODES_GRAPHIQUES.md`.

### 3.9 Profils locaux et connexion
Profil > créer un profil (pseudo, mot de passe facultatif), se connecter, se déconnecter, supprimer. Chaque profil a sa sauvegarde ; le **mode invité** reste disponible et on peut y reprendre sa progression en créant un profil. **Limite importante : ce sont des profils locaux**, stockés dans le navigateur de cet appareil, sans serveur : pas de synchronisation entre appareils, et le mot de passe (haché) ne protège pas contre quelqu’un qui utilise le même navigateur. Détails : `docs/COMPTES.md`.

### 3.10 Patrimoine oral
Accueil > Patrimoine oral : **enregistrer un récit** au micro (5 minutes au plus) ou **importer un fichier audio**, écrire sa **transcription** et sa **traduction en français**, **réécouter**, marquer le texte comme **relu par un locuteur** (nom obligatoire, déclaratif), écouter la traduction par synthèse vocale, **exporter** l’audio et le texte, supprimer. L’accord de la personne qui raconte est obligatoire. **Aucune transcription ni traduction automatique** (elles fonctionnent mal pour ces langues). Les récits restent sur l’appareil. Si le micro est bloqué par la page qui héberge le jeu, l’import de fichier sert de repli ; sur la page hébergée, seuls certains formats se téléchargent. Détails : `docs/PATRIMOINE_ORAL.md`.

### 3.11 Collection, parcours, crédits
**Collection** : mots appris, quêtes, objets par langue. **Mon parcours** : XP, niveau, badges, leçons terminées, révision. **Crédits** : équipe, licences, contrôle des données.

### 3.12 Mobile et identité visuelle
Interface adaptée au téléphone (portrait et paysage), joystick, boutons tactiles, encoches d’écran, installable comme application (`manifest.webmanifest`). Logo, bannière, icône et palette brun/orange viennent des visuels du projet (`img/`).

## 4. Sauvegarde

Navigateur uniquement (aucun envoi sur Internet). Clé `lca-v2` (invité) ou `lca-u-<id>` (profil), schéma versionné (v4) avec migration des anciennes sauvegardes et copie de secours `.bak` avant la première migration. Index des profils : `lca-acc`. Récits oraux : IndexedDB `nzassa-oral`. Paramètres > « Effacer toutes mes données » remet la progression à zéro. **Vider les données du site efface tout** : prévoir un export pour les récits.

## 5. Structure du projet

```
index.html              page et interface
css/styles.css          styles (palette, interface, mobile)
js/main.js              interface, quêtes, voix, menus, 3D, profils, patrimoine oral
js/art2d.js, world2d.js rendu 2D peint
js/learn/               progression (XP, badges), quiz, sauvegarde, interface école
js/account/accounts.js  profils locaux
js/oral/oral.js         patrimoine oral (logique pure + stockage injecté)
js/data/<langue>.js     une langue par fichier (données uniquement)
js/data/quiz/           programme et banque de questions
js/data/regions.js      régions, langues associées, contour de la carte
tests/                  tests unitaires (*.test.cjs) et e2e (e2e.mjs)
scripts/                validation, lint, build
docs/                   guides détaillés
vendor/three.min.js     three.js r128 (licence MIT)
img/                    logo, bannière, icônes
```

Le code est du JavaScript sans bundler (scripts classiques, espace `window.LCA`). Les modules « purs » (progression, sauvegarde, comptes, patrimoine oral, quiz) fonctionnent aussi sous Node, ce qui permet de les tester sans navigateur et de les remplacer plus tard par un client d’API.

## 6. Tests réalisés

| Type | Résultat | Commande |
|---|---|---|
| Lint | 0 problème | `npm run lint` |
| Données | aucune erreur technique (nombreux avertissements « contenu partiel », normaux) | `npm run validate` |
| Unitaires | 37 sur 37 | `npm test` |
| Bout en bout (Chromium, 2D et 3D, faux micro) | 128 sur 128 | `npm run e2e` |

**Non testé** : vrais téléphones, vraie carte graphique, matériel modeste (les mesures de fluidité faites en rendu logiciel sont indicatives), voix de synthèse réelles, vrai micro, navigateurs autres que Chromium (Safari/iOS en particulier), plusieurs onglets ouverts en même temps.

## 7. Limites connues

- Contenus de langues non sourcés ni validés ; 43 langues presque vides.
- La carte est schématique (pas de frontières) ; les pastilles se chevauchent en Afrique de l’Ouest et de l’Est.
- Personnages et décors stylisés et provisoires, sans prétention de reconstitution historique.
- Pas de vrai compte en ligne, pas de partage de récits, pas de transcription ni traduction automatiques.
- La 3D n’a pas d’animation de course ou de saut complète, et le nombre d’objets n’est pas limité selon la machine.
- Niveaux de quiz 3 et 4 « à venir ».

## 7 bis. Nouveautés v0.13
- **Carte** : contours réels Natural Earth 50 m simplifiés (domaine public) + frontières *indicatives* en pointillés (ne tranchent aucun différend) ; pastilles écartées automatiquement avec trait de rappel.
- **3D** : animations de marche/course/saut/réception ; qualité **Auto** (détection cœurs/mémoire/écran/rendu logiciel, baisse automatique si < 22 i/s, densité du décor et distance d'affichage réduites). Heuristiques non testées sur appareils réels.
- **Mentions** « Stylisé, non historique » (personnage, crédits, histoire, carte de langue).
- **Quiz niveaux 3 et 4** : voir `docs/APPRENTISSAGE.md`. **Relecture** : `docs/VALIDATION.md`.
- **En ligne** : client + serveur de référence testés, non déployés, sans interface : `docs/EN_LIGNE.md`.

## 7 ter. Nouveautés v0.14
- **Mobile** : plein écran demandé sur tactile, joystick caméra (3D), corrections d'affichage portrait/paysage.
- **Monde ouvert** : mode Solo ou rencontre d'autres joueurs avec chat écrit (serveur à héberger à part) : `docs/MONDE_OUVERT.md`.

## 8. Ressources externes et licences

three.js r128 (licence MIT, inclus dans `vendor/`). Polices Bricolage Grotesque et Figtree via Google Fonts (repli système hors ligne). Aucun modèle 3D, texture, image ni son externe en dehors du logo et des visuels du projet : décors et personnages sont générés par le code.

## 9. Ajouter ou compléter une langue

Un fichier par langue dans `js/data/` : voir `docs/AJOUTER_UNE_LANGUE.md`. Ne rien inventer : laisser vide ce qui n’est pas documenté, renseigner `sources` et `contributors` avant tout passage en « validé ».
