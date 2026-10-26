import { Plus, Trash2 } from 'lucide-react';
import type { TicketLotForm } from '../../hooks/useTicketLotForm';
import { formatMoneyMinorBrl, type TicketType } from '../../types/ticketing';

export function LotsTab({
  form,
  ticketTypes,
  selectedOccurrenceId,
}: {
  form: TicketLotForm;
  ticketTypes: TicketType[];
  selectedOccurrenceId: string;
}) {
  const {
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newKind,
    setNewKind,
    newPriceReais,
    setNewPriceReais,
    newQuantity,
    setNewQuantity,
    newMinPerOrder,
    setNewMinPerOrder,
    newMaxPerOrder,
    setNewMaxPerOrder,
    newSalesStartsAt,
    setNewSalesStartsAt,
    newSalesEndsAt,
    setNewSalesEndsAt,
    newVisibility,
    setNewVisibility,
    newRequiresEligibility,
    setNewRequiresEligibility,
    newSortOrder,
    setNewSortOrder,
    creatingLot,
    handleCreateLot,
    handleDeleteLot,
    handleToggleLotPause,
  } = form;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateLot}
        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
      >
        <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
          Novo Lote / Tipo de Ingresso
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome (ex: 1º Lote, VIP)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as 'paid' | 'free')}
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
          >
            <option value="paid">Ingresso Pago</option>
            <option value="free">Inscrição Gratuita</option>
          </select>
          <input
            type="number"
            step="0.01"
            disabled={newKind === 'free'}
            value={newKind === 'free' ? '0' : newPriceReais}
            onChange={(e) => setNewPriceReais(e.target.value)}
            placeholder="Preço (R$)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50 disabled:opacity-40"
          />
          <input
            type="number"
            min={1}
            required
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Quantidade total"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descrição do lote (opcional)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <select
            value={newVisibility}
            onChange={(e) => setNewVisibility(e.target.value as 'public' | 'hidden' | 'restricted')}
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
          >
            <option value="public">Visibilidade: Público</option>
            <option value="hidden">Visibilidade: Oculto</option>
            <option value="restricted">Visibilidade: Restrito</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={newMinPerOrder}
              onChange={(e) => setNewMinPerOrder(e.target.value)}
              placeholder="Mín/pedido"
              title="Mínimo por pedido"
              className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
            <input
              type="number"
              min={1}
              value={newMaxPerOrder}
              onChange={(e) => setNewMaxPerOrder(e.target.value)}
              placeholder="Máx/pedido"
              title="Máximo por pedido"
              className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
          </div>
          <input
            type="number"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(e.target.value)}
            placeholder="Ordem (0)"
            title="Ordem de exibição"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
          <div>
            <label className="text-[11px] text-white/60 block mb-1">Início das vendas</label>
            <input
              type="datetime-local"
              value={newSalesStartsAt}
              onChange={(e) => setNewSalesStartsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/60 block mb-1">Fim das vendas</label>
            <input
              type="datetime-local"
              value={newSalesEndsAt}
              onChange={(e) => setNewSalesEndsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-white/80 pt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={newRequiresEligibility}
              onChange={(e) => setNewRequiresEligibility(e.target.checked)}
              className="w-4 h-4 accent-teal-400"
            />
            <span>Exige comprovante de meia-entrada/elegibilidade</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={creatingLot || !selectedOccurrenceId}
          className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          <span>Adicionar Lote</span>
        </button>
      </form>

      <div className="space-y-2">
        {ticketTypes.map((tt) => (
          <div
            key={tt.id}
            className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{tt.name}</span>
                <span className="text-xs font-black text-teal-300">
                  {formatMoneyMinorBrl(tt.priceMinor)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/70 uppercase">
                  {tt.status}
                </span>
              </div>
              <div className="text-xs text-white/60">
                Vendidos: {tt.soldCount} / {tt.quantity} • Reservados: {tt.reservedCount} • Mín{' '}
                {tt.minPerOrder} / Máx {tt.maxPerOrder}
              </div>
              {(tt.salesStartsAt || tt.salesEndsAt) && (
                <div className="text-[11px] text-white/50">
                  Janela:{' '}
                  {tt.salesStartsAt
                    ? new Date(tt.salesStartsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Imediato'}{' '}
                  até{' '}
                  {tt.salesEndsAt
                    ? new Date(tt.salesEndsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Início da sessão'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleToggleLotPause(tt.id, tt.status)}
                className="min-h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 cursor-pointer"
              >
                {tt.status === 'paused' ? 'Reativar' : 'Pausar'}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteLot(tt.id)}
                aria-label={`Remover lote ${tt.name}`}
                className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
