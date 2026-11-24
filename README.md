# Mobility Platform

> **Projet pédagogique : partenariats fictifs.**

Plateforme web et application mobile de répartition de 1 000 étudiants fictifs sur 100 universités partenaires réelles, avec un moteur de règles configurable.

🚧 Projet en cours d'initialisation.

## Gestion de projet

Le suivi se fait dans le [GitHub Project](../../projects) lié au dépôt : chaque tâche est une issue, chaque développement passe par une pull request reliée à son issue.

### Automatisation du tableau

Le workflow [`Suivi du projet`](.github/workflows/project-sync.yml) met à jour le statut des issues dans le Project :

| Événement | Statut de l'issue |
|---|---|
| Premier push sur une branche `<type>/<N>-<slug>` | 🚧 En cours (et le pousseur devient responsable si personne ne l'est) |
| PR ouverte (`Closes #N`) | 👀 En revue — en brouillon : 🚧 En cours |
| PR mergée | ✅ Terminé |
| PR fermée sans merge | 🎯 À faire |

Il vérifie aussi que chaque PR a un titre [Conventional Commits](https://www.conventionalcommits.org/fr/) et contient `Closes #N`.

Il a besoin du secret de dépôt `PROJECT_TOKEN` : un *personal access token (classic)* avec les scopes `repo` et `project` (le `GITHUB_TOKEN` par défaut ne peut pas modifier un Project utilisateur). Sans ce secret, la synchronisation est ignorée avec un avertissement.

## Sommaire (à compléter)

- Présentation et captures
- Prérequis
- Installation et lancement
- Tests
- Documentation (`/docs`)
- Déclaration d'usage de l'IA
