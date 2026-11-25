# ADR-0004 — Postgres Supabase et Drizzle, accès uniquement par l'API

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-4, AD-9, AD-12

## Contexte

Il faut une base relationnelle gratuite, accessible aux deux membres, avec un environnement local en une commande. Alexandre a déjà pratiqué Drizzle.

## Options

1. **Postgres Supabase + Drizzle**, accès réservé au serveur.
2. Postgres Supabase + Prisma : plus lourd en serverless.
3. Accès direct des clients via le SDK Supabase et RLS : écarté (ADR-0003).

## Décision

Postgres Supabase (offre Free), schéma et migrations Drizzle dans `packages/db`, seul point d'accès à la base. RLS est activé sans politique, en deuxième barrière. Un seul historique de migrations, appliqué par la CI.

## Conséquences

- Local : `supabase start` (Docker).
- Deux projets distants (`preview`, `prod`), soit le maximum de l'offre Free pour un propriétaire.
- Connexions par le pooler : mode session pour les migrations, mode transaction pour le runtime.
- Les projets Free se mettent en veille après une semaine d'inactivité : à surveiller avant les démos.
