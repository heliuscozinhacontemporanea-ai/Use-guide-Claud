import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type Theme, useTheme } from '../../../shared/context/ThemeContext';
import { cn } from '../../../shared/utils/cn';

const THEME_OPTIONS: Array<{ id: Theme; icon: typeof Sun }> = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
];

/** Configurações › Aparência. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function AppearanceSettingsView() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="sr-only">{t('settings.appearance')}</legend>
      {THEME_OPTIONS.map((opt) => {
        const isSelected = theme === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={isSelected}
            className={cn(
              'press w-full flex items-center justify-between gap-3 px-5 py-4 min-h-12 rounded-control border text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              isSelected
                ? 'bg-accent-soft border-accent-line'
                : 'bg-surface border-line hover:bg-ink/[0.04]'
            )}
          >
            <span className="flex items-center gap-3.5 min-w-0">
              <Icon size={20} className="text-ink shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-control font-semibold text-ink">
                  {t(`settings.theme.${opt.id}`)}
                </span>
                <span className="block text-caption text-ink-muted mt-0.5">
                  {t(`settings.themeDescription.${opt.id}`)}
                </span>
              </span>
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
