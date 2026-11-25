// Génération reproductible d'étudiants fictifs (issue #10). Fonctions pures (AD-6) :
// mêmes universités, même graine, même scénario et même version → même fichier,
// octet pour octet. Tous les étudiants sont inventés : aucune donnée personnelle réelle.

import { canonicalJson, type Json } from './canonical-json';
import { beta, createRandom, gumbel, normal, type Random } from './random';
import {
  type Continent,
  GeneratorInputError,
  prestige,
  type University,
  universitiesFingerprint,
  WISHES_PER_STUDENT,
} from './universities';

// À incrémenter dès qu'un changement modifie le fichier produit pour une même
// graine : le test de non-régression (empreinte figée) le signale.
// 2.0.0 : portage TypeScript, générateur pseudo-aléatoire sfc32 (la 1.x était en Python).
export const GENERATOR_VERSION = '2.0.0';

// Prénoms et noms courants, combinés au hasard : les identités sont fictives.
export const FIRST_NAMES = [
  'Adam', 'Aïcha', 'Alice', 'Amine', 'Anaïs', 'Arthur', 'Camille', 'Chloé',
  'Clément', 'Emma', 'Enzo', 'Fatou', 'Gabriel', 'Hugo', 'Inès', 'Jade',
  'Jules', 'Julie', 'Karim', 'Léa', 'Léo', 'Lina', 'Louis', 'Lucas',
  'Manon', 'Mathis', 'Maël', 'Nathan', 'Nina', 'Noah', 'Océane', 'Paul',
  'Rayan', 'Romane', 'Sacha', 'Sarah', 'Théo', 'Thomas', 'Yanis', 'Zoé',
] as const;
export const LAST_NAMES = [
  'Bernard', 'Bertrand', 'Blanc', 'Bonnet', 'Boyer', 'Chevalier', 'Da Silva',
  'David', 'Diallo', 'Dubois', 'Dupont', 'Durand', 'Faure', 'Fontaine',
  'Fournier', 'Garcia', 'Gauthier', 'Girard', 'Guerin', 'Haddad', 'Lambert',
  'Laurent', 'Lefebvre', 'Leroy', 'Martin', 'Mercier', 'Michel', 'Moreau',
  'Morel', 'Nguyen', 'Petit', 'Richard', 'Robert', 'Rousseau', 'Roux',
  'Simon', 'Thomas', 'Traoré', 'Vincent', 'Petitjean',
] as const;

/**
 * Paramètres de la génération (documentés dans le README du package). Les noms sont
 * ceux recopiés dans `meta.params` du fichier produit.
 */
export interface Params {
  readonly count: number;
  // GPA sur 4 : loi normale tronquée.
  readonly gpa_mean: number;
  readonly gpa_sd: number;
  readonly gpa_min: number;
  readonly gpa_max: number;
  // Niveau d'anglais latent (loi normale centrée réduite), corrélé au GPA.
  readonly english_gpa_correlation: number;
  /** Décalage du niveau latent, en écarts-types. */
  readonly english_shift: number;
  /** Part des étudiants ayant passé l'IELTS (sinon TOEIC). */
  readonly ielts_share: number;
  readonly toeic_mean: number;
  readonly toeic_sd: number;
  readonly ielts_mean: number;
  readonly ielts_sd: number;
  // Score de vie associative sur 100 : loi bêta (beaucoup de scores bas, quelques engagés).
  readonly associative_alpha: number;
  readonly associative_beta: number;
  // Choix des vœux (modèle de Plackett-Luce, tiré avec l'astuce de Gumbel).
  /** Attrait des universités bien classées. */
  readonly prestige_weight: number;
  /** Les bons dossiers visent plus haut. */
  readonly ambition_weight: number;
  /** < 1 : vœux plus concentrés sur les mêmes destinations. */
  readonly temperature: number;
  readonly continent_bias: Readonly<Record<Continent, number>>;
}

export const DEFAULT_PARAMS: Params = {
  count: 1000,
  gpa_mean: 2.9,
  gpa_sd: 0.5,
  gpa_min: 1.5,
  gpa_max: 4.0,
  english_gpa_correlation: 0.3,
  english_shift: 0,
  ielts_share: 0.3,
  toeic_mean: 780,
  toeic_sd: 120,
  ielts_mean: 6.5,
  ielts_sd: 0.8,
  associative_alpha: 2,
  associative_beta: 3,
  prestige_weight: 2,
  ambition_weight: 0.8,
  temperature: 1,
  continent_bias: {
    europe: 0.4,
    'north-america': 0.5,
    oceania: 0.4,
    asia: 0.2,
    'south-america': 0,
    africa: -0.2,
  },
};

export const SCENARIOS = {
  // Cohorte « normale ».
  reference: {},
  // Les vœux se concentrent sur une poignée de destinations prestigieuses.
  'destinations-surdemandees': { prestige_weight: 4, temperature: 0.5 },
  // Cohorte nettement plus faible en anglais (un écart-type sous la référence).
  'cohorte-faible-anglais': { english_shift: -1 },
} as const satisfies Record<string, Partial<Params>>;

export type Scenario = keyof typeof SCENARIOS;
export const SCENARIO_NAMES = Object.keys(SCENARIOS) as Scenario[];

