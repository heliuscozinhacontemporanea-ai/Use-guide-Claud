import { Plus, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import { ISO_639_1_CODES } from '../../../constants/languageCodes';
import { storedLanguageName } from '../../../utils/languageNames';
import { SIGNUP_LABEL } from '../../sections/signupStyles';

// Gravado em português (débito registrado); o nome exibido vem do Intl no idioma ativo.
const LANGUAGES = [
  { code: 'pt', value: 'Português' },
  { code: 'en', value: 'Inglês' },
  { code: 'es', value: 'Espanhol' },
  { code: 'fr', value: 'Francês' },
  { code: 'de', value: 'Alemão' },
  { code: 'it', value: 'Italiano' },
] as const;

const MAX_RESULTS = 6;
const CHIP =
  'press min-h-11 px-3.5 rounded-xl border text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
const CHIP_ON = 'bg-partner-soft border-partner text-ink';
const CHIP_OFF = 'bg-surface border-line text-ink/80';

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

/** Idiomas que o parceiro fala: os seis mais comuns e "Outro", com busca em todos (D34). */
export function LanguagesField({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const searchId = useId();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const shown = useMemo(() => new Intl.DisplayNames([i18n.language], { type: 'language' }), [i18n]);
  const label = (code: string, fallback: string) => {
    const name = shown.of(code) ?? fallback;
    return name.charAt(0).toLocaleUpperCase(i18n.language) + name.slice(1);
  };
  const valueOf = storedLanguageName;
  const common = new Set<string>(LANGUAGES.map((language) => language.value));
  const extraCodes = ISO_639_1_CODES.filter(
    (code) => !LANGUAGES.some((language) => language.code === code)
  );
  const others = selected.filter((value) => !common.has(value));
  const codeOf = (value: string) => extraCodes.find((code) => valueOf(code) === value);
  const results = query.trim()
    ? extraCodes
        .filter((code) => fold(label(code, code)).includes(fold(query.trim())))
        .filter((code) => !selected.includes(valueOf(code)))
        .slice(0, MAX_RESULTS)
    : [];

  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{t('partnerSignup.details.additional.languages')}</legend>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map(({ code, value }) => {
          const on = selected.includes(value);
          return (
            <button
              key={code}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(value)}
              className={cn(CHIP, on ? CHIP_ON : CHIP_OFF)}
            >
              {label(code, value)}
            </button>
          );
        })}
        {others.map((value) => {
          const code = codeOf(value);
          const name = code ? label(code, value) : value;
          return (
            <button
              key={value}
              type="button"
              aria-label={t('partnerGuide.languages.remove', { language: name })}
              onClick={() => onToggle(value)}
              className={cn(CHIP, CHIP_ON, 'inline-flex items-center gap-1.5')}
            >
              {name}
              <X size={14} aria-hidden="true" />
            </button>
          );
        })}
        <button
          type="button"
          aria-expanded={searching}
          aria-controls={searchId}
          onClick={() => setSearching((open) => !open)}
          className={cn(CHIP, searching ? CHIP_ON : CHIP_OFF, 'inline-flex items-center gap-1.5')}
        >
          <Plus size={14} aria-hidden="true" />
          {t('partnerGuide.languages.other')}
        </button>
      </div>
      {searching ? (
        <div id={searchId} className="mt-3 space-y-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t('partnerGuide.languages.search')}
            placeholder={t('partnerGuide.languages.search')}
            className="w-full min-h-12 px-4 rounded-xl bg-surface border border-line text-[16px] text-ink placeholder:text-ink/50 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          />
          {query.trim() && results.length === 0 ? (
            <p className="px-1 text-[13px] text-ink/70">{t('partnerGuide.languages.noResults')}</p>
          ) : null}
          {results.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {results.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(valueOf(code));
                      setQuery('');
                    }}
                    className={cn(CHIP, CHIP_OFF)}
                  >
                    {label(code, code)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
