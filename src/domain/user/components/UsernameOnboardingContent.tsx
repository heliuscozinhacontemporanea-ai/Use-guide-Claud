import { useTranslation } from 'react-i18next';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/**
 * Escolha do @ obrigatória (D21): o conteúdo da folha de boas-vindas e da página "Seu @" do Seja
 * parceiro (D34). Só sai ao salvar ou ao sair da conta.
 */
export function UsernameOnboardingContent({
  onDone,
  onSignOut,
}: {
  onDone: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const username = useUsername();
  return (
    <>
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
        <UsernameForm username={username} onSaved={onDone} />
      )}
      <div className="mt-4 flex justify-center">
        <TextButton tone="ink" onClick={onSignOut}>
          {t('username.signOut')}
        </TextButton>
      </div>
    </>
  );
}
