import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getLocaleDisplayLabel,
  normalizeLocale,
  persistLocale,
  resolvePreferredLocale,
} from './locale';
describe('locale', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it('normaliza variantes suportadas para os IDs canônicos', () => {
    expect(normalizeLocale('pt')).toBe('pt-BR');
    expect(normalizeLocale('pt-BR')).toBe('pt-BR');
    expect(normalizeLocale('pt_PT')).toBe('pt-BR');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('fr')).toBe('fr');
    expect(normalizeLocale('fr-FR')).toBe('fr');
  });
  it('rejeita idiomas não suportados', () => {
    expect(normalizeLocale('es')).toBeNull();
    expect(normalizeLocale('de-DE')).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
    expect(normalizeLocale(null)).toBeNull();
  });
  it('prioriza o locale persistido', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    expect(resolvePreferredLocale()).toBe('en');
  });
  it('usa pt-BR como fallback final', () => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['de-DE'],
    });
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'de-DE',
    });
    expect(resolvePreferredLocale()).toBe(DEFAULT_LOCALE);
  });
  it('persiste somente o locale canônico recebido', () => {
    persistLocale('pt-BR');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
  });
  it('traduz a lista de idiomas dinamicamente mantendo Português constante', () => {
    // Quando em Português
    expect(getLocaleDisplayLabel('pt-BR', 'pt-BR')).toBe('Português');
    expect(getLocaleDisplayLabel('en', 'pt-BR')).toBe('Inglês');
    expect(getLocaleDisplayLabel('fr', 'pt-BR')).toBe('Francês');

    // Quando em Inglês
    expect(getLocaleDisplayLabel('pt-BR', 'en')).toBe('Português');
    expect(getLocaleDisplayLabel('en', 'en')).toBe('English');
    expect(getLocaleDisplayLabel('fr', 'en')).toBe('French');

    // Quando em Francês
    expect(getLocaleDisplayLabel('pt-BR', 'fr')).toBe('Português');
    expect(getLocaleDisplayLabel('en', 'fr')).toBe('Anglais');
    expect(getLocaleDisplayLabel('fr', 'fr')).toBe('Français');
  });
});
