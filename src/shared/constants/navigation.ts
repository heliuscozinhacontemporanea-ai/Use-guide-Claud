import { Compass, ConciergeBell, FerrisWheel } from 'lucide-react';
import type { RouteKey } from '../i18n';

export type NavTab = 'explore' | 'experiences' | 'services';

/** Barra inferior da D37: Explorar · Experiências · Serviços. */
export const NAVIGATION: ReadonlyArray<{
  tab: NavTab;
  routeKey: RouteKey;
  translationKey: string;
  icon: typeof Compass;
}> = [
  { tab: 'explore', routeKey: 'explore', translationKey: 'navigation.explore', icon: Compass },
  {
    tab: 'experiences',
    routeKey: 'experiences',
    translationKey: 'navigation.experiences',
    icon: FerrisWheel,
  },
  {
    tab: 'services',
    routeKey: 'services',
    translationKey: 'navigation.services',
    icon: ConciergeBell,
  },
];

/**
 * Pílulas de filtro de cada aba (D37 item 8): a primeira é a aba inteira; as outras são as páginas
 * das categorias, que continuam com URL própria. Dicas ficam na Explorar (D37 item 7).
 */
export const TAB_FILTERS: Record<
  Exclude<NavTab, 'explore'>,
  ReadonlyArray<{ routeKey: RouteKey; translationKey: string }>
> = {
  experiences: [
    { routeKey: 'experiences', translationKey: 'navigation.allExperiences' },
    { routeKey: 'tours', translationKey: 'navigation.tours' },
    { routeKey: 'events', translationKey: 'navigation.events' },
    { routeKey: 'attractions', translationKey: 'navigation.attractions' },
  ],
  services: [
    { routeKey: 'services', translationKey: 'navigation.allServices' },
    { routeKey: 'stays', translationKey: 'navigation.accommodations' },
    { routeKey: 'restaurants', translationKey: 'navigation.restaurants' },
    { routeKey: 'transfers', translationKey: 'navigation.transfers' },
    { routeKey: 'rentals', translationKey: 'navigation.rentals' },
  ],
};

const TAB_OF_ROUTE: Record<RouteKey, NavTab> = {
  explore: 'explore',
  guide: 'explore',
  experiences: 'experiences',
  tours: 'experiences',
  events: 'experiences',
  attractions: 'experiences',
  services: 'services',
  stays: 'services',
  restaurants: 'services',
  transfers: 'services',
  rentals: 'services',
};

/** Aba que fica acesa numa página: cada categoria pertence a uma aba. */
export function tabOfRoute(routeKey: RouteKey | null): NavTab | null {
  return routeKey ? TAB_OF_ROUTE[routeKey] : null;
}

const SCREEN_TITLE_KEY: Record<NavTab, string> = {
  explore: 'navigation.explore',
  experiences: 'navigation.experiences',
  services: 'navigation.services',
};

/** Nome da tela no topo principal (D37): o da aba; a página de dicas tem o próprio. */
export function screenTitleKey(routeKey: RouteKey | null): string | null {
  if (routeKey === 'guide') return 'navigation.tips';
  const tab = tabOfRoute(routeKey);
  return tab ? SCREEN_TITLE_KEY[tab] : null;
}
