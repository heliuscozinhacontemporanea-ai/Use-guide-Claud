import { Plus, Trash2 } from 'lucide-react';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../shared/utils/businessDateTime';
import type { EventSessionDraft, EventSessionsLoadState } from '../types/eventSession';
import { newEventSessionDraft } from '../utils/eventSessions';

export interface EventSessionsFieldProps {
  sessions: EventSessionDraft[];
  onChange: (sessions: EventSessionDraft[]) => void;
  /** Estado da leitura das sessões salvas; enquanto não está pronta, a lista não é editável. */
  loadState: EventSessionsLoadState;
}

const INPUT_CLASS =
  'w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus-visible:ring-2 focus-visible:ring-teal-400/50';

/** Sessões do evento (data, horário e capacidade), no fuso de Fortaleza. Usado pelo parceiro e pelo admin. */
export function EventSessionsField({ sessions, onChange, loadState }: EventSessionsFieldProps) {
  if (loadState === 'loading') {
    return (
      <p role="status" className="px-2 text-xs text-white/60">
        Carregando as sessões do evento...
      </p>
    );
  }
  if (loadState === 'error') {
    return (
      <p role="alert" className="px-2 text-xs text-rose-300">
        Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de
        salvar.
      </p>
    );
  }

  const updateSession = (index: number, patch: Partial<EventSessionDraft>) => {
    onChange(
      sessions.map((session, current) => (current === index ? { ...session, ...patch } : session))
    );
  };

  return (
    <div className="space-y-4" id="event-sessions-field">
      <p className="px-2 text-[11px] text-white/60">Horários no fuso de Fortaleza (UTC−3).</p>
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
          Sessões do evento
        </span>
        <button
          type="button"
          onClick={() => onChange([...sessions, newEventSessionDraft()])}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={14} aria-hidden="true" /> Adicionar data
        </button>
      </div>

      {sessions.map((session, index) => {
        const label = `Sessão ${index + 1}`;
        return (
          <fieldset
            key={session.id ?? `new-${index}`}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <legend className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {label}
              </legend>
              {sessions.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remover ${label.toLowerCase()}`}
                  onClick={() => onChange(sessions.filter((_, current) => current !== index))}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Início
                </span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.startsAt)}
                  onChange={(e) =>
                    updateSession(index, { startsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Término
                </span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.endsAt)}
                  onChange={(e) =>
                    updateSession(index, { endsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                Capacidade máxima
              </span>
              <input
                type="number"
                min={1}
                value={Number.isFinite(session.capacity) ? session.capacity : ''}
                onChange={(e) => updateSession(index, { capacity: e.target.valueAsNumber })}
                className={INPUT_CLASS}
              />
            </label>
          </fieldset>
        );
      })}
    </div>
  );
}
