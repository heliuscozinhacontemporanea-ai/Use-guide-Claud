import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  CUSTOM_EVENT_CATEGORY,
  EVENT_CATEGORIES,
  type EventSessionsFieldProps,
  type EventSessionsLoadState,
} from '../../../events';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

export interface AdminEventSlots {
  /** Campo de sessões do domínio events, montado pela composição do app. */
  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  /** Gerenciador de ingressos do domínio ticketing, montado pela composição do app. */
  renderTicketingManager?: (eventListingId: string) => ReactNode;
}

interface AdminEditorEventFieldsProps extends AdminEventSlots {
  eventListingId?: string;
  occurrencesState: EventSessionsLoadState;
}

export function AdminEditorEventFields({
  eventListingId,
  occurrencesState,
  renderSessionsField,
  renderTicketingManager,
}: AdminEditorEventFieldsProps) {
  const { register, setValue, watch } = useFormContext<AdminGuideEditorSchemaValues>();

  const occurrences = watch('occurrences');
  const eventCategory = watch('eventCategory') || '';

  return (
    <div className="space-y-4" id="event-occurrences-section">
      <div className="space-y-1.5 px-2">
        <label
          htmlFor="admin-event-category"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50"
        >
          Categoria do Evento
        </label>
        <select
          id="admin-event-category"
          value={eventCategory}
          onChange={(e) => {
            setValue('eventCategory', e.target.value, { shouldDirty: true });
            if (e.target.value !== CUSTOM_EVENT_CATEGORY) {
              setValue('customCategory', '', { shouldDirty: true });
            }
          }}
          className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
        >
          <option value="">Selecione uma categoria...</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {eventCategory === CUSTOM_EVENT_CATEGORY && (
          <input
            type="text"
            aria-label="Nome da categoria"
            placeholder="Nome da categoria"
            maxLength={200}
            {...register('customCategory')}
            className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
          />
        )}
      </div>

      {renderSessionsField?.({
        sessions: (occurrences ?? []).map((occ) => ({
          id: occ.id,
          startsAt: occ.startsAt,
          endsAt: occ.endsAt,
          capacity: occ.capacity,
          ...(occ.salesEndsAt ? { salesEndsAt: occ.salesEndsAt } : {}),
        })),
        onChange: (sessions) =>
          setValue('occurrences', sessions, { shouldDirty: true, shouldValidate: true }),
        loadState: occurrencesState === 'idle' ? 'ready' : occurrencesState,
      })}

      {eventListingId && renderTicketingManager && (
        <div className="pt-4 border-t border-white/10">
          {renderTicketingManager(eventListingId)}
        </div>
      )}
    </div>
  );
}
