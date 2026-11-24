# ADR-0005 — Authentification Supabase Auth, autorisation côté serveur

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-5

## Contexte

Le sujet impose des comptes étudiant et administrateur distincts, des mots de passe hachés, des sessions sécurisées et des permissions vérifiées côté serveur, sur le web comme sur le mobile.

## Options

1. **Supabase Auth** : hachage, sessions, JWT et SDK Expo fournis.
2. Auth maison (Better Auth, Auth.js) : plus de contrôle, plus de code à sécuriser.

## Décision

Supabase Auth. Le web utilise un cookie (`@supabase/ssr`), le mobile un jeton Bearer. Le serveur vérifie le jeton, lit le rôle dans `profiles` et applique un helper d'autorisation unique par route. L'inscription publique est désactivée.

## Conséquences

- Aucun mot de passe stocké par notre code.
- Forte dépendance à Supabase, acceptée pour un projet pédagogique.
- Protection CSRF par vérification de l'en-tête `Origin` sur les routes qui modifient des données, et en-têtes de sécurité centralisés.
