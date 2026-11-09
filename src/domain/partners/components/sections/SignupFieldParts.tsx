import { useTranslation } from 'react-i18next';
import { SIGNUP_ERROR } from './signupStyles';

/** "*" dos campos obrigatórios; o leitor de tela recebe `aria-required` no próprio campo. */
export function RequiredMark({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span aria-hidden="true" className="ml-0.5 text-danger">
      *
    </span>
  );
}

/**
 * Erro de um campo do cadastro. Recebe a chave vinda do schema (§12.5); `data-signup-error` é o
 * alvo do "Continuar", que rola até o primeiro erro da tela.
 */
export function SignupError({ message }: { message?: string }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <p data-signup-error className={SIGNUP_ERROR}>
      {t(message, { defaultValue: message })}
    </p>
  );
}
