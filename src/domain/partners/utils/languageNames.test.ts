import { describe, expect, it } from 'vitest';
import { languageDisplayName, storedLanguageName } from './languageNames';

describe('nomes de idiomas (D34)', () => {
  it('grava em português, com inicial maiúscula, como a lista do cadastro', () => {
    expect(storedLanguageName('pt')).toBe('Português');
    expect(storedLanguageName('en')).toBe('Inglês');
    expect(storedLanguageName('ja')).toBe('Japonês');
  });

  it('mostra o idioma gravado no idioma de quem lê', () => {
    expect(languageDisplayName('Inglês', 'pt-BR')).toBe('Inglês');
    expect(languageDisplayName('Inglês', 'en')).toBe('English');
    expect(languageDisplayName('Alemão', 'fr')).toBe('Allemand');
    expect(languageDisplayName('Libras', 'en')).toBe('Libras');
  });
});
