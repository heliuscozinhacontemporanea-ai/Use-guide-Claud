import { Check, Search } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { searchUsernamesUseCase, type UsernameProfile } from '../../../user';
import { createCourtesyLinkUseCase } from '../../application/usecases/createCourtesyLinkUseCase';
import { inviteCourtesyUseCase } from '../../application/usecases/inviteCourtesyUseCase';
import type { CourtesyLinkCreated } from '../../types/courtesy';
import { courtesyErrorKey } from '../../utils/courtesyErrorKey';

export interface CourtesySession {
  id: string;
  startsAt: string;
}

const LOOKUP_DELAY_MS = 300;
const PREFIX = /^[a-z0-9._]{2,30}$/;

function initialsOf(profile: UsernameProfile): string {
  return (profile.displayName ?? profile.username)
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
  const inputId = useId();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [results, setResults] = useState<UsernameProfile[]>([]);
  const [found, setFound] = useState<UsernameProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = value.trim().replace(/^@/, '').toLowerCase();

  useEffect(() => {
    if (open) {
      setSessionId(sessions[0]?.id ?? '');
      setValue('');
      setResults([]);
      setFound(null);
      setError(null);
    }
  }, [open, sessions]);

  useEffect(() => {
    setFound(null);
    setError(null);
    if (!PREFIX.test(username)) {
      setResults([]);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      setSearching(true);
      searchUsernamesUseCase(username)
        .then((list) => {
          if (!alive) return;
          setResults(list);
          // O @ digitado inteiro já fica escolhido; nos demais casos a pessoa toca no nome.
          setFound(list.find((profile) => profile.username === username) ?? null);
        })
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
        {!searching && PREFIX.test(username) && results.length === 0 && !error && (
          <p className="text-[13px] text-ink/70">{t('courtesy.errors.USERNAME_NOT_FOUND')}</p>
        )}
        {results.length > 0 && (
          <ul aria-label={t('courtesy.sheet.results')} className="space-y-2">
            {results.map((profile) => {
              const selected = found?.username === profile.username;
              return (
                <li key={profile.username}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFound(profile)}
                    className={cn(
                      'press w-full flex items-center gap-3 p-4 rounded-2xl border text-left focus-visible:ring-2 focus-visible:ring-teal-400/50',
                      selected
                        ? 'bg-sheet-card border-accent-line'
                        : 'bg-sheet-card border-sheet-card-line'
                    )}
                  >
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        className="w-11 h-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="w-11 h-11 shrink-0 rounded-full bg-ink/[0.08] text-ink text-[15px] font-bold flex items-center justify-center"
                      >
                        {initialsOf(profile)}
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-[17px] font-semibold text-ink truncate">
                        {profile.username}
                      </span>
                      {profile.displayName && (
                        <span className="block text-[15px] text-ink/70 truncate">
                          {profile.displayName}
                        </span>
                      )}
                    </span>
                    {selected && (
                      <Check size={20} className="shrink-0 text-accent" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
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
