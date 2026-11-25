import { describe, expect, it } from 'vitest';
import { FIXTURE, UNIS } from './fixture.test-utils';
import { normalizeUniversities, parseRank, prestige, UNRANKED_RANK, universitiesFingerprint } from './universities';

describe('parseRank', () => {
  it('lit les rangs simples, en tranche et ouverts', () => {
    expect(parseRank('47')).toBe(47);
    expect(parseRank(47)).toBe(47);
    expect(parseRank('=142')).toBe(142);
    expect(parseRank('601-650')).toBe(625.5);
    expect(parseRank('601–650')).toBe(625.5);
    expect(parseRank('1401+')).toBe(1401);
    expect(parseRank(null)).toBe(UNRANKED_RANK);
    expect(parseRank(undefined)).toBe(UNRANKED_RANK);
  });

  it('refuse un rang illisible', () => {
    expect(() => parseRank('top 10')).toThrow(/rang illisible/);
    expect(() => parseRank('')).toThrow(/rang illisible/);
  });
});

describe('prestige', () => {
  it('vaut 1 en tête, 0 pour une université non classée', () => {
    expect(prestige(1)).toBe(1);
    expect(prestige(UNRANKED_RANK)).toBe(0);
    expect(prestige(47)).toBeGreaterThan(prestige(625.5));
  });
});

describe('normalizeUniversities', () => {
  it('ne garde que id, continent et rang, triés par id', () => {
    expect(UNIS[0]).toEqual({ id: 'uni-00', continent: 'europe', rank: 8 });
    expect(UNIS.map((u) => u.id)).toEqual([...UNIS.map((u) => u.id)].sort());
    expect(normalizeUniversities([...FIXTURE].reverse())).toEqual(UNIS);
  });

  it('refuse les identifiants en double', () => {
    expect(() => normalizeUniversities([...FIXTURE, FIXTURE[0]])).toThrow(/en double/);
  });

  it('refuse un continent inconnu ou un id manquant', () => {
    expect(() => normalizeUniversities([...FIXTURE.slice(0, 5), { id: 'x', continent: 'antarctica' }])).toThrow(
      /université invalide/,
    );
    expect(() => normalizeUniversities([...FIXTURE.slice(0, 5), { continent: 'europe' }])).toThrow(
      /université invalide/,
    );
  });

  it('refuse moins de 5 universités', () => {
    expect(() => normalizeUniversities(FIXTURE.slice(0, 4))).toThrow(/au moins 5 universités/);
  });
});

describe('universitiesFingerprint', () => {
  it("ne dépend que du contenu, pas de l'ordre d'entrée", () => {
    expect(universitiesFingerprint(normalizeUniversities([...FIXTURE].reverse()))).toBe(universitiesFingerprint(UNIS));
    expect(universitiesFingerprint(UNIS.slice(1))).not.toBe(universitiesFingerprint(UNIS));
    expect(universitiesFingerprint(UNIS)).toMatch(/^[0-9a-f]{64}$/);
  });
});
