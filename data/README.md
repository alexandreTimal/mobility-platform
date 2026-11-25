# Jeu de données — destinations

Ce dossier contient les 100 universités partenaires (réelles) de l'école fictive. Les **partenariats sont fictifs** ; les informations d'identité sont réelles et sourcées. La méthode de collecte est décrite dans [`docs/donnees/collecte-destinations.md`](../docs/donnees/collecte-destinations.md).

## Arborescence

| Chemin | Contenu |
|---|---|
| `raw/<continent>.json` | Identité des universités, un fichier par continent (phase 1, issue #9) |

## Répartition par continent

| Continent | Code | Nombre |
|---|---|---|
| Europe | `europe` | 40 |
| Asie | `asia` | 20 |
| Amérique du Nord | `north-america` | 14 |
| Afrique | `africa` | 10 |
| Amérique du Sud | `south-america` | 10 |
| Océanie | `oceania` | 6 |

## Format d'une entrée (phase 1 : identité)

Chaque fichier `raw/<continent>.json` est un tableau d'objets :

```json
{
  "id": "tu-delft",
  "name": "Delft University of Technology",
  "name_local": "Technische Universiteit Delft",
  "city": "Delft",
  "country": "Pays-Bas",
  "country_code": "NL",
  "continent": "europe",
  "latitude": 52.0017,
  "longitude": 4.3725,
  "wikidata_id": "Q752663",
  "website": "https://www.tudelft.nl/en",
  "ranking": {
    "name": "THE World University Rankings 2027",
    "rank": "50",
    "tied": false,
    "status": "ranked",
    "the_name": "Delft University of Technology",
    "source": "https://www.timeshighereducation.com/world-university-rankings/delft-university-technology"
  },
  "engineering_programs": "<résumé en français>",
  "sources": {
    "identity": "https://www.wikidata.org/wiki/Q752663",
    "coordinates": "https://www.wikidata.org/wiki/Q752663#P625",
    "website": "https://www.wikidata.org/wiki/Q752663#P856",
    "engineering_programs": "<URL de la page consultée>"
  },
  "notes": null
}
```

| Champ | Règle |
|---|---|
| `id` | Slug unique en minuscules (`a-z0-9-`) |
| `name` | Nom officiel actuel en anglais (ou nom usuel international) |
| `name_local` | Nom dans la langue locale, `null` s'il est identique |
| `city` | Ville (ou commune) du campus retenu, nom usuel français s'il existe |
| `country` / `country_code` | Nom du pays en français / code ISO 3166-1 alpha-2 |
| `latitude` / `longitude` | Degrés décimaux (WGS 84, 4 décimales) du **campus où sont dispensés les enseignements d'ingénierie** |
| `wikidata_id` | Identifiant Wikidata de l'université |
| `website` | Page d'accueil officielle |
| `ranking` | Classement **THE World University Rankings 2027** pour les 100 entrées (voir ci-dessous) |
| `engineering_programs` | Résumé en français (≤ 300 caractères) des domaines ingénierie/informatique, rédigé d'après la page citée |
| `sources` | URL vérifiables pour chaque donnée réelle |
| `notes` | Précisions utiles (campus, fusion, multicampus…) ou doute restant ; `null` sinon |

### Classement

Une seule source pour les 100 universités, afin que les rangs soient comparables (ils servent à calibrer la sélectivité fictive) : la table officielle du **THE World University Rankings 2027**.

| Champ | Contenu |
|---|---|
| `rank` | Rang en texte, sans le `=` d'ex aequo (`"50"`, `"601-650"`, `"2001+"`) ; `null` si `status` vaut `reporter` |
| `tied` | `true` si THE indique un ex aequo (`=106`) |
| `status` | `ranked` (classée) ou `reporter` (évaluée par THE mais non classée, faute de remplir les critères) |
| `the_name` | Nom de l'établissement dans la table THE (peut différer de `name`) |
| `source` | Page de l'établissement sur le site THE |

Aucun champ réel n'est inventé : en cas de doute, la valeur est `null` et le doute est expliqué dans `notes`.

## Validation

Le format ci-dessus est vérifié par un schéma Zod, dans [`packages/db/src/destinations.ts`](../packages/db/src/destinations.ts) (`loadDestinations`, que le seed utilisera). `pnpm test` le lance sur les fichiers réels. Il vérifie :

- le nombre d'universités par continent, et que chaque université est dans le fichier de son continent ;
- le type et le format de chaque champ ; un champ inconnu est refusé ;
- le classement : THE 2027, rang sans `=`, rang absent si et seulement si `status` vaut `reporter` ;
- la présence d'une URL de source pour l'identité, les coordonnées, le site et les domaines d'ingénierie ;
- l'unicité des `id` et des `wikidata_id`.

Ce test ne vérifie pas que les valeurs sont justes. Ce contrôle a été fait à la collecte (voir la méthode).
