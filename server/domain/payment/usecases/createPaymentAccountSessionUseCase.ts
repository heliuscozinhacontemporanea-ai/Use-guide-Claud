import { paymentAccountService } from '../factory';
import type { EnsurePaymentAccountInput } from '../services/paymentAccountService';

/** Cria a conta Stripe do CNPJ, se ainda não existir, e abre a sessão do cadastro embutido (D14). */
export function createPaymentAccountSessionUseCase(
  input: EnsurePaymentAccountInput
): Promise<{ clientSecret: string }> {
  return paymentAccountService.createSession(input);
}
