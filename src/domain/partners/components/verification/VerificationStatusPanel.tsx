import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { ListingVerificationView } from '../../types/listingVerification';
import { VERIFICATION_STATUS_STYLE } from './verificationStatusStyle';

interface VerificationStatusPanelProps {
  view: ListingVerificationView;
}

function statusMessages(
  view: ListingVerificationView,
  t: (key: string, values?: Record<string, string>) => string
): string[] {
  if (view.status === 'pending') return [t('verification.panel.pending')];
  if (view.status === 'rejected') {
    return [
      t('verification.panel.rejected', { reason: view.rejectionReason ?? '' }),
      t('verification.panel.resubmit'),
    ];
  }
  if (view.status === 'approved') {
    return [
      t(
        view.documentType === 'cpf'
          ? 'verification.panel.approvedCpf'
          : 'verification.panel.approved'
      ),
    ];
  }
  return [];
}

export function VerificationStatusPanel({ view }: VerificationStatusPanelProps) {
  const { t } = useTranslation();
  const messages = statusMessages(view, t);
  if (messages.length === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border p-4 space-y-1 text-sm',
        VERIFICATION_STATUS_STYLE[view.status]
      )}
    >
      <p className="font-semibold">{t(`verification.status.${view.status}`)}</p>
      {messages.map((message) => (
        <p key={message} className="text-white/80">
          {message}
        </p>
      ))}
      {view.maskedDocument && (
        <p className="text-white/70 text-xs">
          {t('verification.panel.document', { document: view.maskedDocument })}
        </p>
      )}
    </div>
  );
}
