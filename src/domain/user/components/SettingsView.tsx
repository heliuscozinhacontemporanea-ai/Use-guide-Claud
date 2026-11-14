import {
  AtSign,
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  Languages,
  type LucideIcon,
  Monitor,
  Moon,
  ShoppingBag,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/context/ThemeContext';
import { DEFAULT_LOCALE, getLocaleDisplayLabel, i18n, normalizeLocale } from '../../../shared/i18n';

interface SettingsViewProps {
  onOpenLanguage: () => void;
  onOpenAppearance: () => void;
  onOpenSupport: () => void;
  onOpenAbout: () => void;
  /** Só com login: o histórico de compras é da conta. */
  onOpenPurchases?: () => void;
  /** Só com login: o @ que outras pessoas usam para transferir ingressos (D21). */
  onOpenUsername?: () => void;
  /** Só com login: avisos da conta e do parceiro (D25). */
  onOpenNotifications?: () => void;
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
        <Icon size={20} className="text-ink-muted shrink-0" aria-hidden="true" />
        <span className="flex-1 text-body font-semibold text-ink">{label}</span>
        {value && <span className="text-meta text-ink-muted">{value}</span>}
        <ChevronRight size={20} className="text-ink-subtle shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Configurações. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function SettingsView({
  onOpenLanguage,
  onOpenAppearance,
  onOpenSupport,
  onOpenAbout,
  onOpenPurchases,
  onOpenUsername,
  onOpenNotifications,
}: SettingsViewProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="flex flex-col">
      <ul className="rounded-card bg-surface border border-line divide-y divide-line overflow-hidden">
        {onOpenUsername && (
          <SettingsRow icon={AtSign} label={t('username.title')} onClick={onOpenUsername} />
        )}
        {onOpenPurchases && (
          <SettingsRow
            icon={ShoppingBag}
            label={t('purchases.settingsItem')}
            onClick={onOpenPurchases}
          />
        )}
        {onOpenNotifications && (
          <SettingsRow
            icon={Bell}
            label={t('notify.settingsTitle')}
            onClick={onOpenNotifications}
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

      <ul className="mt-4 rounded-card bg-surface border border-line divide-y divide-line overflow-hidden">
        <SettingsRow icon={HelpCircle} label={t('settings.support')} onClick={onOpenSupport} />
        <SettingsRow icon={Info} label={t('settings.about')} onClick={onOpenAbout} />
      </ul>
    </div>
  );
}
