import { sendEmailVerificationUseCase } from '../../factory';
import { useEmailVerificationPromptStore } from '../../stores/useEmailVerificationPromptStore';

/**
 * Conta nova por e-mail (D22): envia o link de confirmação e abre o aviso. Se o envio falhar, o
 * aviso abre do mesmo jeito e oferece outro envio.
 */
export async function startEmailVerificationUseCase(locale: string): Promise<void> {
  const prompt = useEmailVerificationPromptStore.getState();
  await sendEmailVerificationUseCase(locale)
    .then(() => prompt.markSent(Date.now()))
    .catch(() => undefined);
  prompt.open('signup');
}
