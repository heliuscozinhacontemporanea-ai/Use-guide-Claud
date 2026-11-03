import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { TextButton } from '../../../ui/components/TextButton';
import {
  type NotificationSettingKey,
  useNotificationSettings,
} from '../hooks/useNotificationSettings';

const OPTIONS: Array<{ key: NotificationSettingKey; label: string; hint: string }> = [
  {
    key: 'reviewNotifications',
    label: 'appAbout.notifications.reviews',
    hint: 'appAbout.notifications.reviewsHint',
  },
  {
    key: 'planExpiringNotifications',
    label: 'appAbout.notifications.plan',
    hint: 'appAbout.notifications.planHint',
  },
];

/** Configurações › Notificações do parceiro (antes ficavam em Sobre o app). */
export function NotificationSettingsView({
  partnerId,
  onBack,
}: {
  partnerId: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const { settings, loading, error, saveError, reload, updateSetting } =
    useNotificationSettings(partnerId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('appAbout.notifications.title')}
        </h2>
      </div>
      <p className="mb-5 px-1 text-[13px] text-ink/70">{t('appAbout.notifications.intro')}</p>

      {loading ? (
        <div className="h-36 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !settings ? (
        <div className="flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('appAbout.notifications.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('appAbout.retry')}
          </TextButton>
        </div>
      ) : (
        <>
          <ul className="shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            {OPTIONS.map((option) => {
              const labelId = `${baseId}-${option.key}`;
              const hintId = `${labelId}-hint`;
              return (
                <li key={option.key} className="flex items-center gap-3 pl-4 pr-2 py-3">
                  <div className="flex-1 min-w-0">
                    <p id={labelId} className="text-[15px] font-semibold text-ink">
                      {t(option.label)}
                    </p>
                    <p id={hintId} className="text-[13px] text-ink/70">
                      {t(option.hint)}
                    </p>
                  </div>
                  <Switch
                    checked={settings[option.key]}
                    onChange={(value) => void updateSetting(option.key, value)}
                    labelledBy={labelId}
                    describedBy={hintId}
                  />
                </li>
              );
            })}
          </ul>
          {saveError && (
            <p role="alert" className="mt-3 px-1">
              <StatusText tone="danger">{t('appAbout.notifications.saveError')}</StatusText>
            </p>
          )}
        </>
      )}
    </div>
  );
}
