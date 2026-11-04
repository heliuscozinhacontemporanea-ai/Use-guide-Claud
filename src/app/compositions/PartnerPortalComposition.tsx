import { LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveSubscriptionPlansUseCase } from '../../domain/admin';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { isBookableCategory, PartnerSlotSheet } from '../../domain/bookings';
import { UserRole } from '../../domain/auth/types/auth';
import { AboutTermsView, SupportView } from '../../domain/content';
import { EventSessionsField } from '../../domain/events';
import { MonthVisitsTile, ReportsView } from '../../domain/insights';
import { NotificationSettingsView } from '../../domain/notifications';
import { RecentItemReviews } from '../../domain/reviews';
import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
import { getPartnerProfileUseCase, PartnerPanel } from '../../domain/partners';
import {
  CheckoutModal,
  isPaidPlanId,
  type PlanPeriodOption,
  PartnerStripeConnectPortal,
  PlanSubscriptionCard,
} from '../../domain/payment';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { useUI } from '../../shared/stores/useUIStore';
import { PartnerSessionSheet } from '../../domain/ticketing';
import { MessagePage } from '../../ui/components/MessagePage';
import { PartnerBookingsComposition } from './PartnerBookingsComposition';
import { PartnerEventTicketingComposition } from './PartnerEventTicketingComposition';

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
  const periodOptions = useMemo<PlanPeriodOption[]>(
    () =>
      plans.flatMap((plan) =>
        isPaidPlanId(plan.id) && plan.isActive !== false
          ? [{ id: plan.id, name: plan.name, priceMinor: plan.priceMinor }]
          : []
      ),
    [plans]
  );

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
      renderCheckoutModal={({
        isOpen,
        onClose,
        itemId,
        planId,
        itemName,
        amountMinor,
        onPaymentSuccess,
      }) =>
        isPaidPlanId(planId) ? (
          <CheckoutModal
            isOpen={isOpen}
            onClose={onClose}
            itemId={itemId}
            planId={planId}
            itemName={itemName}
            amountMinor={amountMinor}
            onPaymentSuccess={onPaymentSuccess}
          />
        ) : null
      }
      renderPlanSubscription={(itemId, onLiveChange) => (
        <PlanSubscriptionCard itemId={itemId} plans={periodOptions} onLiveChange={onLiveChange} />
      )}
      renderCatalog={{
        renderOffers: ({ items, creating, onCreatingChange, inPage }) =>
          inPage && !items.some((item) => isBookableCategory(item.category)) ? null : (
            <PartnerBookingsComposition
              items={items}
              creating={creating}
              onCreatingChange={onCreatingChange}
            />
          ),
        renderVisits: (itemId, onOpenPlan) => (
          <MonthVisitsTile itemId={itemId} onOpenPlan={onOpenPlan} />
        ),
        renderReviews: (itemId, onOpen) => <RecentItemReviews itemId={itemId} onOpen={onOpen} />,
      }}
      renderEventTicketingManager={(eventListingId) => (
        <PartnerEventTicketingComposition eventListingId={eventListingId} />
      )}
      renderEventSessionsField={(props) => <EventSessionsField {...props} />}
      renderEarnings={() => <PartnerStripeConnectPortal />}
      renderSlotSheet={({ item, onClose, onChanged }) => (
        <PartnerSlotSheet
          offerId={item.parentId}
          slotId={item.id}
          onClose={onClose}
          onChanged={onChanged}
        />
      )}
      renderSessionSheet={({ item, onClose, onChanged }) => (
        <PartnerSessionSheet
          eventListingId={item.parentId}
          occurrenceId={item.id}
          title={item.title}
          sold={item.sold}
          onClose={onClose}
          onChanged={onChanged}
        />
      )}
      renderAccountView={(view, onBack) =>
        view === 'notifications' ? (
          <NotificationSettingsView isPartner onBack={onBack} />
        ) : view === 'terms' ? (
          <AboutTermsView document="partner" onBack={onBack} />
        ) : (
          <SupportView onBack={onBack} />
        )
      }
    />
  );
}
