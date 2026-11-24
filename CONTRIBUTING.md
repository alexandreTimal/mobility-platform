# Contribuer à Mobility Platform

Merci de contribuer ! Ce guide décrit comment on travaille sur le dépôt. Les règles détaillées pour les assistants IA sont dans [`CLAUDE.md`](CLAUDE.md), qui suit les mêmes conventions.

## Prérequis

- `git`, [`gh`](https://cli.github.com/) authentifié (`gh auth login`, puis `gh auth refresh -s project` pour le tableau) et `jq`.
- Les commandes d'installation et de lancement de l'application seront ajoutées ici dès l'initialisation du dépôt applicatif (issue #2).

## Déroulé d'une contribution

1. **Une issue par tâche.** Pas de travail sans issue. Créer l'issue avec un modèle (Fonctionnalité, Bug, Tâche) et un titre en Conventional Commits (`feat(web): …`), puis renseigner labels, milestone, priorité et itération.
2. **Prendre la tâche avant de commencer** :

   ```bash
   scripts/task.sh who         # qui travaille sur quoi
   scripts/task.sh start <N>   # assigne, passe en 🚧 En cours, crée la branche
   ```

   Si la tâche est déjà en cours chez quelqu'un d'autre, le script refuse : on en parle d'abord.
3. **Travailler sur la branche** `<type>/<N>-<slug>`, avec des commits en Conventional Commits qui mentionnent `#N`. Cocher les cases de l'issue au fur et à mesure.
4. **Donner des nouvelles quand c'est utile** (rien n'est imposé) :

   ```bash
   scripts/task.sh note <N> "Fait : … / Suite : …"
   scripts/task.sh block <N> "attend l'API #14"     # puis unblock <N>
   scripts/task.sh release <N> "raison"              # lâcher la tâche
   ```

5. **Ouvrir une pull request** vers `main`, avec le modèle de PR, `Closes #N` dans la description (ou `Refs #N` si la PR ne termine pas l'issue) et la checklist remplie honnêtement.
6. **Merger soi-même** une fois les checks verts (squash). L'issue se ferme et passe en ✅ Terminé.

Le statut des issues sur le tableau suit tout seul (voir le [README](README.md#automatisation-du-tableau)) : pas besoin de déplacer les cartes à la main.

## Stratégie de branches : GitHub Flow

- `main` est la branche principale, **toujours déployable**. On ne pousse jamais directement dessus.
- Chaque tâche a sa **branche courte** créée depuis `main` : `<type>/<N>-<slug>`, par exemple `feat/15-catalogue-web`, `fix/42-focus-carte`, `docs/8-modele-donnees`. Le numéro d'issue dans le nom est obligatoire : c'est lui qui relie la branche au tableau.
- Une branche = une issue = une PR, petite et lisible.
- Merge en **squash uniquement** : le titre de la PR devient le message du commit sur `main`. La branche est supprimée automatiquement après le merge.
- Un tag de version sémantique est posé à chaque milestone (`v0.1.0` = M1, `v0.2.0` = M2…), avec le [`CHANGELOG.md`](CHANGELOG.md) à jour.

### Protection de `main`

| Règle | Réglage |
|---|---|
| Pull request obligatoire | Oui |
| Relecture obligatoire | Non : **chaque membre est responsable de ses PR** (décision d'équipe) |
| Conversations résolues avant merge | Oui |
| Force-push et suppression de la branche | Interdits |
| Checks obligatoires | « Conventions de PR » dès maintenant ; lint, tests et build dès que le pipeline existe (issue #6) |

Une relecture reste la bienvenue : on peut demander l'avis de l'autre sur une PR sensible.

## Conventions

**Commits et titres de PR** : [Conventional Commits](https://www.conventionalcommits.org/fr/), en français, au présent.

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `test` | Tests |
| `refactor` | Restructuration sans changement de comportement |
| `style` | Mise en forme |
| `perf` | Performance |
| `build`, `ci` | Dépendances, pipeline |
| `chore` | Maintenance |

Scope facultatif entre parenthèses : `web`, `mobile`, `api`, `engine`, `data`… Exemple : `feat(engine): ajoute le départage par GPA`.

Le check **« Conventions de PR »** vérifie le titre et la présence de `Closes #N` / `Refs #N`.

**Documentation** : en français, dans `/docs`, écrite au fil de l'eau. Une fonctionnalité n'est pas terminée tant que sa doc n'est pas à jour. Toute décision technique structurante fait l'objet d'un ADR dans `docs/adr/`.

**Qualité** : toute nouvelle logique métier arrive avec ses tests ; toute PR qui touche l'interface respecte les critères d'accessibilité (WCAG 2.2 AA) ; aucun secret dans le code ni l'historique.

## Usage de l'IA

L'usage d'assistants IA est autorisé et **déclaré** dans la section dédiée du README. Le code généré passe par les mêmes tests et les mêmes règles que le reste, et chaque membre doit pouvoir l'expliquer. Aucune donnée présentée comme réelle sans source vérifiable.

## Code de conduite

En participant, vous acceptez le [code de conduite](CODE_OF_CONDUCT.md).
