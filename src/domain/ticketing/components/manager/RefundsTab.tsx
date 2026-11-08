import { formatMoneyMinorBrl, type Refund } from '../../types/ticketing';

export function RefundsTab({ refunds }: { refunds: Refund[] }) {
  return (
    <div className="space-y-2">
      {refunds.length === 0 ? (
        <p className="text-xs text-white/50 p-4 text-center">
          Nenhuma solicitação de reembolso registrada para este evento.
        </p>
      ) : (
        refunds.map((ref) => (
          <div
            key={ref.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-bold text-white">
                Pedido #{ref.orderId.slice(0, 8)} • {formatMoneyMinorBrl(ref.amountMinor)}
              </div>
              <div className="text-white/60">{ref.reason}</div>
              <div className="text-[11px] text-white/50">
                {new Date(ref.createdAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Fortaleza',
                })}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                ref.status === 'succeeded'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : ref.status === 'failed'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {ref.status === 'succeeded'
                ? 'Reembolso concluído'
                : ref.status === 'failed'
                  ? 'Falha no reembolso'
                  : 'Reembolso em processamento'}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
