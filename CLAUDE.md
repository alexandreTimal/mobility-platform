# CLAUDE.md — Mobility Platform

Instructions partagées pour Claude Code (et tout assistant IA) sur ce dépôt. Ce fichier est **versionné et commun au groupe** : les préférences personnelles vont dans `CLAUDE.local.md` (ignoré par git).

> Statut : dépôt en cours d'initialisation, aucune stack choisie (issue #1). Mettre ce fichier à jour dès qu'une décision technique est prise (commandes, arborescence, conventions de code).

## 1. Le projet en bref

Projet PGE5 (groupe de 3, du 19/10/2026 à fin janvier 2027). On crée une **école d'ingénieurs fictive** qui répartit **1 000 étudiants fictifs** de 4e année sur **100 universités partenaires réelles** via un **moteur de règles configurable**.

Livrables : plateforme web + application mobile (même API), documentation utilisateur et technique, audit et déclaration d'accessibilité, dépôt propre avec CI/CD et GitHub Projects, mini charte graphique, jeu de données sourcé, déclaration d'usage de l'IA.

Le sujet complet est dans `Plateforme_mobilite_internationale_FR.pdf` (à la racine, **non versionné** : document de l'école, ne jamais le committer ni le publier).

## 2. Règles d'or (non négociables)

- **École fictive** : aucune référence à Epitech ou à une école existante (nom, logo, couleurs, vocabulaire interne). Ne pas écrire « Epitech » dans le code, les contenus, les captures ou la doc produit.
- **Universités réelles, partenariats fictifs** : la mention « Projet pédagogique : partenariats fictifs » est affichée sur la plateforme (web et mobile).
- **Aucune donnée personnelle réelle** : tous les étudiants sont générés.
- **Aucun contenu protégé** : pas de logo d'université. Photos uniquement sous licence libre (Wikimedia Commons, Unsplash…), avec auteur, licence et texte alternatif, jamais récupérées via un moteur de recherche ou le site d'une université.
- **Tout est sourcé** : chaque donnée réelle (descriptif, coût de la vie, coordonnées GPS…) indique sa source.
- **Données générées par IA** : toujours vérifiées et rattachées à une source réelle. Ne jamais présenter une donnée inventée comme réelle. En cas de doute, le signaler plutôt que d'inventer.

## 3. Périmètre fonctionnel

**Données**
- 100 destinations, au moins une par continent habité (Europe, Asie, Afrique, Amérique du Nord, Amérique du Sud, Océanie).
- Fiche université : identité (nom, ville, pays, GPS — réel), photos (réel, sous licence), descriptif (réel rédigé par nous), coût de la vie (estimation sourcée), conditions d'accès (places, GPA min, anglais min — fictif cohérent), infos pratiques (durée, période, frais — fictif cohérent). Une université sélective a peu de places et des seuils élevés.
- Générateur de 1 000 étudiants : GPA, TOEIC/IELTS, score de vie associative, 5 vœux ordonnés, distributions réalistes, **reproductible (seed)**, scénarios de tension (destinations surdemandées, cohorte faible en anglais…).

**Moteur de règles et affectation**
- Pondérations, seuils éliminatoires, bonus, règles de départage réglables par l'admin.
- Ajout d'un critère **sans modifier le code** (ex. projet personnel, absences).
- Configurations **versionnées** : une affectation doit pouvoir être rejouée à l'identique.
- Au moins 2 algorithmes, dont **Gale-Shapley** (mariage stable). Comparatif chiffré : % premiers vœux, % non-affectés, rang moyen, stabilité (absence de paire bloquante). Temps de calcul mesuré pour 1 000 étudiants.

**Interfaces**
- Espace étudiant : catalogue, fiches, saisie des vœux, résultat **avec explication** (pourquoi ce vœu et pas le précédent).
- Espace admin : règles, simulations, statistiques, mode « et si » (deux configurations côte à côte).
- Carte du monde interactive (un point par destination, clic → fiche) + **vue liste équivalente** (mêmes infos, mêmes filtres : continent, pays, langue, niveau d'anglais, coût de la vie).

**Application mobile**
- Une seule plateforme (iOS ou Android), native ou framework multiplateforme (React Native, Flutter, KMP…), choix justifié dans la doc.
- **Interdit** : PWA, Ionic/Capacitor, Cordova, WebView affichant le site.
- Périmètre : espace étudiant. Consomme la même API que le web, synchronisation web ↔ mobile des vœux.
- Catalogue consultable hors connexion, notification à la publication des résultats.

## 4. Exigences de qualité (comptent autant que les fonctionnalités)

**Accessibilité — WCAG 2.2 AA / RGAA**, à vérifier sur toute PR qui touche l'UI :
- Tout utilisable au clavier, ordre logique, focus toujours visible, points de la carte atteignables.
- HTML sémantique, titres hiérarchisés, libellés sur tous les champs, ARIA seulement si nécessaire.
- Contraste ≥ 4,5:1 pour le texte courant ; information jamais portée par la seule couleur.
- Texte alternatif pertinent ; images décoratives ignorées des lecteurs d'écran.
- Erreurs de formulaire explicites, liées au champ, avec suggestion de correction.
- Zoom 200 % et mobile sans perte de contenu ; respect de `prefers-reduced-motion`.
- Mobile : VoiceOver/TalkBack, tailles de texte dynamiques, zones tactiles ≥ 44 pt / 48 dp.

**Sécurité**
- Comptes étudiant et admin distincts, permissions **vérifiées côté serveur** : un étudiant ne voit ni ne modifie les données des autres.
- Mots de passe hachés, sessions sécurisées, Top 10 OWASP (injections, contrôle d'accès…).
- Données fictives traitées comme réelles. **Aucun secret** dans le code ni l'historique : `.env.example` documenté, secrets CI dans les secrets GitHub.

**Tests** (lancés en une seule commande)
- Minimum : moteur de règles, algorithmes (avec vérification automatique de la stabilité), reproductibilité du générateur.
- L'app mobile a ses propres tests (logique et interface).
- Toute nouvelle logique métier arrive avec ses tests.

**CI/CD**
- GitHub Actions à chaque PR : lint, tests web et mobile, build. Un pipeline rouge bloque le merge.
- Merge sur `main` → déploiement automatique du web + build mobile installable (APK / build simulateur) en artefact.
- Badge d'état dans le README.

**Nouvel arrivant** : avec le seul README, un dev extérieur lance la plateforme et les tests en **moins de 15 minutes** (installation en une commande, données de démo chargées automatiquement, procédure émulateur documentée).

## 5. Gestion de projet avec GitHub Projects

Le suivi est **évalué** : le tableau doit être tenu à jour du début à la fin et l'historique doit montrer qui a fait quoi, et quand.

- Dépôt : <https://github.com/alexandreTimal/mobility-platform>
- Tableau : <https://github.com/users/alexandreTimal/projects/3> (« Mobility Platform », public, lié au dépôt). Vues : **Kanban**, **Roadmap**, **Par personne**.
- Backlog initial : issues #1 à #38 tirées du sujet, déjà rangées par label, milestone, priorité et sprint. Il reste à leur attribuer un responsable.

### Règle de base

**Pas de travail sans issue, pas de merge sans PR.** Chaque tâche est une issue ; chaque développement passe par une PR reliée à son issue (`Closes #N`, ou `Refs #N` si elle ne termine pas l'issue). Pas de relecture obligatoire : **chaque membre est responsable de ses PR** et les merge lui-même une fois les checks verts.

### Champs du tableau

| Champ | Valeurs |
|---|---|
| **Status** | `📋 Backlog` → `🎯 À faire` → `🚧 En cours` → `👀 En revue` → `✅ Terminé` |
| **Priorité** | `P0 - Critique`, `P1 - Haute`, `P2 - Normale`, `P3 - Basse` |
| **Itération** | Sprints de 14 jours : Sprint 1 (23/11/2026), Sprint 2 (07/12), Sprint 3 (21/12), Sprint 4 (04/01/2027), Sprint 5 (18/01) |
| **Estimation (pts)** | Nombre (points de complexité) |
| **Assignees** | Un responsable par issue, obligatoire |
| **Milestone** | Voir ci-dessous |

### Milestones

| Milestone | Échéance | Contenu |
|---|---|---|
| M1 — Fondations | 06/12/2026 | Stack, init dépôt, fichiers indispensables, lint/CI, charte, données de base, auth |
| M2 — Follow-up (MVP) | 18/12/2026 | Catalogue, vœux, Gale-Shapley, API, init mobile, déploiement continu |
| M3 — Fonctionnalités complètes | 17/01/2027 | Moteur de règles, rejeu, 2e algo, admin, « et si », carte, mobile complet |
| M4 — Soutenance | 29/01/2027 | Audits a11y, documentation, README final, tags de version |

### Labels

- **Type** (un par issue) : `type: feature`, `type: bug`, `type: chore`, `type: docs`, `type: test`
- **Zone** (un ou plusieurs) : `area: web`, `area: mobile`, `area: api`, `area: engine`, `area: data`, `area: ci-cd`, `area: design`
- **Transverses** : `a11y`, `security`, `good first issue`, `help wanted`
- **Priorité** : à renseigner dans le champ **Priorité** du tableau (référence). Les labels `priority: high` / `priority: low` existent aussi : s'ils sont utilisés, ils doivent rester cohérents avec ce champ.

### Cycle de vie d'une issue

Le statut est **mis à jour automatiquement** : ne pas le déplacer à la main (sauf `📋 Backlog` → `🎯 À faire` lors de la planification).

| Événement | Statut | Mécanisme |
|---|---|---|
| Issue ou PR ouverte dans le dépôt | ajoutée au tableau en `📋 Backlog` | workflows intégrés du tableau |
| Premier push sur `<type>/<N>-<slug>` | issue N en `🚧 En cours` (depuis Backlog ou À faire), le pousseur devient responsable si l'issue n'en a pas | Action « Suivi du projet » |
| PR liée à l'issue | `👀 En revue` | workflow intégré |
| PR mergée / issue fermée | `✅ Terminé` | workflows intégrés |
| PR fermée sans merge | issues liées en `🎯 À faire` (depuis En cours ou En revue) | Action « Suivi du projet » |
| Issue rouverte | `🎯 À faire` | workflow intégré |
| Issue passée à `✅ Terminé` dans le tableau | l'issue est fermée | workflow intégré |

L'Action vérifie aussi les conventions de PR (check « Conventions de PR ») : titre en Conventional Commits et corps contenant `Closes #N` ou `Refs #N`.

Déroulé :

1. Créer l'issue avec un modèle (`.github/ISSUE_TEMPLATE/` : Fonctionnalité, Bug, Tâche ; les issues vierges sont désactivées). Titre en Conventional Commits : `feat(web): …`, `fix(api): …`, `docs: …`.
2. Renseigner : labels type + zone, milestone, priorité, itération, estimation (responsable si déjà connu).
3. Créer la branche depuis `main` **avec le numéro d'issue** (`feat/15-catalogue-web`) et pousser : l'issue passe en cours. Sans numéro dans le nom de branche, rien n'est synchronisé.
4. Ouvrir la PR avec `Closes #N` (ou `Refs #N`) : l'issue passe en revue.
5. Une fois les checks verts, l'auteur merge (squash) : l'issue se ferme et passe en terminé.

Commandes utiles (`gh`) :

```bash
gh issue create -R alexandreTimal/mobility-platform --template feature.yml
gh issue edit <N> --add-assignee @me --add-label "area: web" --milestone "M2 — Follow-up (MVP)"
gh project item-add 3 --owner alexandreTimal --url <url-issue>
gh pr create --fill   # puis vérifier que le corps contient "Closes #N" ou "Refs #N"
```

### Ce que Claude doit faire

- Avant de coder : identifier l'issue concernée (ou proposer d'en créer une) et rappeler son numéro.
- Nommer la branche `<type>/<N>-<slug>` avec le numéro d'issue, le commit et la PR selon les conventions ci-dessous, avec `Closes #N` (ou `Refs #N` si la PR ne termine pas l'issue) dans la PR.
- Ne pas déplacer le statut des issues à la main : les automatismes s'en chargent.
- Ne jamais pousser directement sur `main`. Ne merger une PR, ni modifier le tableau, les labels ou les milestones, que sur demande explicite.
- Remplir la checklist du modèle de PR (`.github/pull_request_template.md`) honnêtement.

## 6. Git : branches, commits, PR

> La stratégie détaillée sera écrite dans `CONTRIBUTING.md` (issue #5). En attendant :

Stratégie : **GitHub Flow**.

- `main` : branche principale, toujours déployable, **protégée** : PR obligatoire (sans approbation requise), conversations résolues obligatoires, ni force-push ni suppression. Les checks CI deviendront obligatoires dès que le pipeline existera (issue #6).
- Merge en **squash uniquement** ; la branche est supprimée après merge. Le titre de la PR devient le message de commit sur `main` : il doit donc respecter Conventional Commits.
- Branches courtes depuis `main` : `<type>/<N>-<slug>`, ex. `feat/15-catalogue-web`, `fix/42-focus-carte`, `docs/8-modele-donnees`.
- Commits **Conventional Commits** : `feat(engine): ajoute le départage par GPA`, `fix(web): …`, `docs: …`, `test: …`, `chore: …`, `ci: …`. Messages en français, au présent.
- Une PR = une issue, petite et lisible, avec `Closes #N` (ou `Refs #N`). L'auteur la merge lui-même une fois les checks verts.
- Tags semver à chaque milestone (`v0.1.0` = M1, `v0.2.0` = M2…), avec `CHANGELOG.md` à jour.

## 7. Fichiers indispensables (à maintenir)

`README.md` (présentation, captures, prérequis, installation, lancement, tests, liens doc, URL en ligne, badge CI, **déclaration d'usage de l'IA**), `CONTRIBUTING.md`, `LICENSE`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `.env.example`, `.github/` (modèles d'issue et de PR, workflows), `.gitignore`, lockfiles des dépendances.

Pas de code mort ni de fichiers orphelins. Linter et formateur appliqués automatiquement (pre-commit ou CI, issue #4).

## 8. Documentation

Versionnée dans `/docs` en Markdown, **en français partout**, écrite au fil de l'eau (une fonctionnalité n'est pas terminée tant que sa doc n'est pas à jour).

- **Utilisateur** (non technique) : étudiant (catalogue, carte, vœux, résultat, web et mobile), admin (règles, ajout de critère, simulations, rejeu, stats), guide illustré, FAQ, glossaire, fonctionnalités d'accessibilité.
- **Technique** : architecture et choix de stack, ADR (`docs/adr/` : contexte, options, choix, conséquences), modèle de données, format du moteur de règles et ajout d'un critère, algorithmes (principe, complexité, comparatif), API (OpenAPI), collecte des données et licences des photos, architecture mobile et hors connexion, exploitation (CI/CD, déploiement, audit a11y).

Toute décision technique structurante → un ADR.

## 9. Usage de l'IA (charte IONIS)

- **Transparence** : tout usage significatif (code, tests, doc, textes des fiches, recherche de données) est déclaré dans la section dédiée du README.
- **Même exigence** : le code généré passe par les tests, la revue en PR et les mêmes règles de propreté.
- **Responsabilité** : chaque membre doit pouvoir expliquer n'importe quelle partie du code en soutenance. Claude explique ses choix et évite le code qu'on ne saurait pas défendre.
- **Vérification** : aucune donnée réelle sans source vérifiable.

## 10. Outillage local

`_bmad/`, `_bmad-output/`, `.bmad-loop/` et `.claude/` sont de l'outillage personnel (BMAD, Claude Code) **non versionné**. Ne pas y référencer de chemins dans le code ou la doc du projet, et ne pas les committer.

## 11. Commandes du projet

_À compléter dès l'initialisation du dépôt applicatif (issue #2)_ : installation en une commande, lancement web/API/mobile, tests (tous / un seul), lint, build.
