// Préparation des universités lues dans data/ : seuls `id`, `continent` et
// `ranking.rank` servent au générateur.

import { canonicalJson } from './canonical-json';
import { sha256Hex } from './sha256';

export const WISHES_PER_STUDENT = 5;
/** Rang attribué à une université non classée. */
export const UNRANKED_RANK = 1500;
export const CONTINENTS = ['europe', 'asia', 'north-america', 'africa', 'south-america', 'oceania'] as const;

export type Continent = (typeof CONTINENTS)[number];

export interface University {
  readonly id: string;
  readonly continent: Continent;
  /** Rang numérique (voir parseRank). */
  readonly rank: number;
}

/** Erreur d'entrée : message en français, destiné à l'utilisateur. */
export class GeneratorInputError extends Error {
  override name = 'GeneratorInputError';
}

/** Rang numérique d'un rang texte : "47" → 47, "601-650" → 625,5, "1401+" → 1401, absent → 1500. */
export function parseRank(rank: string | number | null | undefined): number {
  if (rank === null || rank === undefined) return UNRANKED_RANK;
  const text = String(rank).trim().replace(/^=+/, '').replaceAll('–', '-');
  let value: number;
  if (text.endsWith('+')) {
    value = Number(text.slice(0, -1));
  } else if (text.includes('-')) {
    const [low = '', high = ''] = text.split(/-(.*)/s);
    value = (Number(low) + Number(high)) / 2;
  } else {
    value = Number(text);
  }
  if (text === '' || !Number.isFinite(value)) {
    throw new GeneratorInputError(`rang illisible : ${JSON.stringify(rank)}`);
  }
  return value;
}

/** Prestige entre 0 (non classée) et environ 1 (tête du classement). */
export function prestige(rank: number): number {
  return Math.max(0, 1 - Math.log(Math.max(rank, 1)) / Math.log(UNRANKED_RANK));
}

const isContinent = (value: unknown): value is Continent =>
  typeof value === 'string' && (CONTINENTS as readonly string[]).includes(value);

/**
 * Valide les universités brutes et les réduit à { id, continent, rank }, triées par `id` :
 * l'ordre des fichiers et des entrées n'influe pas sur le résultat.
 */
export function normalizeUniversities(raw: readonly unknown[]): University[] {
  const universities = raw.map((entry): University => {
    const u = (typeof entry === 'object' && entry !== null ? entry : {}) as Record<string, unknown>;
    const id = u.id;
    if (typeof id !== 'string' || id === '' || !isContinent(u.continent)) {
      throw new GeneratorInputError(`université invalide (id ou continent) : ${JSON.stringify(id ?? null)}`);
    }
    const ranking = (typeof u.ranking === 'object' && u.ranking !== null ? u.ranking : {}) as Record<string, unknown>;
    const rank = ranking.rank;
    if (rank !== undefined && rank !== null && typeof rank !== 'string' && typeof rank !== 'number') {
      throw new GeneratorInputError(`université ${id} : rang illisible`);
    }
    return { id, continent: u.continent, rank: parseRank(rank) };
  });
  if (new Set(universities.map((u) => u.id)).size !== universities.length) {
    throw new GeneratorInputError("identifiants d'universités en double");
  }
  if (universities.length < WISHES_PER_STUDENT) {
    throw new GeneratorInputError(`au moins ${WISHES_PER_STUDENT} universités sont nécessaires`);
  }
  return universities.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/** Empreinte SHA-256 de la liste d'universités utilisée (JSON canonique compact). */
export function universitiesFingerprint(universities: readonly University[]): string {
  return sha256Hex(canonicalJson(universities.map((u) => ({ continent: u.continent, id: u.id, rank: u.rank }))));
}
