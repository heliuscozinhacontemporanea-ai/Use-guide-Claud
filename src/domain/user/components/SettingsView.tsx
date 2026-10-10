import React from 'react';
import { ChevronLeft, ChevronRight, Languages, Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, getLocaleDisplayLabel, i18n, normalizeLocale } from '../../../shared/i18n';
import { useTheme, type Theme } from '../../../shared/context/ThemeContext';

interface SettingsViewProps {
  onBack: () => void;
  onOpenLanguage: () => void;
  onOpenAppearance: () => void;
}

const THEME_LABELS: Record<Theme, string> = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
};

export function SettingsView({ onBack, onOpenLanguage, onOpenAppearance }: SettingsViewProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentLocale =
    normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

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
            Configurações
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Preferências do app
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onOpenAppearance}
          className="w-full flex items-center justify-between py-4 px-2 min-h-[44px] text-left text-white/90 hover:text-white transition-all bg-transparent border-b border-white/10 active:opacity-70 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-lg group"
        >
          <div className="flex items-center gap-3">
            <ThemeIcon size={18} className="text-white shrink-0" />
            <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors">
              Aparência
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">
              {THEME_LABELS[theme]}
            </span>
            <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenLanguage}
          className="w-full flex items-center justify-between py-4 px-2 min-h-[44px] text-left text-white/90 hover:text-white transition-all bg-transparent border-b border-white/10 active:opacity-70 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-lg group"
        >
          <div className="flex items-center gap-3">
            <Languages size={18} className="text-white shrink-0" />
            <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors">
              Idioma do Guide
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">
              {getLocaleDisplayLabel(currentLocale, currentLocale)}
            </span>
            <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
}
