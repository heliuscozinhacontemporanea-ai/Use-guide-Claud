import { Building2, Camera, Globe, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BR_STATES } from '../../../../shared/utils/timeZones';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import type { PartnerContentEditorState } from '../../types/partnerContent';
import { RegionInput } from '../steps/PlaceFields';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const ICON_INPUT_CLASS =
  'w-full min-h-[44px] bg-surface border border-line rounded-2xl pl-12 pr-5 py-4 text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all';
const PLAIN_INPUT_CLASS =
  'w-full min-h-[44px] bg-surface border border-line rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';
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

/**
 * `part` separa Contato e Local nas linhas de Editar evento (p18). `placeFields`: evento do Use Guide
 * sem estabelecimento (escolhas da F4), que pede estado e cidade para o fuso (D28).
 */
export function EventContactSection({
  item,
  onChange,
  part = 'all',
  placeFields = false,
}: EventSectionProps & { part?: 'all' | 'contact' | 'location'; placeFields?: boolean }) {
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
            {t('partnerCatalog.fields.contactTitle')}
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contact && (
          <>
            <div className="space-y-2">
              <label htmlFor="partner-event-phone" className={LABEL_CLASS}>
                {t('partnerCatalog.fields.phone')}
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
              label={t('partnerCatalog.fields.site')}
              icon={<Globe size={16} />}
              placeholder="https://..."
            />
            <IconTextField
              section={section}
              field="instagramLink"
              label={t('partnerCatalog.fields.instagram')}
              icon={<Camera size={16} />}
              placeholder={t('partnerCatalog.fields.instagramPlaceholder')}
            />
          </>
        )}
        {location && placeFields && (
          <div className="space-y-2 sm:col-span-2">
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <select
                value={item.state || 'CE'}
                aria-label={t('partnerCatalog.fields.state')}
                onChange={(e) => updateEventField(section, 'state', e.target.value)}
                className={PLAIN_INPUT_CLASS}
              >
                {BR_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={item.city || ''}
                maxLength={100}
                aria-label={t('partnerCatalog.fields.city')}
                placeholder={t('partnerCatalog.fields.city')}
                onChange={(e) => updateEventField(section, 'city', e.target.value)}
                className={PLAIN_INPUT_CLASS}
              />
            </div>
            <p className="px-1 text-[12px] text-ink/70">{t('partnerCatalog.fields.placeHint')}</p>
          </div>
        )}
        {location && (
          <>
            <IconTextField
              section={section}
              field="googleMapsLink"
              label={t('partnerCatalog.fields.maps')}
              icon={<MapPin size={16} />}
              placeholder={t('partnerCatalog.fields.mapsPlaceholder')}
              required
            />
            <div className="space-y-2 sm:col-span-2">
              <span className={LABEL_CLASS}>
                {t('partnerCatalog.fields.region')} <span className="text-danger font-bold">*</span>
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
          label={t('partnerCatalog.fields.address')}
          icon={<Building2 size={16} />}
          placeholder={t('partnerCatalog.fields.addressPlaceholder')}
        />
      )}
    </div>
  );
}
