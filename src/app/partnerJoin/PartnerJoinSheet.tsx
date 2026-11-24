import { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  closeEmailVerificationPromptUseCase,
  EmailVerificationWait,
  useAuthContext,
} from '../../domain/auth';
import {
  EMPTY_JOIN_DRAFT,
  joinAsPartnerUseCase,
  PartnerBusinessPage,
  type PartnerJoinDraft,
  PartnerPresentation,
} from '../../domain/partners';
import { ScreenFallback } from '../../ui/lazy/DelayedFallback';
import { StackSheet } from '../../ui/layouts/stack/StackSheet';
import type { StackEntry } from '../../ui/layouts/stack/stackTypes';
import { AboutTermsView } from '../lazy/menuScreens';
import { usePartnerJoinStore } from '../stores/partnerJoinStore';

type JoinPage = 'verify' | 'business' | 'terms';

/**
 * Seja parceiro (D34, item 2 da D33): apresentação e "Seu negócio" em páginas empilhadas na folha.
 * Só abre com conta (D35, item 9): quem não confirmou o e-mail confirma antes de "Seu negócio", e a
 * tela segue sozinha; no fim, cria o painel com o anúncio em rascunho. Junta auth e partners: fica no
 * app.
 */
export function PartnerJoinSheet({
  isOpen,
  onClose,
  onNeedAccount,
  onJoined,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Aberto por link sem conta: "Começar" leva ao cadastro pelo convite (D35, item 9). */
  onNeedAccount: () => void;
  /** Painel criado: abre o painel do parceiro. */
  onJoined: () => void;
}) {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuthContext();
  const setJoining = usePartnerJoinStore((state) => state.setActive);
  const [pages, setPages] = useState<JoinPage[]>([]);
  const [draft, setDraft] = useState<PartnerJoinDraft>(EMPTY_JOIN_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJoining(isOpen);
    return () => setJoining(false);
  }, [isOpen, setJoining]);

  useEffect(() => {
    if (!isOpen) {
      setPages([]);
      setDraft(EMPTY_JOIN_DRAFT);
      setError(null);
    }
  }, [isOpen]);

  const emailVerified = user?.emailVerified === true;
  // E-mail confirmado (em outra aba ou pelo link): a espera dá lugar a "Seu negócio".
  useEffect(() => {
    if (emailVerified) {
      setPages((current) => (current[0] === 'verify' ? ['business'] : current));
    }
  }, [emailVerified]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await joinAsPartnerUseCase(draft);
      closeEmailVerificationPromptUseCase();
      onJoined();
    } catch (err) {
      setPages(['business']);
      setError(
        err instanceof Error && err.message === 'LISTING_NAME_RESERVED'
          ? t('partnerGuide.join.errors.nameReserved')
          : t('partnerGuide.join.errors.failed')
      );
    } finally {
      setSubmitting(false);
    }
  }, [draft, onJoined, t]);

  const back = () => {
    if (pages.length === 0) {
      onClose();
      return;
    }
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
              onChange={setDraft}
              onOpenTerms={() => setPages((current) => [...current, 'terms'])}
              onSubmit={() => void submit()}
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
      case 'verify':
        return {
          key: page,
          navBar: true,
          render: () => (
            <div className="pb-6">
              <EmailVerificationWait
                onVerified={onVerified}
                note={t('partnerGuide.join.verifyNeeded')}
              />
            </div>
          ),
        };
    }
  };

  const entries: StackEntry[] = [
    {
      key: 'intro',
      navBar: true,
      render: () => (
        <PartnerPresentation
          onStart={() =>
            !user || user.isAnonymous
              ? onNeedAccount()
              : setPages([emailVerified ? 'business' : 'verify'])
          }
        />
      ),
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
