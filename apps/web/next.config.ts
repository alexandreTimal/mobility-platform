import { existsSync } from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';

// Le `.env` est unique, à la racine du dépôt (créé par `pnpm bootstrap`).
// Next.js ne lit que celui de `apps/web` : on charge donc celui de la racine.
const rootEnv = path.resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

// En-têtes de sécurité définis une seule fois pour tout le site (AD-5).
// La CSP complète (scripts, styles, connexions Supabase) sera durcie avec l'auth (#11).
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@mobility/shared', '@mobility/db'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
