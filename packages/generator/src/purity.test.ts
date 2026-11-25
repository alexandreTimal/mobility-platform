// Garde-fou d'AD-6 et AD-1 : le cœur du générateur n'a ni I/O, ni horloge, ni
// hasard non seedé, et n'importe rien d'autre que ses propres modules.
// Seuls cli.ts (la coquille) et les fichiers de test en sont exemptés.

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('.', import.meta.url));
const coreFiles = readdirSync(SRC).filter(
  (name) => name.endsWith('.ts') && name !== 'cli.ts' && !/\.test(-utils)?\.ts$/.test(name),
);

describe('cœur pur', () => {
  it.each(coreFiles)('%s ne fait ni I/O, ni appel à l’horloge ou au hasard global', (name) => {
    const source = readFileSync(`${SRC}${name}`, 'utf8');
    for (const [, specifier] of source.matchAll(/from\s+'([^']+)'/g)) {
      expect(specifier, `${name} importe ${specifier}`).toMatch(/^\.\/[a-z0-9-]+$/);
    }
    expect(source).not.toMatch(/\bMath\.random\b|\bDate\b|\bprocess\b|\bperformance\.now\b|\brequire\(|\bimport\(/);
  });

  it('couvre les modules attendus', () => {
    expect(coreFiles.sort()).toEqual([
      'canonical-json.ts',
      'generate.ts',
      'index.ts',
      'random.ts',
      'sha256.ts',
      'universities.ts',
    ]);
  });
});
