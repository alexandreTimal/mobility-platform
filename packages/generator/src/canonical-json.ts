// Sérialisation JSON canonique : clés d'objet triées, nombres au format de
// JSON.stringify. Les mêmes données donnent toujours le même texte, octet pour octet,
// quel que soit l'ordre d'insertion des clés (JSON.stringify seul ne le garantit pas :
// il place les clés numériques en premier).

export type Json = null | boolean | number | string | readonly Json[] | { readonly [key: string]: Json };

/**
 * Texte JSON canonique. Sans `indent`, il est compact (empreintes) ; avec `indent`,
 * il est indenté de ce nombre d'espaces (fichiers lisibles).
 */
export function canonicalJson(value: Json, indent = 0): string {
  return write(value, indent, '');
}

function write(value: Json, indent: number, padding: string): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new RangeError(`nombre non représentable en JSON : ${value}`);
    return JSON.stringify(value);
  }
  const inner = indent > 0 ? padding + ' '.repeat(indent) : '';
  const newline = indent > 0 ? '\n' : '';
  const colon = indent > 0 ? ': ' : ':';
  let items: string[];
  let open: string;
  let close: string;
  if (Array.isArray(value)) {
    items = (value as readonly Json[]).map((item) => inner + write(item, indent, inner));
    [open, close] = ['[', ']'];
  } else {
    const object = value as { readonly [key: string]: Json };
    items = Object.keys(object)
      .sort()
      .map((key) => inner + JSON.stringify(key) + colon + write(object[key] as Json, indent, inner));
    [open, close] = ['{', '}'];
  }
  if (items.length === 0) return open + close;
  return open + newline + items.join(`,${newline}`) + newline + padding + close;
}
