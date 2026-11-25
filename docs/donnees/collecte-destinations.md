# Collecte des destinations (identité)

Ce document décrit comment les 100 universités partenaires ont été choisies et comment leurs données d'identité ont été collectées et vérifiées (issue #9). Le format des fichiers est décrit dans [`data/README.md`](../../data/README.md).

> Les universités sont réelles, les partenariats sont fictifs.

## 1. Critères de sélection

- **Offre en ingénierie ou en informatique** : universités techniques, polytechniques, ou universités généralistes dotées d'une faculté d'ingénierie.
- **Couverture mondiale** : les six continents habités, avec la répartition suivante, choisie pour refléter une école d'ingénieurs française tout en gardant une vraie présence hors d'Europe.

  | Continent | Nombre | Contraintes de diversité |
  |---|---|---|
  | Europe | 40 | ≥ 20 pays, ≤ 4 par pays, France exclue |
  | Asie | 20 | ≥ 10 pays, ≤ 3 par pays (Moyen-Orient, Turquie et Caucase inclus) |
  | Amérique du Nord | 14 | Canada (dont Québec francophone), États-Unis ≤ 7, Mexique et Amérique centrale ≥ 2 |
  | Afrique | 10 | ≥ 7 pays, ≤ 2 par pays, Nord / Ouest / Est / australe, établissements francophones et anglophones |
  | Amérique du Sud | 10 | ≥ 6 pays, ≤ 3 par pays |
  | Océanie | 6 | Australie (≥ 3 villes), Nouvelle-Zélande, Pacifique |

- **Exclusions** : la France (l'école est française), la Russie et la Biélorussie (échanges universitaires suspendus).
- **Diversité de sélectivité** : un mélange d'établissements très bien classés, intermédiaires et modestes, pour que les conditions d'accès fictives (places, GPA minimum, niveau d'anglais) puissent être calibrées de façon cohérente.
- **Présence dans le classement THE 2027** : chaque université figure dans la table THE 2027 (classée, ou évaluée sans être classée). Six universités d'une première sélection, absentes de cette table, ont été remplacées par un établissement comparable du même pays ou de la même région (voir § 4).

## 2. Sources par donnée

| Donnée | Source |
|---|---|
| Nom, pays, ville, site officiel | [Wikidata](https://www.wikidata.org) (élément de l'université), vérifié sur le site officiel |
| Coordonnées GPS | Wikidata (propriété P625 de l'université, ou de l'élément du campus / de la faculté d'ingénierie) ; à défaut [OpenStreetMap](https://www.openstreetmap.org) |
| Classement | Table officielle du [THE World University Rankings 2027](https://www.timeshighereducation.com/world-university-rankings), consultée le 24/11/2026 |
| Domaines d'ingénierie | Page officielle de la faculté ou des formations ; à défaut l'article Wikipédia |

Chaque entrée cite l'URL exacte de chaque source dans son champ `sources` (et `ranking.source`).

### Pourquoi THE plutôt que QS

Le sujet cite QS et THE. Nous utilisons **un seul** classement pour toutes les universités, car le rang sert à calibrer la sélectivité fictive : mélanger deux classements rendrait les rangs incomparables. Le site de QS refuse les accès automatisés, ce qui obligeait à recopier les rangs depuis des sites tiers ou des articles de presse ; THE publie sa table complète, ce qui permet de rattacher chaque rang à la source officielle.

### Pourquoi le campus d'ingénierie

Les coordonnées alimentent la carte de la plateforme : elles doivent montrer où l'étudiant étudierait. Quand le siège administratif d'une université est distinct de son campus d'ingénierie (par exemple TUM : siège à Munich, ingénierie à Garching), c'est le campus d'ingénierie qui est retenu, et la précision figure dans `notes`.

## 3. Processus

La collecte a été faite avec l'aide d'agents IA (Claude Code), selon la [déclaration d'usage de l'IA](../../README.md#déclaration-dusage-de-lia) du projet, puis vérifiée :

1. **Sélection et identité** : un agent par continent, avec les critères ci-dessus et l'obligation de citer une source ouverte pour chaque valeur (valeur `null` et explication dans `notes` en cas de doute).
2. **Contrôle automatique** : quotas par continent, champs obligatoires, unicité des identifiants (y compris Wikidata), validité des coordonnées, comparaison de chaque coordonnée avec Wikidata, présence des sources. Le contrôle du format est devenu un test du dépôt (voir [`data/README.md`](../../data/README.md#validation)), lancé par `pnpm test`.
3. **Unification du classement** sur la table officielle THE 2027, par correspondance de l'URL THE ou du nom, chaque correspondance étant relue à la main.
4. **Passe de vérification** de chaque entrée : relecture des domaines d'ingénierie contre la page citée, recadrage des coordonnées sur le campus d'ingénierie, vérification que chaque URL répond, nettoyage des notes.
5. **Vérification manuelle dans un navigateur** des pages officielles qui refusent les requêtes automatisées (protection anti-robot) : la date de consultation est indiquée dans `notes`.
6. **Audit final** : chaque URL citée est testée, et le pays de chaque point GPS est contrôlé par géocodage inverse (OpenStreetMap).
7. **Relecture humaine** en pull request.

## 4. Résultat

100 universités dans 70 pays : Europe 40 (29 pays), Asie 20 (18 pays), Amérique du Nord 14 (4 pays), Afrique 10 (9 pays), Amérique du Sud 10 (7 pays), Océanie 6 (3 pays). Pour 97 d'entre elles, les domaines d'ingénierie sont rédigés d'après une page officielle de l'université consultée en ligne. Les trois exceptions sont expliquées dans leurs `notes` : Cairo University et University of the Philippines (site de la faculté hors service ou au certificat invalide : page officielle archivée par Internet Archive) et Universidad de los Andes (site inaccessible aux outils de collecte : Wikipédia en espagnol).

L'audit final (25/11/2026) confirme que les 100 points GPS tombent dans le pays indiqué. Sur 424 URL citées, 24 ne répondent pas aux requêtes automatisées (protection anti-robot ou certificat TLS refusé par l'outil) ; elles ont été ouvertes dans un navigateur, sauf trois sites inaccessibles même ainsi, signalés dans `notes` : Tunis El Manar University (hors service), Universidad de los Andes (blocage anti-robot) et le College of Engineering de l'University of the Philippines (certificat invalide).

## 5. Remplacements

| Université écartée | Raison | Remplaçante |
|---|---|---|
| University of Colorado Boulder | Absente de THE 2027 | Colorado School of Mines |
| Universidad de Buenos Aires | Absente de THE 2027 | National University of La Plata |
| Universidad de la República (Uruguay) | Absente de THE 2027 | ORT Uruguay University |
| Polytechnique Montréal | Non classée en propre par THE | University of Waterloo |
| École nationale d'ingénieurs de Tunis | Non classée en propre par THE | Tunis El Manar University (dont l'ENIT fait partie) |
| Universidad Tecnológica de Panamá | Absente de THE 2027 | Tecnológico de Costa Rica |

La fiche de l'University of the Philippines désigne l'université dans son ensemble, car c'est elle que THE classe ; ses coordonnées sont celles du College of Engineering, sur le campus de Diliman.

## 6. Limites connues

- Un classement change chaque année : les rangs sont ceux de l'édition 2027 et ne sont pas mis à jour automatiquement.
- Certaines universités ont plusieurs campus d'ingénierie : un seul point est retenu, celui qui est indiqué dans `notes`.
- Les sites officiels qui ne répondaient pas lors de la collecte sont signalés dans `notes` avec la date du test.
