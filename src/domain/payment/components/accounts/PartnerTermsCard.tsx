import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PARTNER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
import { acceptPartnerTermsUseCase } from '../../application/usecases/acceptPartnerTermsUseCase';
import type { PartnerTermsView } from '../../types/payment';

interface PartnerTermsCardProps {
  terms: PartnerTermsView;
  onAccepted: (terms: PartnerTermsView) => void;
}

/** Aceite dos termos do parceiro antes do cadastro da conta de recebimento (D15). */
export function PartnerTermsCard({ terms, onAccepted }: PartnerTermsCardProps) {
  const { t, i18n } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  if (terms.accepted && terms.acceptedAt) {
    const date = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeZone: 'America/Fortaleza',
    }).format(new Date(terms.acceptedAt));
    return (
      <p className="flex items-center gap-2 text-xs text-ink/70">
        <CheckCircle2 size={14} className="text-success shrink-0" aria-hidden="true" />
        {t('legal.partnerTerms.accepted', { date })}
      </p>
    );
  }

  const accept = async () => {
    setSaving(true);
    setFailed(false);
    try {
      onAccepted(await acceptPartnerTermsUseCase(PARTNER_TERMS_VERSION));
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="partner-terms-title"
      className="p-4 rounded-2xl bg-warn-soft border border-warn-line space-y-3"
    >
      <h5 id="partner-terms-title" className="text-sm font-bold text-ink">
        {t('legal.partnerTerms.title')}
      </h5>
      <p className="text-xs text-ink/80">{t('legal.partnerTerms.description')}</p>
      <TermsAcceptanceField
        audience="partner"
        checked={checked}
        onChange={setChecked}
        fees={terms.fees}
        version={terms.currentVersion}
      />
      {failed && (
        <p role="alert" className="text-xs text-danger">
          {t('legal.partnerTerms.error')}
        </p>
      )}
      <button
        type="button"
        disabled={!checked || saving}
        onClick={() => void accept()}
        className="press min-h-11 px-4 rounded-xl bg-teal-400 text-slate-950 text-xs font-black disabled:opacity-50 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {t('legal.partnerTerms.button')}
      </button>
    </section>
  );
}
