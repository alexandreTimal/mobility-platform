import { describe, expect, it } from 'vitest';
import nextConfig from './next.config';

describe('next.config', () => {
  it('applique les en-têtes de sécurité à toutes les routes', async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const all = rules.find((rule) => rule.source === '/:path*');
    expect(all).toBeDefined();
    const headers = Object.fromEntries((all?.headers ?? []).map(({ key, value }) => [key, value]));

    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(headers).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
  });

  it('masque l’en-tête X-Powered-By', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
