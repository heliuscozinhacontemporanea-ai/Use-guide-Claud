import { CalendarClock, Pencil, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY } from '../shared/ListState';

const STATUS_STYLE: Record<OfferStatus, string> = {
  draft: 'bg-white/10 text-white/80',
  published: 'bg-emerald-500/15 text-emerald-300',
  paused: 'bg-amber-500/15 text-amber-200',
  archived: 'bg-white/5 text-white/60',
};

interface PartnerOfferRowProps {
  offer: PartnerOffer;
  busy: boolean;
  onEdit: () => void;
  onSlots: () => void;
  onBookings: () => void;
  onStatus: (status: Exclude<OfferStatus, 'draft'>) => void;
}

export function PartnerOfferRow({
  offer,
  busy,
  onEdit,
  onSlots,
  onBookings,
  onStatus,
}: PartnerOfferRowProps) {
  const { t, i18n } = useTranslation();
  const fromMinor = Math.min(...offer.pricing.priceOptions.map((option) => option.unitAmountMinor));
  const archived = offer.status === 'archived';

  return (
    <li className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white break-words">{offer.title['pt-BR']}</p>
          <p className="text-xs text-white/60">
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
              disabled={busy}
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
    </li>
  );
}
