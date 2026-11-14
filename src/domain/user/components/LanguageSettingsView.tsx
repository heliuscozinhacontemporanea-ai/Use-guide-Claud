import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import {
  DEFAULT_LOCALE,
  getLocaleDisplayLabel,
  i18n,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from '../../../shared/i18n';
import { cn } from '../../../shared/utils/cn';

/** Configurações › Idioma. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function LanguageSettingsView() {
  const { t } = useTranslation();
  const currentLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;
  const { switchLocale } = useLocalizedRouting();

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="sr-only">{t('settings.language')}</legend>
      {SUPPORTED_LOCALES.map((locale) => {
        const isSelected = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchLocale(locale)}
            aria-pressed={isSelected}
            className={cn(
              'press w-full flex items-center justify-between px-5 py-4 min-h-12 rounded-control border text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              isSelected
                ? 'bg-accent-soft border-accent-line text-ink'
                : 'bg-surface border-line text-ink hover:bg-ink/[0.04]'
            )}
          >
            <span className="text-control font-semibold">
              {getLocaleDisplayLabel(locale, currentLocale)}
            </span>
            {isSelected && (
              <span className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Check size={16} strokeWidth={2.5} aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
