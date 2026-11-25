import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CONTINENT_QUOTAS,
  type Continent,
  type Destination,
  DestinationsError,
  loadDestinations,
  validateDestinations,
} from './destinations';

const RAW_DIR = fileURLToPath(new URL('../../../data/raw', import.meta.url));

const delft: Destination = {
  id: 'tu-delft',
  name: 'Delft University of Technology',
  name_local: 'Technische Universiteit Delft',
  city: 'Delft',
  country: 'Pays-Bas',
  country_code: 'NL',
  continent: 'europe',
  latitude: 52.0017,
  longitude: 4.3725,
  wikidata_id: 'Q752663',
  website: 'https://www.tudelft.nl/en',
  ranking: {
    name: 'THE World University Rankings 2027',
    rank: '50',
    tied: false,
    status: 'ranked',
    the_name: 'Delft University of Technology',
    source: 'https://www.timeshighereducation.com/world-university-rankings/delft-university-technology',
  },
  engineering_programs: 'Huit facultés, dont génie civil, génie mécanique et informatique.',
  sources: {
    identity: 'https://www.wikidata.org/wiki/Q752663',
    coordinates: 'https://www.wikidata.org/wiki/Q752663#P625',
    website: 'https://www.wikidata.org/wiki/Q752663#P856',
    engineering_programs: 'https://www.tudelft.nl/en/education',
  },
  notes: null,
};

/** Jeu complet et valide : le bon nombre de destinations par continent, ids et QID uniques. */
function validFiles(): Record<Continent, Destination[]> {
  let n = 0;
  const files = {} as Record<Continent, Destination[]>;
  for (const [continent, quota] of Object.entries(CONTINENT_QUOTAS) as [Continent, number][]) {
    files[continent] = Array.from({ length: quota }, () => {
      n += 1;
      return { ...delft, id: `universite-${n}`, wikidata_id: `Q${n}`, continent };
    });
  }
  return files;
}

function problemsOf(files: Partial<Record<Continent, unknown>>): readonly string[] {
  try {
    validateDestinations(files);
  } catch (error) {
    if (error instanceof DestinationsError) return error.problems;
    throw error;
  }
  return [];
}

describe('data/raw', () => {
  it('contient les 100 destinations, valides et sourcées', () => {
    const destinations = loadDestinations(RAW_DIR);
    expect(destinations).toHaveLength(100);
    expect(new Set(destinations.map((d) => d.continent)).size).toBe(6);
  });
});

describe('validateDestinations', () => {
  it('accepte un jeu valide et le trie par id', () => {
    const ids = validateDestinations(validFiles()).map((d) => d.id);
    expect(ids).toEqual([...ids].sort());
  });

  it('signale un continent absent et un quota non respecté', () => {
    const { oceania: _absent, ...files } = validFiles();
    files.africa = files.africa.slice(1);
    expect(problemsOf(files)).toEqual([
      'africa.json : 9 destinations au lieu de 10',
      'oceania.json : fichier absent',
    ]);
  });

  it('refuse un rang avec "=" et un rang absent pour une université classée', () => {
    const files = validFiles();
    files.europe[0] = { ...delft, id: 'a', wikidata_id: 'Q9001', ranking: { ...delft.ranking, rank: '=50' } };
    files.europe[1] = { ...delft, id: 'b', wikidata_id: 'Q9002', ranking: { ...delft.ranking, rank: null } };
    const problems = problemsOf(files);
    expect(problems.some((p) => p.startsWith('europe.json[0] (a) : ranking.rank : rang attendu'))).toBe(true);
    expect(problems).toContain('europe.json[1] (b) : ranking.rank : rank est renseigné si et seulement si status vaut "ranked"');
  });

  it('accepte une université évaluée mais non classée (reporter) sans rang', () => {
    const files = validFiles();
    files.europe[0] = { ...delft, ranking: { ...delft.ranking, status: 'reporter', rank: null } };
    expect(problemsOf(files)).toEqual([]);
  });

  it('exige une source pour chaque donnée et refuse les champs inconnus', () => {
    const files = validFiles();
    const { website: _w, ...sources } = delft.sources;
    files.asia[0] = { ...delft, id: 'a', wikidata_id: 'Q9001', continent: 'asia', sources: sources as Destination['sources'] };
    files.asia[1] = { ...delft, id: 'b', wikidata_id: 'Q9002', continent: 'asia', photo: 'x' } as Destination;
    const problems = problemsOf(files);
    expect(problems.some((p) => p.startsWith('asia.json[0] (a) : sources.website'))).toBe(true);
    expect(problems.some((p) => p.startsWith('asia.json[1] (b) : (entrée)') && p.includes('photo'))).toBe(true);
  });

  it('refuse des coordonnées hors limites ou trop précises, et un résumé trop long', () => {
    const files = validFiles();
    files.europe[0] = { ...delft, id: 'a', wikidata_id: 'Q9001', latitude: 91 };
    files.europe[1] = { ...delft, id: 'b', wikidata_id: 'Q9002', longitude: 4.37251 };
    files.europe[2] = { ...delft, id: 'c', wikidata_id: 'Q9003', engineering_programs: 'x'.repeat(301) };
    const fields = problemsOf(files).map((p) => p.split(' : ')[1]);
    expect(fields).toEqual(['latitude', 'longitude', 'engineering_programs']);
  });

  it('refuse un classement autre que THE 2027', () => {
    const files = validFiles();
    files.europe[0] = { ...delft, ranking: { ...delft.ranking, source: 'https://www.topuniversities.com/x' } };
    expect(problemsOf(files).some((p) => p.includes('ranking.source'))).toBe(true);
  });

  it('signale une destination rangée dans le mauvais fichier', () => {
    const files = validFiles();
    files.europe[0] = { ...delft, continent: 'asia' };
    expect(problemsOf(files)).toEqual(['europe.json[0] (tu-delft) : continent "asia" dans le fichier europe.json']);
  });

  it('signale les identifiants et les QID Wikidata en double', () => {
    const files = validFiles();
    files.europe[1] = { ...files.europe[1]!, id: 'universite-1' };
    files.asia[0] = { ...files.asia[0]!, wikidata_id: 'Q1' };
    expect(problemsOf(files)).toEqual(['id en double : universite-1', 'wikidata_id en double : Q1']);
  });
});
