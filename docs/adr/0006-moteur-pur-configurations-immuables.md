# ADR-0006 — Moteur pur, configurations immuables, rejeu par instantané

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-6, AD-7, AD-8, AD-15, AD-16

## Contexte

Le sujet exige des règles modifiables sans développeur, l'ajout d'un critère sans code, au moins deux algorithmes dont Gale-Shapley, un comparatif chiffré et un rejeu à l'identique.

## Options

1. **Cœur fonctionnel** : fonctions pures et déterministes, configuration en données, instantané de l'entrée.
2. Moteur qui lit la base au fil du calcul : plus direct, mais ni rejouable ni testable isolément.

## Décision

Le moteur est fait de fonctions pures (aucune I/O, aléa seedé). Éligibilité et score sont définis une seule fois. Les configurations sont des documents JSON versionnés et jamais modifiés. Chaque exécution stocke un instantané immuable de son entrée. Tous les algorithmes partagent la même interface et les mêmes métriques. La campagne suit un cycle `draft → open → closed → published` appliqué par le serveur.

## Conséquences

- Rejeu, tests de stabilité et mesures de performance triviaux.
- Le mode « et si » se résume à deux exécutions comparées.
- Les instantanés occupent de la place en base : quelques centaines de Ko par exécution, acceptable.
