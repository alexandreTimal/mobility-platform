import { createHash } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { FIXTURE, UNIS } from './fixture.test-utils';
import { GENERATOR_VERSION, generate, paramsFor, type Student, serializeDataset } from './generate';
import { normalizeUniversities, universitiesFingerprint } from './universities';

// Empreinte figée de la sortie (graine 42, 50 étudiants, scénario de référence).
// Si ce test échoue, la génération a changé : vérifier que c'est voulu, puis
// incrémenter GENERATOR_VERSION et mettre à jour l'empreinte.
const GOLDEN_SHA256 = '9ad4b08618bf33b6c9bbd78f4d4adf9d7216ff4c9f19dc93fada8cb68679a236';

const students = (seed = 42, scenario = 'reference', count = 1000): readonly Student[] =>
  generate(UNIS, seed, scenario, count).students;

const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length;
const stdev = (xs: readonly number[]): number => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};
const correlation = (xs: readonly number[], ys: readonly number[]): number => {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  xs.forEach((x, i) => {
    const y = ys[i] as number;
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  });
  return sxy / Math.sqrt(sxx * syy);
};
const countBy = <T>(xs: readonly T[]): Map<T, number> => {
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return counts;
};
const rankOf = new Map(UNIS.map((u) => [u.id, u.rank]));

describe('reproductibilité', () => {
  it('même graine, même sortie, octet pour octet', () => {
    expect(serializeDataset(generate(UNIS, 7))).toBe(serializeDataset(generate(UNIS, 7)));
  });

  it('des graines différentes donnent des étudiants différents', () => {
    expect(students(1, 'reference', 50)).not.toEqual(students(2, 'reference', 50));
  });

  it("l'ordre des universités en entrée ne change pas le résultat", () => {
    const shuffled = normalizeUniversities([...FIXTURE.slice(15), ...FIXTURE.slice(0, 15).reverse()]);
    expect(serializeDataset(generate(shuffled, 3, 'reference', 50))).toBe(
      serializeDataset(generate(UNIS, 3, 'reference', 50)),
    );
  });

  it('empreinte figée de la sortie', () => {
    expect(sha256(serializeDataset(generate(UNIS, 42, 'reference', 50)))).toBe(GOLDEN_SHA256);
  });

  it('meta contient de quoi rejouer la génération', () => {
    const { meta } = generate(UNIS, 42, 'cohorte-faible-anglais', 10);
    expect(meta.fictional).toBe(true);
    expect([meta.seed, meta.scenario]).toEqual([42, 'cohorte-faible-anglais']);
    expect(meta.params.english_shift).toBe(-1);
    expect(meta.params.count).toBe(10);
    expect(meta.generator_version).toBe(GENERATOR_VERSION);
    expect(meta.universities_count).toBe(30);
    expect(meta.universities_sha256).toBe(universitiesFingerprint(UNIS));
  });

  it('le fichier est du JSON à clés triées terminé par un saut de ligne', () => {
    const text = serializeDataset(generate(UNIS, 42, 'reference', 2));
    expect(text.endsWith('}\n')).toBe(true);
    const parsed = JSON.parse(text) as { meta: object; students: object[] };
    expect(Object.keys(parsed)).toEqual(['meta', 'students']);
    expect(Object.keys(parsed.students[0] as object)).toEqual([
      'associative_score',
      'email',
      'english',
      'first_name',
      'gpa',
      'id',
      'last_name',
      'wishes',
    ]);
  });
});

describe('format des étudiants', () => {
  let ref: readonly Student[];
  beforeAll(() => {
    ref = students();
  });

  it('1000 étudiants aux identifiants uniques', () => {
    expect(ref).toHaveLength(1000);
    expect(new Set(ref.map((s) => s.id)).size).toBe(1000);
    expect(ref[0]?.id).toBe('etu-0001');
  });

  it('5 vœux distincts et valides', () => {
    const valid = new Set(UNIS.map((u) => u.id));
    for (const s of ref) {
      expect(s.wishes).toHaveLength(5);
      expect(new Set(s.wishes).size).toBe(5);
      expect(s.wishes.every((w) => valid.has(w))).toBe(true);
    }
  });

  it('valeurs dans leurs plages', () => {
    for (const s of ref) {
      expect(s.gpa).toBeGreaterThanOrEqual(1.5);
      expect(s.gpa).toBeLessThanOrEqual(4);
      expect(Math.round(s.gpa * 100) / 100).toBe(s.gpa);
      expect(Number.isInteger(s.associative_score)).toBe(true);
      expect(s.associative_score).toBeGreaterThanOrEqual(0);
      expect(s.associative_score).toBeLessThanOrEqual(100);
      expect(s.email.endsWith('.example')).toBe(true);
      const { test, score } = s.english;
      if (test === 'TOEIC') {
        expect(score >= 10 && score <= 990 && score % 5 === 0).toBe(true);
      } else {
        expect(test).toBe('IELTS');
        expect(score >= 4 && score <= 9 && Number.isInteger(score * 2)).toBe(true);
      }
    }
  });
});

