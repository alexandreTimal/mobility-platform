# ADR-0008 — Hébergement gratuit et comptes partagés à deux

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-12

## Contexte

Tout doit être gratuit, et les deux membres doivent pouvoir travailler sans dépendre l'un de l'autre. L'offre Vercel Hobby n'autorise aucun membre d'équipe ; l'offre Supabase Free autorise des membres d'organisation.

## Options

1. **Compte Vercel dédié au projet, piloté par la CI** ; organisation Supabase dédiée avec deux membres nominatifs.
2. Vercel Pro : collaboration native, mais payant au-delà de 14 jours d'essai.
3. Compte personnel d'Alexandre : Ethan dépendrait de lui pour chaque action.

## Décision

Compte Vercel dédié dont personne ne se sert au quotidien : les déploiements passent par GitHub Actions et la CLI Vercel (jeton dans les secrets GitHub), et les URL de preview sont publiées sur la PR. Les identifiants sont dans un gestionnaire de mots de passe partagé. Organisation Supabase dédiée : Alexandre propriétaire, Ethan Developer.

## Conséquences

- L'historique reste nominatif côté GitHub.
- Le dépôt doit rester public : l'offre Hobby bloque le déploiement de commits d'autres auteurs sur un dépôt privé.
- Repli si le déploiement d'un commit d'Ethan est bloqué : `vercel deploy --prebuilt` depuis un dossier sans `.git`.
