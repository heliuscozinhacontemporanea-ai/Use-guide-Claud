import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Ticket as TicketIcon,
} from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
import { formatMoneyMinorBrl, type TicketOrder } from '../types/ticketing';

interface CheckoutResultViewProps {
  orderId: string;
  paymentIntentId?: string;
  onNavigateToWallet?: () => void;
  onBackHome?: () => void;
}

export function CheckoutResultView({
  orderId,
  paymentIntentId,
  onNavigateToWallet,
  onBackHome,
}: CheckoutResultViewProps) {
  const [order, setOrder] = useState<TicketOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function reconcileAndLoad() {
      setLoading(true);
      setError(null);
      try {
        if (paymentIntentId && orderId) {
          await confirmTicketOrderPaymentReturnUseCase(orderId, {
            paymentIntentId,
          }).catch(() => undefined);
        }
        const loaded = await getTicketOrderUseCase(orderId);
        if (active) {
          setOrder(loaded.order);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível verificar o status do pedido.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (orderId) {
      void reconcileAndLoad();
    } else {
      setLoading(false);
      setError('Pedido não identificado.');
    }

    return () => {
      active = false;
    };
  }, [orderId, paymentIntentId]);

  return (
    <div className="min-h-screen bg-[#020508] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] mx-auto">
        <GlassCard className="p-6 space-y-5 border border-white/15 text-center">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-teal-400" />
              <p className="text-sm font-bold text-white">
                Verificando confirmação junto ao Stripe...
              </p>
              <p className="text-xs text-white/60">
                Não feche esta janela enquanto validamos suas credenciais.
              </p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 mx-auto">
                <AlertTriangle size={26} />
              </div>
              <h2 className="text-lg font-bold text-white">
                Não foi possível confirmar o pedido
              </h2>
              <p className="text-xs text-white/60">{error}</p>
              {onBackHome && (
                <button
                  type="button"
                  onClick={onBackHome}
                  className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={15} />
                  <span>Voltar ao Guia</span>
                </button>
              )}
            </div>
          ) : order?.status === 'paid' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-white">Pagamento Confirmado!</h2>
              <p className="text-xs text-white/70">
                Pedido #{order.id.slice(0, 8)} • {order.eventSnapshot?.title || 'Evento'} •{' '}
                {formatMoneyMinorBrl(order.totalMinor)}
              </p>
              <p className="text-xs text-white/60">
                Seus ingressos com QR Code criptográfico já foram emitidos e estão disponíveis em
                sua carteira.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                {onNavigateToWallet && (
                  <button
                    type="button"
                    onClick={onNavigateToWallet}
                    className="w-full min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TicketIcon size={16} />
                    <span>Ver Meus Ingressos</span>
                  </button>
                )}
                {onBackHome && (
                  <button
                    type="button"
                    onClick={onBackHome}
                    className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
                  >
                    Voltar ao Início
                  </button>
                )}
              </div>
            </div>
          ) : order?.status === 'payment_failed' || order?.status === 'expired' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 mx-auto">
                <AlertTriangle size={30} />
              </div>
              <h2 className="text-lg font-bold text-white">
                {order.status === 'expired'
                  ? 'Reserva Expirada'
                  : 'Pagamento Não Aprovado'}
              </h2>
              <p className="text-xs text-white/60">
                {order.status === 'expired'
                  ? 'O prazo de 10 minutos da reserva encerrou.'
                  : 'A operadora ou o Stripe recusou a transação. Você pode tentar novamente.'}
              </p>
              {onBackHome && (
                <button
                  type="button"
                  onClick={onBackHome}
                  className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
                >
                  Voltar ao Guia
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mx-auto">
                <Clock size={30} className="animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-white">Pagamento em Processamento</h2>
              <p className="text-xs text-white/60">
                Aguardando a confirmação final do webhook Stripe para emitir seus ingressos.
              </p>
              {onNavigateToWallet && (
                <button
                  type="button"
                  onClick={onNavigateToWallet}
                  className="w-full min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Acompanhar em Meus Ingressos
                </button>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
