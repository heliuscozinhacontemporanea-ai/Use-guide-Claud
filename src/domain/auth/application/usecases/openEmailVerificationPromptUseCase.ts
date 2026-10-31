import { useEmailVerificationPromptStore } from '../../stores/useEmailVerificationPromptStore';

/**
 * Abre o aviso "Confirme seu e-mail" (D22). Outros domínios chamam quando o servidor responde que a
 * ação exige e-mail confirmado (ex.: comprar ingresso, reservar, virar parceiro).
 */
export function openEmailVerificationPromptUseCase(): void {
  useEmailVerificationPromptStore.getState().open('required');
}
