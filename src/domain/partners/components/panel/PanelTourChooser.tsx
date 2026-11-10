import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { PANEL_TOUR_CHAPTERS } from '../../utils/panelTourSteps';
import type { PartnerPanelTab } from './partnerPanelTabs';

const ROW =
  'press w-full px-4 py-3 min-h-14 flex items-center gap-3 text-left text-[15px] font-semibold text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50';

/** "Ver o tour do painel" em Mais: do começo ou direto num capítulo, que segue até o fim. */
export function PanelTourChooser({
  open,
  onOpenChange,
  onStart,
  tabs,
  chapterLabel,
}: {
  /** Só os capítulos das abas que o parceiro tem (painel por segmento). */
  tabs?: readonly PartnerPanelTab[];
  chapterLabel?: (tab: PartnerPanelTab) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (chapter: number) => void;
}) {
  const { t } = useTranslation();
  const rows = [
    { id: 'start', label: t('partnerTour.fromStart'), chapter: 0 },
    ...PANEL_TOUR_CHAPTERS.map((chapter, index) => ({
      id: chapter.tab,
      label: chapterLabel?.(chapter.tab) ?? t(`partnerTour.chapters.${chapter.tab}`),
      chapter: index,
    })).filter((row) => !tabs || tabs.includes(row.id)),
  ];
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('partnerTour.chooserTitle')}
      description={t('partnerTour.chooserDescription')}
    >
      <ul className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line overflow-hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button type="button" className={ROW} onClick={() => onStart(row.chapter)}>
              <span className="flex-1 min-w-0">{row.label}</span>
              <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
