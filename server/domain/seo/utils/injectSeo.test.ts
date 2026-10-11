import { describe, expect, it } from 'vitest';
import { injectSeo } from './injectSeo';
import { DEFAULT_SEO_IMAGE } from './routeSeo';

const TEMPLATE = `<html lang="pt-BR"><head>
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:locale:alternate" content="en_US" />
    <link rel="alternate" hreflang="en" href="https://useguide.com.br/en" />
    <title>Padrão</title>
    <meta name="description" content="Padrão" />
    <meta property="og:title" content="Padrão" />
    <meta property="og:image" content="${DEFAULT_SEO_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <link rel="canonical" href="https://useguide.com.br" />
    <script id="schema-structured-data" type="application/ld+json">{"@type":"TouristDestination"}</script>
  </head><body></body></html>`;

describe('injectSeo', () => {
  it('não expande padrões de substituição como $& vindos do conteúdo', () => {
    const html = injectSeo(TEMPLATE, { title: 'Bar do Zé "$&" $1', description: 'd' });
    expect(html).toContain('<title>Bar do Zé &quot;$&amp;&quot; $1</title>');
    expect(html).toContain(
      '<meta property="og:title" content="Bar do Zé &quot;$&amp;&quot; $1" />'
    );
  });

  it('escapa HTML em todos os campos dinâmicos', () => {
    const html = injectSeo(TEMPLATE, {
      title: '<img src=x onerror=alert(1)>',
      description: '"><script>alert(1)</script>',
      canonicalUrl: 'https://useguide.com.br/restaurantes?item=a&type=item',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain(
      '<link rel="canonical" href="https://useguide.com.br/restaurantes?item=a&amp;type=item" />'
    );
  });

  it('insere a meta robots quando o template não tem a tag', () => {
    const html = injectSeo(TEMPLATE, { title: 't', description: 'd', robots: 'noindex, follow' });
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
    expect(html.indexOf('name="robots"')).toBeLessThan(html.indexOf('</head>'));
  });

  it('substitui o JSON-LD e remove as dimensões da imagem padrão quando a imagem muda', () => {
    const html = injectSeo(TEMPLATE, {
      title: 't',
      description: 'd',
      image: 'https://firebasestorage.googleapis.com/v0/b/x/o/y.webp',
      structuredData: { '@type': 'Restaurant', name: '</script>' },
    });
    expect(html).not.toContain('TouristDestination');
    expect(html).toContain('"@type":"Restaurant"');
    expect(html).not.toContain('og:image:width');
  });

  it('troca idioma, og:locale e alternates da home pelos da página', () => {
    const html = injectSeo(TEMPLATE, {
      title: 't',
      description: 'd',
      locale: 'fr',
      alternates: [
        { hreflang: 'pt-BR', href: 'https://useguide.com.br/eventos?item=a&type=event' },
        { hreflang: 'fr', href: 'https://useguide.com.br/fr/evenements?item=a&type=event' },
      ],
    });
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('<meta property="og:locale" content="fr_FR" />');
    expect(html).toContain('<meta property="og:locale:alternate" content="pt_BR" />');
    expect(html).toContain('<meta property="og:locale:alternate" content="en_US" />');
    expect(html).not.toContain('href="https://useguide.com.br/en"');
    expect(html).toContain(
      '<link rel="alternate" hreflang="fr" href="https://useguide.com.br/fr/evenements?item=a&amp;type=event" />'
    );
    expect(html.match(/og:locale:alternate/g)).toHaveLength(2);
  });
});
