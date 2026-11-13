import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './locale';
import { ensureLocaleLoaded, i18n } from './config';
import { saveLocaleChoice } from './localeChoice';
describe('i18n config', () => {
  afterEach(async () => {
    await i18n.changeLanguage(DEFAULT_LOCALE);
    window.localStorage.clear();
  });
  it('inicializa com um locale suportado', () => {
    expect(['pt-BR', 'en', 'fr']).toContain(i18n.language);
  });
  it('troca o idioma e o <html lang> sem gravar a escolha (decisão D10)', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.resolvedLanguage).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('grava o idioma só quando a pessoa escolhe', () => {
    saveLocaleChoice('fr');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
  });
  it('possui recursos nos três idiomas; en e fr chegam sob demanda', async () => {
    await i18n.loadLanguages(['en', 'fr']);
    expect(i18n.t('header.pageTitles.events', { lng: 'pt-BR' })).toBe('Eventos & Experiências');
    expect(i18n.t('header.pageTitles.events', { lng: 'en' })).toBe('Events & Experiences');
    expect(i18n.t('header.pageTitles.events', { lng: 'fr' })).toBe('Événements & Expériences');
  });
  it('dois pedidos ao mesmo tempo esperam o idioma chegar (sem trocar o idioma da tela)', async () => {
    i18n.removeResourceBundle('fr', 'translation');
    const first = ensureLocaleLoaded('fr');
    // O segundo pedido, feito com o primeiro ainda a caminho, também só resolve com o idioma pronto.
    await ensureLocaleLoaded('fr');
    expect(i18n.getFixedT('fr')('header.pageTitles.events')).toBe('Événements & Expériences');
    expect(i18n.language).toBe(DEFAULT_LOCALE);
    await first;
  });
});
