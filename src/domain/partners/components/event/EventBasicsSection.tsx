import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
import type { PartnerBusiness } from '../../types/partner';
import { type EventSectionProps, updateEventField } from './eventSectionProps';
import { SelectDropdown } from './SelectDropdown';

// Valor do "Nenhum (lugar público)" no seletor; não é gravado (o evento fica sem estabelecimento).
const NONE = '__none__';
const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const INPUT_CLASS =
  'w-full min-h-[44px] bg-surface border border-line rounded-2xl px-5 py-4 text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all placeholder:text-ink/50';

interface EventBasicsSectionProps extends EventSectionProps {
  businesses?: PartnerBusiness[];
  /** Evento do Use Guide (escolhas da F4): o estabelecimento é opcional (lugar público). */
  useGuide?: boolean;
}

export function EventBasicsSection({
  item,
  onChange,
  businesses,
  useGuide = false,
}: EventBasicsSectionProps) {
  const { t } = useTranslation();
  const props = { item, onChange };
  const establishments = (businesses ?? []).filter((business) => business.type === 'item');
  const selectedEstablishment = establishments.find(
    (business) => business.businessId === item.establishmentId
  );
  const required = <span className="text-danger font-bold">*</span>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-accent">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
          {t('partnerCatalog.fields.basicsTitle')}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Todo evento de parceiro pertence a um estabelecimento ou ao perfil de produtor (D9). */}
        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            {useGuide ? (
              t('partnerCatalog.fields.establishmentOptional')
            ) : (
              <>
                {t('partnerCatalog.fields.establishment')} {required}
              </>
            )}
          </span>
          {item.id ? (
            <div className="w-full bg-surface border border-line rounded-2xl px-5 py-4 text-ink/70 text-sm flex items-center justify-between cursor-not-allowed">
              <span>
                {selectedEstablishment?.businessName ||
                  (useGuide && !item.establishmentId
                    ? t('partnerCatalog.fields.noEstablishment')
                    : t('partnerCatalog.fields.establishmentReadOnly'))}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/70">
                {t('partnerCatalog.fields.readOnly')}
              </span>
            </div>
          ) : (
            <SelectDropdown
              ariaLabel={t('partnerCatalog.fields.establishment')}
              value={item.establishmentId || (useGuide ? NONE : '')}
              options={[
                ...(useGuide
                  ? [{ value: NONE, label: t('partnerCatalog.fields.noEstablishment') }]
                  : []),
                ...establishments.map((business) => ({
                  value: business.businessId,
                  label: business.businessName,
                })),
              ]}
              onChange={(value) =>
                updateEventField(props, 'establishmentId', value === NONE ? '' : value)
              }
              placeholder={t('partnerCatalog.fields.establishmentPlaceholder')}
              emptyMessage={t('partnerCatalog.fields.establishmentEmpty')}
            />
          )}
          {useGuide && !item.id ? (
            <p className="px-1 text-[12px] text-ink/70">
              {t('partnerCatalog.fields.useGuidePlaces')}
            </p>
          ) : null}
        </div>

        <label className="space-y-2 block">
          <span className={LABEL_CLASS}>
            {t('partnerCatalog.fields.name')} {required}
          </span>
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => updateEventField(props, 'name', e.target.value)}
            maxLength={100}
            className={INPUT_CLASS}
            placeholder={t('partnerCatalog.fields.namePlaceholder')}
          />
        </label>

        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            {t('partnerCatalog.fields.category')} {required}
          </span>
          {/* TODO: B75 — a categoria do evento é gravada em português e aparece assim nos 3 idiomas. */}
          <SelectDropdown
            ariaLabel={t('partnerCatalog.fields.categoryLabel')}
            value={item.eventCategory || ''}
            options={EVENT_CATEGORIES.map((category) => ({ value: category, label: category }))}
            onChange={(value) =>
              onChange({
                ...item,
                eventCategory: value,
                ...(value !== CUSTOM_EVENT_CATEGORY && { customCategory: '' }),
              })
            }
            placeholder={t('partnerCatalog.fields.categoryPlaceholder')}
          />
        </div>

        {item.eventCategory === CUSTOM_EVENT_CATEGORY && (
          <label className="space-y-2 block animate-fade-in">
            <span className={LABEL_CLASS}>
              {t('partnerCatalog.fields.customCategory')} {required}
            </span>
            <input
              type="text"
              value={item.customCategory || ''}
              onChange={(e) => updateEventField(props, 'customCategory', e.target.value)}
              maxLength={100}
              className={INPUT_CLASS}
              placeholder={t('partnerCatalog.fields.customCategoryPlaceholder')}
            />
          </label>
        )}

        <label className="space-y-2 block">
          <span className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/70">
              {t('partnerCatalog.fields.description')}
            </span>
            <span className="text-[10px] font-bold text-ink/70">
              {item.description?.length || 0}/400
            </span>
          </span>
          <textarea
            value={item.description || ''}
            onChange={(e) => updateEventField(props, 'description', e.target.value.slice(0, 400))}
            className={`${INPUT_CLASS} resize-none h-32 no-scrollbar`}
            placeholder={t('partnerCatalog.fields.descriptionPlaceholder')}
          />
        </label>
      </div>
    </div>
  );
}
