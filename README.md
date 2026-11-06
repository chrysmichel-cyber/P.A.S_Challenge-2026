# 1. N’Zassa — « Un continent, mille cultures, une aventure. »

Jeu d’aventure culturelle et éducatif : on explore des villages d’Afrique, on parle à leurs habitants, on ramasse des ingrédients, on écoute des contes, on apprend des mots, on passe des quiz et on enregistre des récits. **58 langues**, cinq régions, un rendu **3D** (par défaut) et un rendu **2D** peint, une seule progression.

Projet pour le **P.A.S Challenge Dakar 2026**, équipe **BugSquash** : GUINDO CHRYS MICHEL CHECK, Kouame Akissi Noëlle Desiree, Konan Ange Stéphane, OYETOLA ADEKOUEWOU AYILA HAMIDE.

> **À lire d’abord : les contenus de langues sont des brouillons.** Mots, contes, recettes et textes d’histoire ont été rédigés pour ce prototype par une IA. Ils ne sont ni sourcés ni validés par des locuteurs, et ne doivent pas être pris pour des données linguistiques authentiques. Le jeu l’affiche (« Brouillon », « Contenu partiel », « à compléter ») au lieu d’inventer. La prononciation est une voix de synthèse approximative.

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

### 3.2 Carte de l’Afrique et 42 langues
Une carte schématique place chaque langue à sa zone (pastilles ; un toucher affiche le nom et la fiche). Les langues sont rangées en cinq régions, chacune avec son décor :

| Région | Décor | Langues |
|---|---|---|
| Ouest | savane, baobabs, cases rondes ocre | wolof, dioula, bambara, yoruba, igbo, haoussa, peul, akan, éwé |
| Nord | dunes, oasis, palmiers-dattiers, maisons cubiques | tamazight, copte, arabe, kabyle, chleuh |
| Est | savane dorée, acacias, girafes | swahili, amharique, somali, tigrigna, oromo, kikuyu, luo, luganda, kinyarwanda, kirundi, malgache |
| Centre | forêt dense, fougères, brume | lingala, kikongo, sango, kituba, tshiluba, umbundu |
| Sud | terre rouge, rochers, aloès | zoulou, xhosa, shona, chewa, bemba, tsonga, tswana, sotho, swati, ndébélé, afrikaans |

Les 15 premières langues ont un contenu plus riche ; les 27 ajoutées depuis la carte des langues d’Afrique n’ont qu’un vocabulaire minimal (les 16 langues sans aucun mot ont été retirées en v0.17) (voir `docs/LANGUES_AJOUTEES.md`). Chaque langue garde sa propre progression.

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

Le jeu local reste dans le navigateur (aucun envoi sur Internet). Clé `lca-v2` (invité) ou `lca-u-<id>` (profil), schéma versionné (v4) avec migration des anciennes sauvegardes et copie de secours `.bak` avant la première migration. Index des profils : `lca-acc`. Récits oraux : IndexedDB `nzassa-oral`. Paramètres > « Effacer toutes mes données » remet la progression à zéro. **Vider les données du site efface tout** : prévoir un export pour les récits.

Le serveur optionnel de `server/` sauvegarde les comptes, récits, signalements et réglages applicatifs dans SQLite (`server/db.sqlite`). Il fonctionne avec Node ≥ 18, sans dépendance npm ; Python fournit le module SQLite standard utilisé pour écrire le fichier. Un ancien fichier JSON configuré par `NZASSA_DB` est migré automatiquement.

La météo du village utilise, si l’utilisateur l’autorise, sa géolocalisation actuelle et les conditions réelles d’Open-Meteo. Les données sont refusées si leur horodatage dépasse ±1 heure, puis l’ambiance géographique stylisée reprend automatiquement. La position n’est pas envoyée au serveur N’Zassa. La géolocalisation nécessite HTTPS (ou `localhost`) et une permission du navigateur.

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
| Unitaires | 140 sur 140 | `npm test` |
| Bout en bout (Chromium, 2D et 3D, faux micro) | 128 sur 128 | `npm run e2e` |

**Non testé** : vrais téléphones, vraie carte graphique, matériel modeste (les mesures de fluidité faites en rendu logiciel sont indicatives), voix de synthèse réelles, vrai micro, navigateurs autres que Chromium (Safari/iOS en particulier), plusieurs onglets ouverts en même temps.

## 7. Limites connues

- Contenus de langues non sourcés ni validés ; 27 langues très peu fournies.
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

