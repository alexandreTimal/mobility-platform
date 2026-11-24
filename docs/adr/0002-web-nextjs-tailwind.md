# ADR-0002 — Web en Next.js et Tailwind CSS

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-3, AD-11

## Contexte

Le web porte l'espace étudiant, l'espace administration et l'API. Le mobile est en Expo (React Native). Alexandre maîtrise Next.js et Vue, et utilise Tailwind.

## Options

1. **Next.js (React, App Router) + Tailwind**.
2. Nuxt (Vue) + Tailwind : familier aussi, mais un second écosystème à côté de React Native.

## Décision

Next.js 16 (App Router, TypeScript) avec Tailwind CSS 4.

## Conséquences

- Même langage et même modèle de composants que le mobile : relecture croisée possible.
- Déploiement natif sur Vercel.
- `next lint` n'existe plus en Next 16 : le lint passe par Biome (ADR-0010).
