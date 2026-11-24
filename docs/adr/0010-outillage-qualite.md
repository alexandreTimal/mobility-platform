# ADR-0010 — Outillage qualité du dépôt

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-13, conventions

## Contexte

Le sujet exige un linter et un formateur appliqués automatiquement, une convention de commits, des versions taguées, des dépendances à jour et verrouillées.

## Options

1. **Biome + Lefthook + commitlint + release-please + Dependabot**.
2. ESLint + Prettier + Husky + lint-staged + Changesets : plus de règles et de plugins, plus de configuration.

## Décision

Node 24 LTS (≥ 24.3), pnpm via Corepack, TypeScript 6.0. Biome pour le lint et le format de tout le dépôt. Lefthook exécute Biome avant chaque commit et commitlint sur chaque message. Conventional Commits avec des scopes par domaine. release-please en version unique (`CHANGELOG.md`, tags `vX.Y.Z`). Dependabot chaque semaine, mises à jour regroupées.

## Conséquences

- Un seul outil de lint et format, rapide.
- Les règles a11y de Biome ne couvrent que le web ; le mobile s'appuie sur ses tests.
- TypeScript 7 sera réévalué quand son API de compilation sera disponible (7.1).
