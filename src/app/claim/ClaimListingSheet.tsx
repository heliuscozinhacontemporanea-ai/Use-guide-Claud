import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmailVerificationWait, useAuthContext } from '../../domain/auth';
import { ClaimListingPage, ClaimSentPage } from '../../domain/partners';
import { StackSheet } from '../../ui/layouts/stack/StackSheet';
import type { StackEntry } from '../../ui/layouts/stack/stackTypes';
import { useClaimStore } from '../stores/claimStore';

type ClaimPage = 'verify' | 'form' | 'sent';

/**
 * Folha "Assumir anúncio" (D35, telas 6 e 7): confirma o e-mail se faltar (como no Seja parceiro),
 * o pedido com os documentos e "Pedido enviado". Junta auth e partners: fica no app.
 */
export function ClaimListingSheet({ onOpenPanel }: { onOpenPanel: () => void }) {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuthContext();
  const target = useClaimStore((state) => state.target);
  const close = useClaimStore((state) => state.close);
  const [page, setPage] = useState<ClaimPage>('form');
  const emailVerified = user?.emailVerified === true;

  // Cada abertura começa pela confirmação do e-mail, se faltar; depois a espera troca a página sozinha.
  // biome-ignore lint/correctness/useExhaustiveDependencies: só na abertura, com o e-mail daquele momento.
  useEffect(() => {
    if (target) setPage(emailVerified ? 'form' : 'verify');
  }, [target]);

  useEffect(() => {
    if (emailVerified) setPage((current) => (current === 'verify' ? 'form' : current));
  }, [emailVerified]);

  const onVerified = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const entries: StackEntry[] = target
    ? [
        page === 'verify'
          ? {
              key: 'verify',
              navBar: true,
              render: () => (
                <div className="pb-6">
                  <EmailVerificationWait
                    onVerified={onVerified}
                    note={t('partnerGuide.join.verifyNeeded')}
                  />
                </div>
              ),
            }
          : page === 'form'
            ? {
                key: 'form',
                title: t('claims.title'),
                navBar: true,
                render: () => (
                  <ClaimListingPage
                    target={target}
                    needsTerms={profile?.role !== 'partner'}
                    onSent={() => {
                      void refreshProfile();
                      setPage('sent');
                    }}
                  />
                ),
              }
            : {
                key: 'sent',
                title: t('claims.title'),
                navBar: true,
                render: () => (
                  <ClaimSentPage
                    name={target.name}
                    onOpenPanel={() => {
                      close();
                      onOpenPanel();
                    }}
                  />
                ),
              },
      ]
    : [];

  return (
    <StackSheet
      isOpen={target !== null}
      onClose={close}
      onBack={close}
      entries={entries}
      labels={{
        back: t('settings.back'),
        close: t('menu.closeMenu'),
        dialog: t('claims.title'),
      }}
    />
  );
}
