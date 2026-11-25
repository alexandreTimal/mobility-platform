import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { parseDatabaseEnv } from './env';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema> & { $client: postgres.Sql };

let database: Database | undefined;

/**
 * Client Drizzle partagé, créé au premier accès (les variables d'environnement
 * sont validées à ce moment-là). `prepare: false` : compatible avec le pooler
 * Supabase en mode transaction (AD-12).
 */
export function getDb(): Database {
  if (!database) {
    const { DATABASE_URL } = parseDatabaseEnv(process.env);
    const client = postgres(DATABASE_URL, { prepare: false });
    database = drizzle({ client, schema, casing: 'snake_case' });
  }
  return database;
}

/** Ferme les connexions ouvertes (scripts en ligne de commande). */
export async function closeDb(): Promise<void> {
  if (database) {
    try {
      await database.$client.end();
    } finally {
      database = undefined;
    }
  }
}
