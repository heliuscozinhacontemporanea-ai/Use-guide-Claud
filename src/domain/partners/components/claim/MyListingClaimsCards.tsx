import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { TextButton } from '../../../../ui/components/TextButton';
import { useMyListingClaims } from '../../hooks/useMyListingClaims';
import type { MyListingClaim } from '../../types/listingClaim';

// Aprovado aparece por alguns dias, como aviso de que o anúncio entrou no Catálogo.
const APPROVED_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** O pedido mais recente de cada lugar; recusado só se não houver outro depois. */
function visibleClaims(claims: MyListingClaim[], now: number): MyListingClaim[] {
  const latest = new Map<string, MyListingClaim>();
  for (const claim of claims) {
    const current = latest.get(claim.itemId);
    if (!current || claim.submittedAt > current.submittedAt) latest.set(claim.itemId, claim);
  }
  return [...latest.values()].filter(
    (claim) =>
      claim.status === 'pending' ||
      claim.status === 'rejected' ||
      (claim.status === 'approved' &&
        claim.reviewedAt !== null &&
        now - new Date(claim.reviewedAt).getTime() < APPROVED_DAYS * DAY_MS)
  );
}

/** Pedidos de "Sou o dono" no Início do painel (D35, telas 8 e 9). */
export function MyListingClaimsCards({
  onResend,
  now = Date.now(),
}: {
  onResend: (claim: MyListingClaim) => void;
  now?: number;
}) {
  const { t, i18n } = useTranslation();
  const { claims } = useMyListingClaims();
  const visible = visibleClaims(claims, now);
  if (visible.length === 0) return null;
  return (
    <div className="space-y-3">
      {visible.map((claim) => (
        <article
          key={claim.claimId}
          className="space-y-2 p-4 rounded-card bg-surface border border-line"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-body font-semibold text-ink">{claim.listingName}</h3>
            <span
              className={
                claim.status === 'approved'
                  ? 'shrink-0 px-2.5 py-1 rounded-full bg-success-soft text-caption font-semibold text-success'
                  : claim.status === 'rejected'
                    ? 'shrink-0 px-2.5 py-1 rounded-full bg-danger-soft text-caption font-semibold text-danger'
                    : 'shrink-0 px-2.5 py-1 rounded-full bg-warn-soft text-caption font-semibold text-warn'
              }
            >
              {t(`claims.panel.${claim.status}`)}
            </span>
          </div>
          {claim.status === 'pending' ? (
            <>
              <p className="text-meta text-ink-muted">
                {t('claims.panel.pendingText', {
                  date: formatBusinessDate(claim.submittedAt, i18n.language, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
                })}
              </p>
              <p className="text-meta text-ink-muted">{t('claims.panel.pendingHint')}</p>
            </>
          ) : claim.status === 'rejected' ? (
            <>
              <p className="text-meta text-ink-muted">
                {t('claims.panel.rejectedText', { reason: claim.rejectionReason ?? '' })}
              </p>
              <TextButton tone="accent" onClick={() => onResend(claim)}>
                {t('claims.panel.resend')}
              </TextButton>
            </>
          ) : (
            <p className="text-meta text-ink-muted">
              {t('claims.panel.approvedText', { name: claim.listingName })}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