## 7 quater. Nouveautés v0.15
- **Enseignant** : on apprend d'abord (cartes avec audio, `js/learn/quiz.js › studyFor`), puis le quiz valide la leçon et ouvre la suivante. Les anciennes sauvegardes restent valides (leçon déjà réussie ou commencée = déjà étudiée).
- **Gardien de la mémoire** : « grand livre » en chapitres (lieu avec carte, langue avec audio, histoire, personnalité, traditions, rappel de vérification), construit uniquement avec les données existantes (`js/memoire/elder.js`).
- **Ambiance** : cycle jour/nuit (une journée = 7 minutes) et météo (dégagé, nuageux, pluie ; désert plus sec, forêt plus humide), en 2D et en 3D (`js/ambient/ambient.js`). Désactivable dans Paramètres.
- **Animaux** : le nom français s'affiche près des animaux ; un nom dans la langue étudiée n'apparaît que s'il est déjà dans ses données (`js/ambient/animals.js`).
- **Mode petits (dès 3 ans)** : gros boutons, images (émojis) pour les mots qui s'y prêtent, voix automatique, deux réponses par question, étoiles ; le monde ouvert est désactivé (`js/kids/kids.js`). Non testé avec de vrais enfants.
- **3D plus douce** : personnages, vaches, animaux et maisons à toit plat en formes arrondies (super-ellipsoïdes) au lieu de cubes.
- **Interface** : nouvel accueil (deux colonnes, tuiles à icônes), finitions du HUD, du dock et des panneaux.

## 7 quinquies. Nouveautés v0.16
- **Cartes plus lisibles** : sur la carte de l'Afrique, boutons de zoom par région, recherche d'une langue par son nom, pastilles plus grandes, noms placés sans chevauchement (`js/map/layout.js › labels`), légende. La minicarte du village s'agrandit d'un appui (avec légende). Les cartes de mots de l'onglet Apprendre ont un texte plus grand et plus contrasté, et un bouton d'écoute plus facile à toucher.
- **Trésors cachés** : 5 par village, à des positions fixes pour un village donné (`js/rewards/hidden.js`). Ils n'apparaissent qu'à l'approche ; la minicarte brille quand on est près (« chaud / froid », sans montrer l'emplacement). Un trésor offre un mot de la langue (déjà présent dans ses données) et +5 points (+20 quand les 5 sont trouvés). Le compteur est dans le HUD et sur la carte de l'Afrique (étoile quand un village est complet). Les objets sont génériques (perle, graine, pierre, plume, coquillage) et ne prétendent représenter aucun objet culturel.
- **Météo et heure selon la zone** : chaque village reçoit un profil climatique stylisé (`js/ambient/climate.js` : désert, sahel, forêt équatoriale, hauts plateaux, côte, etc.) qui règle la pluie, le vent de sable, la brume du matin et les températures indicatives. L'heure est l'heure solaire locale (1 h par 15° de longitude) : voyager vers l'est avance l'heure. Ce sont des ambiances de jeu, **pas des données météorologiques**.
- **Interface** : fond lisible derrière la bannière d'accueil, notifications et panneaux animés, retour tactile sur les boutons, légende et compteur de trésors.

