import path from 'path';
import fs from 'fs';

export interface ServerSEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'place' | 'event' | 'profile';
  robots?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

const BASE_URL = 'https://useguide.com.br';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=630&q=80';

const SERVER_ROUTE_SEO: Record<string, ServerSEOMetadata> = {
  '/': {
    title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
    description:
      'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
    canonicalUrl: `${BASE_URL}/`,
    type: 'website',
  },
  '/eventos': {
    title: 'Eventos & Experiências | Use Guide',
    description:
      'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
    keywords: ['eventos jeri', 'sunset jericoacoara', 'festas prea', 'shows jeri'],
    canonicalUrl: `${BASE_URL}/eventos`,
    type: 'event',
  },
  '/passeios': {
    title: 'Aventura & Passeios | Use Guide',
    description:
      'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
    keywords: ['passeio de buggy', 'lagoa do paraiso', 'tatajuba', 'buraco azul', 'dunas jeri'],
    canonicalUrl: `${BASE_URL}/passeios`,
    type: 'place',
  },
  '/pousadas': {
    title: 'Melhores Hospedagens & Pousadas | Use Guide',
    description:
      'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
    keywords: [
      'pousadas jericoacoara',
      'hotel boutique prea',
      'onde ficar em jeri',
      'resorts jeri',
    ],
    canonicalUrl: `${BASE_URL}/pousadas`,
    type: 'place',
  },
  '/restaurantes': {
    title: 'Sabores Locais & Gastronomia | Use Guide',
    description:
      'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
    keywords: ['restaurantes jericoacoara', 'gastronomia jeri', 'frutos do mar prea', 'bares jeri'],
    canonicalUrl: `${BASE_URL}/restaurantes`,
    type: 'place',
  },
  '/pontos': {
    title: 'Atrações & Pontos Turísticos | Use Guide',
    description:
      'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
    keywords: ['pedra furada', 'duna do por do sol', 'arvore da preguica', 'atracoes jeri'],
    canonicalUrl: `${BASE_URL}/pontos`,
    type: 'place',
  },
  '/info': {
    title: 'Guia Prático & Dicas Úteis | Use Guide',
    description:
      'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
    keywords: ['como chegar em jeri', 'taxa turismo jericoacoara', 'dicas uteis jeri'],
    canonicalUrl: `${BASE_URL}/info`,
    type: 'website',
  },
  '/admin': {
    title: 'Painel Administrativo | Use Guide',
    description: 'Área de gestão e moderação de conteúdo do Use Guide.',
    robots: 'noindex, nofollow',
    type: 'website',
  },
  '/reset-password': {
    title: 'Recuperar Senha | Use Guide',
    description: 'Redefinição de senha de acesso ao Use Guide.',
    robots: 'noindex, nofollow',
    type: 'website',
  },
};

export class ServerSeoService {
  private cachedHtml: string | null = null;

  getMetadataForRoute(reqPath: string, query: Record<string, any> = {}): ServerSEOMetadata {
    const normalizedPath =
      reqPath.endsWith('/') && reqPath.length > 1 ? reqPath.slice(0, -1) : reqPath;
    const baseConfig = SERVER_ROUTE_SEO[normalizedPath] || SERVER_ROUTE_SEO['/']!;

    let meta: ServerSEOMetadata = { ...baseConfig };

    if (query.item) {
      meta.title = `Detalhes do Local | Use Guide`;
      meta.description = `Veja informações completas, localização, fotos e avaliações no Use Guide.`;
      meta.canonicalUrl = `${BASE_URL}${normalizedPath}?item=${encodeURIComponent(query.item)}`;
    }

    if (query.partners === '1') {
      meta.title = 'Seja um Parceiro | Use Guide';
      meta.description =
        'Cadastre seu negócio e alcance milhares de turistas em Jericoacoara, Preá e Barrinha.';
    }

    if (query.admin === '1') {
      meta.title = 'Painel Administrativo | Use Guide';
      meta.description = 'Área de gestão e moderação de conteúdo do Use Guide.';
      meta.robots = 'noindex, nofollow';
    }

    return meta;
  }

  injectSeo(html: string, metadata: ServerSEOMetadata): string {
    const title = metadata.title;
    const description = metadata.description;
    const image = metadata.image || DEFAULT_IMAGE;
    const imageAlt = metadata.imageAlt || `${title} - Use Guide`;
    const url = metadata.canonicalUrl || metadata.url || BASE_URL;
    const type = metadata.type || 'website';
    const robots = metadata.robots || 'index, follow';

    let modifiedHtml = html;

    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    modifiedHtml = modifiedHtml.replace(
      /<meta name="title" content=".*?" \/>/i,
      `<meta name="title" content="${title}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta name="description" content=".*?" \/>/i,
      `<meta name="description" content="${description}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta name="robots" content=".*?" \/>/i,
      `<meta name="robots" content="${robots}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:title" content=".*?" \/>/i,
      `<meta property="og:title" content="${title}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:description" content=".*?" \/>/i,
      `<meta property="og:description" content="${description}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:url" content=".*?" \/>/i,
      `<meta property="og:url" content="${url}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image" content=".*?" \/>/i,
      `<meta property="og:image" content="${image}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:secure_url" content=".*?" \/>/i,
      `<meta property="og:image:secure_url" content="${image}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:alt" content=".*?" \/>/i,
      `<meta property="og:image:alt" content="${imageAlt}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:type" content=".*?" \/>/i,
      `<meta property="og:type" content="${type}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:title" content=".*?" \/>/i,
      `<meta name="twitter:title" content="${title}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:description" content=".*?" \/>/i,
      `<meta name="twitter:description" content="${description}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:image" content=".*?" \/>/i,
      `<meta name="twitter:image" content="${image}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:url" content=".*?" \/>/i,
      `<meta name="twitter:url" content="${url}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<link rel="canonical" href=".*?" \/>/i,
      `<link rel="canonical" href="${url}" />`
    );

    const schema = metadata.structuredData || {
      '@context': 'https://schema.org',
      '@type': type === 'event' ? 'Event' : type === 'place' ? 'TouristDestination' : 'WebSite',
      name: title,
      description: description,
      url: url,
      image: image,
    };

    const schemaScript = `<script id="schema-structured-data" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
    if (modifiedHtml.includes('<script id="schema-structured-data"')) {
      modifiedHtml = modifiedHtml.replace(
        /<script id="schema-structured-data"[\s\S]*?<\/script>/i,
        schemaScript
      );
    }

    return modifiedHtml;
  }

  getHydratedHtml(reqPath: string, query: Record<string, any> = {}): string {
    if (!this.cachedHtml) {
      const distPath = path.join(process.cwd(), 'dist', 'index.html');
      const rootPath = path.join(process.cwd(), 'index.html');
      const filePath = fs.existsSync(distPath) ? distPath : rootPath;
      this.cachedHtml = fs.readFileSync(filePath, 'utf-8');
    }

    const metadata = this.getMetadataForRoute(reqPath, query);
    return this.injectSeo(this.cachedHtml, metadata);
  }
}

export const serverSeoService = new ServerSeoService();
