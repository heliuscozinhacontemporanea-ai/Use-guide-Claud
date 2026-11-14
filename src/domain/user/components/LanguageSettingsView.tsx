import { Check, ChevronLeft } from 'lucide-react';
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

interface LanguageSettingsViewProps {
  onBack: () => void;
  /** Na folha do perfil o `<` e o título ficam na barra fixa (D33). */
  hideHeader?: boolean;
}

export function LanguageSettingsView({ onBack, hideHeader = false }: LanguageSettingsViewProps) {
  const { t } = useTranslation();
  const currentLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;
  const { switchLocale } = useLocalizedRouting();

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
          <button
            type="button"
            onClick={onBack}
            aria-label={t('settings.back')}
            className="press absolute left-0 w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <ChevronLeft size={28} aria-hidden="true" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold mb-1 text-ink leading-tight">
              {t('settings.language')}
            </h2>
            <p className="text-xs text-ink/70 font-semibold uppercase tracking-widest">
              {t('settings.languageSubtitle')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {SUPPORTED_LOCALES.map((locale) => {
          const isSelected = locale === currentLocale;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => switchLocale(locale)}
              className={cn(
                'press w-full flex items-center justify-between px-5 py-4 min-h-12 rounded-2xl border text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                isSelected
                  ? 'bg-accent-soft border-accent-line text-ink'
                  : 'bg-surface border-line text-ink/80 hover:bg-ink/[0.04]'
              )}
            >
              <span className="text-sm font-semibold tracking-wide">
                {getLocaleDisplayLabel(locale, currentLocale)}
              </span>
              {isSelected && (
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
