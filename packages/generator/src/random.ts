// Générateur pseudo-aléatoire seedé et lois de probabilité (AD-6).
//
// Le hasard vient uniquement de sfc32 (« Small Fast Counting », Chris Doty-Humphrey,
// suite de tests PractRand) : un générateur 32 bits bien étudié, écrit ici en entier
// pour que le résultat ne dépende ni de la plateforme ni de la version de Node.
// Toutes les lois (normale, Gumbel, gamma, bêta) sont calculées à partir de ses
// tirages uniformes, comme dans la version Python du générateur.

const TWO_POW_32 = 2 ** 32;
const TWO_POW_53 = 2 ** 53;

export interface Random {
  /** Uniforme dans [0, 1[, avec 53 bits de précision. */
  next(): number;
}

/**
 * sfc32 initialisé avec une graine entière (entier sûr, éventuellement négatif).
 *
 * Initialisation à la manière de PractRand : a = 0, b = 32 bits de poids faible de la
 * graine, c = 32 bits de poids fort (complément à deux), compteur = 1, puis 12 tirages
 * jetés pour bien mélanger l'état.
 */
export function createRandom(seed: number): Random {
  if (!Number.isSafeInteger(seed)) {
    throw new RangeError(`graine invalide : ${seed} (un entier est attendu)`);
  }
  let a = 0;
  let b = seed >>> 0;
  let c = Math.floor(seed / TWO_POW_32) >>> 0;
  let counter = 1;

  const next32 = (): number => {
    const t = (((a + b) | 0) + counter) | 0;
    counter = (counter + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return t >>> 0;
  };

  for (let i = 0; i < 12; i++) next32();

  return {
    next(): number {
      const high = next32() >>> 5; // 27 bits
      const low = next32() >>> 6; // 26 bits
      return (high * 2 ** 26 + low) / TWO_POW_53;
    },
  };
}

/** Uniforme dans ]0, 1[ (évite log(0)). */
export function uniformOpen(rng: Random): number {
  let u = rng.next();
  while (u === 0) u = rng.next();
  return u;
}

/** Loi normale centrée réduite (Box-Muller). */
export function normal(rng: Random): number {
  const u1 = uniformOpen(rng);
  const u2 = rng.next();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Loi de Gumbel standard. */
export function gumbel(rng: Random): number {
  return -Math.log(-Math.log(uniformOpen(rng)));
}

/** Loi gamma (Marsaglia-Tsang), forme ≥ 1. */
export function gamma(rng: Random, shape: number): number {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    const x = normal(rng);
    const v = (1 + c * x) ** 3;
    if (v > 0 && Math.log(uniformOpen(rng)) < 0.5 * x * x + d - d * v + d * Math.log(v)) {
      return d * v;
    }
  }
}

/** Loi bêta, à partir de deux lois gamma. */
export function beta(rng: Random, a: number, b: number): number {
  const x = gamma(rng, a);
  const y = gamma(rng, b);
  return x / (x + y);
}
