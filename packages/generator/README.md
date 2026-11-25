# Générateur d'étudiants fictifs (`@mobility/generator`)

Ce package génère la cohorte de 4e année de l'école fictive : 1 000 étudiants par défaut, chacun avec un GPA, un score d'anglais (TOEIC ou IELTS), un score de vie associative et 5 vœux ordonnés. Voir l'issue #10.

- **Tout est inventé.** Les noms viennent d'une liste de prénoms et de noms courants combinés au hasard, et les adresses utilisent le domaine réservé `.example`. Aucune donnée personnelle réelle n'est utilisée.
- **Le résultat est reproductible.** Avec la même graine, le même scénario, la même version du générateur et la même liste d'universités, on obtient un fichier identique à l'octet près, sur toute plateforme.
- **Le cœur est pur** ([AD-6](../../docs/technique/architecture.md)) : `src/` ne fait aucune I/O, ne lit ni l'horloge ni l'environnement, et n'utilise pas `Math.random`. Seul `src/cli.ts` lit et écrit des fichiers. Un test (`purity.test.ts`) le vérifie.
- **Aucune dépendance** à l'exécution. Il est destiné à être importé par le seed de `packages/db`.

## Utilisation

Depuis la racine du dépôt :

```bash
# 1 000 étudiants, graine 42, scénario de référence
pnpm data:students --universities data/raw --seed 42 --out students.json

# Scénario de tension
pnpm data:students --scenario destinations-surdemandees --out students.json

# Aide
pnpm data:students --help
```

