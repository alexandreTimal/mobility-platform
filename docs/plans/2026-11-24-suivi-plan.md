# Rituel de suivi — plan de mise en œuvre

Conception : `docs/plans/2026-11-24-suivi-design.md` · Issue : #45

**Objectif :** outiller le rituel de suivi (prendre une tâche, points d'étape, blocages, libération) et l'inscrire dans le `CLAUDE.md`.

**Architecture :** un script Bash `scripts/task.sh` qui réutilise l'API GraphQL du Project (comme `.github/scripts/project-sync.sh`) ; le `CLAUDE.md` indique à Claude quand l'appeler.

**Outils :** Bash, `gh`, `jq`, `git`.

## Tâches

1. **Label `bloqué`** : `gh label create "bloqué"`.
2. **Script `scripts/task.sh`** : `who`, `start [--force]`, `note`, `block`, `unblock`, `release` ; `DRY_RUN=1`.
   Vérifications : `scripts/task.sh help` ; `scripts/task.sh who` ; `DRY_RUN=1 scripts/task.sh start 16` (aucune modification) ; `scripts/task.sh start 999` → « introuvable », code 1 ; noms de branche sur des titres avec accents, scope et type `a11y`.
3. **Action « Suivi du projet »** : accepter les types de branche avec chiffres (`a11y/31-…`) dans `.github/scripts/project-sync.sh`.
4. **`CLAUDE.md`** : section « Rituel de suivi », mise à jour de « Ce que Claude doit faire » et du déroulé.
5. **Essai réel** sur l'issue #45 elle-même : `start 45` (branche existante réutilisée), `note 45 …`, puis PR `Closes #45`.
