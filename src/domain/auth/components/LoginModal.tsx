import { Store } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoginModalTab, LoginNote } from '../../../shared/stores/useUIStore';
import type { AccountEntryActions } from '../types/auth';
import { Dialog } from '../../../ui/components/Dialog';
import { AuthForms, type AuthView } from './AuthForms';

interface LoginModalProps {
  /** Entrar e criar conta com o perfil junto, vindo da composição do app (B77). */
  actions: AccountEntryActions;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LoginModalTab;
  /** De onde a pessoa veio (convite do parceiro, "Sou o dono"), D35. */
  note?: LoginNote | null;
  /** "Termos e políticas" com o próprio voltar; vem da composição do app (D35 1b). */
  renderTerms: (onBack: () => void) => ReactNode;
}

/**
 * Entrar, criar conta e recuperar a senha numa folha (D33): sobe com a mola, fecha arrastando e pelo
 * voltar do sistema, e o app atrás vira cartão. Os Termos abrem na mesma folha, sem perder o cadastro.
 */
export function LoginModal({
  actions,
  isOpen,
  onClose,
  initialTab = 'login',
  note,
  renderTerms,
}: LoginModalProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<AuthView>(initialTab);
  const [showTerms, setShowTerms] = useState(false);
  // Cada abertura começa do zero (aba pedida, sem erro nem e-mail de antes).
  const [opening, setOpening] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setView(initialTab);
    setShowTerms(false);
    setOpening((count) => count + 1);
  }, [isOpen, initialTab]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      nested
      title={
        showTerms
          ? t('appAbout.terms')
          : view === 'forgot'
            ? t('auth.forgot.title')
            : t('auth.tabs.label')
      }
    >
      {showTerms ? renderTerms(() => setShowTerms(false)) : null}
      {/* O formulário só some da tela: o que já foi digitado continua ao voltar dos Termos. */}
      <div hidden={showTerms}>
        <AuthForms
          key={opening}
          actions={actions}
          initialView={initialTab}
          onSuccess={onClose}
          onViewChange={setView}
          onOpenTerms={() => setShowTerms(true)}
          note={
            note ? (
              <p className="flex items-start gap-2.5 p-3 rounded-xl bg-partner-soft border border-partner-line text-meta text-ink">
                <Store size={18} className="shrink-0 text-partner" aria-hidden="true" />
                <span>{t(note.key, note.values ?? {})}</span>
              </p>
            ) : null
          }
        />
      </div>
    </Dialog>
  );
}
