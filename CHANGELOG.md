# Journal des modifications

Toutes les évolutions notables du projet sont consignées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/). Un tag est posé à chaque milestone : `v0.1.0` (M1 — Fondations), `v0.2.0` (M2 — Follow-up), `v0.3.0` (M3 — Fonctionnalités complètes), `v1.0.0` (M4 — Soutenance).

## [Non publié]

### Ajouté

- Dépôt initialisé : README, modèles d'issue et de pull request.
- Synchronisation automatique du tableau GitHub Projects et vérification des conventions de PR (Action « Suivi du projet »).
- `CLAUDE.md` commun au groupe.
- Rituel de suivi des tâches (`scripts/task.sh`).
- `CONTRIBUTING.md`, `LICENSE` (MIT), `CODE_OF_CONDUCT.md` et ce journal.
- Les 100 universités partenaires et leurs données d'identité sourcées (`data/raw`), avec leur validation (`packages/db`) et la méthode de collecte (`docs/donnees`).
- Lint et format avec Biome (`pnpm lint`, `pnpm format`), hooks git Lefthook : Biome avant chaque commit, commitlint (Conventional Commits, scopes du projet) sur chaque message.
