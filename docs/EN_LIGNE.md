# Architecture des fonctionnalités en ligne (comptes, récits, transcription, traduction)

**État réel : préparée et testée en local, non déployée.** Le jeu reste 100 % local tant que `LCA.config.apiBase` est vide (défaut). Aucune interface en ligne n'est affichée dans le jeu à ce stade.

## Pièces
- `js/online/client.js` : client sans dépendance (`auth`, `stories`, `transcribe`, `translate`), isolé de l'interface.
- `js/online/config.js` : `apiBase` (vide par défaut).
- `server/server.cjs` : serveur de **référence** (Node, sans dépendance) qui fixe le contrat. Lancer : `node server/server.cjs` (port 8787, local uniquement par défaut). Variables : `NZASSA_SECRET`, `NZASSA_DB`, `PORT`, `HOST`.
- `tests/online.test.cjs` : 8 tests (démarrent le vrai serveur).

## Sécurité mise en œuvre (et testée)
Mots de passe hachés scrypt + sel ; jetons signés HMAC-SHA256 avec expiration (7 j), comparaison à temps constant ; limitation de débit (plus stricte sur l'authentification) ; limite de corps 6 Mo ; validation des noms/titres ; consentement explicite (compte, récit) ; aucun récit public avant validation (`pending` → `approved`) ; un signalement remet un récit en modération ; export et suppression des données du compte (RGPD) ; réponses `no-store`.

## Transcription et traduction automatiques
Les routes existent mais répondent **501 `no_provider`** tant qu'aucun fournisseur n'est branché : le serveur n'invente jamais de transcription ni de traduction. Tout résultat futur devra rester étiqueté « brouillon » et passer par le système de relecture par des locuteurs natifs (`docs/VALIDATION.md`).

## Limites connues — à faire avant une mise en production
Stockage fichier JSON (remplacer par une base), pas de TLS (proxy HTTPS obligatoire), CORS fermé par défaut, pas d'e-mail/récupération de mot de passe, pas d'outil de modération (le statut se change en base), pas de stockage objet pour l'audio, pas d'audit de sécurité externe, pas de branchement UI. Les comptes locaux actuels (`docs/COMPTES.md`) restent indépendants.
