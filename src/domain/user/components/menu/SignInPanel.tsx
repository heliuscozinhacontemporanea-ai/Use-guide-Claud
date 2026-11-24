import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { TermsNotice } from '../../../../ui/legal/TermsNotice';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useAuth } from '../../../auth';

function authErrorKey(code: unknown): string | null {
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/popup-blocked') return 'menu.authErrors.popupBlocked';
  if (code === 'auth/unauthorized-domain') return 'menu.authErrors.unauthorizedDomain';
  return 'menu.authErrors.generic';
}

/**
 * Menu sem login: entrar por e-mail ou Google, o aviso dos Termos (D35 1b) e o convite discreto para
 * quem tem um negócio, que cria a conta antes do Seja parceiro (D35, item 9).
 */
export function SignInPanel({
  onPartnerInvite,
  onOpenTerms,
}: {
  onPartnerInvite: () => void;
  onOpenTerms: () => void;
}) {
  const { t } = useTranslation();
  const { openLoginModal } = useUI();
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorKey(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? err.code : undefined;
      setErrorKey(authErrorKey(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('menu.signInOrRegister')}
        </h2>
        <button
          type="button"
          onClick={openLoginModal}
          className={`${BUTTON_SECONDARY} w-full min-h-12 inline-flex items-center justify-center gap-2.5`}
        >
          <Mail size={18} className="text-accent" aria-hidden="true" />
          {t('menu.emailPassword')}
        </button>
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[13px] text-ink/70">{t('menu.orUse')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={googleLoading}
          className={`${BUTTON_SECONDARY} w-full min-h-12 inline-flex items-center justify-center gap-3`}
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt=""
                loading="lazy"
              />
              {t('menu.continueGoogle')}
            </>
          )}
        </button>
        {errorKey && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger text-center"
          >
            {t(errorKey)}
          </p>
        )}
        <TermsNotice action="continue" onOpenTerms={onOpenTerms} />
      </section>
      <p className="pt-4 border-t border-line text-center text-meta text-ink-muted">
        <Trans
          i18nKey="menu.partnerInvite"
          components={{
            invite: (
              <button
                type="button"
                onClick={onPartnerInvite}
                className="min-h-11 font-semibold text-partner rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
