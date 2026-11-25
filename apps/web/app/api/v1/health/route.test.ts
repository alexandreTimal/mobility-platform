import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/v1/health', () => {
  it('répond 200 {"status":"ok"}', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
