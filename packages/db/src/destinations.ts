// Lecture et validation des destinations réelles de data/raw (AD-10).
// Le seed (#8) s'appuiera sur loadDestinations : un fichier invalide fait échouer le chargement.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

/** Nombre de destinations attendu par continent (un fichier data/raw/<continent>.json chacun). */
export const CONTINENT_QUOTAS = {
  europe: 40,
  asia: 20,
  'north-america': 14,
  africa: 10,
  'south-america': 10,
  oceania: 6,
} as const;

export type Continent = keyof typeof CONTINENT_QUOTAS;
export const CONTINENTS = Object.keys(CONTINENT_QUOTAS) as Continent[];

export const RANKING_NAME = 'THE World University Rankings 2027';
const THE_PAGE = 'https://www.timeshighereducation.com/world-university-rankings/';
const MAX_PROGRAMS_LENGTH = 300;

const url = z.url({ protocol: /^https?$/ });
const text = z.string().trim().min(1);
/** Coordonnée en degrés décimaux, 4 décimales au plus. */
const coordinate = (limit: number) =>
  z
    .number()
    .min(-limit)
    .max(limit)
    .refine((value) => Math.abs(value * 1e4 - Math.round(value * 1e4)) < 1e-6, { message: '4 décimales au plus' });

const rankingSchema = z
  .strictObject({
    name: z.literal(RANKING_NAME),
    rank: z
      .string()
      .regex(/^\d+(-\d+|\+)?$/, 'rang attendu : "50", "601-650" ou "2001+" (sans "=")')
      .nullable(),
    tied: z.boolean(),
    status: z.enum(['ranked', 'reporter']),
    the_name: text,
    source: url.refine((value) => value.startsWith(THE_PAGE), { message: `page attendue sous ${THE_PAGE}` }),
  })
  .refine((r) => (r.status === 'ranked') === (r.rank !== null), {
    message: 'rank est renseigné si et seulement si status vaut "ranked"',
    path: ['rank'],
  })
  .refine((r) => r.status === 'ranked' || !r.tied, {
    message: 'une université non classée ne peut pas être ex aequo',
    path: ['tied'],
  });

export const destinationSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug attendu (a-z, 0-9, tirets)'),
  name: text,
  name_local: text.nullable(),
  city: text,
  country: text,
  country_code: z.string().regex(/^[A-Z]{2}$/, 'code ISO 3166-1 alpha-2 attendu'),
  continent: z.enum(CONTINENTS),
  latitude: coordinate(90),
  longitude: coordinate(180),
  wikidata_id: z.string().regex(/^Q\d+$/, 'identifiant Wikidata attendu (Q123)'),
  website: url,
  ranking: rankingSchema,
  engineering_programs: text.max(MAX_PROGRAMS_LENGTH),
  sources: z.strictObject({
    identity: url,
    coordinates: url,
    website: url,
    engineering_programs: url,
  }),
  notes: text.nullable(),
});

export type Destination = z.infer<typeof destinationSchema>;

/** Erreur de données : la liste de tous les problèmes trouvés, en français. */
export class DestinationsError extends Error {
  override name = 'DestinationsError';
  constructor(readonly problems: readonly string[]) {
    super(`data/raw invalide :\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }
}

/**
 * Valide le contenu des fichiers de data/raw, indexé par continent, et renvoie les destinations
 * triées par `id`. Lève DestinationsError avec tous les problèmes (pas seulement le premier).
 */
export function validateDestinations(files: Readonly<Partial<Record<Continent, unknown>>>): Destination[] {
  const problems: string[] = [];
  const destinations: Destination[] = [];

  for (const continent of CONTINENTS) {
    const content = files[continent];
    if (content === undefined) {
      problems.push(`${continent}.json : fichier absent`);
      continue;
    }
    if (!Array.isArray(content)) {
      problems.push(`${continent}.json : un tableau est attendu`);
      continue;
    }
    if (content.length !== CONTINENT_QUOTAS[continent]) {
      problems.push(`${continent}.json : ${content.length} destinations au lieu de ${CONTINENT_QUOTAS[continent]}`);
    }
    content.forEach((entry: unknown, index) => {
      const label = `${continent}.json[${index}] (${String((entry as { id?: unknown } | null)?.id ?? '?')})`;
      const parsed = destinationSchema.safeParse(entry);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          problems.push(`${label} : ${issue.path.join('.') || '(entrée)'} : ${issue.message}`);
        }
        return;
      }
      if (parsed.data.continent !== continent) {
        problems.push(`${label} : continent "${parsed.data.continent}" dans le fichier ${continent}.json`);
      }
      destinations.push(parsed.data);
    });
  }

  for (const key of ['id', 'wikidata_id'] as const) {
    const seen = new Set<string>();
    for (const destination of destinations) {
      if (seen.has(destination[key])) problems.push(`${key} en double : ${destination[key]}`);
      seen.add(destination[key]);
    }
  }

  if (problems.length > 0) throw new DestinationsError(problems);
  return destinations.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Lit et valide data/raw/<continent>.json pour les six continents. */
export function loadDestinations(rawDir: string): Destination[] {
  const files: Partial<Record<Continent, unknown>> = {};
  const problems: string[] = [];
  for (const continent of CONTINENTS) {
    const path = join(rawDir, `${continent}.json`);
    let content: string;
    try {
      content = readFileSync(path, 'utf8');
    } catch {
      continue; // signalé par validateDestinations (fichier absent)
    }
    try {
      files[continent] = JSON.parse(content);
    } catch (error) {
      problems.push(`${continent}.json : JSON illisible (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  if (problems.length > 0) throw new DestinationsError(problems);
  return validateDestinations(files);
}
