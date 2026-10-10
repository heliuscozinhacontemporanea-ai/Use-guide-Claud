export interface SEOMetadata {
  title?: string | undefined;
  description?: string | undefined;
  keywords?: string[] | undefined;
  image?: string | undefined;
  imageAlt?: string | undefined;
  url?: string | undefined;
  type?: ('website' | 'article' | 'place' | 'event' | 'profile') | undefined;
  robots?: string | undefined;
  canonicalUrl?: string | undefined;
  author?: string | undefined;
  structuredData?: Record<string, any> | undefined;
}

interface DefaultSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  imageAlt: string;
  url: string;
  type: 'website' | 'article' | 'place' | 'event' | 'profile';
  robots: string;
  author: string;
}

const BASE_URL = 'https://useguide.com.br';
const DEFAULT_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0788355965.firebasestorage.app/o/Marca%2F412E6CA0-01A8-48B1-B07B-BA4233C81769.png?alt=media&token=ff7e5442-a701-4854-aefc-1e36bb5fbd34';

const DEFAULT_SEO: DefaultSEOMetadata = {
  title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
  description:
    'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
  keywords: [
    'Jericoacoara',
    'Preá',
    'Barrinha',
    'Kitesurf',
    'Vento tempo real',
    'Guia turístico',
    'Hospedagem Jeri',
    'Restaurantes Jeri',
    'Passeios Ceará',
  ],
  image: DEFAULT_IMAGE,
  imageAlt: 'Logomarca oficial Use Guide - Jericoacoara, Preá e Barrinha',
  url: BASE_URL,
  type: 'website',
  robots: 'index, follow',
  author: 'Use Guide',
};

export const ROUTE_SEO_CONFIG: Record<string, SEOMetadata> = {
  '/': {
    title: 'Explorar Jeri, Preá & Barrinha',
    description:
      'Guia interativo com mapa, previsão de vento em tempo real, gastronomia e os melhores locais de Jericoacoara, Preá e Barrinha.',
    canonicalUrl: `${BASE_URL}/`,
  },
  '/eventos': {
    title: 'Eventos & Experiências',
    description:
      'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
    keywords: ['eventos jeri', 'sunset jericoacoara', 'festas prea', 'shows jeri'],
    canonicalUrl: `${BASE_URL}/eventos`,
    type: 'event',
  },
  '/passeios': {
    title: 'Aventura & Passeios',
    description:
      'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
    keywords: ['passeio de buggy', 'lagoa do paraiso', 'tatajuba', 'buraco azul', 'dunas jeri'],
    canonicalUrl: `${BASE_URL}/passeios`,
    type: 'place',
  },
  '/pousadas': {
    title: 'Melhores Hospedagens & Pousadas',
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
    title: 'Sabores Locais & Gastronomia',
    description:
      'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
    keywords: ['restaurantes jericoacoara', 'gastronomia jeri', 'frutos do mar prea', 'bares jeri'],
    canonicalUrl: `${BASE_URL}/restaurantes`,
    type: 'place',
  },
  '/pontos': {
    title: 'Atrações & Pontos Turísticos',
    description:
      'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
    keywords: ['pedra furada', 'duna do por do sol', 'arvore da preguica', 'atracoes jeri'],
    canonicalUrl: `${BASE_URL}/pontos`,
    type: 'place',
  },
  '/info': {
    title: 'Guia Prático & Dicas Úteis',
    description:
      'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
    keywords: ['como chegar em jeri', 'taxa turismo jericoacoara', 'dicas uteis jeri'],
    canonicalUrl: `${BASE_URL}/info`,
  },
  '/admin': {
    title: 'Painel Administrativo',
    description: 'Área de gestão e moderação de conteúdo do Use Guide.',
    robots: 'noindex, nofollow',
  },
  '/reset-password': {
    title: 'Recuperar Senha',
    description: 'Redefinição de senha de acesso ao Use Guide.',
    robots: 'noindex, nofollow',
  },
};

