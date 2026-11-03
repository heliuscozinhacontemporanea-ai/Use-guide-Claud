import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import licenses from './licenses.generated.json';

const root = path.resolve(__dirname, '../../../..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

describe('licenças das bibliotecas', () => {
  it('cobre toda dependência de produção, na versão instalada, com o texto da licença', () => {
    const byName = new Map(licenses.map((entry) => [entry.name, entry]));
    for (const name of Object.keys(pkg.dependencies)) {
      const installed = JSON.parse(
        readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8')
      ) as { version: string };
      const entry = byName.get(name);
      // Falhou? Rode `npm run licenses` depois de mudar dependências.
      expect(entry, name).toBeDefined();
      expect(entry?.version, name).toBe(installed.version);
      expect(entry?.license, name).not.toBe('');
      expect(entry?.text.length, name).toBeGreaterThan(200);
    }
    expect(licenses).toHaveLength(Object.keys(pkg.dependencies).length);
  });
});
