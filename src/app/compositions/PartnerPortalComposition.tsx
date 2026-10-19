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

export function PartnerPortalComposition() {
  const { t } = useTranslation();
  const { user, loading: userLoading } = useAuthContext();
  const { goTo } = useLocalizedRouting();
  const { showToast } = useUI();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'loading' | 'active' | 'pending' | 'suspended' | 'none'>('loading');

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!user) {
        if (active) {
          setProfileStatus('none');
          setPartnerProfile(null);
        }
        return;
      }

      setProfileStatus('loading');
      try {
        const [profile, plans] = await Promise.all([
          getPartnerProfileUseCase(user.uid),
          getActiveSubscriptionPlansUseCase(),
        ]);
        if (!active) return;
        setSubscriptionPlans(plans);
        if (profile) {
          setPartnerProfile(profile);
          setProfileStatus((profile.status as any) || 'none');
        } else {
          setPartnerProfile(null);
          setProfileStatus('none');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil do parceiro:', err);
        if (active) {
          setProfileStatus('none');
          showToast('Erro ao carregar dados do parceiro', 'error');
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [user, showToast]);

  const handlePlanPurchased = async () => {
    if (!user) return;
    try {
      const profile = await getPartnerProfileUseCase(user.uid);
      if (profile) {
        setPartnerProfile(profile);
        setProfileStatus((profile.status as any) || 'none');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil pós-pagamento:', err);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
          <LogIn size={32} />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Portal do Parceiro</h2>
        <p className="text-white/50 text-xs mb-8 max-w-xs">
          Faça login para gerenciar seu estabelecimento, ver métricas e atrair mais clientes.
        </p>
        <button
          onClick={() => goTo('explore')}
          className="px-8 py-4 rounded-2xl bg-teal-500 text-black font-black uppercase tracking-widest text-[10px]"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  if (profileStatus === 'suspended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Conta Suspensa</h2>
        <p className="text-white/50 text-xs mb-8 max-w-xs">
          O acesso ao portal de parceiros está temporariamente suspenso. Entre em contato com o suporte para mais informações.
        </p>
        <button
          onClick={() => goTo('explore')}
          className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px]"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <PartnerPanel
      profile={partnerProfile ?? undefined}
      subscriptionPlans={subscriptionPlans}
      onPlanPurchased={handlePlanPurchased}
      renderReports={(props) => <ReportsView {...props} />}
      renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
      renderCheckoutModal={({ isOpen, onClose, planId, itemName, amountMinor, onPaymentSuccess }) =>
        isOpen ? (
          <CheckoutModal
            isOpen={isOpen}
            onClose={onClose}
            planId={planId as any}
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
