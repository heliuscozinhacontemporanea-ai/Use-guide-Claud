import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { AuthForms, type AuthView } from './AuthForms';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'forgot';
}

/**
 * Entrar, criar conta e recuperar a senha numa folha (D33): sobe com a mola, fecha arrastando e pelo
 * voltar do sistema, e o app atrás vira cartão.
 */
export function LoginModal({ isOpen, onClose, initialTab = 'login' }: LoginModalProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<AuthView>(initialTab);
  // Cada abertura começa do zero (aba pedida, sem erro nem e-mail de antes).
  const [opening, setOpening] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setView(initialTab);
    setOpening((count) => count + 1);
  }, [isOpen, initialTab]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      nested
      title={view === 'forgot' ? t('auth.forgot.title') : t('auth.tabs.label')}
    >
      <AuthForms
        key={opening}
        initialView={initialTab}
        onSuccess={onClose}
        onViewChange={setView}
      />
    </Dialog>
  );
}
