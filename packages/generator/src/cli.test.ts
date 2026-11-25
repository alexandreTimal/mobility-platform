import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadUniversities, runCli } from './cli';
import { FIXTURE, UNIS } from './fixture.test-utils';
import { generate, serializeDataset } from './generate';

let dir: string;
let out: string[];
let err: string[];
const io = () => ({
  cwd: dir,
  stdout: (text: string) => out.push(text),
  stderr: (text: string) => err.push(text),
});

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'generator-'));
  out = [];
  err = [];
  writeFileSync(join(dir, 'u.json'), JSON.stringify(FIXTURE), 'utf8');
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('loadUniversities', () => {
  it("lit tous les *.json d'un dossier, sans dépendre de l'ordre des fichiers", () => {
    const folder = mkdtempSync(join(dir, 'raw-'));
    writeFileSync(join(folder, 'b.json'), JSON.stringify(FIXTURE.slice(0, 15).reverse()), 'utf8');
    writeFileSync(join(folder, 'a.json'), JSON.stringify(FIXTURE.slice(15)), 'utf8');
    writeFileSync(join(folder, 'notes.txt'), 'ignoré', 'utf8');
    expect(loadUniversities(folder)).toEqual(UNIS);
  });

  it('refuse un fichier qui ne contient pas un tableau', () => {
    writeFileSync(join(dir, 'objet.json'), '{}', 'utf8');
    expect(() => loadUniversities(join(dir, 'objet.json'))).toThrow(/un tableau d'universités est attendu/);
  });

  it('signale un chemin introuvable ou un dossier vide', () => {
    expect(() => loadUniversities(join(dir, 'absent'))).toThrow(/introuvable/);
    expect(() => loadUniversities(mkdtempSync(join(dir, 'vide-')))).toThrow(/aucun fichier JSON/);
  });
});

describe('runCli', () => {
  it('écrit le fichier demandé, identique à la génération en mémoire', () => {
    expect(runCli(['--universities', 'u.json', '--count', '20', '--out', 's.json'], io())).toBe(0);
    expect(readFileSync(join(dir, 's.json'), 'utf8')).toBe(serializeDataset(generate(UNIS, 42, 'reference', 20)));
  });

  it('écrit sur la sortie standard sans --out, en tenant compte de la graine et du scénario', () => {
    const args = ['--', '--universities', 'u.json', '--seed', '7', '--scenario', 'cohorte-faible-anglais'];
    expect(runCli([...args, '--count', '5'], io())).toBe(0);
    expect(out.join('')).toBe(serializeDataset(generate(UNIS, 7, 'cohorte-faible-anglais', 5)));
  });

  it('affiche une erreur en français et sort avec le code 2', () => {
    expect(runCli(['--universities', 'u.json', '--count', '0'], io())).toBe(2);
    expect(runCli(['--universities', 'u.json', '--seed', 'abc'], io())).toBe(2);
    expect(runCli(['--universities', 'u.json', '--scenario', 'inexistant'], io())).toBe(2);
    expect(runCli(['--inconnue'], io())).toBe(2);
    expect(err).toHaveLength(4);
    expect(err[0]).toMatch(/^Erreur : --count doit être un entier supérieur ou égal à 1/);
    expect(err[1]).toMatch(/^Erreur : --seed doit être un entier/);
    expect(err[2]).toMatch(/^Erreur : scénario inconnu/);
    expect(err[3]).toMatch(/^Erreur : option inconnue/);
  });

  it('affiche son aide', () => {
    expect(runCli(['--help'], io())).toBe(0);
    expect(out.join('')).toMatch(/--scenario <nom>/);
  });
});
