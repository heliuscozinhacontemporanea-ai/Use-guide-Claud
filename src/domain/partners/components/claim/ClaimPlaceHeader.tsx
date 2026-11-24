import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClaimTarget } from '../../types/listingClaim';

/** O lugar no alto do pedido: foto, nome, categoria e cidade. */
export function ClaimPlaceHeader({ target }: { target: ClaimTarget }) {
  const { t } = useTranslation();
  const place = [t(`listingDetail.typeLabel.${target.category}`), target.city]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="flex items-center gap-3 p-3 rounded-card bg-surface border border-line">
      {target.image ? (
        <img src={target.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="size-12 shrink-0 grid place-items-center rounded-xl bg-partner-soft text-partner">
          <Store size={20} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-body font-semibold text-ink truncate">{target.name}</p>
        <p className="text-meta text-ink-muted truncate">{place}</p>
      </div>
    </div>
  );
}
