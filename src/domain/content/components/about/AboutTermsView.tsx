import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { type LegalSectionKey, LegalTermsDocument } from '../../../../ui/legal/LegalTermsDocument';

/** Sobre o app › um documento legal (uso, compras, parceiro ou privacidade, D15). */
export function AboutTermsView({
  section,
  onBack,
}: {
  section: LegalSectionKey;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t(`legal.${section}.title`)}
        </h2>
      </div>
      <div className="shrink-0 p-4 rounded-[20px] bg-surface border border-line">
        <LegalTermsDocument sections={[section]} showSectionTitles={false} />
      </div>
    </div>
  );
}
