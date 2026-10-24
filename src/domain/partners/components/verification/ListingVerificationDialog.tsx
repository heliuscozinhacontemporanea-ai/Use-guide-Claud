import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Dialog } from '../../../../ui/components/Dialog';
import { useListingVerification } from '../../hooks/useListingVerification';
import type { DocumentVerificationFormValues } from '../../schemas/listingVerificationFormSchema';
import { DocumentVerificationForm } from './DocumentVerificationForm';
import { LinkedVerificationForm } from './LinkedVerificationForm';
import { VerificationStatusPanel } from './VerificationStatusPanel';
import type { VerificationListingOption } from './verificationListingOption';

const PRODUCER_CATEGORY = 'producer';

interface ListingVerificationDialogProps {
  listing: VerificationListingOption;
  /** Outros cadastros da conta: o perfil de produtor escolhe um deles como origem do documento. */
  accountListings: VerificationListingOption[];
  onClose: () => void;
}

export function ListingVerificationDialog({
  listing,
  accountListings,
  onClose,
}: ListingVerificationDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const { data, loading, error, submitting, reload, submitDocument, submitLinked } =
    useListingVerification(listing.id);
  const isProducer = listing.category === PRODUCER_CATEGORY;
  // Em análise ou aprovada com CNPJ não há o que reenviar; CPF aprovado ainda pode trocar para CNPJ.
  const canSubmit =
    data !== null &&
    (data.status === 'not_submitted' ||
      data.status === 'rejected' ||
      (data.status === 'approved' && data.documentType === 'cpf' && !isProducer));

  const send = async (action: () => Promise<unknown>) => {
    try {
      await action();
      showToast(t('verification.form.sent'), 'success');
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : t('verification.errors.INTERNAL_ERROR'),
        'error'
      );
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('verification.dialog.title')}
      description={listing.name}
      className="max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="space-y-5 pt-2">
        <p className="text-xs text-white/70 leading-relaxed">{t('verification.dialog.intro')}</p>

        {loading ? (
          <p role="status" className="text-sm text-white/60">
            {t('verification.dialog.loading')}
          </p>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl border border-white/10 text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t('verification.dialog.retry')}
            </button>
          </div>
        ) : (
          data && (
            <>
              <VerificationStatusPanel view={data} />
              {canSubmit &&
                (isProducer ? (
                  <LinkedVerificationForm
                    sources={accountListings.filter(
                      (option) => option.id !== listing.id && option.category !== PRODUCER_CATEGORY
                    )}
                    initialSourceId={data.sourceItemId}
                    submitting={submitting}
                    onSubmit={(sourceItemId) => send(() => submitLinked(sourceItemId))}
                  />
                ) : (
                  <DocumentVerificationForm
                    submitting={submitting}
                    onSubmit={(values: DocumentVerificationFormValues) =>
                      send(() => submitDocument(values))
                    }
                  />
                ))}
            </>
          )
        )}
      </div>
    </Dialog>
  );
}
