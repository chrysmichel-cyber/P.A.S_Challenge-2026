# Architecture des fonctionnalités en ligne (comptes, récits, transcription, traduction)

**État réel : branchée en développement local, non déployée publiquement.** `npm run dev` démarre le jeu avec son API SQLite sur `127.0.0.1:8787`; les inscriptions et connexions utilisent cette API. Le serveur local ne rend pas les comptes accessibles depuis d’autres appareils.

## Pièces
- `js/online/client.js` : client sans dépendance (`auth`, `stories`, `transcribe`, `translate`), isolé de l'interface.
- `js/online/config.js` : `apiBase` pointe automatiquement vers l’API locale sur `localhost` et `127.0.0.1`; ailleurs il reste vide jusqu’à configuration d’une API HTTPS.
- `scripts/dev.mjs` : démarre et arrête ensemble Vite et l’API, en autorisant l’origine locale du jeu.
- `server/server.cjs` : serveur de **référence** (Node ≥ 18) qui fixe le contrat. Lancer : `node server/server.cjs` (port 8787, local uniquement par défaut). Variables : `NZASSA_SECRET`, `NZASSA_DB`, `PORT`, `HOST`.
- `server/db.sqlite` : base SQLite créée automatiquement par le serveur. Elle contient notamment les comptes utilisateurs, récits, signalements et les données de configuration de l’application (`app_data`). Elle utilise le module `sqlite3` standard de Python, sans dépendance npm ni installation de paquet Node. Une ancienne base JSON indiquée par `NZASSA_DB` est migrée automatiquement vers SQLite et conservée en `.json.bak`.
- `js/ambient/realtime.js` : météo réelle optionnelle, directement entre le navigateur et Open-Meteo. La position reste côté navigateur ; les mesures de plus d’une heure sont rejetées.
- `tests/online.test.cjs` : 8 tests (démarrent le vrai serveur).

## Sécurité mise en œuvre (et testée)
Mots de passe hachés scrypt + sel ; jetons signés HMAC-SHA256 avec expiration (7 j), comparaison à temps constant ; limitation de débit (plus stricte sur l'authentification) ; limite de corps 6 Mo ; validation des noms/titres ; consentement explicite (compte, récit) ; aucun récit public avant validation (`pending` → `approved`) ; un signalement remet un récit en modération ; export et suppression des données du compte (RGPD) ; réponses `no-store`.

## Transcription et traduction automatiques
Les routes existent mais répondent **501 `no_provider`** tant qu'aucun fournisseur n'est branché : le serveur n'invente jamais de transcription ni de traduction. Tout résultat futur devra rester étiqueté « brouillon » et passer par le système de relecture par des locuteurs natifs (`docs/VALIDATION.md`).

## Limites connues — à faire avant une mise en production
Pas de TLS (proxy HTTPS obligatoire), pas d'e-mail/récupération de mot de passe, pas d'outil de modération (le statut se change en base), pas de stockage objet pour l'audio, pas d'audit de sécurité externe. La progression du joueur reste stockée localement et n’est pas synchronisée avec son compte.
