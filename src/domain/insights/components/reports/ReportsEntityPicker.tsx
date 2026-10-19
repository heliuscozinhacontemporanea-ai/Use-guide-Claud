import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
import type { ReportEntity } from '../../types/report';

interface ReportsEntityPickerProps {
  entities: ReportEntity[];
  onSelect: (entity: ReportEntity) => void;
}

export function ReportsEntityPicker({ entities, onSelect }: ReportsEntityPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-white/50 tracking-wide px-4">
        {t('insights.reports.pickTitle')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <button
            type="button"
            key={entity.id}
            onClick={() => onSelect(entity)}
            className="glassmorphism rounded-3xl p-5 flex items-center gap-4 text-left hover:bg-white/5 hover:border-amber-500/30 transition-all border border-white/5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-white/5 relative">
              {entity.image && (
                <img
                  src={entity.image}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <span
                className={cn(
                  'absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-widest text-black',
                  entity.type === 'items' ? 'bg-teal-500' : 'bg-[#00D4FF]'
                )}
              >
                {entity.type === 'items'
                  ? t('insights.reports.typeItem')
                  : t('insights.reports.typeEvent')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{entity.name}</h4>
                {entity.type === 'items' &&
                  entity.isVerified &&
                  !entity.isVerificationSuspended && (
                    <VerifiedBadge size="sm" className="text-[14px] flex-shrink-0" />
                  )}
              </div>
              <p className="text-[10px] text-white/50 font-semibold tracking-wide">
                {entity.location}
              </p>
            </div>
            <ChevronRight size={16} className="text-white/50" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
