import {
  ChevronRight,
  Languages,
  Monitor,
  Moon,
  ShoppingBag,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, getLocaleDisplayLabel, i18n, normalizeLocale } from '../../../shared/i18n';
import { useTheme } from '../../../shared/context/ThemeContext';
import { BackButton } from '../../../ui/components/BackButton';

interface SettingsViewProps {
  onBack: () => void;
  onOpenLanguage: () => void;
  onOpenAppearance: () => void;
  /** Só com login: o histórico de compras é da conta. */
  onOpenPurchases?: () => void;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-14 px-4 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <Icon size={20} className="text-ink/80 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
        {value && <span className="text-[13px] text-ink/70">{value}</span>}
        <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

export function SettingsView({
  onBack,
  onOpenLanguage,
  onOpenAppearance,
  onOpenPurchases,
}: SettingsViewProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('settings.title')}</h2>
      </div>

      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        {onOpenPurchases && (
          <SettingsRow
            icon={ShoppingBag}
            label={t('purchases.settingsItem')}
            onClick={onOpenPurchases}
          />
        )}
        <SettingsRow
          icon={ThemeIcon}
          label={t('settings.appearance')}
          value={t(`settings.theme.${theme}`)}
          onClick={onOpenAppearance}
        />
        <SettingsRow
          icon={Languages}
          label={t('settings.language')}
          value={getLocaleDisplayLabel(currentLocale, currentLocale)}
          onClick={onOpenLanguage}
        />
      </ul>
    </div>
  );
}
