import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';

/** Sobre o app › Quem somos. */
export function AboutCompanyView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const paragraphs = t('appAbout.companyParagraphs', { returnObjects: true }) as string[];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('appAbout.company')}</h2>
      </div>
      <div className="shrink-0 p-4 rounded-[20px] bg-surface border border-line space-y-3 text-[15px] text-ink/80 leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
