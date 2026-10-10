import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthModalShell } from './AuthModalShell';
import { cn } from '../../../shared/utils/cn';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, signUp, loginWithGoogle, forgotPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [direction, setDirection] = useState<number>(0);
  const [passedEmail, setPassedEmail] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('login');
      setDirection(0);
      setPassedEmail('');
      setApiError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleBack = () => {
    onClose();
  };

  const handleSwitchToRegister = (email?: string) => {
    if (email) setPassedEmail(email);
    setApiError(null);
    setDirection(1);
    setActiveTab('register');
  };

  const handleSwitchToLogin = (email?: string) => {
    if (email) setPassedEmail(email);
    setApiError(null);
    setDirection(-1);
    setActiveTab('login');
  };

  const handleSwitchToForgotPassword = (email?: string) => {
    if (email) setPassedEmail(email);
    setApiError(null);
    setDirection(1);
    setActiveTab('forgot');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect horizontal swipe with clear dominance over vertical scroll
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && activeTab === 'login') {
        handleSwitchToRegister();
      } else if (deltaX > 0 && (activeTab === 'register' || activeTab === 'forgot')) {
        handleSwitchToLogin();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <AuthModalShell isOpen={isOpen} onClose={handleBack}>
      {activeTab === 'forgot' ? (
        <div className="mb-6 flex items-center gap-2">
          <button
            id="auth-forgot-back-btn"
            type="button"
            onClick={() => handleSwitchToLogin()}
            aria-label="Voltar para login"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl active:scale-90 transition-all text-white/70 hover:text-white flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50 -ml-1"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 text-center pr-10">
            <h2 className="text-xl font-display font-black text-white">Recuperar Senha</h2>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-center">
          <div
            role="tablist"
            aria-label="Opções de autenticação"
            className="flex items-center justify-center gap-6"
          >
            <button
              type="button"
              role="tab"
              id="auth-tab-login"
              aria-controls="auth-panel-login"
              aria-label="Entrar"
              aria-selected={activeTab === 'login'}
              onClick={() => handleSwitchToLogin()}
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-full cursor-pointer"
            >
              <LogIn
                size={activeTab === 'login' ? 24 : 18}
                className={cn(
                  'transition-all duration-300',
                  activeTab === 'login'
                    ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]'
                    : 'text-white/50 hover:text-white/80'
                )}
              />
            </button>
            <button
              type="button"
              role="tab"
              id="auth-tab-register"
              aria-controls="auth-panel-register"
              aria-label="Cadastro"
              aria-selected={activeTab === 'register'}
              onClick={() => handleSwitchToRegister()}
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-full cursor-pointer"
            >
              <UserPlus
                size={activeTab === 'register' ? 24 : 18}
                className={cn(
                  'transition-all duration-300',
                  activeTab === 'register'
                    ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]'
                    : 'text-white/50 hover:text-white/80'
                )}
              />
            </button>
          </div>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex flex-col"
      >
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'login' && (
            <motion.div
              key="login"
              role="tabpanel"
              id="auth-panel-login"
              aria-labelledby="auth-tab-login"
              initial={{ opacity: 0, x: direction < 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction < 0 ? 20 : -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <LoginForm
                onSuccess={onClose}
                onSwitchToRegister={handleSwitchToRegister}
                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                login={login}
                loginWithGoogle={loginWithGoogle}
                apiError={apiError}
                setApiError={setApiError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div
              key="register"
              role="tabpanel"
              id="auth-panel-register"
              aria-labelledby="auth-tab-register"
              initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <RegisterForm
                onSuccess={onClose}
                onSwitchToLogin={handleSwitchToLogin}
                signUp={signUp}
                apiError={apiError}
                setApiError={setApiError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                initialEmail={passedEmail}
              />
            </motion.div>
          )}

          {activeTab === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ForgotPasswordForm
                onSwitchToLogin={handleSwitchToLogin}
                forgotPassword={forgotPassword}
                apiError={apiError}
                setApiError={setApiError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                initialEmail={passedEmail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthModalShell>
  );
}
