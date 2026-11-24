---
name: mobility-help
description: Aide du projet Mobility pour ne jamais être perdu. Dit où en est le projet (issues, PR, branche), où se trouve quoi dans le dépôt, quelles commandes et quels outils sont disponibles, quelles règles s'appliquent et quoi faire ensuite. À utiliser quand un contributeur demande « je fais quoi ? », « où est… ? », « comment je lance / teste / ajoute… ? », « quelle commande ? », « c'est quoi la règle pour… ? », ou tape /mobility-help.
---

# Aide du projet Mobility

Tu aides un membre de l'équipe (ou un nouvel arrivant) à s'orienter dans le dépôt `mobility-platform`. Réponds en français, de façon courte et concrète, à partir de **ce que contient réellement le dépôt**. N'invente jamais une commande, un fichier, un script ou une règle : si tu ne le trouves pas, dis-le et propose où le documenter.

## Ce que l'utilisateur doit savoir en sortant

1. **Où il en est** : branche courante, changements en cours, issue liée, PR ouverte et son état (CI verte ou non).
2. **Quoi faire ensuite** : la prochaine action utile, avec la commande ou le skill exact.
3. **Où se trouve ce qu'il cherche** : chemin de fichier cliquable, commande, ou section de doc.
4. **Quelle règle s'applique** : l'`AD-n` de l'architecture ou la convention concernée, s'il y en a une.

Ne déverse pas tout le contenu : réponds à la question posée. Sans question précise, fais un point d'orientation (voir plus bas).

## Sources, dans cet ordre

- **Règles et structure** : `docs/technique/architecture.md` (règles AD-1…, conventions, structure, stack), `docs/adr/` (justifications).
- **Façon de travailler** : `CONTRIBUTING.md` (déroulé d'une contribution, branches, conventions) et `CLAUDE.md` (règles communes pour l'IA, rituel de suivi).
- **Docs et guides** : `docs/README.md` (sommaire), `docs/guide/` (dont `docs/guide/bmad.md`), `README.md`, `apps/*/README.md`.
- **Commandes disponibles** : champ `scripts` du `package.json` racine et de chaque `apps/*` et `packages/*`, `turbo.json`, `scripts/`. Ne cite que des scripts présents.
- **CI/CD** : `.github/workflows/`.
- **État du travail** :
  - `git status --short`, `git branch --show-current`, `git log --oneline -10`
  - `gh pr status`
  - `gh pr checks` (si une PR existe pour la branche)
  - `gh issue list --assignee @me --state open`
  - `scripts/task.sh who` (qui travaille sur quoi)
  - `gh issue view <N>` pour l'issue liée à la branche (le numéro est dans le nom de branche `<type>/<N>-<slug>`)
- **Outils IA** : skills disponibles dans `.claude/skills/` ; pour la méthode BMad, renvoie vers `/bmad-help` plutôt que de la réexpliquer.

Si `gh` n'est pas connecté, demande à l'utilisateur de lancer `! gh auth login` et continue avec ce que tu peux lire localement.

## Point d'orientation (sans question précise)

Présente en quelques lignes :

1. **Ta situation** : branche, issue, PR et état de la CI, fichiers modifiés non commités.
2. **Tes issues ouvertes**, la plus prioritaire en premier.
3. **La prochaine action** recommandée, par exemple :
   - pas de tâche en cours → choisir une issue, puis `scripts/task.sh start <N>` (assigne, passe en 🚧 En cours, crée la branche) ;
   - du code en cours → `pnpm test`, puis commit conventionnel ;
   - une PR rouge → lire `gh pr checks` et corriger ;
   - une issue à développer avec l'IA → `/bmad-build #N` dans un contexte neuf.
4. **Rappels utiles** : `pnpm bootstrap` (installer), `pnpm dev` (lancer), `pnpm test` (tester), seulement s'ils existent dans `package.json`.

## Si BMad n'est pas installé

Si `_bmad/` est absent, dis-le en premier : BMad est obligatoire sur ce projet (AD-14). Commande : `./scripts/setup-bmad.sh` (ou `pnpm bootstrap`).

## Garde-fous

- Ne modifie aucun fichier et ne lance aucune commande qui écrit (commit, push, merge, création d'issue) : tu orientes, tu ne fais pas à la place de l'utilisateur. Propose la commande et laisse-le la lancer, ou propose le skill adapté.
- Si une question révèle un manque dans la doc (commande non documentée, règle absente), signale-le et propose d'ouvrir une issue `docs:`.
- Si la réponse contredit `docs/technique/architecture.md`, c'est l'architecture qui fait foi. Une règle ne change que par une PR qui modifie ce document et ajoute un ADR.
