import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/**
 * Passo obrigatório logo depois de criar a conta (e-mail ou Google) e para contas sem @ (D21):
 * assim toda conta pode ser encontrada pelo @. Só fecha ao salvar ou ao sair da conta.
 */
export function UsernameOnboardingDialog({
  onDone,
  onSignOut,
}: {
  onDone: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const username = useUsername();

  return (
    <Dialog
      open
      dismissible={false}
      onOpenChange={() => undefined}
      title={t('username.onboardingTitle')}
    >
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
    </Dialog>
  );
}
