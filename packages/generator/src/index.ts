// Générateur seedé d'étudiants fictifs : cœur pur (aucune I/O, AD-6).
// La seule I/O est dans cli.ts, qui n'est pas exporté ici.

export { canonicalJson, type Json } from './canonical-json';
export {
  DEFAULT_PARAMS,
  type Dataset,
  type EnglishScore,
  FIRST_NAMES,
  GENERATOR_VERSION,
  generate,
  generateStudent,
  isScenario,
  LAST_NAMES,
  type Params,
  paramsFor,
  SCENARIO_NAMES,
  SCENARIOS,
  type Scenario,
  type Student,
  serializeDataset,
} from './generate';
export { createRandom, type Random } from './random';
export { sha256Hex } from './sha256';
export {
  CONTINENTS,
  type Continent,
  GeneratorInputError,
  normalizeUniversities,
  parseRank,
  prestige,
  UNRANKED_RANK,
  type University,
  universitiesFingerprint,
  WISHES_PER_STUDENT,
} from './universities';
