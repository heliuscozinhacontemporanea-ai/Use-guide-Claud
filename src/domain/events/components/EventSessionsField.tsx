import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../shared/utils/businessDateTime';
import { INPUT } from '../../../ui/styles/controls';
import type { EventSessionDraft, EventSessionsLoadState } from '../types/eventSession';
import { defaultSalesEndsAt, newEventSessionDraft, withStartsAt } from '../utils/eventSessions';

export interface EventSessionsFieldProps {
  sessions: EventSessionDraft[];
  onChange: (sessions: EventSessionDraft[]) => void;
  /** Estado da leitura das sessões salvas; enquanto não está pronta, a lista não é editável. */
  loadState: EventSessionsLoadState;
}

const LABEL = 'text-[12px] font-semibold text-ink/70';

/** Sessões do evento (data, horário, capacidade e fim das vendas), no fuso de Fortaleza. Usado pelo parceiro e pelo admin. */
export function EventSessionsField({ sessions, onChange, loadState }: EventSessionsFieldProps) {
  const { t } = useTranslation();
  if (loadState === 'loading') {
    return (
      <p role="status" className="px-2 text-[13px] text-ink/70">
        {t('eventSessions.loading')}
      </p>
    );
  }
  if (loadState === 'error') {
    return (
      <p role="alert" className="px-2 text-[13px] text-danger">
        {t('eventSessions.loadError')}
      </p>
    );
  }

  const replace = (index: number, next: EventSessionDraft) => {
    onChange(sessions.map((session, current) => (current === index ? next : session)));
  };

  return (
    <div className="space-y-4" id="event-sessions-field">
      <div className="flex items-center justify-between gap-2 px-2">
        <div>
          <p className="text-sm font-semibold text-ink">{t('eventSessions.title')}</p>
          <p className="text-[12px] text-ink/70">{t('eventSessions.timezone')}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...sessions, newEventSessionDraft()])}
          className="press shrink-0 whitespace-nowrap min-h-11 px-4 rounded-xl bg-accent-soft text-accent text-[13px] font-semibold inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={16} aria-hidden="true" /> {t('eventSessions.add')}
        </button>
      </div>

      {sessions.map((session, index) => {
        const label = t('eventSessions.session', { n: index + 1 });
        return (
          <fieldset
            key={session.id ?? `new-${index}`}
            className="p-4 rounded-2xl bg-surface border border-line space-y-4 min-w-0"
          >
            <div className="flex items-center justify-between">
              <legend className="text-[13px] font-semibold text-ink/80">{label}</legend>
              {sessions.length > 1 && (
                <button
                  type="button"
                  aria-label={t('eventSessions.remove', { session: label })}
                  onClick={() => onChange(sessions.filter((_, current) => current !== index))}
                  className="press w-11 h-11 flex items-center justify-center rounded-xl bg-danger-soft text-danger focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.startsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.startsAt)}
                  onChange={(e) =>
                    replace(index, withStartsAt(session, businessDateTimeToIso(e.target.value)))
                  }
                  className={INPUT}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.endsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.endsAt)}
                  onChange={(e) =>
                    replace(index, { ...session, endsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.capacity')}</span>
                <input
                  type="number"
                  min={1}
                  value={Number.isFinite(session.capacity) ? session.capacity : ''}
                  onChange={(e) => replace(index, { ...session, capacity: e.target.valueAsNumber })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.salesEndsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(
                    session.salesEndsAt ?? defaultSalesEndsAt(session.startsAt)
                  )}
                  onChange={(e) =>
                    replace(index, {
                      ...session,
                      salesEndsAt: businessDateTimeToIso(e.target.value),
                    })
                  }
                  className={INPUT}
                />
              </label>
            </div>
            <p className="text-[12px] text-ink/70">{t('eventSessions.salesEndsHint')}</p>
          </fieldset>
        );
      })}
    </div>
  );
}