describe('distributions', () => {
  let ref: readonly Student[];
  beforeAll(() => {
    ref = students();
  });

  it('GPA : moyenne 2,9 et écart-type 0,5', () => {
    const gpas = ref.map((s) => s.gpa);
    expect(Math.abs(mean(gpas) - 2.9)).toBeLessThan(0.06);
    expect(Math.abs(stdev(gpas) - 0.5)).toBeLessThan(0.06);
  });

  it("le niveau d'anglais est corrélé au GPA", () => {
    const toeic = ref.filter((s) => s.english.test === 'TOEIC');
    expect(
      correlation(
        toeic.map((s) => s.gpa),
        toeic.map((s) => s.english.score),
      ),
    ).toBeGreaterThan(0.15);
  });

  it("environ 30 % d'IELTS", () => {
    const share = ref.filter((s) => s.english.test === 'IELTS').length / ref.length;
    expect(Math.abs(share - 0.3)).toBeLessThan(0.05);
  });

  it('les universités prestigieuses sont plus demandées en premier vœu', () => {
    const firsts = countBy(ref.map((s) => s.wishes[0]));
    const top = UNIS.filter((u) => u.rank <= 120).map((u) => u.id);
    const bottom = UNIS.filter((u) => u.rank >= 1401).map((u) => u.id);
    const avg = (ids: string[]): number => mean(ids.map((id) => firsts.get(id) ?? 0));
    expect(avg(top)).toBeGreaterThan(avg(bottom));
  });

  it('les meilleurs dossiers visent plus haut', () => {
    const byGpa = [...ref].sort((a, b) => a.gpa - b.gpa);
    const meanFirstRank = (group: readonly Student[]): number =>
      mean(group.map((s) => rankOf.get(s.wishes[0] as string) as number));
    expect(meanFirstRank(byGpa.slice(-200))).toBeLessThan(meanFirstRank(byGpa.slice(0, 200)));
  });
});

describe('scénarios', () => {
  const top5Share = (group: readonly Student[]): number => {
    const counts = [...countBy(group.map((s) => s.wishes[0])).values()].sort((a, b) => b - a);
    return counts.slice(0, 5).reduce((s, n) => s + n, 0) / group.length;
  };
  const meanToeic = (group: readonly Student[]): number =>
    mean(group.filter((s) => s.english.test === 'TOEIC').map((s) => s.english.score));

  it('destinations-surdemandees concentre les premiers vœux', () => {
    expect(top5Share(students(42, 'destinations-surdemandees'))).toBeGreaterThan(top5Share(students()) + 0.15);
  });

  it("cohorte-faible-anglais baisse nettement le niveau d'anglais", () => {
    expect(meanToeic(students(42, 'cohorte-faible-anglais'))).toBeLessThan(meanToeic(students()) - 80);
  });

  it("cohorte-faible-anglais garde les mêmes étudiants et les mêmes vœux : seul l'anglais change", () => {
    const withoutEnglish = (group: readonly Student[]) => group.map(({ english: _english, ...rest }) => rest);
    const ref = students();
    const weak = students(42, 'cohorte-faible-anglais');
    expect(withoutEnglish(weak)).toEqual(withoutEnglish(ref));
    expect(weak.map((s) => s.english.test)).toEqual(ref.map((s) => s.english.test));
  });

  it('refuse un scénario inconnu', () => {
    expect(() => paramsFor('inexistant')).toThrow(/scénario inconnu/);
    expect(() => generate(UNIS, 42, 'inexistant')).toThrow(/scénario inconnu/);
  });

  it("refuse un nombre d'étudiants ou une graine invalides", () => {
    expect(() => generate(UNIS, 42, 'reference', 0)).toThrow(/nombre d'étudiants invalide/);
    expect(() => generate(UNIS, 1.5)).toThrow(/graine invalide/);
  });
});
