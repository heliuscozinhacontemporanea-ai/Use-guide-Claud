import { Search } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { findUserByUsernameUseCase, type UsernameProfile } from '../../../user';
import { createCourtesyLinkUseCase } from '../../application/usecases/createCourtesyLinkUseCase';
import { inviteCourtesyUseCase } from '../../application/usecases/inviteCourtesyUseCase';
import type { CourtesyLinkCreated } from '../../types/courtesy';
import { courtesyErrorKey } from '../../utils/courtesyErrorKey';

export interface CourtesySession {
  id: string;
  startsAt: string;
}

const LOOKUP_DELAY_MS = 400;
const USERNAME = /^[a-z0-9._]{3,30}$/;

/**
 * Folha Convidar (p14): o @ é procurado exato, sem lista de sugestões, para não expor contas por
 * prefixo. Com mais de uma sessão aberta, a pessoa escolhe qual.
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
  const inputId = useId();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [found, setFound] = useState<UsernameProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = value.trim().replace(/^@/, '').toLowerCase();

  useEffect(() => {
    if (open) {
      setSessionId(sessions[0]?.id ?? '');
      setValue('');
      setFound(null);
      setError(null);
    }
  }, [open, sessions]);

  useEffect(() => {
    setFound(null);
    setError(null);
    if (!USERNAME.test(username)) return;
    let alive = true;
    const timer = setTimeout(() => {
      setSearching(true);
      findUserByUsernameUseCase(username)
        .then((profile) => alive && setFound(profile))
        .catch((err: unknown) => alive && setError(t(courtesyErrorKey(err))))
        .finally(() => alive && setSearching(false));
    }, LOOKUP_DELAY_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [username, t]);

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

  const initials = (found?.displayName ?? found?.username ?? '')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
        <label htmlFor={inputId} className="sr-only">
          {t('courtesy.sheet.searchLabel')}
        </label>
        <div className="flex items-center gap-3 min-h-12 px-4 rounded-2xl border border-line focus-within:ring-2 focus-within:ring-teal-400/50">
          <Search size={20} className="shrink-0 text-ink/60" aria-hidden="true" />
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t('courtesy.sheet.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent text-[17px] text-ink placeholder:text-ink/50 outline-none"
          />
        </div>
        {searching && <p className="text-[13px] text-ink/70">{t('courtesy.sheet.searching')}</p>}
        {found && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-sheet-card border border-sheet-card-line">
            {found.photoURL ? (
              <img
                src={found.photoURL}
                alt=""
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-11 h-11 shrink-0 rounded-full bg-ink/[0.08] text-ink text-[15px] font-bold flex items-center justify-center"
              >
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[17px] font-semibold text-ink truncate">@{found.username}</p>
              {found.displayName && (
                <p className="text-[15px] text-ink/70 truncate">{found.displayName}</p>
              )}
            </div>
          </div>
        )}
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