export function isScenario(name: string): name is Scenario {
  return Object.hasOwn(SCENARIOS, name);
}

export function paramsFor(scenario: string, count?: number): Params {
  if (!isScenario(scenario)) {
    throw new GeneratorInputError(`scénario inconnu : "${scenario}" (choix : ${SCENARIO_NAMES.join(', ')})`);
  }
  if (count !== undefined && (!Number.isInteger(count) || count < 1)) {
    throw new GeneratorInputError(`nombre d'étudiants invalide : ${count} (au moins 1)`);
  }
  return { ...DEFAULT_PARAMS, ...SCENARIOS[scenario], ...(count === undefined ? {} : { count }) };
}

export interface EnglishScore {
  readonly test: 'TOEIC' | 'IELTS';
  readonly score: number;
}

export interface Student {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly gpa: number;
  readonly english: EnglishScore;
  readonly associative_score: number;
  readonly wishes: readonly string[];
}

export interface Dataset {
  readonly meta: {
    readonly fictional: true;
    readonly generator_version: string;
    readonly seed: number;
    readonly scenario: Scenario;
    readonly params: Params;
    readonly universities_count: number;
    readonly universities_sha256: string;
  };
  readonly students: readonly Student[];
}

const clip = (x: number, low: number, high: number): number => Math.min(high, Math.max(low, x));

/** Arrondi à l'entier, égalités vers le pair (comme `round` en Python). */
function roundHalfEven(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

const round2 = (x: number): number => roundHalfEven(x * 100) / 100;
const roundTo = (x: number, step: number): number => round2(roundHalfEven(x / step) * step);

const pick = <T>(rng: Random, items: readonly T[]): T => items[Math.floor(rng.next() * items.length)] as T;

/**
 * Un étudiant. L'ordre des tirages est fixe et ne dépend pas des paramètres : à graine
 * égale, deux scénarios tirent les mêmes nombres dans le même ordre.
 */
export function generateStudent(index: number, rng: Random, p: Params, universities: readonly University[]): Student {
  const zGpa = normal(rng);
  const zEnglish =
    p.english_gpa_correlation * zGpa + Math.sqrt(1 - p.english_gpa_correlation ** 2) * normal(rng) + p.english_shift;

  const gpa = round2(clip(p.gpa_mean + p.gpa_sd * zGpa, p.gpa_min, p.gpa_max));
  const english: EnglishScore =
    rng.next() < p.ielts_share
      ? { test: 'IELTS', score: clip(roundTo(p.ielts_mean + p.ielts_sd * zEnglish, 0.5), 4, 9) }
      : { test: 'TOEIC', score: Math.trunc(clip(roundTo(p.toeic_mean + p.toeic_sd * zEnglish, 5), 10, 990)) };
  const associative = roundHalfEven(100 * beta(rng, p.associative_alpha, p.associative_beta));

  // Utilité de chaque université pour cet étudiant, puis les 5 meilleures :
  // cela revient à tirer 5 vœux sans remise selon Plackett-Luce.
  const ambition = (p.ambition_weight * (gpa - p.gpa_mean)) / p.gpa_sd;
  const utilities = universities.map((u) => {
    const logit = (p.prestige_weight + ambition) * prestige(u.rank) + (p.continent_bias[u.continent] ?? 0);
    return { utility: logit / p.temperature + gumbel(rng), id: u.id };
  });
  utilities.sort((x, y) => y.utility - x.utility || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
  const wishes = utilities.slice(0, WISHES_PER_STUDENT).map((u) => u.id);

  const firstName = pick(rng, FIRST_NAMES);
  const lastName = pick(rng, LAST_NAMES);
  const id = `etu-${String(index).padStart(4, '0')}`;
  return {
    id,
    first_name: firstName,
    last_name: lastName,
    email: `${id}@etudiants.example`,
    gpa,
    english,
    associative_score: associative,
    wishes,
  };
}

/**
 * Génère la cohorte. `universities` doit venir de normalizeUniversities (triées par `id`).
 */
export function generate(
  universities: readonly University[],
  seed: number,
  scenario: string = 'reference',
  count?: number,
): Dataset {
  const p = paramsFor(scenario, count);
  if (universities.length < WISHES_PER_STUDENT) {
    throw new GeneratorInputError(`au moins ${WISHES_PER_STUDENT} universités sont nécessaires`);
  }
  if (!Number.isSafeInteger(seed)) {
    throw new GeneratorInputError(`graine invalide : ${seed} (un entier est attendu)`);
  }
  const rng = createRandom(seed);
  const students = Array.from({ length: p.count }, (_, i) => generateStudent(i + 1, rng, p, universities));
  return {
    meta: {
      fictional: true,
      generator_version: GENERATOR_VERSION,
      seed,
      scenario: scenario as Scenario,
      params: p,
      universities_count: universities.length,
      universities_sha256: universitiesFingerprint(universities),
    },
    students,
  };
}

/** Texte du fichier produit : JSON canonique (clés triées), indenté, terminé par un saut de ligne. */
export function serializeDataset(dataset: Dataset): string {
  return `${canonicalJson(dataset as unknown as Json, 2)}\n`;
}
