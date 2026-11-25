import { defineConfig } from 'drizzle-kit';
import { loadRootEnvFile, parseMigrationsUrl } from './src/env';

loadRootEnvFile();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: parseMigrationsUrl(process.env),
  },
  strict: true,
  verbose: true,
});
