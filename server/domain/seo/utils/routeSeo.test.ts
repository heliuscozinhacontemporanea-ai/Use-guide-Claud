import { describe, expect, it } from 'vitest';
import { ptBR } from '../../../../src/shared/i18n/resources';
import { en } from '../../../../src/shared/i18n/resources.en';
import { fr } from '../../../../src/shared/i18n/resources.fr';
import { ROUTE_SEO_TEXTS } from './routeSeo';

describe('paridade dos textos de SEO frontend × backend', () => {
  it('títulos e descrições por rota e idioma são iguais aos do i18n', () => {
    for (const [locale, translation] of Object.entries({ 'pt-BR': ptBR, en, fr })) {
      const frontend = translation.seo.routes;
      for (const [routeKey, texts] of Object.entries(ROUTE_SEO_TEXTS)) {
        expect(texts[locale as keyof typeof texts]).toEqual(
          frontend[routeKey as keyof typeof frontend]
        );
      }
    }
  });
});
