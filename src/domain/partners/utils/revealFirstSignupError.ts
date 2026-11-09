/**
 * Rola até o primeiro erro do passo e põe o foco no campo dele. Espera dois quadros para o React
 * desenhar as mensagens (`data-signup-error`, em `SignupError`).
 */
export function revealFirstSignupError(root: Element | null | undefined): void {
  if (!root) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const message = root.querySelector<HTMLElement>('[data-signup-error]');
      if (!message) return;
      const field = message.parentElement?.querySelector<HTMLElement>(
        'input:not([type=hidden]):not([type=file]), textarea, select, button'
      );
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      (field ?? message).scrollIntoView({
        block: 'center',
        behavior: reduced ? 'auto' : 'smooth',
      });
      field?.focus({ preventScroll: true });
    })
  );
}
