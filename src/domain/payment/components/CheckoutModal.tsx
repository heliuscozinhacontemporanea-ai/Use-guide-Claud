import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Clock, Lock, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { GlassCard } from '../../../ui/components/GlassCard';
import { usePayment } from '../hooks/usePayment';
import { StripePaymentElement } from './StripePaymentElement';
import { SuccessPaymentGlass } from './subcomponents/SuccessPaymentGlass';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  amount: number;
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual';
  onPaymentSuccess?: (paymentId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  itemId,
  itemName,
  amount,
  billingCycle = 'monthly',
  onPaymentSuccess,
}: CheckoutModalProps) {
  const {
    loading,
    error,
    setError,
    clientSecret,
    paymentIntentId,
    status,
    initializePlanPayment,
    confirmPaymentOnBackend,
    resetAttempt,
  } = usePayment({
    itemId,
    billingCycle,
    onSuccess: onPaymentSuccess,
  });

  useEffect(() => {
    if (isOpen && itemId && status === 'idle') {
      initializePlanPayment();
    }
  }, [isOpen, itemId, status, initializePlanPayment]);

  if (!isOpen) return null;

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
                  <h3 className="text-base font-bold text-white">Checkout Seguro</h3>
                  <p className="text-xs text-white/60">{itemName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar checkout"
                className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {status === 'succeeded' && paymentIntentId ? (
              <SuccessPaymentGlass
                itemName={itemName}
                amount={amount}
                paymentId={paymentIntentId}
                onClose={onClose}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/50 block">Total a pagar</span>
                    <span className="text-xs text-white/70 font-medium">{itemName}</span>
                  </div>
                  <span className="text-xl font-black text-teal-300">
                    R$ {amount.toFixed(2)}
                  </span>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p>{error}</p>
                      <button
                        type="button"
                        onClick={() => {
                          resetAttempt();
                          initializePlanPayment();
                        }}
                        className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        <span>Tentar novamente</span>
                      </button>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="py-10 flex flex-col items-center justify-center gap-3 text-white/70">
                    <RefreshCw size={22} className="animate-spin text-teal-400" />
                    <span className="text-xs font-medium">
                      Preparando ambiente seguro Stripe...
                    </span>
                  </div>
                )}

                {status === 'processing' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-3">
                    <Clock size={18} className="text-amber-300 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold">Pagamento em processamento</p>
                      <p className="text-white/60 mt-0.5">
                        Estamos aguardando a confirmação final do Stripe para liberar seu plano.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && clientSecret && paymentIntentId && (
                  <StripePaymentElement
                    clientSecret={clientSecret}
                    orderId={paymentIntentId}
                    submitLabel={`Pagar R$ ${amount.toFixed(2)}`}
                    onError={(msg) => setError(msg)}
                    onSuccess={(piId) => confirmPaymentOnBackend(piId)}
                  />
                )}

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-white/50">
                  <ShieldCheck size={14} className="text-teal-400" />
                  <span>Criptografia ponta a ponta via Stripe (Cartão e Pix)</span>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
