// Universités synthétiques pour les tests (identifiants et rangs inventés,
// indépendants du vrai jeu de données qui évolue encore).

import { CONTINENTS, normalizeUniversities } from './universities';

const RANKS = ['8', '47', '120', '201-250', '301-350', '401-500', '601-650', '801-1000', '1201-1400', '1401+', null];

export const FIXTURE = Array.from({ length: 30 }, (_, i) => {
  const rank = RANKS[i % RANKS.length] ?? null;
  return {
    id: `uni-${String(i).padStart(2, '0')}`,
    continent: CONTINENTS[i % CONTINENTS.length],
    ranking: rank === null ? null : { rank },
  };
});

export const UNIS = normalizeUniversities(FIXTURE);
