import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
import { getPartnerConnectStatusUseCase, PartnerStripeConnectPortal } from '../../domain/payment';

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [paymentsReady, setPaymentsReady] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getPartnerConnectStatusUseCase()
      .then((status) => {
        if (active) setPaymentsReady(status.chargesEnabled && status.payoutsEnabled);
      })
      .catch(() => {
        if (active) setPaymentsReady(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PartnerOffersManager
      items={items}
      accountNotice={
        paymentsReady === false ? (
          <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-200">{t('bookings.partner.stripeRequired')}</p>
            <PartnerStripeConnectPortal />
          </div>
        ) : null
      }
    />
  );
}
