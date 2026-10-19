import { Building2, Camera, Globe, Hash, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { REGIONS } from '../../../../shared/constants/regions';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import type { PartnerContentEditorState } from '../../types/partnerContent';
import { type EventSectionProps, updateEventField } from './eventSectionProps';
import { SelectDropdown } from './SelectDropdown';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-white/50 ml-1';
const ICON_INPUT_CLASS =
  'w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all';
const ICON_CLASS = 'absolute left-4 top-1/2 -translate-y-1/2 text-white/50';

type TextField = 'websiteLink' | 'instagramLink' | 'googleMapsLink' | 'address';

function IconTextField({
  label,
  icon,
  field,
  placeholder,
  required = false,
  section,
}: {
  label: string;
  icon: ReactNode;
  field: TextField;
  placeholder: string;
  required?: boolean;
  section: EventSectionProps;
}) {
  const value: PartnerContentEditorState[TextField] = section.item[field];
  return (
    <label className="space-y-2 block">
      <span className={LABEL_CLASS}>
        {label} {required && <span className="text-rose-500 font-bold">*</span>}
      </span>
      <span className="relative block">
        <span className={ICON_CLASS} aria-hidden="true">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => updateEventField(section, field, e.target.value)}
          maxLength={300}
          className={ICON_INPUT_CLASS}
        />
      </span>
    </label>
  );
}

export function EventContactSection({ item, onChange }: EventSectionProps) {
  const section = { item, onChange };

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Phone size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Contato e Localização
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="partner-event-phone" className={LABEL_CLASS}>
            WhatsApp de Contato / Reservas
          </label>
          <E164PhoneField
            id="partner-event-phone"
            value={item.phone}
            onChange={(e164) => updateEventField(section, 'phone', e164)}
          />
        </div>
        <IconTextField
          section={section}
          field="websiteLink"
          label="Site / Link de Ingressos"
          icon={<Globe size={16} />}
          placeholder="https://..."
        />
        <IconTextField
          section={section}
          field="instagramLink"
          label="Instagram do Evento"
          icon={<Camera size={16} />}
          placeholder="@perfil"
        />
        <IconTextField
          section={section}
          field="googleMapsLink"
          label="Google Maps (Local)"
          icon={<MapPin size={16} />}
          placeholder="Link da localização"
          required
        />
        <div className="space-y-2 sm:col-span-2">
          <span className={LABEL_CLASS}>
            Região / Bairro <span className="text-rose-500 font-bold">*</span>
          </span>
          <div className="relative">
            <span className={`${ICON_CLASS} z-10 pointer-events-none`} aria-hidden="true">
              <Hash size={16} />
            </span>
            <SelectDropdown
              ariaLabel="Região do evento"
              withIcon
              value={item.location || ''}
              options={REGIONS.map((region) => ({ value: region, label: region }))}
              onChange={(value) => updateEventField(section, 'location', value)}
              placeholder="Selecione uma região..."
            />
          </div>
        </div>
      </div>

      <IconTextField
        section={section}
        field="address"
        label="Endereço do Local"
        icon={<Building2 size={16} />}
        placeholder="Rua, Número, Referência..."
      />
    </div>
  );
}
