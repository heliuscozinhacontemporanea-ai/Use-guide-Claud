import { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AuthForms,
  closeEmailVerificationPromptUseCase,
  EmailVerificationWait,
  useAuthContext,
} from '../../domain/auth';
import {
  EMPTY_JOIN_DRAFT,
  joinAsPartnerUseCase,
  loadPartnerJoinDraftUseCase,
  PartnerBusinessPage,
  type PartnerJoinDraft,
  PartnerPresentation,
  savePartnerJoinDraftUseCase,
} from '../../domain/partners';
import { UsernameOnboardingContent } from '../../domain/user';
import { ScreenFallback } from '../../ui/lazy/DelayedFallback';
import { StackSheet } from '../../ui/layouts/stack/StackSheet';
import type { StackEntry } from '../../ui/layouts/stack/stackTypes';
import { AboutTermsView } from '../lazy/menuScreens';
import { signOut } from '../signOut';
import { usePartnerJoinStore } from '../stores/partnerJoinStore';

type JoinPage = 'business' | 'terms' | 'account' | 'username' | 'verify';

/**
 * Seja parceiro (D34, item 2 da D33): apresentação e "Seu negócio" em páginas empilhadas na folha.
 * Quem não tem conta cria ali mesmo, escolhe o @ e confirma o e-mail; a tela segue sozinha a cada
 * etapa e, no fim, cria o painel com o anúncio em rascunho. Junta auth, user e partners: fica no app.
 */
export function PartnerJoinSheet({
  isOpen,
  onClose,
  onJoined,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Painel criado: abre o painel do parceiro. */
  onJoined: () => void;
}) {
  const { t } = useTranslation();
  const { user, profile, loading, refreshProfile } = useAuthContext();
  const setJoining = usePartnerJoinStore((state) => state.setActive);
  const [pages, setPages] = useState<JoinPage[]>([]);
  const [draft, setDraft] = useState<PartnerJoinDraft>(
    () => loadPartnerJoinDraftUseCase() ?? EMPTY_JOIN_DRAFT
  );
  // "Criar meu painel" tocado: a cada mudança da conta, o fluxo anda sozinho até criar o painel.
  const [continuing, setContinuing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJoining(isOpen);
    return () => setJoining(false);
  }, [isOpen, setJoining]);

  useEffect(() => {
    if (!isOpen) {
      setPages([]);
      setContinuing(false);
      setError(null);
    }
  }, [isOpen]);

  const changeDraft = (next: PartnerJoinDraft) => {
    setDraft(next);
    savePartnerJoinDraftUseCase(next);
  };

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await joinAsPartnerUseCase(draft);
      closeEmailVerificationPromptUseCase();
      setContinuing(false);
      onJoined();
    } catch {
      setContinuing(false);
      setPages(['business']);
      setError(t('partnerGuide.join.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  }, [draft, onJoined, t]);

  useEffect(() => {
    if (!continuing || submitting || loading) return;
    // Ao avançar para conta, @ ou e-mail, "Seu negócio" continua embaixo para o voltar.
    if (!user || user.isAnonymous) setPages(['business', 'account']);
    // O nome do cadastro vem antes do @: a sugestão do @ sai dele (UsernameGate).
    else if (!profile?.firstName) return;
    else if (!profile.username) setPages(['business', 'username']);
    else if (!user.emailVerified) setPages(['business', 'verify']);
    else void submit();
  }, [continuing, submitting, loading, user, profile, submit]);

  const back = () => {
    if (pages.length === 0) {
      onClose();
      return;
    }
    setContinuing(false);
    setPages((current) => current.slice(0, -1));
  };

  const onVerified = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const pageEntry = (page: JoinPage): StackEntry => {
    switch (page) {
      case 'business':
        return {
          key: page,
          title: t('partnerGuide.join.title'),
          navBar: true,
          render: () => (
            <PartnerBusinessPage
              draft={draft}
              onChange={changeDraft}
              onOpenTerms={() => setPages((current) => [...current, 'terms'])}
              onSubmit={() => {
                setError(null);
                setContinuing(true);
              }}
              submitting={submitting}
              error={error}
            />
          ),
        };
      case 'terms':
        return {
          key: page,
          title: t('partnerGuide.join.termsLink'),
          navBar: true,
          render: () => (
            <Suspense fallback={<ScreenFallback />}>
              <AboutTermsView document="partner" />
            </Suspense>
          ),
        };
      case 'account':
        return {
          key: page,
          title: t('partnerGuide.join.accountTitle'),
          navBar: true,
          render: () => (
            <div className="pb-6">
              <p className="text-[15px] text-ink/75">{t('partnerGuide.join.accountLead')}</p>
              <AuthForms initialView="register" onSuccess={() => undefined} />
            </div>
          ),
        };
      case 'username':
        return {
          key: page,
          title: t('partnerGuide.join.usernameTitle'),
          navBar: true,
          render: () => (
            <div className="pb-6">
              <UsernameOnboardingContent
                onDone={() => void refreshProfile()}
                onSignOut={() => void signOut()}
              />
            </div>
          ),
        };
      case 'verify':
        return {
          key: page,
          navBar: true,
          render: () => (
            <div className="pb-6">
              <EmailVerificationWait onVerified={onVerified} note={t('partnerGuide.join.kept')} />
            </div>
          ),
        };
    }
  };

  const entries: StackEntry[] = [
    {
      key: 'intro',
      navBar: true,
      render: () => <PartnerPresentation onStart={() => setPages(['business'])} />,
    },
    ...pages.map(pageEntry),
  ];

  return (
    <StackSheet
      isOpen={isOpen}
      onClose={onClose}
      onBack={back}
      entries={entries}
      labels={{
        back: t('settings.back'),
        close: t('menu.closeMenu'),
        dialog: t('partnerSignup.presentation.title'),
      }}
    />
  );
}
