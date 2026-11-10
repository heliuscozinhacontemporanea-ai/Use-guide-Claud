import { Bike, Calendar, Camera, Car, ChevronRight, Compass, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import {
  type AddSegmentOption,
  addSegmentOptions,
  type PartnerSegment,
} from '../../utils/partnerSegments';

const ICONS: Record<AddSegmentOption, ReactNode> = {
  tours: <Compass size={20} aria-hidden="true" />,
  rentals: <Bike size={20} aria-hidden="true" />,
  transfers: <Car size={20} aria-hidden="true" />,
  attraction: <Camera size={20} aria-hidden="true" />,
  events: <Calendar size={20} aria-hidden="true" />,
  showcase: <Store size={20} aria-hidden="true" />,
};

/** Folha "Também trabalha com…?" (S3): escolher um segmento abre o cadastro dele. */
export function AddSegmentSheet({
  open,
  onOpenChange,
  segments,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segments: readonly PartnerSegment[];
  /** Categorias que o cadastro aberto aceita (uma só já vem escolhida). */
  onChoose: (categories: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('partnerAddSegment.title')}
      description={t('partnerAddSegment.description')}
    >
      <ul className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line overflow-hidden">
        {addSegmentOptions(segments).map((row) => {
          const content = (
            <>
              <span className="w-11 h-11 shrink-0 rounded-xl bg-surface border border-line flex items-center justify-center text-ink/80">
                {ICONS[row.id]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-semibold text-ink">
                  {t(`partnerAddSegment.rows.${row.id}.title`)}
                </span>
                <span className="block text-[13px] text-ink/70">
                  {t(`partnerAddSegment.rows.${row.id}.hint`)}
                </span>
              </span>
            </>
          );
          return (
            <li key={row.id}>
              {row.has ? (
                <div className="px-4 py-3 min-h-16 flex items-center gap-3">
                  {content}
                  <span className="shrink-0 px-2.5 py-1 rounded-full border border-success-line bg-success-soft text-[13px] font-medium text-success">
                    {t('partnerAddSegment.have')}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onChoose(row.categories);
                  }}
                  className="press w-full px-4 py-3 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
                >
                  {content}
                  <ChevronRight size={18} className="shrink-0 text-ink/50" aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
