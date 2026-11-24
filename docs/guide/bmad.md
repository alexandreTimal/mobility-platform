# Travailler avec BMad

BMad est une méthode et un ensemble de skills pour Claude Code. **Il est obligatoire sur ce projet** (AD-14 de l'[architecture](../technique/architecture.md)) : toute l'équipe a ainsi les mêmes outils, dans les mêmes versions.

## Installation

```bash
pnpm bootstrap          # installe tout le projet, BMad compris
# ou seulement BMad :
./scripts/setup-bmad.sh
```

Le script installe la version figée de BMad (modules, outil `claude-code`, langue française). Relance-le après chaque mise à jour du script. `_bmad/` et `_bmad-output/` ne sont pas versionnés.

## En 30 secondes

| Je veux… | Commande dans Claude Code |
|---|---|
| Savoir où j'en suis, où est quoi, quoi faire | `/mobility-help` |
| Savoir quel skill BMad utiliser | `/bmad-help` |
| Développer une issue (code + tests + revue) | `/bmad-build #N` |
| Relire une PR ou un diff | `/bmad-code-review` |
| Préciser une fonctionnalité floue avant de coder | `/bmad-spec` |
| Changer une règle d'architecture | `/bmad-architecture` (mode mise à jour), puis un ADR |

## Les règles d'usage

1. **Un skill = un contexte neuf.** Tape `/clear` avant de lancer un nouveau skill.
2. **L'IA respecte l'architecture.** Les règles `AD-n` de `docs/technique/architecture.md` priment sur ses propositions.
3. **Tu restes responsable.** Tout ce que l'IA produit passe par une PR, des tests et la CI. Tu dois pouvoir l'expliquer en soutenance.
4. **Aucune donnée inventée.** Une donnée produite par l'IA (descriptif, coût de la vie, coordonnées…) est vérifiée et rattachée à une source réelle dans `data/`.
5. **Déclare l'usage.** Mets à jour la section « Usage de l'IA » du README quand tu utilises l'IA pour un nouveau type de tâche.