| Option | Défaut | Rôle |
|---|---|---|
| `--universities` | `data/raw` | Un fichier JSON (tableau d'universités) ou un dossier dont tous les `*.json` sont lus |
| `--seed` | `42` | Graine aléatoire (entier) |
| `--scenario` | `reference` | `reference`, `destinations-surdemandees` ou `cohorte-faible-anglais` |
| `--count` | `1000` | Nombre d'étudiants |
| `--out` | sortie standard | Fichier de sortie |

Les chemins relatifs sont résolus depuis le dossier où la commande est lancée. En cas d'erreur (option invalide, fichier introuvable, université mal formée), un message en français est affiché et la commande sort avec le code 2.

Le générateur ne lit que les champs `id`, `continent` et `ranking.rank` des universités. Il les trie par `id` : l'ordre des fichiers ne change donc pas le résultat.

Depuis du code TypeScript :

```ts
import { generate, normalizeUniversities, serializeDataset } from '@mobility/generator';

const universities = normalizeUniversities(rawUniversities); // valide, réduit, trie par id
const dataset = generate(universities, 42, 'reference'); // { meta, students }
const text = serializeDataset(dataset); // JSON canonique, identique à l'octet près
```

Génération de 1 000 étudiants sur 100 universités : environ 25 ms (cœur seul), environ 0,25 s pour la commande complète.

## Tests

```bash
pnpm --filter @mobility/generator test
```

Les tests utilisent 30 universités synthétiques, et non le vrai jeu de données qui évolue encore. Ils vérifient :

- la reproductibilité : même graine, même sortie, et des graines différentes donnent des sorties différentes ;
- une **empreinte figée** (SHA-256) de la sortie ;
- le format : identifiants uniques, 5 vœux distincts et valides, plages de valeurs ;
- les distributions et l'effet des scénarios ;
- la validation des entrées et la ligne de commande ;
- les briques de base (générateur pseudo-aléatoire, SHA-256 comparé à `node:crypto`, JSON canonique) et la pureté du cœur.

Si le test d'empreinte échoue, c'est que la génération a changé. Vérifier que c'est voulu, puis incrémenter `GENERATOR_VERSION` (`src/generate.ts`) et mettre à jour `GOLDEN_SHA256` (`src/generate.test.ts`) : une graine ne doit jamais produire en silence deux cohortes différentes.

## Format de sortie

```json
{
  "meta": {
    "fictional": true,
    "generator_version": "2.0.0",
    "seed": 42,
    "scenario": "reference",
    "params": { "...": "paramètres complets utilisés" },
    "universities_count": 100,
    "universities_sha256": "empreinte de la liste d'universités utilisée"
  },
  "students": [
    {
      "id": "etu-0001",
      "first_name": "Léa",
      "last_name": "Martin",
      "email": "etu-0001@etudiants.example",
      "gpa": 3.12,
      "english": { "test": "TOEIC", "score": 815 },
      "associative_score": 37,
      "wishes": ["eth-zurich", "tu-delft", "kth", "nus", "unsw-sydney"]
    }
  ]
}
```

Le bloc `meta` contient tout ce qu'il faut pour rejouer la génération. `universities_sha256` est l'empreinte SHA-256 de la liste `{ id, continent, rank }` triée, en JSON canonique compact : elle permet de vérifier que la liste d'universités est bien la même.

Le fichier est du **JSON canonique** : clés triées, indentation de 2 espaces, saut de ligne final. Les nombres suivent le format de JavaScript (`4` et non `4.0`).

## Reproductibilité

- **Générateur pseudo-aléatoire : sfc32** (« Small Fast Counting », Chris Doty-Humphrey, issu de la suite de tests PractRand), écrit en entier dans `src/random.ts`. Il est initialisé à partir de la graine comme dans PractRand (a = 0, b = 32 bits de poids faible, c = 32 bits de poids fort, compteur = 1, puis 12 tirages jetés). Chaque nombre uniforme utilise deux tirages de 32 bits pour obtenir 53 bits de précision.
- Les lois (normale par Box-Muller, Gumbel, gamma par Marsaglia-Tsang, bêta) sont calculées à partir de ces uniformes, sans bibliothèque.
- L'empreinte SHA-256 est calculée en TypeScript pur (`src/sha256.ts`), pour que le cœur ne dépende pas de `node:crypto`.
- Les arrondis sont faits « au pair » en cas d'égalité, comme dans la première version.

**Version 2.0.0.** La version 1.x était un script Python (PR #50). Le portage en TypeScript ([architecture](../../docs/technique/architecture.md), AD-1 et AD-6) garde le même modèle, les mêmes paramètres et les mêmes scénarios, mais change de générateur pseudo-aléatoire : à graine égale, les étudiants produits sont différents de ceux de la version Python.

## Modèle et paramètres

Les valeurs par défaut sont des **hypothèses de modélisation**, pas des statistiques réelles. Elles visent une cohorte plausible et des affectations intéressantes à comparer. Tous les paramètres sont dans `DEFAULT_PARAMS` (`src/generate.ts`) et sont recopiés dans `meta.params`.

| Donnée | Modèle | Paramètres (défaut) |
|---|---|---|
| GPA (sur 4) | Loi normale tronquée, arrondie au centième | `gpa_mean` 2,9 · `gpa_sd` 0,5 · bornes 1,5 à 4,0 |
| Niveau d'anglais latent | Loi normale centrée réduite, corrélée au GPA | `english_gpa_correlation` 0,3 · `english_shift` 0 |
| Test d'anglais | IELTS pour une part des étudiants, TOEIC pour les autres | `ielts_share` 0,3 |
| TOEIC | 780 + 120 × niveau, arrondi à 5, borné entre 10 et 990 | `toeic_mean`, `toeic_sd` |
| IELTS | 6,5 + 0,8 × niveau, arrondi à 0,5, borné entre 4 et 9 | `ielts_mean`, `ielts_sd` |
| Vie associative (sur 100) | Loi bêta(2, 3) : beaucoup de scores modestes, quelques étudiants très engagés | `associative_alpha`, `associative_beta` |
| 5 vœux | Modèle de choix de Plackett-Luce (voir ci-dessous) | `prestige_weight` 2 · `ambition_weight` 0,8 · `temperature` 1 · `continent_bias` |

### Les vœux

Chaque étudiant attribue une utilité à chaque université :

```
utilité = ((prestige_weight + ambition) × prestige + biais_continent) / temperature + bruit de Gumbel
```

- `prestige` = 1 − ln(rang) / ln(1500), entre 0 (non classée) et environ 1 (tête du classement). Un rang en tranche (`601-650`) est remplacé par son milieu, et `1401+` par 1401.
- `ambition` = `ambition_weight` × (GPA − moyenne) / écart-type : les bons dossiers visent des universités plus prestigieuses, les dossiers fragiles les évitent un peu.
- `continent_bias` traduit l'attrait supposé de chaque continent (Amérique du Nord 0,5, Europe et Océanie 0,4, Asie 0,2, Amérique du Sud 0, Afrique −0,2).
- Les 5 universités de plus forte utilité deviennent les vœux, dans l'ordre. Avec un bruit de Gumbel, cela revient exactement à tirer 5 vœux sans remise selon le modèle de Plackett-Luce, où chaque université a une probabilité proportionnelle à exp(utilité sans bruit).

### Scénarios de tension

| Scénario | Paramètres modifiés | Effet |
|---|---|---|
| `reference` | aucun | Cohorte « normale » |
| `destinations-surdemandees` | `prestige_weight` 4, `temperature` 0,5 | Les premiers vœux se concentrent sur quelques destinations prestigieuses |
| `cohorte-faible-anglais` | `english_shift` −1 | Le niveau d'anglais baisse d'un écart-type (TOEIC moyen d'environ 785 à environ 665) |

Les tirages se font toujours dans le même ordre. À graine égale, `cohorte-faible-anglais` produit donc **les mêmes étudiants avec les mêmes vœux** que `reference` : seuls les scores d'anglais changent (un test le vérifie). On peut ainsi mesurer l'effet du seul niveau d'anglais sur l'affectation.
