import { ChevronLeft, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { ErrorState } from '../../../ui/components/ErrorState';
import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
import type { GuideItem } from '../../guide';
import { useEntityReport } from '../hooks/useEntityReport';
import type { ReportEntity } from '../types/report';
import { PendingReviewsPanel } from './reports/PendingReviewsPanel';
import { ReportsEntityPicker } from './reports/ReportsEntityPicker';
import { ReportsStatsGrid } from './reports/ReportsStatsGrid';
import { ReportsViewsChart } from './reports/ReportsViewsChart';

interface ReportsViewProps {
  partnerId: string;
  items: GuideItem[];
  events: GuideItem[];
}

function toEntity(item: GuideItem, type: ReportEntity['type']): ReportEntity {
  return {
    id: item.id,
    type,
    name: item.name,
    image: item.image,
    location: item.location,
    isVerified: item.isVerified,
    isVerificationSuspended: item.isVerificationSuspended,
  };
}

export function ReportsView({ items, events }: ReportsViewProps) {
  const { t } = useTranslation();
  const entities = [
    ...items.map((item) => toEntity(item, 'items')),
    ...events.map((event) => toEntity(event, 'events')),
  ];
  const [selected, setSelected] = useState<ReportEntity | null>(
    entities.length === 1 ? (entities[0] ?? null) : null
  );
  const report = useEntityReport(selected);

  if (entities.length === 0) {
    return (
      <div className="py-20 text-center glassmorphism rounded-[2rem] border border-white/5">
        <p className="text-[11px] text-white/60 font-medium tracking-wide">
          {t('insights.reports.empty')}
        </p>
      </div>
    );
  }

  if (!selected) {
    return <ReportsEntityPicker entities={entities} onSelect={setSelected} />;
  }

  const canGoBack = entities.length > 1;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        {canGoBack ? (
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label={t('insights.reports.seeAllLabel')}
            className="p-3 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide">
              {t('insights.reports.seeAll')}
            </span>
          </button>
        ) : (
          <span />
        )}
        <div className="text-right min-w-0">
          <span
            className={cn(
              'inline-block mb-1 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest',
              selected.type === 'items'
                ? 'bg-accent-soft text-accent'
                : 'bg-[#00D4FF]/20 text-[#00D4FF]'
            )}
          >
            {selected.type === 'items'
              ? t('insights.reports.typeBusiness')
              : t('insights.reports.typeEvent')}
          </span>
          <h3 className="text-lg font-display font-black text-white tracking-tight flex items-center justify-end gap-1.5">
            <span className="truncate">{selected.name}</span>
            {selected.type === 'items' &&
              selected.isVerified &&
              !selected.isVerificationSuspended && (
                <VerifiedBadge size="md" className="text-[18px] flex-shrink-0" />
              )}
          </h3>
          <p className="text-[10px] text-warn font-semibold tracking-wide">
            {t('insights.reports.title')}
          </p>
        </div>
      </div>

      {report.loading ? (
        <div className="py-20 text-center" role="status">
          <div
            className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden="true"
          />
          <span className="sr-only">{t('insights.reports.loading')}</span>
        </div>
      ) : report.error ? (
        <ErrorState message={t('insights.reports.loadError')} onRetry={report.reload} />
      ) : report.statsLocked || !report.stats ? (
        <div className="space-y-8">
          <div className="p-6 rounded-[2rem] border border-warn-line bg-warn-soft flex items-start gap-3">
            <Lock size={18} className="text-warn shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                {t('insights.reports.planRequiredTitle')}
              </h4>
              <p className="text-xs text-warn leading-relaxed">
                {t('insights.reports.planRequired')}
              </p>
            </div>
          </div>
          <PendingReviewsPanel reviews={report.reviews} onReplied={report.markReplied} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ReportsStatsGrid stats={report.stats} />
          <ReportsViewsChart history={report.stats.history} />
          <PendingReviewsPanel reviews={report.reviews} onReplied={report.markReplied} />
        </motion.div>
      )}
    </div>
  );
}
