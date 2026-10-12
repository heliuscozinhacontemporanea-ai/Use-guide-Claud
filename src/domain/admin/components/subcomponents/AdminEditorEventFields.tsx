import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../../shared/utils/businessDateTime';
import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
import { PartnerEventTicketingManager } from '../../../ticketing';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

interface AdminEditorEventFieldsProps {
  eventListingId?: string;
  occurrencesState: 'idle' | 'loading' | 'ready' | 'error';
}

export function AdminEditorEventFields({
  eventListingId,
  occurrencesState,
}: AdminEditorEventFieldsProps) {
  const { control, register, setValue, watch } = useFormContext<AdminGuideEditorSchemaValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'occurrences',
  });

  const occurrences = watch('occurrences') || [];
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

      {occurrencesState === 'loading' && (
        <p role="status" className="px-2 text-xs text-white/60">
          Carregando as sessões do evento...
        </p>
      )}
      {occurrencesState === 'error' && (
        <p role="alert" className="px-2 text-xs text-rose-300">
          Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de
          salvar.
        </p>
      )}
      <p className="px-2 text-[11px] text-white/60">Horários no fuso de Fortaleza (UTC−3).</p>
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
          Ocorrências do Evento
        </label>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const startIso = now.toISOString();
            const endIso = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
            append({
              startsAt: startIso,
              endsAt: endIso,
              capacity: 100,
            });
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={14} /> Adicionar Data
        </button>
      </div>

      {fields.map((field, index) => {
        const occ = occurrences[index];
        return (
          <div
            key={field.id}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Sessão #{index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remover sessão ${index + 1}`}
                  onClick={() => remove(index)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Início
                </label>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(occ?.startsAt)}
                  onChange={(e) => {
                    const iso = businessDateTimeToIso(e.target.value);
                    setValue(`occurrences.${index}.startsAt`, iso, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    if (index === 0) {
                      setValue('date', iso, { shouldDirty: true });
                    }
                  }}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Término
                </label>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(occ?.endsAt)}
                  onChange={(e) => {
                    const iso = businessDateTimeToIso(e.target.value);
                    setValue(`occurrences.${index}.endsAt`, iso, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    if (index === 0) {
                      setValue('endDate', iso, { shouldDirty: true });
                    }
                  }}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                Capacidade Máxima
              </label>
              <input
                type="number"
                min={1}
                {...register(`occurrences.${index}.capacity`, { valueAsNumber: true })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>
        );
      })}

      {eventListingId && (
        <div className="pt-4 border-t border-white/10">
          <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />
        </div>
      )}
    </div>
  );
}
