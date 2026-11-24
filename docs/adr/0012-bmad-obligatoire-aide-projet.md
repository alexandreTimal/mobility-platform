# ADR-0012 — BMad obligatoire et commande d'aide du projet

- **Statut :** accepté
- **Date :** 2026-11-25
- **Règles concernées :** AD-14

## Contexte

L'usage de l'IA est autorisé, encadré et déclaré. Deux membres utilisent Claude Code : sans outillage commun, chacun aurait des skills et des versions différents.

## Options

1. **BMad figé et installé par script**, plus un skill de projet versionné `/mobility-help`.
2. BMad libre, chacun l'installe comme il veut.
3. Versionner `_bmad/` dans le dépôt : lourd et généré.

## Décision

`scripts/setup-bmad.sh` installe BMad 6.12.2 (modules bmm, tea, cis, outil `claude-code`, français). Il est appelé par `pnpm bootstrap`, et ignoré en CI ou avec `SKIP_BMAD=1`. Le skill `.claude/skills/mobility-help` est versionné : il oriente dans le dépôt à partir des docs, de l'état du dépôt et des issues.

## Conséquences

- Mêmes skills et mêmes versions pour toute l'équipe.
- Un relecteur extérieur peut ignorer BMad et rester sous les 15 minutes.
- Monter de version de BMad = une PR sur le script.
