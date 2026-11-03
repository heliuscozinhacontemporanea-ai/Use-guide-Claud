import {
  CalendarCheck,
  type LucideIcon,
  MessageSquareWarning,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { TextButton } from '../../../ui/components/TextButton';
import { cn } from '../../../shared/utils/cn';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationPreferences } from '../types/notificationCategories';
import { NotificationDeviceCard } from './NotificationDeviceCard';

const LIST =
  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
const SECTION_TITLE = 'px-1 mb-2 text-xs font-bold text-ink';
// Mesmo cartão de opção da folha de decisão (docs/design/base-d17/light-6-admin-decidir.png).
const OPTION =
  'press min-h-14 px-4 py-3 rounded-2xl bg-surface border border-line flex items-center gap-3 cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:border-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';
const NOTE = 'px-1 mt-2 text-[13px] text-ink/70';

type AlwaysKey = 'purchases' | 'trips' | 'account' | 'partnerClaims' | 'partnerMoney';

const ALWAYS_ICONS: Record<AlwaysKey, LucideIcon> = {
  purchases: ShoppingBag,
  trips: CalendarCheck,
  account: ShieldCheck,
  partnerClaims: MessageSquareWarning,
  partnerMoney: Wallet,
};

/** Título com ícone neutro ao lado, sem caixa nem cor (só identifica o assunto). */
function RowTitle({
  icon: Icon,
  id,
  children,
}: {
  icon: LucideIcon;
  id?: string;
  children: string;
}) {
  return (
    <p id={id} className="flex items-center gap-2 text-[15px] font-semibold text-ink">
      <Icon size={18} className="shrink-0 text-ink/70" aria-hidden="true" />
      {children}
    </p>
  );
}

function AlwaysRow({ item }: { item: AlwaysKey }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 min-h-16">
      <div className="flex-1 min-w-0">
        <RowTitle icon={ALWAYS_ICONS[item]}>{t(`notify.always.${item}.label`)}</RowTitle>
        <p className="pl-[26px] text-[13px] text-ink/70">{t(`notify.always.${item}.hint`)}</p>
      </div>
      <span className="shrink-0 text-[13px] text-ink/60">{t('notify.always.on')}</span>
    </li>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <li className="flex items-center gap-3 pl-4 pr-2 py-3">
      <div className="flex-1 min-w-0">
        <RowTitle icon={icon} id={id}>
          {label}
        </RowTitle>
        <p id={`${id}-hint`} className="pl-[26px] text-[13px] text-ink/70">
          {hint}
        </p>
      </div>
      <Switch checked={checked} onChange={onChange} labelledBy={id} describedBy={`${id}-hint`} />
    </li>
  );
}

function SalesChoice({
  value,
  onChange,
}: {
  value: NotificationPreferences['salesAlerts'];
  onChange: (value: NotificationPreferences['salesAlerts']) => void;
}) {
  const { t } = useTranslation();
  const name = useId();
  return (
    <fieldset className="shrink-0 mt-6">
      <legend className={SECTION_TITLE}>{t('notify.sales.title')}</legend>
      <div className="space-y-2">
        {(['each', 'daily'] as const).map((option) => (
          <label key={option} className={OPTION}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 shrink-0 accent-teal-500"
            />
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">
                {t(`notify.sales.${option}`)}
              </span>
              <span className="block text-[13px] text-ink/70">
                {t(`notify.sales.${option}Hint`)}
              </span>
            </span>
          </label>
        ))}
      </div>
      <p className={NOTE}>{t('notify.sales.note')}</p>
    </fieldset>
  );
}

/**
 * Configurações › Notificações (D25, revisão). Avisos que evitam perder um serviço, um prazo ou
 * dinheiro chegam sempre; a pessoa só escolhe o que é opcional (padrão Airbnb e Apple HIG).
 */
export function NotificationSettingsView({
  isPartner,
  onBack,
}: {
  isPartner: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { preferences, loading, error, saveError, reload, update } = useNotificationPreferences();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('notify.settingsTitle')}</h2>
      </div>

      <NotificationDeviceCard />

      <h3 className={SECTION_TITLE}>{t('notify.always.title')}</h3>
      <ul className={LIST}>
        <AlwaysRow item="purchases" />
        <AlwaysRow item="trips" />
        <AlwaysRow item="account" />
        {isPartner && (
          <>
            <AlwaysRow item="partnerClaims" />
            <AlwaysRow item="partnerMoney" />
          </>
        )}
      </ul>
      <p className={NOTE}>{t('notify.always.note')}</p>

      {loading ? (
        <div className="mt-6 h-40 shrink-0 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !preferences ? (
        <div className="mt-6 flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('notify.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('notify.retry')}
          </TextButton>
        </div>
      ) : (
        <>
          <h3 className={cn(SECTION_TITLE, 'mt-6')}>{t('notify.choices.title')}</h3>
          <ul className={LIST}>
            <ToggleRow
              icon={Star}
              label={t('notify.choices.reviewRequests')}
              hint={t('notify.choices.reviewRequestsHint')}
              checked={preferences.reviewRequests}
              onChange={(value) => void update({ reviewRequests: value })}
            />
            <ToggleRow
              icon={Sparkles}
              label={t('notify.choices.news')}
              hint={t('notify.choices.newsHint')}
              checked={preferences.news}
              onChange={(value) => void update({ news: value })}
            />
          </ul>
          <p className={NOTE}>{t('notify.choices.nightNote')}</p>

          {isPartner && (
            <SalesChoice
              value={preferences.salesAlerts}
              onChange={(value) => void update({ salesAlerts: value })}
            />
          )}

          {saveError && (
            <p role="alert" className="mt-3 px-1">
              <StatusText tone="danger">{t('notify.saveError')}</StatusText>
            </p>
          )}
        </>
      )}
    </div>
  );
}
