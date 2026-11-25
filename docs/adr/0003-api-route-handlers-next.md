# ADR-0003 — API servie par les route handlers Next.js

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-2, AD-3

## Contexte

L'application mobile doit consommer la même API que le web. Une affectation de 1000 étudiants sur 100 destinations se calcule en quelques millisecondes.

## Options

1. **A. Route handlers Next.js**, déployés avec le web.
2. B. API séparée (Hono, Fastify) sur un hébergeur gratuit : second déploiement, mise en veille des offres gratuites.
3. C. Accès direct des clients à Supabase (RLS) : logique de permissions dispersée, moteur à exécuter côté serveur malgré tout.

## Décision

Option A. La logique métier vit dans des packages sans dépendance à Next ; les routes ne font qu'authentifier, valider, appeler un cas d'usage et sérialiser. Le contrat est défini en Zod dans `packages/shared`, et l'OpenAPI en est généré.

## Conséquences

- Un seul déploiement gratuit.
- Extraire l'API dans un service à part resterait un déplacement, pas une réécriture.
- Le générateur OpenAPI exact est choisi dans #14.
