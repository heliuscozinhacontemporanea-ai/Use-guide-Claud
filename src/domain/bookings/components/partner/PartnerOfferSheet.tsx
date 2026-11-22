import { CalendarClock, Pencil, TicketPercent, Users } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';
import { isFleetOffer } from '../../utils/offerKindByCategory';

interface PartnerOfferSheetProps {
  offer: PartnerOffer | null;
  summary: string;
  busy: boolean;
  canPublish: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSlots: () => void;
  onBookings: () => void;
  onStatus: (status: Exclude<OfferStatus, 'draft'>) => void;
  /** Área Cupons já com a oferta escolhida (B1c), montada pelo painel. */
  onCoupons?: () => void;
}

/** Folha da oferta no Catálogo: as ações que já existiam, num toque na linha. */
export function PartnerOfferSheet({
  offer,
  summary,
  busy,
  canPublish,
  onClose,
  onEdit,
  onSlots,
  onBookings,
  onStatus,
  onCoupons,
}: PartnerOfferSheetProps) {
  const { t } = useTranslation();
  // A folha desce com a última oferta: sumir de uma vez deixava o fundo do app preso como cartão.
  const last = useRef(offer);
  if (offer) last.current = offer;
  const shown = offer ?? last.current;
  if (!shown) return null;
  const archived = shown.status === 'archived';
  const hintId = `publish-hint-${shown.id}`;

  return (
    <Dialog
      open={Boolean(offer)}
      onOpenChange={(open) => !open && onClose()}
      title={shown.title['pt-BR']}
      description={`${summary} · ${t(`bookings.status.${shown.status}`)}`}
    >
      {archived ? null : (
        <div className="space-y-4">
          <ListCard label={t('bookings.partner.sheetActions')}>
            <ListRowButton
              title={t('bookings.partner.edit')}
              aside={<Pencil size={16} className="text-ink/60" aria-hidden="true" />}
              onClick={onEdit}
            />
            <ListRowButton
              title={t(isFleetOffer(shown) ? 'fleet.days.title' : 'bookings.partner.manageSlots')}
              aside={<CalendarClock size={16} className="text-ink/60" aria-hidden="true" />}
              onClick={onSlots}
            />
            <ListRowButton
              title={t('bookings.partner.viewBookings')}
              aside={<Users size={16} className="text-ink/60" aria-hidden="true" />}
              onClick={onBookings}
            />
            {onCoupons && (
              <ListRowButton
                title={t('bookings.partner.coupons')}
                aside={<TicketPercent size={16} className="text-ink/60" aria-hidden="true" />}
                onClick={onCoupons}
              />
            )}
          </ListCard>
          <div className="grid grid-cols-2 gap-2">
            {shown.status === 'published' ? (
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
                aria-describedby={canPublish ? undefined : hintId}
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
          {!canPublish && shown.status !== 'published' && (
            <p id={hintId} className="px-1 text-[13px] text-warn">
              {t('bookings.partner.publishNeedsStripe')}
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
