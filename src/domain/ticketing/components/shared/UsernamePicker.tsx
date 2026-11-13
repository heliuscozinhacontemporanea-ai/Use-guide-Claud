import { Check, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { searchUsernamesUseCase, type UsernameProfile } from '../../../user';

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
 * Busca pelo começo do usuário, como no Instagram (D27): até 8 contas, e a pessoa toca em quem
 * quer. O usuário digitado inteiro já vem escolhido. `resetKey` limpa a busca ao reabrir a folha.
 */
export function UsernamePicker({
  resetKey,
  label,
  placeholder,
  notFound,
  resultsLabel,
  selected,
  onSelect,
  onError,
}: {
  resetKey: unknown;
  label: string;
  placeholder: string;
  notFound: string;
  resultsLabel: string;
  selected: UsernameProfile | null;
  onSelect: (profile: UsernameProfile | null) => void;
  onError: (error: unknown) => void;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const [value, setValue] = useState('');
  const [results, setResults] = useState<UsernameProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const username = value.trim().replace(/^@/, '').toLowerCase();

  // biome-ignore lint/correctness/useExhaustiveDependencies: só reinicia quando a folha reabre.
  useEffect(() => {
    setValue('');
    setResults([]);
  }, [resetKey]);

  // A busca só recomeça quando o @ digitado muda. Se dependesse da identidade de `onSelect` e
  // `onError` (que muda, por exemplo, quando o i18n troca o `t` da tela), a escolha seria apagada
  // e o botão de enviar desligado enquanto uma nova busca corre.
  const callbacks = useRef({ onSelect, onError });
  useEffect(() => {
    callbacks.current = { onSelect, onError };
  });

  useEffect(() => {
    callbacks.current.onSelect(null);
    setFailed(false);
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
          callbacks.current.onSelect(list.find((profile) => profile.username === username) ?? null);
        })
        .catch((err: unknown) => {
          if (!alive) return;
          setFailed(true);
          callbacks.current.onError(err);
        })
        .finally(() => alive && setSearching(false));
    }, LOOKUP_DELAY_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [username]);

  const found = selected;
  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-3 min-h-12 px-4 rounded-2xl border border-line focus-within:ring-2 focus-within:ring-teal-400/50">
        <Search size={20} className="shrink-0 text-ink/60" aria-hidden="true" />
        <input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent text-[17px] text-ink placeholder:text-ink/50 outline-none"
        />
      </div>
      {searching && <p className="text-[13px] text-ink/70">{t('courtesy.sheet.searching')}</p>}
      {!searching && PREFIX.test(username) && results.length === 0 && !failed && (
        <p className="text-[13px] text-ink/70">{notFound}</p>
      )}
      {results.length > 0 && (
        <ul aria-label={resultsLabel} className="space-y-2">
          {results.map((profile) => {
            const selected = found?.username === profile.username;
            return (
              <li key={profile.username}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(profile)}
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
    </>
  );
}
