import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { UsernameProfile } from '../../../user';
import { createCourtesyLinkUseCase } from '../../application/usecases/createCourtesyLinkUseCase';
import { inviteCourtesyUseCase } from '../../application/usecases/inviteCourtesyUseCase';
import type { CourtesyLinkCreated } from '../../types/courtesy';
import { courtesyErrorKey } from '../../utils/courtesyErrorKey';
import { UsernamePicker } from '../shared/UsernamePicker';

export interface CourtesySession {
  id: string;
  startsAt: string;
}

/**
 * Folha Convidar (p14): procura pelo começo do @ enquanto se digita, como no Instagram (D27), e a
 * pessoa toca em quem quer convidar. Com mais de uma sessão aberta, escolhe qual.
 */
export function InviteCourtesySheet({
  open,
  sessions,
  onClose,
  onInvited,
  onLinkCreated,
}: {
  open: boolean;
  sessions: CourtesySession[];
  onClose: () => void;
  onInvited: (username: string) => void;
  onLinkCreated: (link: CourtesyLinkCreated) => void;
}) {
  const { t, i18n } = useTranslation();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const [found, setFound] = useState<UsernameProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectGuest = useCallback((profile: UsernameProfile | null) => {
    setFound(profile);
    setError(null);
  }, []);
  const searchFailed = useCallback((err: unknown) => setError(t(courtesyErrorKey(err))), [t]);

  useEffect(() => {
    if (open) {
      setSessionId(sessions[0]?.id ?? '');
      setFound(null);
      setError(null);
    }
  }, [open, sessions]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err: unknown) {
      setError(t(courtesyErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const send = () =>
    run(async () => {
      if (!found) return;
      await inviteCourtesyUseCase(sessionId, found.username);
      onInvited(found.username);
    });

  const createLink = () =>
    run(async () => {
      onLinkCreated(await createCourtesyLinkUseCase(sessionId));
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('courtesy.sheet.title')}
      description={t('courtesy.sheet.description')}
    >
      <div className="space-y-4">
        {sessions.length > 1 && (
          <fieldset className="space-y-2">
            <legend className="text-[13px] font-semibold text-ink/70">
              {t('courtesy.sheet.session')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  aria-pressed={sessionId === session.id}
                  onClick={() => setSessionId(session.id)}
                  className={cn(
                    'press min-h-11 px-3 rounded-xl border text-[13px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50',
                    sessionId === session.id
                      ? 'bg-accent-soft border-accent-line text-accent'
                      : 'bg-sheet-card border-sheet-card-line text-ink/80'
                  )}
                >
                  {formatSessionLabel(session.startsAt, i18n.language)}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <UsernamePicker
          resetKey={open}
          label={t('courtesy.sheet.searchLabel')}
          placeholder={t('courtesy.sheet.searchPlaceholder')}
          notFound={t('courtesy.errors.USERNAME_NOT_FOUND')}
          resultsLabel={t('courtesy.sheet.results')}
          selected={found}
          onSelect={selectGuest}
          onError={searchFailed}
        />
        <p className="text-[15px] text-ink/70">{t('courtesy.sheet.rule')}</p>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={!found || busy || !sessionId}
          onClick={() => void send()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('courtesy.sheet.send')}
        </button>
        <p className="text-center text-[15px] font-semibold">
          <span className="text-accent">{t('courtesy.sheet.noAccount')} </span>
          <button
            type="button"
            disabled={busy || !sessionId}
            onClick={() => void createLink()}
            className="press min-h-11 font-semibold text-accent underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
          >
            {t('courtesy.sheet.createLink')}
          </button>
        </p>
      </div>
    </Dialog>
  );
}
