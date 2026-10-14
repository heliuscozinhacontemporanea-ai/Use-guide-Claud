import React from 'react';
import { ChevronLeft, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme, type Theme } from '../../../shared/context/ThemeContext';
import { cn } from '../../../shared/utils/cn';

interface AppearanceSettingsViewProps {
  onBack: () => void;
}

const THEME_OPTIONS: Array<{ id: Theme; icon: typeof Sun }> = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
];

export function AppearanceSettingsView({ onBack }: AppearanceSettingsViewProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
        <button
          onClick={onBack}
          aria-label={t('settings.back')}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
            {t('settings.appearance')}
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            {t('settings.appearanceSubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-4 min-h-[48px] rounded-2xl border transition-all text-left group focus-visible:ring-2 focus-visible:ring-teal-400/50',
                isSelected
                  ? 'bg-teal-500/10 border-teal-500/30 text-white shadow-lg shadow-teal-500/5'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3.5">
                <Icon size={18} className="text-white shrink-0" />
                <div>
                  <p className="text-sm font-bold leading-tight">{t(`settings.theme.${opt.id}`)}</p>
                  <p className="text-[11px] text-white/50 font-medium mt-0.5">
                    {t(`settings.themeDescription.${opt.id}`)}
                  </p>
                </div>
              </div>

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
