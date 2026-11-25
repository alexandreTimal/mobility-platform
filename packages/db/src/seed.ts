// Seed des données de démo (AD-9, AD-13). Idempotent : relançable sans casse.
// Pour l'instant, il vérifie seulement que la base répond : les destinations
// (#9), les étudiants fictifs (#10) et les comptes de démo (#11) n'existent pas encore.
import { sql } from 'drizzle-orm';
import { closeDb, getDb } from './client';
import { loadRootEnvFile } from './env';

async function main(): Promise<void> {
  loadRootEnvFile();
  const db = getDb();
  await db.execute(sql`select 1`);
  console.log('✓ Base joignable. Aucune donnée de démo à charger pour l’instant (tables à venir avec #8).');
}

main()
  .catch((error: unknown) => {
    console.error('✗ Échec du seed :', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
