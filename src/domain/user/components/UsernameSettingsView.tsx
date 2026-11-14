import { useTranslation } from 'react-i18next';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/** Configurações › Nome de usuário (D21). O `<` e o título ficam na barra fixa da folha (D33). */
export function UsernameSettingsView() {
  const { t } = useTranslation();
  const username = useUsername();

  return (
    <div className="flex flex-col">
      {username.loading ? (
        <div className="h-28 rounded-card bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : username.error ? (
        <div className="flex items-center justify-between gap-2 text-meta text-ink-muted">
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
