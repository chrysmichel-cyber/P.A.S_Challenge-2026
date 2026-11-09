# Monde ouvert (chat écrit) et mode mobile

## Deux modes de jeu (accueil → « Mode de jeu »)
- **Solo** (défaut) : rien n'est envoyé sur Internet.
- **Monde ouvert** : tu retrouves les autres joueurs du **village de ta langue** (un salon par langue, 30 joueurs maximum) et tu discutes **par écrit uniquement**. Tu vois leurs personnages bouger (3D et 2D).

## Ce qu'il faut pour l'utiliser
Un serveur N'Zassa en marche, sur une adresse **HTTPS**. Le jeu publié sur GitHub Pages est statique : il ne peut pas héberger ce serveur.
1. Héberger `server/` (Node ≥ 18, sans dépendance) chez un hébergeur Node (Render, Railway, Fly.io, VPS…) : `node server/server.cjs`.
2. Variables : `NZASSA_SECRET` (longue chaîne aléatoire), `NZASSA_CORS` (origine du jeu, ex. `https://chrysmichel-cyber.github.io`), `PORT`, `HOST=0.0.0.0`.
3. Dans le jeu : Accueil → Monde ouvert → coller l'adresse du serveur → cocher le consentement → « Tester le serveur ». Ou fixer `LCA.config.apiBase` dans `js/online/config.js`.

En local : `NZASSA_CORS='*' node server/server.cjs` puis adresse `http://localhost:8787`.

## Sécurité et protection des joueurs (implémentées et testées)
Pseudo seulement (aucun compte, e-mail, âge ni photo) ; consentement explicite avant d'entrer ; texte seul : liens, e-mails, numéros de téléphone remplacés par `***` ; messages limités à 200 caractères, 1 message / 1,5 s et 20 / minute, doublons refusés ; **Masquer** un joueur (côté client) ; **Signaler** : 3 signalements de joueurs différents = silence de 10 minutes ; positions bornées, avatar réduit à des couleurs/valeurs validées ; sessions courtes sans état persistant (rien n'est sauvegardé : messages et positions disparaissent à l'arrêt du serveur) ; limitation de débit par adresse.

## Limites honnêtes — à traiter avant un usage public, surtout avec des mineurs
- Aucune modération humaine ni filtre d'insultes : seuls les liens/coordonnées sont filtrés. Prévoir des modérateurs, un filtre de langage et une charte.
- Pas d'âge ni de consentement parental ; le chat est ouvert à tous les pseudos.
- Pas d'identité vérifiée : un joueur peut prendre n'importe quel pseudo libre.
- Sondage HTTP (~2 fois par seconde), pas de WebSocket : suffisant pour un prototype (quelques dizaines de joueurs), pas pour une grande échelle.
- Un seul processus serveur, état en mémoire ; pas de TLS intégré (proxy HTTPS requis).
- Testé uniquement avec un serveur local et deux navigateurs ; pas de test de charge ni sur appareils réels.

## Mobile
- **Plein écran** : sur appareil tactile, une invite demande de passer en plein écran (et tente le mode paysage). Si on le quitte, la partie se met en pause et l'invite revient. Sur iPhone/Safari, l'API plein écran n'existe pas : le jeu l'explique (« Sur l'écran d'accueil ») et propose de continuer.
- **Joystick de déplacement** (à gauche) et **joystick caméra** (à droite, rotation et inclinaison) en 3D.
- Corrections d'affichage : bandeau du haut sans chevauchement en portrait, barre du bas plus lisible, carte moins rognée en paysage, menu pause défilable.
