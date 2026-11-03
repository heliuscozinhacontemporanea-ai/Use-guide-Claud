import {
  CalendarCheck,
  Check,
  type LucideIcon,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
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
const SECTION_TITLE = 'px-1 mb-2 text-[13px] font-semibold text-ink/70';
const NOTE = 'px-1 mt-2 text-[13px] text-ink/70';

function AlwaysRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 min-h-12">
      <Icon size={18} className="shrink-0 text-ink/60" aria-hidden="true" />
      <span className="text-[15px] text-ink">{text}</span>
    </li>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <li className="flex items-center gap-3 pl-4 pr-2 py-3">
      <div className="flex-1 min-w-0">
        <p id={id} className="text-[15px] font-semibold text-ink">
          {label}
        </p>
        <p id={`${id}-hint`} className="text-[13px] text-ink/70">
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
      <div className={LIST}>
        {(['each', 'daily'] as const).map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 px-4 py-3 min-h-14 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-teal-400/50"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-ink">
                {t(`notify.sales.${option}`)}
              </span>
              <span className="block text-[13px] text-ink/70">
                {t(`notify.sales.${option}Hint`)}
              </span>
            </span>
            <Check
              size={20}
              aria-hidden="true"
              className={cn('shrink-0 text-accent', value !== option && 'invisible')}
            />
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
        <AlwaysRow icon={ShoppingBag} text={t('notify.always.purchases')} />
        <AlwaysRow icon={CalendarCheck} text={t('notify.always.trips')} />
        <AlwaysRow icon={ShieldCheck} text={t('notify.always.account')} />
        {isPartner && (
          <>
            <AlwaysRow icon={MessageSquareText} text={t('notify.always.partnerClaims')} />
            <AlwaysRow icon={Wallet} text={t('notify.always.partnerMoney')} />
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
              label={t('notify.choices.reviewRequests')}
              hint={t('notify.choices.reviewRequestsHint')}
              checked={preferences.reviewRequests}
              onChange={(value) => void update({ reviewRequests: value })}
            />
            <ToggleRow
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
