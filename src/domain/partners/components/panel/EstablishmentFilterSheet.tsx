import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { PartnerEstablishment } from '../../types/partnerHome';
import type { EstablishmentFilter } from '../../utils/partnerHomeFilter';
import { locationName } from '../../../../shared/utils/locationName';

function Radio({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center',
        on ? 'border-teal-400 bg-teal-400' : 'border-line'
      )}
    >
      {on && <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />}
    </span>
  );
}

/** "Mostrar no painel": todos ou um estabelecimento, e o atalho para criar outro (D27). */
export function EstablishmentFilterSheet({
  open,
  onOpenChange,
  establishments,
  pendingById,
  value,
  onChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishments: PartnerEstablishment[];
  pendingById: Record<string, number>;
  value: EstablishmentFilter;
  onChange: (value: EstablishmentFilter) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  const choose = (next: EstablishmentFilter) => {
    onChange(next);
    onOpenChange(false);
  };
  const row =
    'press w-full px-4 py-3 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50';
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('partnerPanel.filter.title')}
      description={t('partnerPanel.filter.description')}
    >
      <div className="space-y-4">
        <ul className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line overflow-hidden">
          <li>
            <button
              type="button"
              aria-pressed={value === null}
              onClick={() => choose(null)}
              className={row}
            >
              <span className="flex-1 text-[15px] font-semibold text-ink">
                {t('partnerPanel.filter.all')}
              </span>
              <Radio on={value === null} />
            </button>
          </li>
          {establishments.map((item) => {
            const pending = pendingById[item.id] ?? 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={value === item.id}
                  onClick={() => choose(item.id)}
                  className={row}
                >
                  <span
                    aria-hidden="true"
                    className="w-11 h-11 shrink-0 rounded-full bg-ink/[0.08] flex items-center justify-center text-[15px] font-bold text-ink"
                  >
                    {item.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-ink truncate">
                      {item.name}
                    </span>
                    <span className="block text-[13px] text-ink/70 truncate">
                      {[
                        t(`partnerPanel.category.${item.category}`, { defaultValue: '' }),
                        locationName(item.location),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {pending > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-danger text-[#0d0e10] text-[12px] font-bold flex items-center justify-center">
                      <span aria-hidden="true">{pending}</span>
                      <span className="sr-only">
                        {t('partnerPanel.filter.pending', { count: pending })}
                      </span>
                    </span>
                  )}
                  <Radio on={value === item.id} />
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onCreate();
          }}
          className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
        >
          <Plus size={18} aria-hidden="true" />
          {t('partnerPanel.filter.create')}
        </button>
      </div>
    </Dialog>
  );
}
