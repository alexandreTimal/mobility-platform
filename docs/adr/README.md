# Journal des décisions d'architecture (ADR)

Chaque décision structurante a son ADR : contexte, options, choix, conséquences. Les règles qui en découlent sont dans l'[architecture](../technique/architecture.md).

Pour ajouter une décision : copier [`0000-modele.md`](0000-modele.md) sous le numéro suivant, puis l'ajouter à ce tableau dans la même PR. Un ADR accepté ne se modifie pas : on le remplace par un nouveau.

| N° | Décision | Règles | Statut |
|---|---|---|---|
| [0001](0001-monorepo-pnpm-turborepo.md) | Monorepo pnpm + Turborepo | AD-1 | accepté |
| [0002](0002-web-nextjs-tailwind.md) | Web en Next.js et Tailwind CSS | AD-3, AD-11 | accepté |
| [0003](0003-api-route-handlers-next.md) | API servie par les route handlers Next.js | AD-2, AD-3 | accepté |
| [0004](0004-donnees-supabase-drizzle.md) | Postgres Supabase et Drizzle, accès uniquement par l'API | AD-4, AD-9, AD-12 | accepté |
| [0005](0005-authentification-supabase-auth.md) | Authentification Supabase Auth, autorisation côté serveur | AD-5 | accepté |
| [0006](0006-moteur-pur-configurations-immuables.md) | Moteur pur, configurations immuables, rejeu par instantané | AD-6, AD-7, AD-8, AD-15, AD-16 | accepté |
| [0007](0007-mobile-expo-android.md) | Mobile en Expo, Android uniquement | AD-2 à AD-5, AD-9, AD-11, AD-12 | accepté |
| [0008](0008-hebergement-comptes-partages.md) | Hébergement gratuit et comptes partagés à deux | AD-12 | accepté |
| [0009](0009-flux-git-pr-relecture.md) | Flux Git, pull requests et relecture | AD-12 | accepté |
| [0010](0010-outillage-qualite.md) | Outillage qualité du dépôt | AD-13, conventions | accepté |
| [0011](0011-tests-ci-cd.md) | Stratégie de tests et pipeline CI/CD | AD-11, AD-12, AD-13 | accepté |
| [0012](0012-bmad-obligatoire-aide-projet.md) | BMad obligatoire et commande d'aide du projet | AD-14 | accepté |
