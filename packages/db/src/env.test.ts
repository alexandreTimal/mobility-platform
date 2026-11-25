import { describe, expect, it } from 'vitest';
import { parseDatabaseEnv, parseMigrationsUrl } from './env';

const LOCAL_URL = 'postgresql://postgres:postgres@127.0.0.1:54422/postgres';

describe('parseDatabaseEnv', () => {
  it('accepte une URL Postgres', () => {
    expect(parseDatabaseEnv({ DATABASE_URL: LOCAL_URL })).toEqual({ DATABASE_URL: LOCAL_URL });
  });

  it('traite une DATABASE_URL_MIGRATIONS vide comme absente', () => {
    expect(parseDatabaseEnv({ DATABASE_URL: LOCAL_URL, DATABASE_URL_MIGRATIONS: '' })).toEqual({
      DATABASE_URL: LOCAL_URL,
    });
  });

  it('lève une erreur explicite si DATABASE_URL est absente', () => {
    expect(() => parseDatabaseEnv({})).toThrow(/DATABASE_URL : variable absente : lancez `pnpm bootstrap`/);
  });

  it('refuse une URL qui n’est pas Postgres', () => {
    expect(() =>
      parseDatabaseEnv({ DATABASE_URL: LOCAL_URL, DATABASE_URL_MIGRATIONS: 'http://exemple.test' }),
    ).toThrow(/DATABASE_URL_MIGRATIONS : doit être une URL Postgres/);
  });
});

describe('parseMigrationsUrl', () => {
  it('préfère DATABASE_URL_MIGRATIONS, sans exiger DATABASE_URL', () => {
    expect(parseMigrationsUrl({ DATABASE_URL_MIGRATIONS: LOCAL_URL })).toBe(LOCAL_URL);
  });

  it('se replie sur DATABASE_URL si DATABASE_URL_MIGRATIONS est vide', () => {
    expect(parseMigrationsUrl({ DATABASE_URL: LOCAL_URL, DATABASE_URL_MIGRATIONS: '' })).toBe(LOCAL_URL);
  });

  it('lève une erreur lisible si aucune des deux n’est renseignée', () => {
    expect(() => parseMigrationsUrl({})).toThrow(/DATABASE_URL_MIGRATIONS \(ou DATABASE_URL\) : variable absente/);
  });
});