function toAbsoluteUrl(url: string | undefined): string {
  if (!url) return BASE_URL;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : BASE_URL;
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

function getOrCreateMetaTag(attributeName: string, attributeValue: string): HTMLMetaElement {
  let element = document.querySelector<HTMLMetaElement>(
    `meta[${attributeName}="${attributeValue}"]`
  );
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  return element;
}

function getOrCreateLinkTag(rel: string): HTMLLinkElement {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  return element;
}

function updateStructuredData(schema: Record<string, any>): void {
  let script = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'schema-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function updateDocumentSEO(metadata: SEOMetadata = {}): void {
  if (typeof document === 'undefined') return;

  const resolvedTitle = metadata.title
    ? metadata.title.includes('Use Guide')
      ? metadata.title
      : `${metadata.title} | Use Guide`
    : DEFAULT_SEO.title;

  document.title = resolvedTitle;

  const description = metadata.description || DEFAULT_SEO.description;
  const keywords =
    metadata.keywords && metadata.keywords.length > 0
      ? metadata.keywords.join(', ')
      : DEFAULT_SEO.keywords.join(', ');
  const rawImage = metadata.image || DEFAULT_SEO.image;
  const image = toAbsoluteUrl(rawImage);
  const imageAlt = metadata.imageAlt || `${resolvedTitle} - Use Guide`;
  const url =
    metadata.url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SEO.url);
  const type = metadata.type || DEFAULT_SEO.type;
  const robots = metadata.robots || DEFAULT_SEO.robots;
  const author = metadata.author || DEFAULT_SEO.author;

  getOrCreateMetaTag('name', 'title').setAttribute('content', resolvedTitle);
  getOrCreateMetaTag('name', 'description').setAttribute('content', description);
  getOrCreateMetaTag('name', 'keywords').setAttribute('content', keywords);
  getOrCreateMetaTag('name', 'author').setAttribute('content', author);
  getOrCreateMetaTag('name', 'robots').setAttribute('content', robots);
  getOrCreateMetaTag('name', 'theme-color').setAttribute('content', '#0d1b2a');

  getOrCreateMetaTag('property', 'og:title').setAttribute('content', resolvedTitle);
  getOrCreateMetaTag('property', 'og:description').setAttribute('content', description);
  getOrCreateMetaTag('property', 'og:image').setAttribute('content', image);
  getOrCreateMetaTag('property', 'og:image:secure_url').setAttribute('content', image);
  getOrCreateMetaTag('property', 'og:image:alt').setAttribute('content', imageAlt);
  getOrCreateMetaTag('property', 'og:image:width').setAttribute('content', '1200');
  getOrCreateMetaTag('property', 'og:image:height').setAttribute('content', '630');
  getOrCreateMetaTag('property', 'og:url').setAttribute('content', url);
  getOrCreateMetaTag('property', 'og:type').setAttribute('content', type);
  getOrCreateMetaTag('property', 'og:site_name').setAttribute('content', 'Use Guide');
  getOrCreateMetaTag('property', 'og:locale').setAttribute('content', 'pt_BR');

  getOrCreateMetaTag('name', 'twitter:card').setAttribute('content', 'summary_large_image');
  getOrCreateMetaTag('name', 'twitter:url').setAttribute('content', url);
  getOrCreateMetaTag('name', 'twitter:title').setAttribute('content', resolvedTitle);
  getOrCreateMetaTag('name', 'twitter:description').setAttribute('content', description);
  getOrCreateMetaTag('name', 'twitter:image').setAttribute('content', image);
  getOrCreateMetaTag('name', 'twitter:image:alt').setAttribute('content', imageAlt);

  const canonical = metadata.canonicalUrl || url;
  if (canonical) {
    getOrCreateLinkTag('canonical').setAttribute('href', canonical);
  }

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'event' ? 'Event' : type === 'place' ? 'TouristDestination' : 'WebSite',
    name: resolvedTitle,
    description: description,
    url: url,
    image: image,
  };

  updateStructuredData(metadata.structuredData || defaultSchema);
}
