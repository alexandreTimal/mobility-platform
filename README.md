# Mobility Platform

> **Projet pédagogique : partenariats fictifs.**

Plateforme web et application mobile de répartition de 1 000 étudiants fictifs sur 100 universités partenaires réelles, avec un moteur de règles configurable.

🚧 Projet en cours d'initialisation.

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

## Architecture

La stack et les règles du projet sont dans [`docs/technique/architecture.md`](docs/technique/architecture.md) : monorepo pnpm + Turborepo, web et API en Next.js, mobile Expo (Android), Supabase (Postgres + Auth), Drizzle. Les justifications sont dans les [ADR](docs/adr/README.md).

## Outils IA (BMad) — obligatoire pour l'équipe

```bash
./scripts/setup-bmad.sh   # bientôt inclus dans `pnpm bootstrap`
```

Puis, dans Claude Code :

- `/mobility-help` : où en est le projet, où trouver quoi, quoi faire ensuite ;
- `/bmad-help` : quel skill BMad utiliser maintenant ;
- `/bmad-build #N` : développer une issue.

Détails et règles d'usage : [`docs/guide/bmad.md`](docs/guide/bmad.md).

## Contribuer

Voir [`CONTRIBUTING.md`](CONTRIBUTING.md) et le [code de conduite](CODE_OF_CONDUCT.md). Les évolutions sont consignées dans le [`CHANGELOG.md`](CHANGELOG.md).

## Licence

[MIT](LICENSE).

## Sommaire (à compléter)

- Présentation et captures
- Prérequis
- Installation et lancement
- Tests
- Documentation (`/docs`)
- Déclaration d'usage de l'IA
