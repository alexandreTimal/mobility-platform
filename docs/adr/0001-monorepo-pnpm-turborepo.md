# ADR-0001 — Monorepo pnpm + Turborepo

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-1

## Contexte

Le web, le mobile, l'API et le moteur partagent des types, des schémas et des tokens de charte. Deux personnes travaillent en parallèle et doivent pouvoir relire le code de l'autre.

## Options

1. **Monorepo pnpm + Turborepo** : un dépôt, des workspaces, des tâches mises en cache.
2. Plusieurs dépôts (web, mobile, API) : isolation forte, mais contrat partagé à publier et à synchroniser.
3. Monorepo sans orchestrateur : plus simple, mais pas de cache ni de tâches filtrées par package.

## Décision

Monorepo pnpm (`apps/*`, `packages/*`) orchestré par Turborepo, avec un graphe de dépendances à sens unique.

## Conséquences

- Un seul `pnpm install`, une seule CI, un seul tableau de suivi.
- Le code partagé vit dans `packages/` ; une app n'est jamais importée.
- La CI peut ne relancer que ce qui a changé.
