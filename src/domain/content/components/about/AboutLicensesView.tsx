import { useTranslation } from 'react-i18next';
import { TextButton } from '../../../../ui/components/TextButton';
import { CREDITS } from '../../data/credits';
import { useOpenSourceLicenses } from '../../hooks/useOpenSourceLicenses';
import { LicenseEntry } from './LicenseEntry';

const SECTION_TITLE = 'px-1 mb-2 text-meta font-semibold text-ink-muted';
const LIST =
  'shrink-0 rounded-card bg-surface border border-line divide-y divide-line overflow-hidden';

/**
 * Sobre o app › Licenças e créditos: autoria de trabalhos de terceiros e licenças das bibliotecas.
 * O `<` e o título ficam na barra fixa da folha do perfil (D33).
 */
export function AboutLicensesView() {
  const { t } = useTranslation();
  const { licenses, loading, error, reload } = useOpenSourceLicenses();

  return (
    <div className="flex flex-col">
      <p className="mb-5 px-1 text-meta text-ink-muted">{t('appAbout.licensesIntro')}</p>

      <h3 className={SECTION_TITLE}>{t('appAbout.credits')}</h3>
      <ul className={`${LIST} mb-6`}>
        {CREDITS.map((credit) => (
          <LicenseEntry
            key={credit.id}
            title={t(credit.workKey)}
            subtitle={t('appAbout.creditBy', { author: credit.author, source: credit.source })}
            license={credit.license}
            url={credit.url}
            text={credit.text}
          />
        ))}
      </ul>

      <h3 className={SECTION_TITLE}>
        {t('appAbout.libraries')}
        {licenses && ` (${licenses.length})`}
      </h3>
      {loading ? (
        <div className="h-56 rounded-card bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !licenses ? (
        <div className="flex items-center justify-between gap-2 px-1 text-meta text-ink-muted">
          <span role="alert">{t('appAbout.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('appAbout.retry')}
          </TextButton>
        </div>
      ) : (
        <ul className={LIST}>
          {licenses.map((library) => (
            <LicenseEntry
              key={library.name}
              title={library.name}
              subtitle={[library.version, library.author].filter(Boolean).join(' · ')}
              license={library.license}
              url={library.url}
              text={library.text}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
