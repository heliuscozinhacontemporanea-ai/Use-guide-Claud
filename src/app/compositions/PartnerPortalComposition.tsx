import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PartnerPanel, getPartnerProfileUseCase } from '../../domain/partners';
import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
import { getActiveSubscriptionPlansUseCase } from '../../domain/admin';
import { UserRole } from '../../domain/auth/types/auth';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { ReportsView } from '../../domain/insights';
import { CheckoutModal, isPaidPlanId, PlanSubscriptionCard } from '../../domain/payment';
import { NotificationBell } from '../../domain/notifications';
import { PartnerEventTicketingManager } from '../../domain/ticketing';
import { ErrorState } from '../../ui/components/ErrorState';

export function PartnerPortalComposition() {
  const { user, loading } = useAuthContext();

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    let active = true;
    getActiveSubscriptionPlansUseCase()
      .then((loadedPlans) => {
        if (active) {
          setPlans(loadedPlans as unknown as SubscriptionPlan[]);
        }
      })
      .catch((err) => {
        console.error('[PartnerPortalComposition] Erro ao carregar planos:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (user.role !== UserRole.PARTNER) {
      setProfileError('Acesso permitido somente para parceiros.');
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);
    setProfileError(null);

    getPartnerProfileUseCase(user.uid)
      .then((result) => {
        if (!active) {
          return;
        }
        if (!result) {
          setProfileError('Perfil de parceiro não encontrado.');
          setProfile(null);
          return;
        }
        setProfile(result);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        console.error('[PartnerPortalComposition]', error);
        setProfileError('Não foi possível carregar o perfil do parceiro.');
        setProfile(null);
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, loading]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020508]">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020508] p-6">
        <ErrorState message={profileError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <PartnerPanel
      profile={profile}
      subscriptionPlans={plans}
      renderReports={({ partnerId, items, events }) => (
        <ReportsView partnerId={partnerId} items={items} events={events} />
      )}
      renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
      renderCheckoutModal={({ isOpen, onClose, itemId, itemName, amount, onPaymentSuccess }) =>
        isPaidPlanId(itemId) ? (
          <CheckoutModal
            isOpen={isOpen}
            onClose={onClose}
            planId={itemId}
            itemName={itemName}
            amount={amount}
            onPaymentSuccess={onPaymentSuccess}
          />
        ) : null
      }
      planSubscriptionSlot={<PlanSubscriptionCard />}
      renderEventTicketingManager={(eventListingId) => (
        <PartnerEventTicketingManager eventListingId={eventListingId} />
      )}
    />
  );
}
