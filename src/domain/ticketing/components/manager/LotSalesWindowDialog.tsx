import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import type { TicketType } from '../../types/ticketing';

/**
 * Início e fim das vendas de um lote que já existe, na hora do lugar do evento (D28). Campo vazio
 * tira a data: sem início, vende desde já; sem fim, até o encerramento das vendas da sessão.
 */
export function LotSalesWindowDialog({
  lot,
  timeZone,
  onClose,
  onSave,
}: {
  lot: TicketType | null;
  timeZone: string;
  onClose: () => void;
  onSave: (
    lotId: string,
    dates: { salesStartsAt: string | null; salesEndsAt: string | null }
  ) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartsAt(isoToBusinessDateTime(lot?.salesStartsAt, timeZone));
    setEndsAt(isoToBusinessDateTime(lot?.salesEndsAt, timeZone));
    setError(null);
  }, [lot, timeZone]);

  if (!lot) return null;

  const save = async () => {
    const dates = {
      salesStartsAt: startsAt ? businessDateTimeToIso(startsAt, timeZone) : null,
      salesEndsAt: endsAt ? businessDateTimeToIso(endsAt, timeZone) : null,
    };
    if (dates.salesStartsAt && dates.salesEndsAt && dates.salesEndsAt <= dates.salesStartsAt) {
      setError(t('eventSessions.lotDates.orderError'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(lot.id, dates);
      onClose();
    } catch {
      setError(t('eventSessions.lotDates.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<[string, string, string, (value: string) => void]> = [
    ['lot-sales-start', t('eventSessions.lotDates.startsAt'), startsAt, setStartsAt],
    ['lot-sales-end', t('eventSessions.lotDates.endsAt'), endsAt, setEndsAt],
  ];

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('eventSessions.lotDates.title', { name: lot.name })}
      description={t('eventSessions.lotDates.hint')}
    >
      <div className="space-y-4">
        {fields.map(([id, label, value, set]) => (
          <div key={id} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={id} className="text-[14px] font-semibold text-ink">
                {label}
              </label>
              {value && (
                <TextButton tone="ink" onClick={() => set('')}>
                  {t('eventSessions.lotDates.clear')}
                </TextButton>
              )}
            </div>
            <input
              id={id}
              type="datetime-local"
              value={value}
              onChange={(event) => set(event.target.value)}
              className={INPUT}
            />
          </div>
        ))}
        {error && <StatusText tone="danger">{error}</StatusText>}
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t(saving ? 'eventSessions.lotDates.saving' : 'eventSessions.lotDates.save')}
        </button>
      </div>
    </Dialog>
  );
}
