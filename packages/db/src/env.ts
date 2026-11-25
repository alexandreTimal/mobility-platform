import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const postgresUrl = z
  .string({ error: 'variable absente : lancez `pnpm bootstrap` ou renseignez-la dans .env' })
  .min(1, 'variable vide : lancez `pnpm bootstrap` ou renseignez-la dans .env')
  .refine((value) => /^postgres(ql)?:\/\//.test(value), {
    message: 'doit être une URL Postgres (postgresql://…)',
  });

const databaseEnvSchema = z.object({
  /** Connexion du runtime (pooler en mode transaction en ligne, base locale sinon). */
  DATABASE_URL: postgresUrl,
  /** Connexion des migrations (pooler en mode session en ligne). Vide ou absente : DATABASE_URL. */
  DATABASE_URL_MIGRATIONS: z.preprocess((value) => (value === '' ? undefined : value), postgresUrl.optional()),
});

const migrationsEnvSchema = z.object({ url: postgresUrl });

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

function formatError(error: z.ZodError, label: (key: string) => string): Error {
  const details = error.issues.map((issue) => `  - ${label(issue.path.join('.'))} : ${issue.message}`).join('\n');
  return new Error(`Variables d'environnement de la base invalides :\n${details}`);
}

/** Valide les variables de connexion et lève une erreur lisible si l'une est invalide. */
export function parseDatabaseEnv(source: Record<string, string | undefined>): DatabaseEnv {
  const result = databaseEnvSchema.safeParse(source);
  if (!result.success) {
    throw formatError(result.error, (key) => key);
  }
  return result.data;
}

/** URL des migrations : DATABASE_URL_MIGRATIONS si renseignée, sinon DATABASE_URL. */
export function parseMigrationsUrl(source: Record<string, string | undefined>): string {
  const url = source.DATABASE_URL_MIGRATIONS || source.DATABASE_URL;
  const result = migrationsEnvSchema.safeParse({ url });
  if (!result.success) {
    throw formatError(result.error, () => 'DATABASE_URL_MIGRATIONS (ou DATABASE_URL)');
  }
  return result.data.url;
}

/**
 * Charge le `.env` racine du dépôt s'il existe (scripts lancés depuis `packages/db`).
 * Les variables déjà définies dans l'environnement ne sont pas écrasées.
 */
export function loadRootEnvFile(): void {
  const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env');
  if (existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  }
}
