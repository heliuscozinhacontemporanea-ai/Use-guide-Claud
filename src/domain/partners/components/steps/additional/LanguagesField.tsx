import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
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

/** Idiomas em que o estabelecimento atende. */
export function LanguagesField({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const names = new Intl.DisplayNames([i18n.language], { type: 'language' });
  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{t('partnerSignup.details.additional.languages')}</legend>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map(({ code, value }) => {
          const on = selected.includes(value);
          const name = names.of(code) ?? value;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(value)}
              className={cn(
                'press min-h-11 px-3.5 rounded-xl border text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                on
                  ? 'bg-partner-soft border-partner text-ink'
                  : 'bg-surface border-line text-ink/80'
              )}
            >
              {name.charAt(0).toLocaleUpperCase(i18n.language) + name.slice(1)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
