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
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
          Categoria do Evento <span className="text-rose-500 font-bold">*</span>
        </label>
        <select
          {...register('eventCategory')}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
        >
          <option value="">Selecione uma categoria...</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {eventCategory === CUSTOM_EVENT_CATEGORY && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Especifique a Categoria <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            {...register('customCategory')}
            placeholder="Ex: Luau, Workshop..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
          />
        </div>
      )}

      {renderSessionsField?.({
        sessions: (occurrences ?? []).map((occ) => ({
          id: occ.id,
          startsAt: occ.startsAt,
          endsAt: occ.endsAt,
          capacity: occ.capacity,
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
