import type { RouteKey } from '../../../../shared/i18n/localizedRoutes';
import type { GuideItem } from '../../types/guide';
import type { ExploreCardVariant } from './ExploreSection';

export interface ExploreSectionConfig {
  category: GuideItem['category'];
  title: string;
  route: RouteKey;
  variant: ExploreCardVariant;
  skeletonWrapClassName: string;
  skeletonClassName: string;
  emptyMessage?: string;
}

// TODO: títulos ainda em pt-BR fixo (débito B16); entram no namespace do guia na tradução da home.
export const EXPLORE_SECTIONS: readonly ExploreSectionConfig[] = [
  {
    category: 'event',
    title: 'Próximos Eventos',
    route: 'events',
    variant: 'banner',
    skeletonWrapClassName: 'min-w-[90vw] md:min-w-[700px] snap-center',
    skeletonClassName: 'aspect-[4/3] w-full rounded-3xl',
    emptyMessage: 'Nenhum evento agendado.',
  },
  {
    category: 'restaurant',
    title: 'Sabores Locais',
    route: 'restaurants',
    variant: 'square',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-square w-full rounded-3xl',
  },
  {
    category: 'hotel',
    title: 'Hospedagem',
    route: 'stays',
    variant: 'portrait',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-[3/4] w-full rounded-3xl',
  },
  {
    category: 'tour',
    title: 'Aventura & Passeios',
    route: 'tours',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'transfer',
    title: 'Translados & Transporte',
    route: 'transfers',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'rental',
    title: 'Aluguéis',
    route: 'rentals',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'sight',
    title: 'Atrações',
    route: 'attractions',
    variant: 'square',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-square w-full rounded-full',
  },
  {
    category: 'tips',
    title: 'Guia Prático',
    route: 'guide',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-[4/3] w-full rounded-2xl',
  },
];
