import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { FADE } from '../../../ui/motion/tokens';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export type AuthView = 'login' | 'register' | 'forgot';

/**
 * Entrar, criar conta e recuperar a senha (D33): a mesma tela na folha de acesso e no Seja parceiro
 * (D34). A troca entre as três só esmaece.
 */
export function AuthForms({
  initialView = 'login',
  onSuccess,
  onViewChange,
  onOpenTerms,
  note,
}: {
  initialView?: AuthView;
  onSuccess: () => void;
  onViewChange?: (view: AuthView) => void;
  /** Abre "Termos e políticas" sem sair do cadastro (D35 1b). */
  onOpenTerms: () => void;
  /** Linha no alto, de onde a pessoa veio (convite do parceiro, "Sou o dono"), D35. */
  note?: ReactNode;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { login, signUp, loginWithGoogle, forgotPassword } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [passedEmail, setPassedEmail] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const show = (next: AuthView, email?: string) => {
    if (email) setPassedEmail(email);
    setApiError(null);
    setView(next);
    onViewChange?.(next);
  };

  return (
    <>
      {note && view !== 'forgot' ? <div className="mt-2">{note}</div> : null}
      {view !== 'forgot' && (
        <div className="mt-3 mb-5">
          <SegmentedControl<'login' | 'register'>
            label={t('auth.tabs.label')}
            value={view}
            onChange={(next) => show(next)}
            options={[
              { value: 'login', label: t('auth.tabs.login') },
              { value: 'register', label: t('auth.tabs.register') },
            ]}
          />
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : FADE}
          className={view === 'forgot' ? 'mt-4' : undefined}
        >
          {view === 'login' && (
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToRegister={(email) => show('register', email)}
              onSwitchToForgotPassword={(email) => show('forgot', email)}
              login={login}
              loginWithGoogle={loginWithGoogle}
              apiError={apiError}
              setApiError={setApiError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onOpenTerms={onOpenTerms}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              onSuccess={onSuccess}
              onSwitchToLogin={(email) => show('login', email)}
              signUp={signUp}
              apiError={apiError}
              setApiError={setApiError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              initialEmail={passedEmail}
              onOpenTerms={onOpenTerms}
            />
          )}
          {view === 'forgot' && (
            <ForgotPasswordForm
              onSwitchToLogin={() => show('login')}
              forgotPassword={forgotPassword}
              apiError={apiError}
              setApiError={setApiError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              initialEmail={passedEmail}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
