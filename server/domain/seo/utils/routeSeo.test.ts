import { describe, expect, it } from 'vitest';
import { resources } from '../../../../src/shared/i18n/resources';
import { ROUTE_SEO_TEXTS } from './routeSeo';

describe('paridade dos textos de SEO frontend × backend', () => {
  it('títulos e descrições por rota e idioma são iguais aos do i18n', () => {
    for (const [locale, bundle] of Object.entries(resources)) {
      const frontend = bundle.translation.seo.routes;
      for (const [routeKey, texts] of Object.entries(ROUTE_SEO_TEXTS)) {
        expect(texts[locale as keyof typeof texts]).toEqual(
          frontend[routeKey as keyof typeof frontend]
        );
      }
    }
  });
});
