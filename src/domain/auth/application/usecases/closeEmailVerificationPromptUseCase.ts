import { useEmailVerificationPromptStore } from '../../stores/useEmailVerificationPromptStore';

/** Fecha o aviso "Confirme seu e-mail" quando outro fluxo já cuidou da confirmação (D34). */
export function closeEmailVerificationPromptUseCase(): void {
  useEmailVerificationPromptStore.getState().close();
}
