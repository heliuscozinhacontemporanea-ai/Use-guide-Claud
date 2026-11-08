import { Handshake, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useAuth } from '../../../auth';
import { MenuRow } from './MenuRow';

function authErrorKey(code: unknown): string | null {
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/popup-blocked') return 'menu.authErrors.popupBlocked';
  if (code === 'auth/unauthorized-domain') return 'menu.authErrors.unauthorizedDomain';
  return 'menu.authErrors.generic';
}

/** Menu sem login: entrar por e-mail ou Google e o convite para parceiros. */
export function SignInPanel({ onPartnersOpen }: { onPartnersOpen: () => void }) {
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
      </section>
      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        <MenuRow icon={Handshake} label={t('profile.partnerProgram')} onClick={onPartnersOpen} />
      </ul>
    </div>
  );
}
