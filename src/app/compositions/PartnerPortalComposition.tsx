import { useEffect, useState } from 'react';
import { LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PartnerPanel, getPartnerProfileUseCase } from '../../domain/partners';
import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
import { getActiveSubscriptionPlansUseCase } from '../../domain/admin';
import { UserRole } from '../../domain/auth/types/auth';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { EventSessionsField } from '../../domain/events';
import { ReportsView } from '../../domain/insights';
import { CheckoutModal, isPaidPlanId, PlanSubscriptionCard } from '../../domain/payment';
import { PartnerBookingsComposition } from './PartnerBookingsComposition';
import { NotificationBell } from '../../domain/notifications';
import { PartnerEventTicketingManager } from '../../domain/ticketing';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { useUI } from '../../shared/stores/useUIStore';
import { MessagePage } from '../../ui/components/MessagePage';

export function PartnerPortalComposition() {
  const { t } = useTranslation();
  const { user, loading } = useAuthContext();
  const { openLoginModal } = useUI();
  const { goTo } = useLocalizedRouting();

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [profileVersion, setProfileVersion] = useState(0);

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
    if (loading) {
      return;
    }
    if (!user) {
      setProfileLoading(false);
      return;
    }

    if (user.role !== UserRole.PARTNER) {
      setProfileError('pages.partnerOnly');
      setProfileLoading(false);
      return;
    }

    let active = true;
    // Recarga depois da compra de plano: mantém o painel na tela em vez do carregamento inicial.
    setProfileLoading(profileVersion === 0);
    setProfileError(null);

    getPartnerProfileUseCase(user.uid)
      .then((result) => {
        if (!active) {
          return;
        }
        if (!result) {
          setProfileError('pages.partnerProfileNotFound');
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
        setProfileError('pages.partnerProfileLoadError');
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
  }, [user, loading, profileVersion]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020508]">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <MessagePage
        icon={LogIn}
        title={t('pages.partnerAreaTitle')}
        description={t('pages.partnerLoginRequired')}
        actionLabel={t('pages.signIn')}
        onAction={openLoginModal}
      />
    );
  }

  if (profile?.status === 'suspended') {
    return (
      <MessagePage
        icon={ShieldAlert}
        title={t('pages.partnerSuspendedTitle')}
        description={t('pages.partnerSuspended')}
        actionLabel={t('pages.backHome')}
        onAction={() => goTo('explore')}
      />
    );
  }

  // O portal esconde o cabeçalho e a navegação; a ação leva de volta ao guia.
  if (profileError || !profile) {
    return (
      <MessagePage
        icon={ShieldAlert}
        title={t('pages.partnerAreaTitle')}
        description={t(profileError ?? 'pages.partnerProfileNotFound')}
        actionLabel={t('pages.backHome')}
        onAction={() => goTo('explore')}
      />
    );
  }

  return (
    <PartnerPanel
      key={profileVersion}
      profile={profile}
      onPlanPurchased={() => setProfileVersion((version) => version + 1)}
      subscriptionPlans={plans}
      renderReports={({ partnerId, items, events }) => (
        <ReportsView partnerId={partnerId} items={items} events={events} />
      )}
      renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
      renderCheckoutModal={({
        isOpen,
        onClose,
        planId,
        itemName,
        amountMinor,
        onPaymentSuccess,
      }) =>
        isPaidPlanId(planId) ? (
          <CheckoutModal
            isOpen={isOpen}
            onClose={onClose}
            planId={planId}
            itemName={itemName}
            amountMinor={amountMinor}
            onPaymentSuccess={onPaymentSuccess}
          />
        ) : null
      }
      planSubscriptionSlot={<PlanSubscriptionCard />}
      renderBookableOffersManager={(items) => <PartnerBookingsComposition items={items} />}
      renderEventTicketingManager={(eventListingId) => (
        <PartnerEventTicketingManager eventListingId={eventListingId} />
      )}
      renderEventSessionsField={(props) => <EventSessionsField {...props} />}
    />
  );
}
