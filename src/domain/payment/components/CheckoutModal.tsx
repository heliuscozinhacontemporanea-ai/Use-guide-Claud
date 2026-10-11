import { AnimatePresence, motion } from 'motion/react';
import { Lock, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { GlassCard } from '../../../ui/components/GlassCard';
import type { PaidPlanId } from '../types/payment';
import { formatPlanAmount } from '../utils/formatPlanAmount';
import { OneTimePlanCheckout } from './subcomponents/OneTimePlanCheckout';
import { PaymentMethodChoice, type PlanPaymentMethod } from './subcomponents/PaymentMethodChoice';
import { SubscriptionPlanCheckout } from './subcomponents/SubscriptionPlanCheckout';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: PaidPlanId;
  itemName: string;
  /** Valor do plano em reais, como vem do cadastro (o backend recalcula). */
  amount: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  planId,
  itemName,
  amount,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const { t, i18n } = useTranslation();
  const [method, setMethod] = useState<PlanPaymentMethod>('subscription');
  const [confirmedMethod, setConfirmedMethod] = useState<PlanPaymentMethod | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmedMethod(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        style={{ zIndex: Z_INDEX.modalNested }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-[480px] mx-auto my-auto"
        >
          <GlassCard className="p-6 border border-white/15 bg-slate-950/90 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('payment.checkout.title')}</h3>
                  <p className="text-xs text-white/60">{itemName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label={t('payment.checkout.close')}
                className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-white/60">{t('payment.checkout.totalLabel')}</span>
              <span className="text-xl font-black text-teal-300">
                {formatPlanAmount(amount, i18n.language)}
                <span className="block text-[11px] font-medium text-white/60 text-right">
                  {t(`payment.period.${planId}`)}
                </span>
              </span>
            </div>

            {confirmedMethod === null && (
              <div className="space-y-4">
                <PaymentMethodChoice value={method} onChange={setMethod} />
                <button
                  type="button"
                  onClick={() => setConfirmedMethod(method)}
                  className="w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {t('payment.checkout.continue')}
                </button>
              </div>
            )}

            {confirmedMethod === 'subscription' && (
              <SubscriptionPlanCheckout
                planId={planId}
                itemName={itemName}
                amount={amount}
                onClose={handleClose}
                onActivated={onPaymentSuccess}
              />
            )}

            {confirmedMethod === 'one_time' && (
              <OneTimePlanCheckout
                planId={planId}
                itemName={itemName}
                amount={amount}
                onClose={handleClose}
                onPaymentSuccess={onPaymentSuccess}
              />
            )}

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-white/60">
              <ShieldCheck size={14} className="text-teal-400 shrink-0" />
              <span>{t('payment.checkout.secureFooter')}</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
