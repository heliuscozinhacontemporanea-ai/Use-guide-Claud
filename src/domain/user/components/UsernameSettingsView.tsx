import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/** Configurações › Nome de usuário (D21). */
export function UsernameSettingsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const username = useUsername();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('username.title')}</h2>
      </div>

      {username.loading ? (
        <div className="h-28 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : username.error ? (
        <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
          <span>{t('username.loadError')}</span>
          <TextButton tone="accent" onClick={() => void username.reload()}>
            {t('username.retry')}
          </TextButton>
        </div>
      ) : (
        <UsernameForm username={username} />
      )}
    </div>
  );
}
