import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { ScreenFallback } from '../../../ui/lazy/DelayedFallback';
import { lazyNamed } from '../../../ui/lazy/lazyNamed';
import { useWindMapPoints } from '../hooks/useWindForecast';
import type { WindPoint } from '../types/climaWind';
import { generateWindGrid } from '../utils/windGrid';

// O Leaflet só é baixado quando o mapa abre (DESIGN.md P11).
const WindMapLeaflet = lazyNamed(() => import('./WindMapLeaflet'), 'WindMapLeaflet');

// Nomes de lugares: não são traduzidos (AGENTS.md §12.3).
const NAMED_POINTS: WindPoint[] = [
  { id: 'jeri', name: 'Jericoacoara', lat: -2.796, lng: -40.508 },
  { id: 'prea', name: 'Preá', lat: -2.812, lng: -40.415 },
  { id: 'barrinha', name: 'Barrinha', lat: -2.805, lng: -40.38 },
  { id: 'tatajuba', name: 'Tatajuba', lat: -2.845, lng: -40.685 },
  { id: 'acarau', name: 'Acaraú', lat: -2.885, lng: -40.115 },
];
const ALL_WIND_POINTS: WindPoint[] = [...generateWindGrid(-2.83, -40.48, 7, 0.08), ...NAMED_POINTS];

interface WindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mapa do vento numa folha (D33). Arrastar dentro do mapa mexe no mapa: a folha só fecha arrastando
 * pelo título ou pelo `X` (`data-gesture-ignore`).
 */
export function WindMapModal({ isOpen, onClose }: WindMapModalProps) {
  const { t } = useTranslation();
  const { points, error } = useWindMapPoints(ALL_WIND_POINTS, isOpen);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={t('wind.map.title')}
      className="sm:max-w-3xl"
    >
      {error && <p className="mb-3 text-meta text-warn">{t('wind.map.error')}</p>}
      <div
        data-gesture-ignore=""
        className="relative h-[60dvh] rounded-card overflow-hidden border border-line"
      >
        <Suspense fallback={<ScreenFallback />}>
          <WindMapLeaflet points={points} />
        </Suspense>
      </div>
    </Dialog>
  );
}
