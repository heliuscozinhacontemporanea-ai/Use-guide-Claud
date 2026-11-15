import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { UsernameOnboardingContent } from './UsernameOnboardingContent';

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
  return (
    <Dialog
      open
      dismissible={false}
      onOpenChange={() => undefined}
      title={t('username.onboardingTitle')}
    >
      <UsernameOnboardingContent onDone={onDone} onSignOut={onSignOut} />
    </Dialog>
  );
}
