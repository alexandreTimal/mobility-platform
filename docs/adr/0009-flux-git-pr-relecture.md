# ADR-0009 — Flux Git, pull requests et relecture

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-12

## Contexte

Le sujet demande une branche principale protégée, une PR par développement reliée à son issue et relue avant merge, et un historique qui montre qui a fait quoi.

## Options

1. **GitHub Flow + squash merge, CI obligatoire, approbation non obligatoire**.
2. GitHub Flow avec une approbation obligatoire du binôme.
3. Git Flow (branches `develop`, `release`) : trop lourd pour deux personnes.

## Décision

GitHub Flow : `main` protégée, branches courtes `<type>/<N>-<slug>`, une PR par issue (`Closes #N`), squash merge avec un titre conventionnel. La vérification `ci` est obligatoire. L'approbation ne l'est pas : chaque auteur est responsable de sa PR (décision d'équipe du 2026-11-24).

## Conséquences

- Un commit par PR sur `main`, relié à son issue.
- Écart assumé avec la consigne « relue avant merge » : à justifier en soutenance. Une relecture reste possible et encouragée (`/bmad-code-review`).
