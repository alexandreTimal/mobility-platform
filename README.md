# Mobility Platform

> **Projet pédagogique : partenariats fictifs.**

Plateforme web et application mobile de répartition de 1 000 étudiants fictifs sur 100 universités partenaires réelles, avec un moteur de règles configurable.

🚧 Projet en cours de développement : le socle (monorepo, web, base locale) est en place, les fonctionnalités arrivent au fil des issues.

## Prérequis

| Outil | Version | Vérifier |
|---|---|---|
| [Node.js](https://nodejs.org/) | 24.3 ou plus récent (`.nvmrc` : `nvm install`) | `node -v` |
| [pnpm](https://pnpm.io/) | 12 (version exacte fixée par `packageManager`, sélectionnée automatiquement) | `pnpm -v` |
| [Docker](https://docs.docker.com/get-docker/) | démarré (Supabase local tourne dans Docker) | `docker info` |

Pour installer pnpm 12 : `npm install -g pnpm@12`, ou `corepack enable pnpm` avec Node ≥ 24.15 (les Corepack plus anciens ne savent pas lancer pnpm 12). Un pnpm 10 ou 11 global bascule bien sur la version du dépôt, mais Turborepo ne peut alors pas lancer les tâches : `pnpm bootstrap` le détecte et l'indique.

## Installation

```bash
git clone https://github.com/alexandreTimal/mobility-platform.git
cd mobility-platform
pnpm bootstrap
```

`pnpm bootstrap` (script [`scripts/bootstrap.sh`](scripts/bootstrap.sh)) :

1. vérifie Node, pnpm et Docker (et s'arrête avec un message clair sinon) ;
2. installe les dépendances ;
3. installe BMad (étape ignorée en CI ou avec `SKIP_BMAD=1`, utile pour un relecteur sans Claude Code : `SKIP_BMAD=1 pnpm bootstrap`) ;
4. crée `.env` depuis [`.env.example`](.env.example) s'il n'existe pas (un `.env` existant est conservé) ;
5. démarre Supabase en local et reporte ses URL et clés dans `.env` ;
6. applique les migrations et charge les données de démo.

Il est relançable sans risque. Le premier lancement télécharge les images Docker de Supabase (quelques minutes).

## Lancement

```bash
pnpm dev
```

- Plateforme web : <http://localhost:3000>
- Santé de l'API : <http://localhost:3000/api/v1/health> (`{"status":"ok"}`)
- Supabase Studio (base locale) : <http://127.0.0.1:54423>

Supabase local continue de tourner en arrière-plan : `pnpm db:stop` pour l'arrêter, `pnpm db:start` pour le relancer.

## Tests

```bash
pnpm test                                  # tous les tests du dépôt (Vitest, via Turborepo)
pnpm --filter @mobility/db test            # les tests d'un seul package
pnpm typecheck                             # vérification des types
pnpm build                                 # build de production du web
```

## Structure du dépôt

| Dossier | Contenu |
|---|---|
| `apps/web` | Next.js (App Router) : pages et API REST `/api/v1` |
| `apps/mobile` | Application Android (Expo), à initialiser ([README](apps/mobile/README.md)) |
| `packages/shared` | Contrat partagé : constantes, schémas Zod, types |
| `packages/db` | Schéma Drizzle, migrations, seed, client Postgres |
| `supabase/` | Configuration de la stack Supabase locale |
| `scripts/` | `bootstrap.sh`, `setup-bmad.sh`, `task.sh` |
| `docs/` | Documentation utilisateur et technique |

Commandes de base de données : `pnpm db:generate` (générer une migration depuis le schéma), `pnpm db:migrate` (l'appliquer), `pnpm db:seed` (données de démo).

## Architecture

La stack et les règles du projet sont dans [`docs/technique/architecture.md`](docs/technique/architecture.md) : monorepo pnpm + Turborepo, web et API en Next.js, mobile Expo (Android), Supabase (Postgres + Auth), Drizzle. Les justifications sont dans les [ADR](docs/adr/README.md).

## Outils IA (BMad) — obligatoire pour l'équipe

BMad est installé automatiquement par `pnpm bootstrap` (voir [Installation](#installation)). Pour le réinstaller ou le mettre à jour seul :

```bash
./scripts/setup-bmad.sh
```

Puis, dans Claude Code :

- `/mobility-help` : où en est le projet, où trouver quoi, quoi faire ensuite ;
- `/bmad-help` : quel skill BMad utiliser maintenant ;
- `/bmad-build #N` : développer une issue.

Détails et règles d'usage : [`docs/guide/bmad.md`](docs/guide/bmad.md).

## Gestion de projet

Le suivi se fait dans le [GitHub Project](../../projects) lié au dépôt : chaque tâche est une issue, chaque développement passe par une pull request reliée à son issue.

### Prendre une tâche et donner des nouvelles

Avant de commencer une tâche, on la prend avec `scripts/task.sh start <N>` : l'issue est assignée, passe en 🚧 En cours et sa branche est créée. Personne ne travaille ainsi en double. Ensuite, tout est libre : `scripts/task.sh who` (qui fait quoi), `note` (point d'étape), `block` / `unblock`, `release` (lâcher la tâche). Détails dans le [`CLAUDE.md`](CLAUDE.md#rituel-de-suivi-qui-fait-quoi).

### Automatisation du tableau

| Événement | Statut de l'issue | Géré par |
|---|---|---|
| Issue créée | 📋 Backlog | Workflows intégrés du Project |
| Premier push sur une branche `<type>/<N>-<slug>` | 🚧 En cours (+ le pousseur devient responsable si personne ne l'est) | Action [`Suivi du projet`](.github/workflows/project-sync.yml) |
| PR liée ouverte (`Closes #N`) | 👀 En revue | Workflows intégrés |
| PR mergée / issue fermée | ✅ Terminé | Workflows intégrés |
| PR fermée sans merge | 🎯 À faire | Action `Suivi du projet` |
| Issue réouverte | 🎯 À faire | Workflows intégrés |

L'Action vérifie aussi que chaque PR a un titre [Conventional Commits](https://www.conventionalcommits.org/fr/) et contient `Closes #N` (ou `Refs #N` si elle ne termine pas l'issue).

Elle a besoin du secret de dépôt `PROJECT_TOKEN` : un *personal access token (classic)* avec les scopes `repo` et `project` (le `GITHUB_TOKEN` par défaut ne peut pas modifier un Project utilisateur). Sans ce secret, la synchronisation est ignorée avec un avertissement.

## Contribuer

Voir [`CONTRIBUTING.md`](CONTRIBUTING.md) et le [code de conduite](CODE_OF_CONDUCT.md). Les évolutions sont consignées dans le [`CHANGELOG.md`](CHANGELOG.md).

## Licence

[MIT](LICENSE).

## À compléter

- Présentation et captures
- URL en ligne et badge CI (#6, #19)
- Déclaration d'usage de l'IA
