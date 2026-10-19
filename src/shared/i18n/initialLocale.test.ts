import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  isCrawler,
  resolveHomeRedirect,
  resolveInitialLocale,
  suggestedLocaleFor,
} from './initialLocale';
import { LOCALE_STORAGE_KEY } from './locale';

const BROWSER = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(navigator, 'languages', { configurable: true, value: languages });
  Object.defineProperty(navigator, 'language', { configurable: true, value: languages[0] });
}

describe('idioma na primeira visita (decisão D10)', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => setBrowserLanguages(['pt-BR']));

  it('reconhece robôs de busca e de pré-visualização de link', () => {
    expect(isCrawler(GOOGLEBOT)).toBe(true);
    expect(isCrawler('WhatsApp/2.23.20.0')).toBe(true);
    expect(isCrawler(BROWSER)).toBe(false);
  });

  it('a home vai para /en com o navegador em inglês', () => {
    setBrowserLanguages(['en-US', 'en']);
    expect(resolveHomeRedirect('/', '', BROWSER)).toBe('/en');
    expect(resolveHomeRedirect('/', '?utm_source=instagram', BROWSER)).toBe(
      '/en?utm_source=instagram'
    );
    expect(resolveInitialLocale('/', '', BROWSER)).toBe('en');
  });

  it('a escolha salva vale mais que o navegador', () => {
    setBrowserLanguages(['en-US']);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR');
    expect(resolveHomeRedirect('/', '', BROWSER)).toBeNull();
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    expect(resolveHomeRedirect('/', '', BROWSER)).toBe('/fr');
  });

  it('não redireciona robôs, navegador em português nem link para conteúdo', () => {
    setBrowserLanguages(['en-US']);
    expect(resolveHomeRedirect('/', '', GOOGLEBOT)).toBeNull();
    expect(resolveHomeRedirect('/', '?item=abc&type=items', BROWSER)).toBeNull();
    expect(resolveHomeRedirect('/eventos', '', BROWSER)).toBeNull();
    setBrowserLanguages(['pt-BR']);
    expect(resolveHomeRedirect('/', '', BROWSER)).toBeNull();
  });

  it('a URL com prefixo de idioma sempre vale', () => {
    setBrowserLanguages(['fr-FR']);
    expect(resolveInitialLocale('/en/events', '', BROWSER)).toBe('en');
    expect(resolveInitialLocale('/eventos', '', BROWSER)).toBe('pt-BR');
  });

  it('página em português aberta por link sugere o idioma da pessoa', () => {
    setBrowserLanguages(['en-US']);
    expect(suggestedLocaleFor('/eventos', BROWSER)).toBe('en');
    expect(suggestedLocaleFor('/en/events', BROWSER)).toBeNull();
    expect(suggestedLocaleFor('/admin', BROWSER)).toBeNull();
    expect(suggestedLocaleFor('/eventos', GOOGLEBOT)).toBeNull();
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR');
    expect(suggestedLocaleFor('/eventos', BROWSER)).toBeNull();
  });
});
