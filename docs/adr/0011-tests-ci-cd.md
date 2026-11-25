# ADR-0011 — Stratégie de tests et pipeline CI/CD

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-11, AD-12, AD-13

## Contexte

Le sujet exige des tests du moteur, des algorithmes (dont la stabilité) et du générateur, des tests mobiles, une CI bloquante sur chaque PR, un déploiement continu du web et un APK à chaque merge.

## Options

1. **Vitest + Playwright/axe, orchestrés par Turborepo** ; trois workflows GitHub Actions.
2. Jest partout : plus lent, moins adapté à l'ESM.

## Décision

Vitest pour les packages et le web ; Playwright + axe pour les parcours web et l'accessibilité ; outils mobiles choisis par Ethan. `pnpm test` lance tout. Workflows : `ci.yml` (lint, types, tests web et mobile, build web, export du bundle mobile) sur chaque PR, `deploy-web.yml` (preview et production), `mobile-apk.yml` (APK en artefact à chaque merge).

## Conséquences

- Une PR rouge ne peut pas être mergée.
- La base preview est réinitialisée à chaque déploiement de preview.
- Badges d'état dans le README.
