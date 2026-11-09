# Validation des contenus par des locuteurs natifs

Tous les contenus linguistiques de N’Zassa sont des **brouillons générés par IA, non validés**. Rien n’est présenté comme authentique tant qu’il n’a pas été relu.

## Fonctionnement (menu → « Relecture »)
- Un relecteur déclare son nom et sa langue (déclaratif : aucune identité n’est vérifiée).
- Pour chaque mot, conte ou recette, il choisit : **confirmé**, **à corriger** (avec correction proposée) ou **contesté**.
- Un élément devient « validé » seulement après **2 confirmations de relecteurs distincts** et **aucune contestation**.
- Le statut d’une langue reste « brouillon » ou « en vérification » ; il ne passe jamais à « validé » automatiquement.
- Export/import d’un fichier `nzassa-review` (JSON) pour fusionner les relectures de plusieurs personnes.

## Sources prioritaires à vérifier
Les langues sans source renseignée sont signalées par `scripts/validate-data.mjs` (ex. zoulou). Les mots, traductions, contes, recettes et repères historiques doivent être comparés à des dictionnaires, grammaires ou locuteurs avant tout usage pédagogique.

## Limites
Relecture déclarative (pas d’authentification), stockage local au navigateur tant que le serveur (`docs/EN_LIGNE.md`) n’est pas branché. Les nouveaux mots n’ont pas été ajoutés dans cette version : l’enrichissement ne doit se faire qu’avec une source citée.
