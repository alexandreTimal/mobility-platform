# ADR-0009 — Flux Git, pull requests et relecture

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-12

## Contexte

Le sujet demande une branche principale protégée, une PR par développement reliée à son issue et relue avant merge, et un historique qui montre qui a fait quoi.

## Options

1. **GitHub Flow + squash merge, CI obligatoire, une approbation obligatoire du binôme**.
2. GitHub Flow sans approbation obligatoire (chaque auteur responsable de sa PR) : choix initial du 2026-11-24, abandonné le 2026-11-25 car contraire à la consigne « relue avant merge » du sujet.
3. Git Flow (branches `develop`, `release`) : trop lourd pour deux personnes.

## Décision

GitHub Flow : `main` protégée, branches courtes `<type>/<N>-<slug>`, une PR par issue (`Closes #N`), squash merge avec un titre conventionnel. La vérification `ci` est obligatoire, ainsi qu'**une approbation** de l'autre membre. Un nouveau push invalide l'approbation. Une fois la PR approuvée et verte, son auteur la merge.

## Conséquences

- Un commit par PR sur `main`, relié à son issue.
- Conforme à la consigne « relue avant merge » du sujet ; la relecture est tracée dans chaque PR.
- Chacun dépend de l'autre pour merger : relire les PR en attente fait partie du travail quotidien. `/bmad-code-review` aide à préparer la relecture, mais l'approbation est humaine.
- Le propriétaire du dépôt peut techniquement contourner la règle (administrateur) : on ne le fait pas.
