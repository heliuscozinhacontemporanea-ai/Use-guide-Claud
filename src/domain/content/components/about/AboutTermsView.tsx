import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { type LegalSectionKey, LegalTermsDocument } from '../../../../ui/legal/LegalTermsDocument';

const DOCUMENTS = {
  // Uso, compras e cancelamento e privacidade: valem para todo mundo.
  terms: { titleKey: 'appAbout.terms', sections: ['use', 'purchases', 'privacy'] },
  partner: { titleKey: 'legal.partner.title', sections: ['partner'] },
} satisfies Record<string, { titleKey: string; sections: LegalSectionKey[] }>;

/**
 * Sobre o app › Termos e políticas ou Termos do parceiro (D15). Com `onBack` desenha o próprio topo
 * (painel do parceiro); na folha do perfil o `<` e o título ficam na barra fixa (D33).
 */
export function AboutTermsView({
  document,
  onBack,
}: {
  document: keyof typeof DOCUMENTS;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  const { titleKey, sections } = DOCUMENTS[document];
  return (
    <div className="flex flex-col">
      {onBack && (
        <div className="flex items-center gap-2 mb-5">
          <BackButton label={t('settings.back')} onClick={onBack} />
          <h2 className="text-heading font-display font-bold text-ink">{t(titleKey)}</h2>
        </div>
      )}
      <div className="shrink-0 p-4 rounded-card bg-surface border border-line">
        {/* Com um documento só, o título da tela já basta. */}
        <LegalTermsDocument sections={sections} showSectionTitles={sections.length > 1} />
      </div>
    </div>
  );
}
