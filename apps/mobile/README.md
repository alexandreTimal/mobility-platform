# Application mobile

Application **Android** de la plateforme de mobilité, développée avec **Expo**. Elle couvre l'espace étudiant : catalogue, fiches, carte, vœux, résultat et explication.

> Ce dossier n'est pas encore initialisé. Ce README liste **ce qui est déjà fixé** pour tout le projet et **les choix qui restent à faire par Ethan**, responsable du mobile.

## Ce qui est déjà fixé

Ces règles viennent du sujet ou de l'[architecture commune](../../docs/technique/architecture.md). On n'y déroge pas sans en discuter à deux.

| Règle | Détail |
|---|---|
| Expo, Android uniquement | Pas de Mac dans l'équipe. Interdits par le sujet : PWA, Ionic/Capacitor, Cordova, WebView affichant le site |
| Même API que le web | L'app appelle uniquement `/api` (Next.js). Elle ne lit **jamais** la base Supabase directement |
| Contrat d'API partagé | Les types et schémas Zod viennent de `packages/shared`. Pas de type d'API redéfini à la main dans l'app |
| Authentification | Supabase Auth. Le jeton (JWT) est envoyé à `/api`, qui vérifie le rôle côté serveur |
| Synchronisation web/mobile | Le serveur est la seule source de vérité. Un vœu saisi sur mobile apparaît sur le web, et inversement. Les écritures se font en ligne uniquement |
| Campagne et résultats | L'app lit l'état de la campagne dans l'API (`open`, `closed`, `published`) et n'utilise jamais une date locale. Les explications s'affichent avec `formatExplanation` de `packages/shared` |
| Mention obligatoire | « Projet pédagogique : partenariats fictifs » visible sur chaque écran |
| Identité visuelle | Les couleurs, typographies et espacements viennent des tokens partagés de la charte. Pas de couleur codée en dur |
| Accessibilité | WCAG 2.2 AA : TalkBack, tailles de texte dynamiques, zones tactiles ≥ 48 dp, contrastes ≥ 4,5:1 |
| Tests | Tests de logique et d'interface, lancés par la commande de test commune du dépôt |
| CI/CD | Chaque PR lance le lint, les types, les tests mobiles et l'export du bundle Android. Chaque merge sur `main` produit un **APK installable en artefact** du pipeline |
| Secrets | Uniquement dans les secrets GitHub et un `.env` local (jamais commité) |

## Choix à faire

Pour chaque point : choisis, puis note ta décision dans un ADR (`docs/adr/`, à partir du numéro 0013, avec le modèle `0000-modele.md`) avec le contexte, les options, le choix et les conséquences. Les recommandations sont des suggestions, pas des obligations.

### 1. Build de l'APK en CI

| Option | Pour | Contre |
|---|---|---|
| **`expo prebuild` + Gradle dans GitHub Actions** *(suggéré)* | Illimité et gratuit sur un dépôt public, APK directement en artefact du pipeline | Build plus long (Android SDK à installer), signature à gérer (une clé de debug suffit pour la démo) |
| **EAS Build** (service Expo) | Simple à configurer, signature gérée | Quota gratuit mensuel limité, file d'attente lente : un build à chaque merge risque de l'épuiser |

### 2. Styles

| Option | Pour | Contre |
|---|---|---|
| **NativeWind v4** (stable) | Même syntaxe que le Tailwind du web | Repose sur Tailwind 3, alors que le web sera en Tailwind 4 |
| **NativeWind v5** | Tailwind 4 comme le web | Encore en version candidate (RC) à l'automne 2026 : vérifier son statut avant de l'adopter |
| **`StyleSheet` + tokens** | Natif, aucune dépendance | Pas de classes utilitaires, plus verbeux |

Quel que soit le choix, les valeurs viennent des tokens partagés.

### 3. Catalogue hors connexion

Le sujet exige de pouvoir **consulter le catalogue hors connexion**.

| Option | Pour | Contre |
|---|---|---|
| **Cache persistant TanStack Query** (AsyncStorage ou MMKV) *(suggéré)* | Simple, la même librairie gère aussi le mode en ligne | Lecture seule du dernier état téléchargé |
| **Base locale** (`expo-sqlite`) | Recherche et filtres hors connexion plus poussés | Schéma local à maintenir et à synchroniser |

Suggestion : catalogue lisible hors connexion, **saisie des vœux uniquement en ligne**, pour éviter les conflits de synchronisation.

### 4. Notification à la publication des résultats

| Option | Pour | Contre |
|---|---|---|
| **Push distant** : service Expo + FCM *(suggéré)* | Vraie notification envoyée par le serveur au moment de la publication | Projet Firebase (gratuit) à créer, partager et configurer ; ne fonctionne pas dans Expo Go (un build de développement est nécessaire) |
| **Notification locale** déclenchée par une vérification en arrière-plan | Aucun compte supplémentaire | Délai non garanti : Android limite les tâches en arrière-plan |

### 5. Autres choix laissés à Ethan

- **Navigation** : Expo Router (fourni par défaut) ou React Navigation.
- **Carte** : `react-native-maps` ou une alternative (MapLibre…). Les points doivent rester accessibles à TalkBack, avec une vue liste équivalente.
- **Stockage du jeton** : `expo-secure-store` est recommandé pour un jeton d'authentification.
- **Outils de test** : Jest + React Native Testing Library, ou équivalent.

## Prochaines étapes

1. Prendre les décisions ci-dessus et les consigner en ADR.
2. Initialiser l'app : issue #18.
3. Documenter ici le lancement sur émulateur Android (exigé par le sujet), pour qu'un nouvel arrivant puisse le faire en moins de 15 minutes.
