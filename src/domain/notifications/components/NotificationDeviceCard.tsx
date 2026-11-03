import { Bell, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { usePushDeviceState } from '../hooks/usePushDeviceState';

/** Ativar notificações neste aparelho. É a única ação principal da tela. */
export function NotificationDeviceCard() {
  const { t } = useTranslation();
  const { state, enable } = usePushDeviceState();

  if (state === 'default') {
    return (
      <section className="shrink-0 mb-6 p-4 rounded-[20px] bg-surface border border-line space-y-3">
        <div className="space-y-1">
          <h3 className="text-[16px] font-semibold text-ink">{t('notify.device.defaultTitle')}</h3>
          <p className="text-[14px] text-ink/70 leading-relaxed">{t('notify.device.default')}</p>
        </div>
        <button type="button" onClick={() => void enable()} className={`${BUTTON_PRIMARY} w-full`}>
          {t('notify.device.enable')}
        </button>
      </section>
    );
  }

  const granted = state === 'granted';
  const Icon = granted ? Bell : BellOff;
  return (
    <section className="shrink-0 mb-6 p-4 rounded-[20px] bg-surface border border-line flex items-start gap-3">
      <Icon size={20} className="mt-0.5 shrink-0 text-ink/60" aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {granted && (
          <h3 className="text-[15px] font-semibold text-ink">{t('notify.device.granted')}</h3>
        )}
        <p className="text-[14px] text-ink/70 leading-relaxed">
          {granted ? t('notify.device.grantedHint') : t(`notify.device.${state}`)}
        </p>
      </div>
    </section>
  );
}
