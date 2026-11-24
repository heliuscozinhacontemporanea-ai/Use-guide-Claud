import { Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
import { submitListingClaimUseCase } from '../../application/usecases/submitListingClaimUseCase';
import type { DocumentVerificationFormValues } from '../../schemas/listingVerificationFormSchema';
import type { ClaimTarget } from '../../types/listingClaim';
import { DocumentVerificationForm } from '../verification/DocumentVerificationForm';
import { ClaimPlaceHeader } from './ClaimPlaceHeader';

const KNOWN_ERRORS = new Set([
  'EMAIL_NOT_VERIFIED',
  'TERMS_REQUIRED',
  'LISTING_NOT_CLAIMABLE',
  'ALREADY_APPROVED',
  'DOCUMENT_IN_USE',
  'CNPJ_ALREADY_USED',
]);

/**
 * "Assumir anúncio" (D35, 4a): os mesmos campos e arquivos da verificação (D12). Os Termos do parceiro
 * só para quem ainda não é parceiro; ao enviar, a pessoa vira parceira e o anúncio não muda até a
 * aprovação.
 */
export function ClaimListingPage({
  target,
  needsTerms,
  onSent,
}: {
  target: ClaimTarget;
  needsTerms: boolean;
  onSent: () => void;
}) {
  const { t } = useTranslation();
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: DocumentVerificationFormValues) => {
    if (needsTerms && !terms) {
      setError(t('claims.errors.TERMS_REQUIRED'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitListingClaimUseCase(target.itemId, values, needsTerms);
      onSent();
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setError(t(KNOWN_ERRORS.has(code) ? `claims.errors.${code}` : 'claims.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <ClaimPlaceHeader target={target} />
      <p className="text-meta text-ink-muted">{t('claims.lead')}</p>
      <DocumentVerificationForm
        submitting={submitting}
        onSubmit={submit}
        submitLabel={t('claims.submit')}
        extra={
          <div className="space-y-4">
            {needsTerms ? (
              <TermsAcceptanceField checked={terms} onChange={setTerms} audience="partner" />
            ) : null}
            <p className="flex items-start gap-2.5 p-3 rounded-xl bg-surface border border-line text-meta text-ink-muted">
              <Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t('claims.note')}</span>
            </p>
            {error ? (
              <p role="alert" className="text-meta text-danger">
                {error}
              </p>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
