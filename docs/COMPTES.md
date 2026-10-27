# Profils locaux, connexion et nom du personnage (v0.9)

## Ce que c'est, et ce que ce n'est pas
- **Profils locaux** : un profil = un pseudo (+ mot de passe facultatif) enregistré **dans ce navigateur**, avec sa propre sauvegarde.
- **Ce n'est pas un compte en ligne.** Aucun serveur : rien ne se synchronise entre appareils, et vider les données du site efface les profils.
- Le mot de passe est haché (PBKDF2-SHA256, 150 000 itérations, sel aléatoire) et jamais stocké en clair, mais il ne protège **pas** contre quelqu'un qui a accès à ton navigateur (les données de jeu restent lisibles). Il sert à séparer les profils. Après 5 échecs, 30 s d'attente (limite côté client seulement).
- Sans Web Crypto (navigateur ancien, contexte non sécurisé), seuls les profils sans mot de passe sont possibles ; le jeu le dit.

## Clés de stockage
| Clé | Contenu |
|---|---|
| `lca-acc` | index des profils (pseudo, sel, empreinte, profil actif) |
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

## Passer à une vraie API plus tard
`js/account/accounts.js` expose `register`, `login`, `logout`, `remove`, `list`, `current`, `storage`. Un client serveur (Supabase, Firebase, API maison) peut les remplacer ; la sauvegarde (`js/learn/storage.js`) reçoit déjà son stockage par injection. Un vrai compte demandera : hachage côté serveur, HTTPS, jetons, réinitialisation de mot de passe, conformité RGPD. **Rien de cela n'existe ici.**

## Tests
- Unitaires (`tests/accounts.test.cjs`, exécutés) : nettoyage du nom, migration v3→v4, hachage, pseudo unique, mauvais mot de passe, blocage, séparation des sauvegardes, import invité, suppression, stockage défaillant.
- E2E (`tests/e2e.mjs`, exécutés) : création, mot de passe invalide, connexion/déconnexion, nom 2D et 3D, suppression.
- Non testé : vrais téléphones, navigation privée, plusieurs onglets ouverts en même temps (le dernier écrit gagne).
