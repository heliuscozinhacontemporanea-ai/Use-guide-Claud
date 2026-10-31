import type { ReactNode } from 'react';
import { Route, Routes, type Location } from 'react-router-dom';
import { AdminPanelComposition } from '../compositions/AdminPanelComposition';
import { AccountActionPage } from '../../domain/auth';
import type { GuideItem } from '../../domain/guide';
import { ExploreView } from '../../domain/guide/components/ExploreView';
import { GridView } from '../../domain/guide/components/GridView';
import { ACCOUNT_ACTION_PATH } from '../../shared/constants/accountActionPath';
import { LOCALIZED_ROUTES, type RouteKey, SUPPORTED_LOCALES } from '../../shared/i18n';
import { NotFoundView } from '../../ui/components/NotFoundView';
import { PageLayout } from '../../ui/layouts/PageLayout';
import { CheckoutResultComposition } from '../compositions/CheckoutResultComposition';

type GridCategory =
  | 'event'
  | 'tour'
  | 'transfer'
  | 'rental'
  | 'hotel'
  | 'restaurant'
  | 'sight'
  | 'tips';

const GRID_CATEGORY: Record<Exclude<RouteKey, 'explore'>, GridCategory> = {
  events: 'event',
  tours: 'tour',
  transfers: 'transfer',
  rentals: 'rental',
  stays: 'hotel',
  restaurants: 'restaurant',
  attractions: 'sight',
  guide: 'tips',
};

interface AppRoutesProps {
  location: Location;
  onSelectItem: (item: GuideItem) => void;
  onStickyChange: (sticky: boolean) => void;
}

/** Uma <Route> por chave e idioma, geradas do mapa único de URLs (decisão D6). */
export function AppRoutes({ location, onSelectItem, onStickyChange }: AppRoutesProps) {
  const renderRoute = (routeKey: RouteKey): ReactNode => {
    if (routeKey === 'explore') {
      return (
        <PageLayout>
          <ExploreView onSelectItem={onSelectItem} onStickyChange={onStickyChange} />
        </PageLayout>
      );
    }
    return (
      <PageLayout>
        <GridView category={GRID_CATEGORY[routeKey]} onSelectItem={onSelectItem} />
      </PageLayout>
    );
  };

  return (
    <Routes location={location}>
      {(Object.keys(LOCALIZED_ROUTES) as RouteKey[]).flatMap((routeKey) =>
        SUPPORTED_LOCALES.map((locale) => (
          <Route
            key={`${routeKey}-${locale}`}
            path={LOCALIZED_ROUTES[routeKey][locale]}
            element={renderRoute(routeKey)}
          />
        ))
      )}
      <Route path="/checkout/result" element={<CheckoutResultComposition />} />
      <Route path="/admin" element={<AdminPanelComposition />} />
      <Route path={ACCOUNT_ACTION_PATH} element={<AccountActionPage />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}
