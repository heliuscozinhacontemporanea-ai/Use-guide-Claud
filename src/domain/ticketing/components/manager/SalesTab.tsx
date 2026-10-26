import { GlassCard } from '../../../../ui/components/GlassCard';
import { type EventSalesAnalytics, formatMoneyMinorBrl } from '../../types/ticketing';

export function SalesTab({ analytics }: { analytics: EventSalesAnalytics | null }) {
  return (
    <div className="space-y-4">
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Receita Bruta</span>
            <div className="text-sm font-black text-white">
              {formatMoneyMinorBrl(analytics.grossSalesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Descontos</span>
            <div className="text-sm font-black text-amber-300">
              {formatMoneyMinorBrl(analytics.discountsMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Comissão Use Guide</span>
            <div className="text-sm font-black text-white/80">
              {formatMoneyMinorBrl(analytics.platformFeesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Taxas Stripe</span>
            <div className="text-sm font-black text-white/80">
              {formatMoneyMinorBrl(analytics.paymentFeesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Reembolsos</span>
            <div className="text-sm font-black text-red-300">
              {formatMoneyMinorBrl(analytics.refundsMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Receita Líquida</span>
            <div className="text-sm font-black text-teal-300">
              {formatMoneyMinorBrl(analytics.netSalesMinor)}
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Ingressos Pagos</span>
          <div className="text-base font-black text-white">{analytics?.ticketsSold ?? 0}</div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Inscrições Gratuitas</span>
          <div className="text-base font-black text-white">{analytics?.freeRegistrations ?? 0}</div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Check-ins Realizados</span>
          <div className="text-base font-black text-emerald-300">
            {analytics?.ticketsCheckedIn ?? 0}
          </div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Pedidos Confirmados</span>
          <div className="text-base font-black text-teal-300">{analytics?.ordersPaid ?? 0}</div>
        </GlassCard>
      </div>
    </div>
  );
}
