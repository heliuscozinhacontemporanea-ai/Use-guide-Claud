import { Building2 } from 'lucide-react';
import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
import type { PartnerBusiness } from '../../types/partner';
import { type EventSectionProps, updateEventField } from './eventSectionProps';
import { SelectDropdown } from './SelectDropdown';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const INPUT_CLASS =
  'w-full min-h-[44px] bg-surface border border-line rounded-2xl px-5 py-4 text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all placeholder:text-ink/50';

interface EventBasicsSectionProps extends EventSectionProps {
  businesses?: PartnerBusiness[];
}

export function EventBasicsSection({ item, onChange, businesses }: EventBasicsSectionProps) {
  const props = { item, onChange };
  const establishments = (businesses ?? []).filter((business) => business.type === 'item');
  const selectedEstablishment = establishments.find(
    (business) => business.businessId === item.establishmentId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-accent">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
          Informações Básicas
        </h3>
      </div>

      <div className="space-y-4">
        {/* Todo evento pertence a um estabelecimento ou ao perfil de produtor (decisão D9). */}
        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            Estabelecimento ou perfil de produtor <span className="text-danger font-bold">*</span>
          </span>
          {item.id ? (
            <div className="w-full bg-surface border border-line rounded-2xl px-5 py-4 text-ink/70 text-sm flex items-center justify-between cursor-not-allowed">
              <span>
                {selectedEstablishment?.businessName ||
                  item.establishmentId ||
                  'Estabelecimento vinculado'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/70">
                Somente leitura
              </span>
            </div>
          ) : (
            <SelectDropdown
              ariaLabel="Estabelecimento ou perfil de produtor"
              value={item.establishmentId || ''}
              options={establishments.map((business) => ({
                value: business.businessId,
                label: business.businessName,
              }))}
              onChange={(value) => updateEventField(props, 'establishmentId', value)}
              placeholder="Selecione o estabelecimento..."
              emptyMessage="Nenhum estabelecimento cadastrado no seu perfil."
            />
          )}
        </div>

        <label className="space-y-2 block">
          <span className={LABEL_CLASS}>
            Nome do Evento <span className="text-danger font-bold">*</span>
          </span>
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => updateEventField(props, 'name', e.target.value)}
            maxLength={100}
            className={INPUT_CLASS}
            placeholder="Ex: Show na Praia, Sunset Party..."
          />
        </label>

        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            Categoria <span className="text-danger font-bold">*</span>
          </span>
          <SelectDropdown
            ariaLabel="Categoria do evento"
            value={item.eventCategory || ''}
            options={EVENT_CATEGORIES.map((category) => ({ value: category, label: category }))}
            onChange={(value) =>
              onChange({
                ...item,
                eventCategory: value,
                ...(value !== CUSTOM_EVENT_CATEGORY && { customCategory: '' }),
              })
            }
            placeholder="Selecione uma categoria..."
          />
        </div>

        {item.eventCategory === CUSTOM_EVENT_CATEGORY && (
          <label className="space-y-2 block animate-fade-in">
            <span className={LABEL_CLASS}>
              Especifique a Categoria <span className="text-danger font-bold">*</span>
            </span>
            <input
              type="text"
              value={item.customCategory || ''}
              onChange={(e) => updateEventField(props, 'customCategory', e.target.value)}
              maxLength={100}
              className={INPUT_CLASS}
              placeholder="Ex: Luau, Palestra, Workshop..."
            />
          </label>
        )}

        <label className="space-y-2 block">
          <span className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/70">
              Descrição do Evento
            </span>
            <span className="text-[10px] font-bold text-ink/70">
              {item.description?.length || 0}/400
            </span>
          </span>
          <textarea
            value={item.description || ''}
            onChange={(e) => updateEventField(props, 'description', e.target.value.slice(0, 400))}
            className={`${INPUT_CLASS} resize-none h-32 no-scrollbar`}
            placeholder="Descreva os detalhes importantes, atrações ou diferenciais do evento..."
          />
        </label>
      </div>
    </div>
  );
}
