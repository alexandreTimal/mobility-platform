// Ligne de commande du générateur : la seule partie qui fait des I/O (lecture des
// universités, écriture du fichier). Toute la logique est dans le cœur pur.
//
//   pnpm data:students -- --seed 42 --scenario reference --out students.json

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { generate, SCENARIO_NAMES, serializeDataset } from './generate';
import { GeneratorInputError, normalizeUniversities, type University } from './universities';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DEFAULT_UNIVERSITIES = join(REPO_ROOT, 'data', 'raw');

const USAGE = `Génère des étudiants fictifs de façon reproductible.

Usage : pnpm data:students -- [options]

  --universities <chemin>  fichier JSON (tableau d'universités) ou dossier de *.json (défaut : data/raw)
  --seed <entier>          graine aléatoire (défaut : 42)
  --scenario <nom>         ${SCENARIO_NAMES.join(', ')} (défaut : reference)
  --count <entier>         nombre d'étudiants (défaut : 1000)
  --out <fichier>          fichier de sortie (défaut : sortie standard)
  --help                   affiche cette aide
`;

/** Lit un fichier JSON (tableau) ou tous les *.json d'un dossier, puis les normalise. */
export function loadUniversities(path: string): University[] {
  let files: string[];
  try {
    files = statSync(path).isDirectory()
      ? readdirSync(path)
          .filter((name) => name.endsWith('.json'))
          .sort()
          .map((name) => join(path, name))
      : [path];
  } catch {
    throw new GeneratorInputError(`fichier ou dossier introuvable : ${path}`);
  }
  if (files.length === 0) throw new GeneratorInputError(`aucun fichier JSON dans ${path}`);
  const universities: unknown[] = [];
  for (const file of files) {
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      throw new GeneratorInputError(`${file} : JSON illisible (${error instanceof Error ? error.message : error})`);
    }
    if (!Array.isArray(data)) throw new GeneratorInputError(`${file} : un tableau d'universités est attendu`);
    universities.push(...data);
  }
  return normalizeUniversities(universities);
}

function parseInteger(option: string, value: string | undefined, min?: number): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(n) || (min !== undefined && n < min)) {
    const bound = min === undefined ? '' : ` supérieur ou égal à ${min}`;
    throw new GeneratorInputError(`--${option} doit être un entier${bound} (reçu : "${value}")`);
  }
  return n;
}

export interface CliIo {
  /** Dossier contre lequel les chemins relatifs sont résolus. */
  readonly cwd: string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

/** Exécute la commande ; renvoie le code de sortie (0 si tout va bien). */
export function runCli(argv: readonly string[], io: CliIo): number {
  try {
    let values: Record<string, string | boolean | undefined>;
    try {
      ({ values } = parseArgs({
        args: argv[0] === '--' ? argv.slice(1) : [...argv],
        options: {
          universities: { type: 'string' },
          seed: { type: 'string' },
          scenario: { type: 'string' },
          count: { type: 'string' },
          out: { type: 'string' },
          help: { type: 'boolean' },
        },
        strict: true,
        allowPositionals: false,
      }));
    } catch (error) {
      throw new GeneratorInputError(
        `option inconnue ou incomplète (${error instanceof Error ? error.message : error}). Voir --help.`,
      );
    }
    if (values.help) {
      io.stdout(USAGE);
      return 0;
    }
    const str = (key: string): string | undefined => values[key] as string | undefined;
    const seed = parseInteger('seed', str('seed')) ?? 42;
    const count = parseInteger('count', str('count'), 1);
    const scenario = str('scenario') ?? 'reference';
    const source = str('universities');
    const universities = loadUniversities(source === undefined ? DEFAULT_UNIVERSITIES : resolve(io.cwd, source));
    const text = serializeDataset(generate(universities, seed, scenario, count));
    const out = str('out');
    if (out === undefined) {
      io.stdout(text);
    } else {
      const target = resolve(io.cwd, out);
      try {
        writeFileSync(target, text, 'utf8');
      } catch (error) {
        throw new GeneratorInputError(
          `impossible d'écrire ${target} (${error instanceof Error ? error.message : error})`,
        );
      }
    }
    return 0;
  } catch (error) {
    if (error instanceof GeneratorInputError) {
      io.stderr(`Erreur : ${error.message}\n`);
      return 2;
    }
    throw error;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runCli(process.argv.slice(2), {
    // pnpm lance le script depuis le dossier du package : INIT_CWD est le dossier d'appel.
    cwd: process.env.INIT_CWD ?? process.cwd(),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
