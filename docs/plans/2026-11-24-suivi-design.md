# Rituel de suivi des tâches — conception

Date : 24/11/2026 · Issue : #45

## Objectif

Savoir à tout moment **qui travaille sur quoi**, pour ne jamais faire une tâche en double, tout en laissant chaque membre **très libre** de son organisation. Le suivi doit rester propre (tableau à jour, historique lisible) sans devenir une corvée.

## Principe

Chaque membre travaille avec Claude Code. C'est donc **Claude qui applique le rituel**, guidé par le `CLAUDE.md`, avec une commande unique `scripts/task.sh`. Les automatismes existants (workflows du tableau et Action « Suivi du projet ») restent le filet de sécurité.

Une seule règle est obligatoire : **signaler qu'on prend une tâche avant de commencer**. Tout le reste est libre.

## Le rituel

| Moment | Commande | Effet | Obligatoire ? |
|---|---|---|---|
| Voir qui fait quoi | `scripts/task.sh who` | Liste des issues en cours ou en revue, avec leur responsable | — |
| Prendre une tâche | `scripts/task.sh start <N>` | Vérifie que personne d'autre ne l'a prise, assigne, passe en `🚧 En cours`, crée et pousse la branche `<type>/<N>-<slug>`, commente « ▶️ Démarré » | **Oui** |
| Donner des nouvelles | `scripts/task.sh note <N> "<texte>"` | Commentaire « 🔄 Point d'étape » sur l'issue | Libre |
| Signaler un blocage | `scripts/task.sh block <N> "<raison>"` | Label `bloqué` + commentaire | Recommandé |
| Lever un blocage | `scripts/task.sh unblock <N>` | Retire le label `bloqué` + commentaire | — |
| Lâcher une tâche | `scripts/task.sh release <N> ["<raison>"]` | Retour en `🎯 À faire`, responsable retiré, commentaire | Recommandé |
| Terminer | PR avec `Closes #N` | En revue puis Terminé (déjà automatique) | — |

Le suivi au fil de l'eau vient aussi gratuitement :

- les **cases à cocher** de l'issue, cochées quand une étape est faite ;
- les **commits qui mentionnent `#N`**, que GitHub affiche dans l'historique de l'issue.

## Ce qui est volontairement libre

- Pas de limite au nombre de tâches en cours par personne.
- Pas de délai d'inactivité ni de relance.
- Pas de rythme imposé pour les points d'étape : on en poste quand c'est utile à l'autre (changement de cap, étape importante, fin de session longue).
- Une issue **assignée mais pas démarrée** est un plan, pas une réservation : on peut en parler et l'échanger.

## Garde-fou anti-doublon

`start` refuse de prendre une issue qui est déjà `🚧 En cours` ou `👀 En revue` avec un **autre** responsable, et indique qui l'a. Pour passer outre (après en avoir parlé), `--force`.

## Détails techniques

- Script Bash, dépendances : `gh` (authentifié avec le scope `project`), `jq`, `git`.
- Même logique GraphQL que `.github/scripts/project-sync.sh` (Project utilisateur n°3, champ `Status`, libellés comparés sur leur fin à cause des emojis).
- Type de branche déduit du préfixe Conventional Commits du titre (`feat(web): …` → `feat`), sinon `chore`. Slug tiré du titre, sans accents, 40 caractères maximum.
- La branche est poussée depuis `origin/main` ; on bascule dessus seulement si le dossier de travail est propre, sinon le script indique la commande à lancer.
- `DRY_RUN=1` affiche les actions sans rien modifier.
