import { describe, expect, it } from 'vitest';
import { FICTIONAL_PARTNERSHIPS_NOTICE } from './index';

describe('FICTIONAL_PARTNERSHIPS_NOTICE', () => {
  it('reprend la mention exigée par le sujet', () => {
    expect(FICTIONAL_PARTNERSHIPS_NOTICE).toBe('Projet pédagogique : partenariats fictifs');
  });
});
