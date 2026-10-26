import { CalendarClock, Pencil, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY } from '../shared/ListState';

const STATUS_STYLE: Record<OfferStatus, string> = {
  draft: 'bg-surface border border-line text-ink/80',
  published: 'bg-success-soft border border-success-line text-success',
  paused: 'bg-warn-soft border border-warn-line text-warn',
  archived: 'bg-surface border border-line text-ink/70',
};

interface PartnerOfferRowProps {
  offer: PartnerOffer;
  busy: boolean;
  canPublish: boolean;
  onEdit: () => void;
  onSlots: () => void;
  onBookings: () => void;
  onStatus: (status: Exclude<OfferStatus, 'draft'>) => void;
}

export function PartnerOfferRow({
  offer,
  busy,
  canPublish,
  onEdit,
  onSlots,
  onBookings,
  onStatus,
}: PartnerOfferRowProps) {
  const { t, i18n } = useTranslation();
  const fromMinor = Math.min(...offer.pricing.priceOptions.map((option) => option.unitAmountMinor));
  const archived = offer.status === 'archived';

  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink break-words">{offer.title['pt-BR']}</p>
          <p className="text-xs text-ink/70">
            {t(`bookings.kind.${offer.kind}`)} ·{' '}
            {t('bookings.partner.fromPrice', { amount: formatMinor(fromMinor, i18n.language) })}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[offer.status]}`}
        >
          {t(`bookings.status.${offer.status}`)}
        </span>
      </div>
      {!archived && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className={BUTTON_SECONDARY}>
            <Pencil size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.edit')}
          </button>
          <button type="button" onClick={onSlots} className={BUTTON_SECONDARY}>
            <CalendarClock size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.manageSlots')}
          </button>
          <button type="button" onClick={onBookings} className={BUTTON_SECONDARY}>
            <Users size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.viewBookings')}
          </button>
          {offer.status === 'published' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus('paused')}
              className={BUTTON_SECONDARY}
            >
              {t('bookings.partner.pause')}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || !canPublish}
              title={canPublish ? undefined : t('bookings.partner.publishNeedsStripe')}
              aria-describedby={canPublish ? undefined : `publish-hint-${offer.id}`}
              onClick={() => onStatus('published')}
              className={BUTTON_SECONDARY}
            >
              {t('bookings.partner.publish')}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus('archived')}
            className={BUTTON_SECONDARY}
          >
            {t('bookings.partner.archive')}
          </button>
        </div>
      )}
      {!canPublish && offer.status !== 'published' && !archived && (
        <p id={`publish-hint-${offer.id}`} className="text-[11px] text-warn">
          {t('bookings.partner.publishNeedsStripe')}
        </p>
      )}
    </li>
  );
}
