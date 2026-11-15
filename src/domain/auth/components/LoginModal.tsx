import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { FADE } from '../../../ui/motion/tokens';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthView = 'login' | 'register' | 'forgot';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'forgot';
}

/**
 * Entrar, criar conta e recuperar a senha numa folha (D33): sobe com a mola, fecha arrastando e pelo
 * voltar do sistema, e o app atrás vira cartão. A troca entre as três telas só esmaece.
 */
export function LoginModal({ isOpen, onClose, initialTab = 'login' }: LoginModalProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { login, signUp, loginWithGoogle, forgotPassword } = useAuth();
  const [view, setView] = useState<AuthView>(initialTab);
  const [passedEmail, setPassedEmail] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView(initialTab);
      return;
    }
    setPassedEmail('');
    setApiError(null);
    setIsLoading(false);
  }, [isOpen, initialTab]);

  const show = (next: AuthView, email?: string) => {
    if (email) setPassedEmail(email);
    setApiError(null);
    setView(next);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      nested
      title={view === 'forgot' ? t('auth.forgot.title') : t('auth.tabs.label')}
    >
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
              onSuccess={onClose}
              onSwitchToRegister={(email) => show('register', email)}
              onSwitchToForgotPassword={(email) => show('forgot', email)}
              login={login}
              loginWithGoogle={loginWithGoogle}
              apiError={apiError}
              setApiError={setApiError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              onSuccess={onClose}
              onSwitchToLogin={(email) => show('login', email)}
              signUp={signUp}
              apiError={apiError}
              setApiError={setApiError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              initialEmail={passedEmail}
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
    </Dialog>
  );
}
