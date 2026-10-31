import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { applyEmailVerificationCodeUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { ResetPassword } from './ResetPassword';

type VerifyState = 'verifying' | 'verified' | 'invalid';

/**
 * Página de ação da conta (D22), o URL de ação dos modelos de e-mail do Firebase:
 * https://useguide.com.br/conta/acao?mode=...&oobCode=... Confirma o e-mail ou abre a nova senha.
 */
export function AccountActionPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const code = searchParams.get('oobCode');
  if (mode === 'resetPassword') return <ResetPassword />;
  if (mode === 'verifyEmail' && code) return <VerifyEmail code={code} />;
  return <ActionResult state="invalid" />;
}

function VerifyEmail({ code }: { code: string }) {
  const [state, setState] = useState<VerifyState>('verifying');

  useEffect(() => {
    let active = true;
    applyEmailVerificationCodeUseCase(code)
      .then(() => {
        if (!active) return;
        // Se a conta estiver aberta neste navegador, o app já mostra o e-mail como confirmado.
        if (useAuthStore.getState().user) useAuthStore.getState().setEmailVerified(true);
        setState('verified');
      })
      .catch(() => active && setState('invalid'));
    return () => {
      active = false;
    };
  }, [code]);

  return <ActionResult state={state} />;
}

function ActionResult({ state }: { state: VerifyState }) {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const Icon =
    state === 'verifying' ? LoaderCircle : state === 'verified' ? CircleCheck : CircleAlert;

  return (
    <main className="min-h-dvh bg-app flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-surface border border-line p-8 text-center space-y-4">
        <Icon
          size={40}
          aria-hidden="true"
          className={
            state === 'verifying'
              ? 'mx-auto text-accent animate-spin motion-reduce:animate-none'
              : state === 'verified'
                ? 'mx-auto text-success'
                : 'mx-auto text-danger'
          }
        />
        {state === 'verifying' ? (
          <p role="status" className="text-[15px] text-ink/80">
            {t('emailVerification.action.verifying')}
          </p>
        ) : (
          <>
            <h1 className="text-[22px] font-display font-bold text-ink">
              {t(
                state === 'verified'
                  ? 'emailVerification.action.verifiedTitle'
                  : 'emailVerification.action.invalidTitle'
              )}
            </h1>
            <p className="text-[15px] text-ink/70">
              {t(
                state === 'verified'
                  ? 'emailVerification.action.verifiedText'
                  : 'emailVerification.action.invalidText'
              )}
            </p>
            <button
              type="button"
              onClick={() => goTo('explore', '', { replace: true })}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('emailVerification.action.goToApp')}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
