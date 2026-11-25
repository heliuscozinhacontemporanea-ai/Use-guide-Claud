import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CREDITS } from './credits';

const fontsDir = path.resolve(__dirname, '../../../assets/fonts');

describe('créditos das fontes do app', () => {
  it('toda fonte servida pelo app tem o crédito com a licença OFL completa', () => {
    const families = readdirSync(fontsDir)
      .filter((file) => file.endsWith('.woff2'))
      .map((file) => file.replace(/-latin\.woff2$/, ''));
    expect(families.sort()).toEqual(['inter', 'outfit']);
    for (const family of families) {
      const credit = CREDITS.find((entry) => entry.id === family);
      const licenseFile = readdirSync(fontsDir).find(
        (file) => file.toLowerCase() === `${family}-ofl.txt`
      );
      expect(credit, family).toBeDefined();
      expect(licenseFile, family).toBeDefined();
      expect(credit?.license).toBe('OFL-1.1');
      expect(credit?.text).toBe(
        readFileSync(path.join(fontsDir, licenseFile ?? ''), 'utf8').trim()
      );
      expect(credit?.text).toContain('SIL OPEN FONT LICENSE Version 1.1');
    }
  });
});
