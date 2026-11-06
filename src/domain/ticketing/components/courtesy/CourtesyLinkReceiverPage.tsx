import { CalendarClock, Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { openEmailVerificationPromptUseCase } from '../../../auth';
import { acceptCourtesyLinkUseCase } from '../../application/usecases/acceptCourtesyLinkUseCase';
import { previewCourtesyLinkUseCase } from '../../application/usecases/previewCourtesyLinkUseCase';
import type { CourtesyLinkPreview } from '../../types/courtesy';
import { courtesyErrorKey } from '../../utils/courtesyErrorKey';

/**
 * Página do link de convite (p28): mostra o evento antes do login; com login, recebe a cortesia,
 * que fica presa à conta (D27).
 */
export function CourtesyLinkReceiverPage({
  link,
  loggedIn,
  onLogin,
  onAccepted,
  onClose,
}: {
  link: { courtesyId: string; token: string };
  loggedIn: boolean;
  onLogin: () => void;
  onAccepted: () => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState<CourtesyLinkPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setError(null);
    void previewCourtesyLinkUseCase(link.courtesyId, link.token)
      .then(setPreview)
      .catch((err: unknown) => setError(t(courtesyErrorKey(err))));
  }, [link.courtesyId, link.token, t]);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptCourtesyLinkUseCase(link.courtesyId, link.token);
      setAccepted(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'RECIPIENT_NOT_VERIFIED') {
        openEmailVerificationPromptUseCase();
      }
      setError(t(courtesyErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const when =
    preview &&
    [formatSessionLabel(preview.startsAt, i18n.language), preview.locationName]
      .filter(Boolean)
      .join(' · ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="courtesy-link-title"
      className="fixed inset-0 overflow-y-auto bg-app px-4 pt-[calc(env(safe-area-inset-top)+48px)] pb-[calc(env(safe-area-inset-bottom)+24px)]"
      style={{ zIndex: Z_INDEX.overlay }}
    >
      <div className="mx-auto w-full max-w-[480px] space-y-6">
        <section className="p-6 rounded-[24px] bg-surface border border-line text-center space-y-4">
          <span className="mx-auto w-14 h-14 rounded-2xl bg-ink/[0.06] text-ink flex items-center justify-center">
            <TicketIcon size={26} aria-hidden="true" />
          </span>
          <h1 id="courtesy-link-title" className="text-[24px] font-display font-bold text-ink">
            {t('courtesy.receiver.title')}
          </h1>
          {preview ? (
            <>
              <p className="text-[17px] text-ink/80">
                <Trans
                  i18nKey={
                    preview.businessName
                      ? 'courtesy.receiver.invitedBy'
                      : 'courtesy.receiver.invitedGeneric'
                  }
                  values={{ business: preview.businessName, event: preview.eventTitle }}
                  components={{ strong: <strong className="font-semibold text-ink" /> }}
                />
              </p>
              <p className="inline-flex items-center gap-2 text-[15px] text-ink/70">
                <CalendarClock size={18} aria-hidden="true" />
                {when}
              </p>
            </>
          ) : (
            !error && (
              <div className="h-16 rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
            )
          )}
        </section>

        {error && (
          <p role="alert" className="text-center">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}

        {accepted ? (
          <>
            <p role="status" className="text-center">
              <StatusText tone="success">{t('courtesy.receiver.accepted')}</StatusText>
            </p>
            <button type="button" onClick={onAccepted} className={`${BUTTON_PRIMARY} w-full`}>
              {t('courtesy.receiver.seeTickets')}
            </button>
          </>
        ) : (
          preview && (
            <button
              type="button"
              disabled={busy}
              onClick={loggedIn ? () => void accept() : onLogin}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t(loggedIn ? 'courtesy.receiver.accept' : 'courtesy.receiver.login')}
            </button>
          )
        )}
        {!accepted && (
          <p className="text-center text-[15px] text-ink/70">{t('courtesy.receiver.hint')}</p>
        )}
        <div className="flex justify-center">
          <TextButton tone="ink" onClick={onClose}>
            {t('courtesy.receiver.close')}
          </TextButton>
        </div>
      </div>
    </div>
  );
}
