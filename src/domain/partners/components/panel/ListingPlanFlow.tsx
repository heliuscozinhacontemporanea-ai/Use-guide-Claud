import type React from 'react';
import type { SubscriptionPlan } from '../../types/partner';
import type { PartnerContentRecord } from '../../types/partnerContent';
import { ListingPlanDialog, type PaidPlanSelection } from '../plan/ListingPlanDialog';
import { ListingVerificationDialog } from '../verification/ListingVerificationDialog';
import type { VerificationListingOption } from '../verification/verificationListingOption';

/** Folhas de verificação e de plano de um estabelecimento; o plano pode levar à verificação. */
export function ListingPlanFlow({
  items,
  plans,
  verifying,
  onVerifyingChange,
  planListing,
  onPlanListingChange,
  onClosedVerification,
  onClosedPlan,
  onSelectPaidPlan,
  renderSubscription,
}: {
  items: PartnerContentRecord[];
  plans: SubscriptionPlan[];
  verifying: VerificationListingOption | null;
  onVerifyingChange: (listing: VerificationListingOption | null) => void;
  planListing: { id: string; name: string } | null;
  onPlanListingChange: (listing: { id: string; name: string } | null) => void;
  /** Para os selos relerem o estado depois de um envio, um trial ou uma compra. */
  onClosedVerification: () => void;
  onClosedPlan: () => void;
  onSelectPaidPlan: (selection: PaidPlanSelection) => void;
  renderSubscription?: (itemId: string, onLiveChange: (live: boolean) => void) => React.ReactNode;
}) {
  const summary = (item: PartnerContentRecord) => ({
    id: item.id,
    name: item.name,
    category: item.category,
  });
  return (
    <>
      {verifying && (
        <ListingVerificationDialog
          listing={verifying}
          accountListings={items.map(summary)}
          onClose={() => {
            onVerifyingChange(null);
            onClosedVerification();
          }}
        />
      )}
      {planListing && (
        <ListingPlanDialog
          listing={planListing}
          plans={plans}
          onClose={() => {
            onPlanListingChange(null);
            onClosedPlan();
          }}
          onVerify={() => {
            const listing = items.find((item) => item.id === planListing.id);
            onPlanListingChange(null);
            if (listing) onVerifyingChange(summary(listing));
          }}
          onSelectPaidPlan={(selection) => {
            onPlanListingChange(null);
            onSelectPaidPlan(selection);
          }}
          renderSubscription={renderSubscription}
        />
      )}
    </>
  );
}
