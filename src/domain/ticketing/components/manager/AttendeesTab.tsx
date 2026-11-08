import { formatMoneyMinorBrl, type TicketOrder } from '../../types/ticketing';

export function AttendeesTab({ orders }: { orders: TicketOrder[] }) {
  return (
    <div className="space-y-2">
      {orders.length === 0 ? (
        <p className="text-xs text-white/50 p-4 text-center">
          Nenhum pedido ou participante registrado para este evento.
        </p>
      ) : (
        orders.map((ord) => (
          <div
            key={ord.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-bold text-white">
                {ord.buyerSnapshot.name} ({ord.buyerSnapshot.email})
              </div>
              <div className="text-white/50">
                Pedido #{ord.id.slice(0, 8)} •{' '}
                {new Date(ord.createdAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Fortaleza',
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-teal-300">{formatMoneyMinorBrl(ord.totalMinor)}</div>
              <div className="text-[11px] text-white/60 uppercase">{ord.status}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