## 7 sexies. Nouveautés v0.17
- **Nettoyage des langues** : les 16 langues qui n'avaient aucun mot (baoulé, dinka, ibibio, kalenjin, kamba, kanuri, luhya, makhuwa, mooré, nande, nubien, nuer, sidamo, songhaï, sukuma, tiv) sont retirées : fichiers, carte, régions, menus, compteurs et tests. **42 langues** restent. Aucun mot n'a été inventé ; les langues avec au moins un mot sont toutes conservées. Détail : `docs/LANGUES_AJOUTEES.md`.
- **Carte** : audit automatisé (5 tailles d'écran, 42 pastilles, clic réel, recouvrements, débordements, cohérence régions/langues) ; une pastille mal placée dans la mer (swahili) corrigée ; tests unitaires ajoutés (pastilles sur la terre, langues sans mot). La carte n'affiche pas de noms de pays (seulement la zone de chaque langue).
- **Village vivant** (`js/life/life.js`, rendus 3D et 2D) : 6 lieux de vie (marché avec étals, paniers et jarres ; cour de cuisine avec marmite, mortier et tabourets ; atelier de poterie et de tissage ; banc de l'arbre à palabres ; aire de jeux ; feu du soir) et 10 habitants qui cuisinent, travaillent, vendent, bavardent assis, jouent en courant ou racontent des histoires, avec gestes variés et regards autour d'eux.
- **Routines** : marché et ateliers le jour, feu et conteur le soir, village endormi la nuit ; messages « marché animé » le matin et « rassemblement autour du feu » le soir.
- **Interactions pédagogiques** : on parle à chaque habitant. Les dialogues utilisent seulement les données existantes de la langue (mots du marché, salutations, nombres, recette, conte) ; si un mot manque, le dialogue le dit au lieu d'inventer. Chaque lieu découvert rapporte 3 points (« découverte culturelle »).
- **Sons d'ambiance** (WebAudio, aucun fichier) : vent, oiseaux le jour, grillons la nuit, murmure du marché, cuisine, feu, voix, rivière ; mixés selon la zone et l'heure. Réglage « Sons d'ambiance du village » dans Paramètres (nécessite le Son).
- **Limites** : décors et métiers sont des représentations générales et stylisées, non propres à un peuple ; pas de nouveaux modèles lourds ; les sons sont synthétiques ; non testé sur de vrais téléphones ; la 2D dessine les personnages assis par un simple cadrage.

## 7 septies. Nouveautés v0.18
- **Audit 2D / 3D d'abord** : le mode 2D était déjà une vue à la troisième personne en perspective (caméra derrière et au-dessus, suivi doux, collisions, mêmes habitants, dialogues, langues et progression que la 3D). En 2D, la caméra ne tourne pas autour du personnage : l'ajouter casserait le sol et l'horizon pré-dessinés (trop risqué), ce n'a donc **pas** été fait. Les deux modes partagent le même contrôleur de caméra et les mêmes données.
- **Entrée du village et apparition** : chaque village a une porte fixe (`gate`) et un point d'apparition précis juste devant ; le personnage regarde vers l'intérieur (nord). Le point est cherché parmi les emplacements libres (jamais dans un bâtiment, un arbre ou un obstacle ; repli défini). Même règle en 2D et en 3D, au démarrage et à chaque voyage.
- **Voyage entre villages** : depuis la carte, écran de transition (nom du village de destination, barre de progression, réduit si « réduire les animations »), changement de langue sans perte de la sauvegarde, des points ni de la progression, puis apparition à l'entrée.
- **Animaux** : poules, chèvres et moutons errent autour de leur lieu, picorent ou broutent, se reposent la nuit ; étiquettes françaises (nom local seulement s'il existe dans les données).
- **Jardin potager** (jardinier), **point d'eau avec pont** (porteuse d'eau, bassin bloquant, pont traversable), **porte du village éclairée le soir**, ombres de contact selon l'heure sous les objets en 2D, collisions des objets du village en 2D (elles n'existaient pas).
- Les dialogues du jardinier et de la porteuse d'eau n'utilisent que des mots déjà présents dans les données (nourriture, « eau ») ; sinon ils le disent. Rien n'est inventé.
- **Limites** : décors et métiers stylisés ; non testé sur de vrais téléphones ni une vraie carte graphique ; les tests de performance ont été faits en rendu logiciel (lent, indicatif). Quelques tests du monde ouvert sont instables en rendu logiciel (ils échouaient déjà avant).

## 7 octies. Nouveautés v0.19

**Apprentissage** (bouton « Atelier de langue » dans Apprendre) : révision automatique par boîtes (Leitner, priorité = retard + difficulté + rareté d'usage), carnet personnel avec notes, progression par langue et niveau, comparaison de prononciation, voix de référence, propositions de mots.
**Patrimoine oral** : région, accord explicite pour afficher le nom du narrateur, empreinte SHA-256 de l'audio d'origine, avis de locuteurs déclarés, recherche et filtres, échange par fichier `nzassa-oral`.
**Animations** : le joueur inactif plus de 60 s regarde autour de lui, change de posture, s'étire, bâille, regarde ses mains ou s'assoit près d'un banc ; tout s'interrompt dès qu'on bouge. Les PNJ ont de petits gestes selon leur activité.

**Limites (honnêtes)** :
- Aucun enregistrement de locuteur n'est fourni : les voix doivent être enregistrées par des locuteurs natifs consentants. Sans voix de référence, la synthèse vocale du navigateur est utilisée et signalée comme telle.
- La comparaison de prononciation est **approximative** (rythme et mélodie seulement) ; ce n'est pas une note de prononciation.
- Sans serveur, la validation communautaire est **déclarative** et passe par des fichiers échangés ; elle ne prouve pas l'identité des validateurs.
- Tout est stocké localement (navigateur). Tous les contenus linguistiques restent des brouillons à faire valider.
- Les gestes des PNJ n'ont été vérifiés que par tests unitaires, pas visuellement.

## 8. Ressources externes et licences

three.js r128 (licence MIT, inclus dans `vendor/`). Polices Bricolage Grotesque et Figtree via Google Fonts (repli système hors ligne). Aucun modèle 3D, texture, image ni son externe en dehors du logo et des visuels du projet : décors et personnages sont générés par le code.

## 9. Ajouter ou compléter une langue

Un fichier par langue dans `js/data/` : voir `docs/AJOUTER_UNE_LANGUE.md`. Ne rien inventer : laisser vide ce qui n’est pas documenté, renseigner `sources` et `contributors` avant tout passage en « validé ».
