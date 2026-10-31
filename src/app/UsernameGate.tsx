import { logoutUseCase, useAuthContext } from '../domain/auth';
import { UsernameOnboardingDialog } from '../domain/user';

/**
 * Toda conta logada precisa de @ (D21): logo depois de criar a conta (e-mail ou Google) e para
 * contas antigas sem @, o app pede a escolha antes de seguir. Junta auth e user, por isso fica no app.
 */
export function UsernameGate() {
  const { user, profile, loading, refreshProfile } = useAuthContext();
  // Espera o nome do cadastro (e-mail ou Google) estar salvo: a sugestão do @ vem dele.
  if (loading || !user || user.isAnonymous || !profile?.firstName || profile.username) return null;
  return (
    <UsernameOnboardingDialog
      onDone={() => void refreshProfile()}
      onSignOut={() => void logoutUseCase()}
    />
  );
}
