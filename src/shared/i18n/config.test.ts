import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
} from './locale';
import { i18n } from './config';
describe('i18n config', () => {
  afterEach(async () => {
    await i18n.changeLanguage(DEFAULT_LOCALE);
    window.localStorage.clear();
  });
  it('inicializa com um locale suportado', () => {
    expect(['pt-BR', 'en', 'fr']).toContain(i18n.language);
  });
  it('altera o idioma e persiste a preferência', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.resolvedLanguage).toBe('en');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
  it('possui recursos nos três idiomas', () => {
    expect(i18n.t('header.pageTitles.events', { lng: 'pt-BR' })).toBe(
      'Eventos & Experiências'
    );
    expect(i18n.t('header.pageTitles.events', { lng: 'en' })).toBe(
      'Events & Experiences'
    );
    expect(i18n.t('header.pageTitles.events', { lng: 'fr' })).toBe(
      'Événements & Expériences'
    );
  });
});
