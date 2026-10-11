import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  getLocaleDisplayLabel,
  i18n,
  SUPPORTED_LOCALES,
  type Locale,
  normalizeLocale,
} from '../../../shared/i18n';
import { cn } from '../../../shared/utils/cn';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';

interface LanguageSettingsViewProps {
  onBack: () => void;
}

export function LanguageSettingsView({ onBack }: LanguageSettingsViewProps) {
  const { t } = useTranslation();
  const currentLocale =
    normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const { switchLocale } = useLocalizedRouting();
  const handleSelectLocale = (locale: Locale) => {
    switchLocale(locale);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
        <button
          onClick={onBack}
          aria-label={t('header.closeMenu', 'Voltar')}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
            Idioma do Guide
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Selecione o idioma
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {SUPPORTED_LOCALES.map((locale) => {
          const isSelected = locale === currentLocale;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => handleSelectLocale(locale)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-4 min-h-[48px] rounded-2xl border transition-all text-left group focus-visible:ring-2 focus-visible:ring-teal-400/50',
                isSelected
                  ? 'bg-teal-500/10 border-teal-500/30 text-white shadow-lg shadow-teal-500/5'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="text-sm font-bold tracking-wide">
                {getLocaleDisplayLabel(locale, currentLocale)}
              </span>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={2.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
