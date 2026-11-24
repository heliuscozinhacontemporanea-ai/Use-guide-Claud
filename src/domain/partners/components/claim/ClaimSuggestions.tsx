import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClaimTarget } from '../../types/listingClaim';

/**
 * "Já está no guia?" (D35, 3b): até 3 lugares do Use Guide com nome parecido na mesma cidade, enquanto
 * a pessoa digita o nome do negócio no "Seja parceiro".
 */
export function ClaimSuggestions({
  places,
  onPick,
}: {
  places: ClaimTarget[];
  onPick: (place: ClaimTarget) => void;
}) {
  const { t } = useTranslation();
  if (places.length === 0) return null;
  return (
    <div className="space-y-3 p-4 rounded-card border border-partner-line bg-partner-soft">
      <p className="text-meta font-semibold text-partner">{t('claims.suggest.title')}</p>
      <ul className="space-y-2">
        {places.map((place) => (
          <li key={place.itemId} className="flex items-center gap-3">
            {place.image ? (
              <img src={place.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="size-10 shrink-0 grid place-items-center rounded-lg bg-surface text-partner">
                <Store size={18} aria-hidden="true" />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-meta font-semibold text-ink truncate">{place.name}</p>
              <p className="text-caption text-ink-muted truncate">
                {[t(`listingDetail.typeLabel.${place.category}`), place.city]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPick(place)}
              className="shrink-0 min-h-11 px-3 rounded-xl bg-partner-fill text-meta font-semibold text-on-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('claims.suggest.action')}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-caption text-ink-muted">{t('claims.suggest.hint')}</p>
    </div>
  );
}
