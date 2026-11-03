import { BellRing } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { usePushDeviceState } from '../hooks/usePushDeviceState';
import {
  ALWAYS_IN_CENTER,
  type NotificationCategory,
  PARTNER_CATEGORIES,
  USER_CATEGORIES,
} from '../types/notificationCategories';

const LIST =
  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
const SECTION_TITLE = 'px-1 mb-2 text-[13px] font-semibold text-ink/70';

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

function DeviceCard() {
  const { t } = useTranslation();
  const { state, enable } = usePushDeviceState();
  const message =
    state === 'default'
      ? t('notify.device.default')
      : state === 'granted'
        ? null
        : t(`notify.device.${state}`);
  return (
    <section className="shrink-0 mb-5 p-4 rounded-[20px] bg-surface border border-line space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          <BellRing size={20} aria-hidden="true" />
        </span>
        <h3 className="text-[15px] font-semibold text-ink">{t('notify.device.title')}</h3>
      </div>
      {state === 'granted' ? (
        <StatusText tone="success">{t('notify.device.granted')}</StatusText>
      ) : (
        <p className="text-[13px] text-ink/70">{message}</p>
      )}
      {state === 'default' && (
        <button type="button" onClick={() => void enable()} className={`${BUTTON_PRIMARY} w-full`}>
          {t('notify.device.enable')}
        </button>
      )}
    </section>
  );
}

/** Configurações › Notificações, para todas as contas (D25). */
export function NotificationSettingsView({
  isPartner,
  onBack,
}: {
  isPartner: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { preferences, loading, error, saveError, reload, setPush, setOption } =
    useNotificationPreferences();

  const categoryRow = (category: NotificationCategory) => (
    <ToggleRow
      key={category}
      label={t(`notify.categories.${category}.label`)}
      hint={
        ALWAYS_IN_CENTER.includes(category)
          ? `${t(`notify.categories.${category}.hint`)} ${t('notify.alwaysInCenter')}.`
          : t(`notify.categories.${category}.hint`)
      }
      checked={preferences?.push[category] ?? false}
      onChange={(value) => setPush(category, value)}
    />
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('notify.settingsTitle')}</h2>
      </div>
      <p className="shrink-0 mb-5 px-1 text-[13px] text-ink/70">{t('notify.settingsIntro')}</p>

      <DeviceCard />

      {loading ? (
        <div className="h-64 shrink-0 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !preferences ? (
        <div className="flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('notify.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('notify.retry')}
          </TextButton>
        </div>
      ) : (
        <>
          <h3 className={SECTION_TITLE}>{t('notify.userSection')}</h3>
          <ul className={`${LIST} mb-5`}>{USER_CATEGORIES.map(categoryRow)}</ul>

          {isPartner && (
            <>
              <h3 className={SECTION_TITLE}>{t('notify.partnerSection')}</h3>
              <ul className={`${LIST} mb-5`}>
                {PARTNER_CATEGORIES.map(categoryRow)}
                <ToggleRow
                  label={t('notify.dailyDigest')}
                  hint={t('notify.dailyDigestHint')}
                  checked={preferences.dailyDigest}
                  onChange={(value) => setOption('dailyDigest', value)}
                />
              </ul>
            </>
          )}

          <ul className={LIST}>
            <ToggleRow
              label={t('notify.quietHours')}
              hint={t('notify.quietHoursHint')}
              checked={preferences.quietHours}
              onChange={(value) => setOption('quietHours', value)}
            />
          </ul>

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
