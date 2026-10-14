import type { Locale } from '../../../shared/kernel/locale';
import type { RouteKey } from '../../../shared/kernel/localizedRoutes';
import type { SeoGuideCategory, SeoMetadata } from '../types/seoTypes';

export const SITE_URL = 'https://useguide.com.br';

export const DEFAULT_SEO_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0788355965.firebasestorage.app/o/Marca%2F412E6CA0-01A8-48B1-B07B-BA4233C81769.png?alt=media&token=ff7e5442-a701-4854-aefc-1e36bb5fbd34';

/** Rota de listagem usada como URL canônica dos itens de cada categoria. */
export const CATEGORY_ROUTE_KEY: Record<SeoGuideCategory | 'event', RouteKey> = {
  restaurant: 'restaurants',
  hotel: 'stays',
  tour: 'tours',
  sight: 'attractions',
  tips: 'guide',
  event: 'events',
};

export const OG_LOCALE: Record<Locale, string> = { 'pt-BR': 'pt_BR', en: 'en_US', fr: 'fr_FR' };

type RouteText = { title: string; description: string };

/**
 * Títulos e descrições por rota e idioma. Iguais a `seo.routes` de src/shared/i18n/resources.ts
 * (o teste de paridade compara os dois).
 */
export const ROUTE_SEO_TEXTS: Record<RouteKey, Record<Locale, RouteText>> = {
  explore: {
    'pt-BR': {
      title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
      description:
        'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
    },
    en: {
      title: 'Use Guide | Jericoacoara, Preá & Barrinha Travel Guide',
      description:
        'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
    },
    fr: {
      title: 'Use Guide | Guide de Jericoacoara, Preá et Barrinha',
      description:
        'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
    },
  },
  events: {
    'pt-BR': {
      title: 'Eventos & Experiências | Use Guide',
      description:
        'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
    },
    en: {
      title: 'Events & Experiences | Use Guide',
      description:
        'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
    },
    fr: {
      title: 'Événements & Expériences | Use Guide',
      description:
        'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
    },
  },
  tours: {
    'pt-BR': {
      title: 'Aventura & Passeios | Use Guide',
      description:
        'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
    },
    en: {
      title: 'Adventure & Tours | Use Guide',
      description:
        'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
    },
    fr: {
      title: 'Aventure & Excursions | Use Guide',
      description:
        'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
    },
  },
  stays: {
    'pt-BR': {
      title: 'Melhores Hospedagens & Pousadas | Use Guide',
      description:
        'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
    },
    en: {
      title: 'Best Stays & Inns | Use Guide',
      description:
        'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
    },
    fr: {
      title: 'Meilleurs Hébergements | Use Guide',
      description:
        'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
    },
  },
  restaurants: {
    'pt-BR': {
      title: 'Sabores Locais & Gastronomia | Use Guide',
      description:
        'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
    },
    en: {
      title: 'Local Flavors & Dining | Use Guide',
      description:
        'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
    },
    fr: {
      title: 'Saveurs Locales & Gastronomie | Use Guide',
      description:
        'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
    },
  },
  attractions: {
    'pt-BR': {
      title: 'Atrações & Pontos Turísticos | Use Guide',
      description:
        'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
    },
    en: {
      title: 'Attractions & Landmarks | Use Guide',
      description:
        'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
    },
    fr: {
      title: 'Attractions & Sites Touristiques | Use Guide',
      description:
        'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
    },
  },
  guide: {
    'pt-BR': {
      title: 'Guia Prático & Dicas Úteis | Use Guide',
      description:
        'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
    },
    en: {
      title: 'Practical Guide & Tips | Use Guide',
      description:
        'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
    },
    fr: {
      title: 'Guide Pratique & Conseils | Use Guide',
      description:
        "Tout ce qu'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.",
    },
  },
};

/** Rotas fora do mapa de idiomas: nunca indexadas. */
export const NON_LOCALIZED_ROUTE_SEO: Record<string, SeoMetadata> = {
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
