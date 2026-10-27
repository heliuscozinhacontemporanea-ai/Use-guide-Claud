import { useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OfferFormInput } from '../../schemas/offerFormSchema';
import { INPUT } from '../../../../ui/styles/controls';

const LANGUAGES = ['pt-BR', 'en', 'fr'] as const;
type Language = (typeof LANGUAGES)[number];

interface OfferTextFieldsProps {
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

/** Título e descrição por idioma: pt-BR obrigatório, en e fr opcionais (AGENTS.md §12.6). */
export function OfferTextFields({ register, errors }: OfferTextFieldsProps) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>('pt-BR');
  const titleError = errors.title?.[language]?.message;

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.editor.languageTabs')}
      </legend>
      <div role="tablist" className="flex gap-2">
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={language === code}
            onClick={() => setLanguage(code)}
            className={`min-h-11 px-3 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
              language === code ? 'bg-accent-soft text-accent' : 'bg-surface text-ink/70'
            }`}
          >
            {t(`common.locales.${code === 'pt-BR' ? 'ptBR' : code}`)}
          </button>
        ))}
      </div>
      {language !== 'pt-BR' && (
        <p className="text-xs text-white/60">{t('bookings.editor.optionalTranslation')}</p>
      )}
      {LANGUAGES.map((code) => (
        <div key={code} hidden={language !== code} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.editor.titleLabel')}</span>
            <input {...register(`title.${code}`)} className={INPUT} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.editor.descriptionLabel')}</span>
            <textarea {...register(`description.${code}`)} rows={4} className={`${INPUT} py-2`} />
          </label>
        </div>
      ))}
      {titleError && (
        <p role="alert" className="text-xs text-red-300">
          {t(titleError)}
        </p>
      )}
    </fieldset>
  );
}
