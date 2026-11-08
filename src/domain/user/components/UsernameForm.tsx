import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { StatusText } from '../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import type { useUsername } from '../hooks/useUsername';
import {
  isUsernameFormatValid,
  nextUsernameChangeAt,
  normalizeUsernameInput,
} from '../utils/username';

const KNOWN_ERRORS = ['USERNAME_INVALID', 'USERNAME_TAKEN', 'USERNAME_CHANGE_TOO_SOON'];

/** Escolha ou troca do @ (D21): usado em Configurações e no passo obrigatório depois do cadastro. */
export function UsernameForm({
  username,
  onSaved,
}: {
  username: ReturnType<typeof useUsername>;
  onSaved?: (saved: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const { current, changedAt, suggestion, save } = username;
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'danger'; message: string } | null>(
    null
  );

  useEffect(() => {
    setValue(current ?? suggestion);
  }, [current, suggestion]);

  const normalized = normalizeUsernameInput(value);
  const lockedUntil = nextUsernameChangeAt(current, changedAt, new Date());

  const submit = async () => {
    setSaving(true);
    setResult(null);
    try {
      const saved = await save(normalized);
      setResult({ tone: 'success', message: t('username.saved', { username: saved }) });
      onSaved?.(saved);
    } catch (err: unknown) {
      const code =
        err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
      setResult({ tone: 'danger', message: t(`username.errors.${code}`) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="text-[13px] text-ink/70">{t('username.intro')}</p>
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink/80">
          {t('username.label')}
        </label>
        <div className="flex items-center min-h-11 rounded-xl bg-surface border border-line focus-within:ring-2 focus-within:ring-teal-400/50">
          <span className="pl-3 text-sm text-ink/70" aria-hidden="true">
            @
          </span>
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={31}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={Boolean(lockedUntil)}
            aria-describedby={`${inputId}-rules`}
            className="flex-1 min-w-0 min-h-11 px-1 bg-transparent text-sm text-ink focus:outline-none disabled:opacity-60"
          />
        </div>
        <p id={`${inputId}-rules`} className="text-[12px] text-ink/70">
          {t('username.rules')}
        </p>
      </div>
      {lockedUntil ? (
        <p className="text-[13px] text-ink/70">
          {t('username.lockedUntil', {
            date: formatBusinessDate(lockedUntil.toISOString(), i18n.language, {
              dateStyle: 'long',
            }),
          })}
        </p>
      ) : (
        current && <p className="text-[13px] text-ink/70">{t('username.changeWarning')}</p>
      )}
      {result && (
        <p role="status">
          <StatusText tone={result.tone}>{result.message}</StatusText>
        </p>
      )}
      {!lockedUntil && (
        <button
          type="submit"
          disabled={saving || normalized === current || !isUsernameFormatValid(value)}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t(current ? 'username.change' : 'username.save')}
        </button>
      )}
    </form>
  );
}
