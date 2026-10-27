# Patrimoine oral (v0.12)

Accueil > **Patrimoine oral** : enregistrer un récit, écrire sa transcription et sa traduction, le réécouter.

## Ce qui fonctionne
- **Enregistrer** avec le micro (MediaRecorder, 5 minutes au plus) **ou choisir un fichier audio** (25 Mo au plus) si le micro est refusé ou indisponible.
- **Réécouter** avant et après la sauvegarde, avec un lecteur audio.
- **Fiche** : titre, langue, conteur ou conteuse, lieu, date, durée.
- **Transcription** (dans la langue du récit) et **traduction en français**, écrites à la main, modifiables à tout moment.
- **Accord de la personne qui raconte** : case obligatoire avant tout enregistrement.
- **Statut** : « Brouillon » ou « Relu par un locuteur » (le nom du locuteur est obligatoire). Ce statut est **déclaré** par l'utilisateur : le jeu ne peut pas le vérifier.
- **Écouter la traduction** avec la voix de synthèse française du navigateur (ce n'est pas la voix du conteur).
- **Exporter** l'audio et un fichier texte (transcription, traduction, statut, mention de l'absence d'outil automatique).
- **Supprimer** un récit (confirmation, audio effacé aussi).
- Un récit appartient au **profil actif** (invité ou profil local) ; les autres profils ne le voient pas.

## Ce qui n'existe pas (volontairement ou faute de serveur)
- **Aucune transcription ni traduction automatique** : ces outils couvrent mal la plupart de ces langues et inventeraient du texte avec assurance. Une aide automatique, si elle est ajoutée, devra être marquée « non vérifiée ».
- **Pas de partage en ligne** : tout reste sur l'appareil (IndexedDB). Vider les données du site efface les récits. Pensez à exporter.
- Si IndexedDB est indisponible (navigation privée stricte), le jeu l'indique : les récits sont alors perdus à la fermeture.
- Le micro peut être bloqué selon la page qui héberge le jeu ; le fichier audio sert alors de solution de repli.
- Aucun récit n'est ajouté au vocabulaire ou aux leçons automatiquement.

## Éthique
Demander l'accord avant d'enregistrer, surtout pour les personnes âgées ; ne pas diffuser sans accord écrit ; prévoir un droit de retrait. Avant tout partage en ligne : consentement écrit, choix privé/public, modération, hébergement conforme au RGPD.

## Code
`js/oral/oral.js` : logique pure et stockage injecté (`idbAdapter`, `memAdapter`) ; l'interface est dans `js/main.js` (écrans `oral`, `oralnew`, `oralview`). Pour un serveur plus tard, remplacer l'adaptateur par un client d'API.

## Tests
- Unitaires exécutés (`tests/oral.test.cjs`) : nettoyage, validation, création, modification, suppression, isolation par profil, stockage défaillant, export, taille.
- E2E exécutés (`tests/e2e.mjs`) avec un **faux micro** du navigateur : enregistrement réel, champs obligatoires, relecture, export, persistance après rechargement, suppression, fichier audio et fichier refusé.
- Non testé : vrai micro, téléphones, navigateurs autres que Chromium, lecture sur Safari/iOS (formats audio différents).
