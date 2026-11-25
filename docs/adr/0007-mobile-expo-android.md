# ADR-0007 — Mobile en Expo, Android uniquement

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-2 à AD-5, AD-9, AD-11, AD-12

## Contexte

Le sujet impose une app native (pas de WebView, PWA ni Capacitor) sur une seule plateforme. L'équipe n'a pas de Mac. Ethan souhaite utiliser Expo.

## Options

1. **Expo (React Native), Android**.
2. Kotlin natif : pas de partage de code ni de types avec le web.
3. Flutter : nouveau langage (Dart), aucun partage avec le web.

## Décision

Expo pour Android, consommant uniquement `/api` et le contrat de `packages/shared`. Les choix internes (build de l'APK, styles, hors connexion, notifications, navigation, carte, tests) sont laissés à Ethan, qui les consigne dans des ADR à partir de 0013 (voir `apps/mobile/README.md`).

## Conséquences

- Types et schémas partagés avec le web.
- APK constructible dans GitHub Actions, sans Mac.
- iOS hors périmètre.
