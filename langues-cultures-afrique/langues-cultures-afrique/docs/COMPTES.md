# Comptes SQLite, profils et nom du personnage

## Ce que c'est, et ce que ce n'est pas
- Sur `npm run dev`, les inscriptions et connexions passent par le serveur et enregistrent le nom d’utilisateur, le nom du personnage, l’identifiant du compte, la date de création et le hachage du mot de passe dans `server/db.sqlite`.
- Le mot de passe est haché côté serveur (scrypt + sel aléatoire), jamais enregistré en clair. La création demande un consentement explicite.
- La sauvegarde de progression reste dans le navigateur et n’est pas encore synchronisée entre appareils. Le mode invité reste disponible hors ligne.

## Clés de stockage
| Clé | Contenu |
|---|---|
| `lca-acc` | index des profils (pseudo, sel, empreinte, profil actif) |
| `lca-cloud` | session du compte SQLite (jeton d’accès et identifiant) |
| `lca-v2` | sauvegarde **invité** (inchangée : les anciennes sauvegardes restent valides) |
| `lca-u-<id>` | sauvegarde d'un profil (même schéma que `lca-v2`) |
| `lca-u-<id>.bak` | copie de secours avant migration, comme pour l'invité |

Le jeu ne connaît qu'une clé : `LCA.accounts.storage()` redirige `lca-v2` vers le profil actif. Changer de profil recharge la page.

## Parcours
- Accueil > **Profil** (ou la puce en haut à gauche) : se connecter, créer un profil, se déconnecter, supprimer le profil.
- À la création, on peut **reprendre la progression d'invité** (copie ; la sauvegarde invité reste intacte).
- La suppression d'un profil efface sa sauvegarde mais jamais celle de l'invité.

## Nom du personnage
- Champ « Nom » dans *Mon personnage* (et dans l'écran Profil). 16 caractères au plus : lettres (accents compris), chiffres, espace, apostrophe, tiret ; le reste est retiré.
- Stocké dans la sauvegarde (`name`, schéma **v4**, migration depuis v2/v3 sans perte).
- Affiché : puce d'en-tête, étiquette au-dessus du personnage (2D et 3D), accueil, message de bienvenue et dialogue de Maître Ibou.

## Démarrage
`npm run dev` lance le jeu et son API SQLite locale ensemble. En hébergement distant, configurer `LCA.config.apiBase` vers l’API HTTPS. Le serveur de référence permet aussi l’export et la suppression du compte.

## Tests
- Unitaires (`tests/accounts.test.cjs`, exécutés) : nettoyage du nom, migration v3→v4, hachage, pseudo unique, mauvais mot de passe, blocage, séparation des sauvegardes, import invité, suppression, stockage défaillant.
- E2E (`tests/e2e.mjs`, exécutés) : création, mot de passe invalide, connexion/déconnexion, nom 2D et 3D, suppression.
- Non testé : vrais téléphones, navigation privée, plusieurs onglets ouverts en même temps (le dernier écrit gagne).
