import { Building2, Camera, Globe, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import type { PartnerContentEditorState } from '../../types/partnerContent';
import { RegionInput } from '../steps/PlaceFields';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const ICON_INPUT_CLASS =
  'w-full min-h-[44px] bg-surface border border-line rounded-2xl pl-12 pr-5 py-4 text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all';
const ICON_CLASS = 'absolute left-4 top-1/2 -translate-y-1/2 text-ink/70';

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
        {label} {required && <span className="text-danger font-bold">*</span>}
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

/** `part` separa Contato e Local nas linhas de Editar evento (p18). */
export function EventContactSection({
  item,
  onChange,
  part = 'all',
}: EventSectionProps & { part?: 'all' | 'contact' | 'location' }) {
  const { t } = useTranslation();
  const section = { item, onChange };
  const contact = part !== 'location';
  const location = part !== 'contact';

  return (
    <div className="space-y-6 pt-4 border-t border-line">
      {part === 'all' && (
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-surface border border-line text-accent">
            <Phone size={18} aria-hidden="true" />
          </span>
          <h3 className="text-sm font-black text-ink uppercase tracking-widest">
            Contato e Localização
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contact && (
          <>
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
          </>
        )}
        {location && (
          <>
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
                Região / Bairro <span className="text-danger font-bold">*</span>
              </span>
              <RegionInput
                value={item.location || ''}
                onChange={(value) => updateEventField(section, 'location', value)}
                label={t('partners.place.region')}
              />
            </div>
          </>
        )}
      </div>

      {location && (
        <IconTextField
          section={section}
          field="address"
          label="Endereço do Local"
          icon={<Building2 size={16} />}
          placeholder="Rua, Número, Referência..."
        />
      )}
    </div>
  );
}
