import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalJson } from './canonical-json';
import { createRandom, gumbel, normal } from './random';
import { sha256Hex, utf8Encode } from './sha256';

describe('createRandom (sfc32)', () => {
  it('même graine, même suite ; graines différentes, suites différentes', () => {
    const draw = (seed: number) => {
      const rng = createRandom(seed);
      return Array.from({ length: 20 }, () => rng.next());
    };
    expect(draw(42)).toEqual(draw(42));
    expect(draw(42)).not.toEqual(draw(43));
    expect(draw(-1)).not.toEqual(draw(2 ** 32 - 1));
    expect(draw(0)).not.toEqual(draw(2 ** 32));
  });

  it('tire des uniformes dans [0, 1[ de moyenne 1/2', () => {
    const rng = createRandom(1);
    const xs = Array.from({ length: 100_000 }, () => rng.next());
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(Math.abs(xs.reduce((s, x) => s + x, 0) / xs.length - 0.5)).toBeLessThan(0.01);
  });

  it('loi normale centrée réduite et loi de Gumbel (moyenne γ ≈ 0,5772)', () => {
    const rng = createRandom(2);
    const zs = Array.from({ length: 50_000 }, () => normal(rng));
    const m = zs.reduce((s, x) => s + x, 0) / zs.length;
    const v = zs.reduce((s, x) => s + (x - m) ** 2, 0) / zs.length;
    expect(Math.abs(m)).toBeLessThan(0.02);
    expect(Math.abs(v - 1)).toBeLessThan(0.03);
    const gs = Array.from({ length: 50_000 }, () => gumbel(rng));
    expect(Math.abs(gs.reduce((s, x) => s + x, 0) / gs.length - 0.5772)).toBeLessThan(0.03);
  });

  it('refuse une graine non entière', () => {
    expect(() => createRandom(0.5)).toThrow(/graine invalide/);
    expect(() => createRandom(2 ** 53)).toThrow(/graine invalide/);
  });
});

describe('sha256Hex', () => {
  it('donne la même empreinte que node:crypto', () => {
    const samples = ['', 'abc', 'é à ü 中文 🎓', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'x'.repeat(1000)];
    for (const text of samples) {
      expect(sha256Hex(text)).toBe(createHash('sha256').update(text, 'utf8').digest('hex'));
    }
  });

  it('encode en UTF-8 comme Buffer', () => {
    const text = 'Aïcha Traoré 🎓';
    expect(Array.from(utf8Encode(text))).toEqual(Array.from(Buffer.from(text, 'utf8')));
  });
});

describe('canonicalJson', () => {
  it("trie les clés quel que soit l'ordre d'insertion, y compris les clés numériques", () => {
    expect(canonicalJson({ b: 1, a: [true, null, 'é'], '10': 0, '9': 0 })).toBe(
      '{"10":0,"9":0,"a":[true,null,"é"],"b":1}',
    );
    expect(canonicalJson({ b: { d: 1, c: 2 }, a: 1 })).toBe(canonicalJson({ a: 1, b: { c: 2, d: 1 } }));
  });

  it('indente comme JSON.stringify quand les clés sont déjà triées', () => {
    const value = { a: [1, 2.5, { b: 'x' }], c: {}, d: [] };
    expect(canonicalJson(value, 2)).toBe(JSON.stringify(value, null, 2));
  });

  it('refuse les nombres non finis', () => {
    expect(() => canonicalJson(Number.NaN)).toThrow(/non représentable/);
  });
});
