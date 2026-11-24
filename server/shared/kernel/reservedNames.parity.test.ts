import { describe, expect, it } from 'vitest';
import * as frontend from '../../../src/shared/utils/reservedNames';
import { comparableName, mentionsUseGuide } from './reservedNames';

const SAMPLES = [
  'Use Guide Oficial',
  'Restaurante Us3 Guide',
  'U$E GUIDE',
  'use.guide',
  'Pousada Guide Jeri',
  'Cantinho do Preá',
  '1nst4.gram',
  'Instaaagram',
];

describe('nomes reservados (D35, item 10)', () => {
  it('frontend e backend comparam do mesmo jeito', () => {
    for (const sample of SAMPLES) {
      expect(frontend.comparableName(sample), sample).toBe(comparableName(sample));
      expect(frontend.mentionsUseGuide(sample), sample).toBe(mentionsUseGuide(sample));
    }
  });

  it('desfaz os disfarces e acha o Use Guide', () => {
    expect(comparableName('1nst4.gram')).toBe('instagram');
    expect(comparableName('Instaaagram')).toBe('instagram');
    expect(comparableName('Cantinho do Preá')).toBe('cantinhodoprea');
    expect(mentionsUseGuide('U$E GUIDE')).toBe(true);
    expect(mentionsUseGuide('Pousada Guide Jeri')).toBe(false);
  });
});
