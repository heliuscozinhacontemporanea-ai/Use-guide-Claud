import { Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { PLATFORM_TIME_ZONE } from '../../../../shared/utils/timeZones';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
import type { TicketLotForm } from '../../hooks/useTicketLotForm';
import type { TicketType } from '../../types/ticketing';
import { LotSalesWindowDialog } from './LotSalesWindowDialog';

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink/80">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Lotes de uma sessão: criar, ver o vendido, mudar as datas de venda, pausar e remover. */
export function LotsTab({
  form,
  ticketTypes,
  selectedOccurrenceId,
  timeZone = PLATFORM_TIME_ZONE,
}: {
  form: TicketLotForm;
  ticketTypes: TicketType[];
  selectedOccurrenceId: string;
  /** Fuso do evento: a janela de vendas aparece na hora do lugar (D28). */
  timeZone?: string;
}) {
  const { t, i18n } = useTranslation();
  const [datesFor, setDatesFor] = useState<TicketType | null>(null);
  const dateTime = (iso: string) => formatBusinessDateTime(iso, i18n.language, timeZone);
  const free = form.newKind === 'free';

  return (
    <div className="space-y-4">
      <form
        onSubmit={form.handleCreateLot}
        className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
      >
        <h3 className="text-[16px] font-display font-bold text-ink">{t('ticketLots.newTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field id="lot-name" label={t('ticketLots.name')}>
            <input
              id="lot-name"
              type="text"
              required
              value={form.newName}
              onChange={(e) => form.setNewName(e.target.value)}
              placeholder={t('ticketLots.namePlaceholder')}
              className={INPUT}
            />
          </Field>
          <Field id="lot-kind" label={t('ticketLots.kind')}>
            <select
              id="lot-kind"
              value={form.newKind}
              onChange={(e) => form.setNewKind(e.target.value as 'paid' | 'free')}
              className={INPUT}
            >
              <option value="paid">{t('ticketLots.kindPaid')}</option>
              <option value="free">{t('ticketLots.kindFree')}</option>
            </select>
          </Field>
          <Field id="lot-price" label={t('ticketLots.price')}>
            <input
              id="lot-price"
              type="number"
              step="0.01"
              inputMode="decimal"
              disabled={free}
              value={free ? '0' : form.newPriceReais}
              onChange={(e) => form.setNewPriceReais(e.target.value)}
              className={`${INPUT} disabled:opacity-40`}
            />
          </Field>
          <Field id="lot-quantity" label={t('ticketLots.quantity')}>
            <input
              id="lot-quantity"
              type="number"
              min={1}
              required
              inputMode="numeric"
              value={form.newQuantity}
              onChange={(e) => form.setNewQuantity(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="lot-description" label={t('ticketLots.description')}>
            <input
              id="lot-description"
              type="text"
              value={form.newDescription}
              onChange={(e) => form.setNewDescription(e.target.value)}
              placeholder={t('ticketLots.descriptionPlaceholder')}
              className={INPUT}
            />
          </Field>
          <Field id="lot-visibility" label={t('ticketLots.visibility')}>
            <select
              id="lot-visibility"
              value={form.newVisibility}
              onChange={(e) =>
                form.setNewVisibility(e.target.value as 'public' | 'hidden' | 'restricted')
              }
              className={INPUT}
            >
              <option value="public">{t('ticketLots.visibilityPublic')}</option>
              <option value="hidden">{t('ticketLots.visibilityHidden')}</option>
              <option value="restricted">{t('ticketLots.visibilityRestricted')}</option>
            </select>
          </Field>
          <Field id="lot-min" label={t('ticketLots.minPerOrder')}>
            <input
              id="lot-min"
              type="number"
              min={1}
              inputMode="numeric"
              value={form.newMinPerOrder}
              onChange={(e) => form.setNewMinPerOrder(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="lot-max" label={t('ticketLots.maxPerOrder')}>
            <input
              id="lot-max"
              type="number"
              min={1}
              inputMode="numeric"
              value={form.newMaxPerOrder}
              onChange={(e) => form.setNewMaxPerOrder(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="lot-order" label={t('ticketLots.sortOrder')}>
            <input
              id="lot-order"
              type="number"
              min={0}
              inputMode="numeric"
              value={form.newSortOrder}
              onChange={(e) => form.setNewSortOrder(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="lot-new-sales-start" label={t('ticketLots.salesStartsAt')}>
            <input
              id="lot-new-sales-start"
              type="datetime-local"
              value={form.newSalesStartsAt}
              onChange={(e) => form.setNewSalesStartsAt(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="lot-new-sales-end" label={t('ticketLots.salesEndsAt')}>
            <input
              id="lot-new-sales-end"
              type="datetime-local"
              value={form.newSalesEndsAt}
              onChange={(e) => form.setNewSalesEndsAt(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 min-h-11 text-[14px] text-ink/80 cursor-pointer">
          <input
            type="checkbox"
            checked={form.newRequiresEligibility}
            onChange={(e) => form.setNewRequiresEligibility(e.target.checked)}
            className="size-5 accent-teal-400"
          />
          {t('ticketLots.requiresEligibility')}
        </label>
        <button
          type="submit"
          disabled={form.creatingLot || !selectedOccurrenceId}
          className={`${BUTTON_PRIMARY} inline-flex items-center gap-1.5`}
        >
          <Plus size={16} aria-hidden="true" />
          {t(form.creatingLot ? 'ticketLots.adding' : 'ticketLots.add')}
        </button>
      </form>

      {ticketTypes.length === 0 ? (
        <p className="px-1 text-[14px] text-ink/70">{t('ticketLots.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {ticketTypes.map((lot) => (
            <li
              key={lot.id}
              className="p-4 rounded-[20px] bg-surface border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-bold text-ink break-words">{lot.name}</span>
                  <span className="text-[14px] font-bold text-accent">
                    {lot.priceMinor > 0
                      ? formatMoneyMinor(lot.priceMinor, i18n.language)
                      : t('ticketLots.free')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full border border-line text-[12px] font-semibold text-ink/80">
                    {t(`ticketLots.status.${lot.status}`)}
                  </span>
                </p>
                <p className="text-[13px] text-ink/70">
                  {[
                    t('ticketLots.sold', { sold: lot.soldCount, quantity: lot.quantity }),
                    lot.reservedCount > 0 && t('ticketLots.reserved', { count: lot.reservedCount }),
                    t('ticketLots.perOrder', { min: lot.minPerOrder, max: lot.maxPerOrder }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="text-[13px] text-ink/70">
                  {t('eventSessions.lotDates.summary', {
                    from: lot.salesStartsAt
                      ? dateTime(lot.salesStartsAt)
                      : t('eventSessions.lotDates.fromNow'),
                    to: lot.salesEndsAt
                      ? dateTime(lot.salesEndsAt)
                      : t('eventSessions.lotDates.untilSession'),
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDatesFor(lot)}
                  aria-label={t('eventSessions.lotDates.buttonAria', { name: lot.name })}
                  className={BUTTON_SECONDARY}
                >
                  {t('eventSessions.lotDates.button')}
                </button>
                <button
                  type="button"
                  onClick={() => void form.handleToggleLotPause(lot.id, lot.status)}
                  className={BUTTON_SECONDARY}
                >
                  {t(lot.status === 'paused' ? 'ticketLots.resume' : 'ticketLots.pause')}
                </button>
                <button
                  type="button"
                  onClick={() => void form.handleDeleteLot(lot.id)}
                  aria-label={t('ticketLots.remove', { name: lot.name })}
                  className="press size-11 rounded-xl bg-danger-soft border border-danger-line text-danger flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <LotSalesWindowDialog
        lot={datesFor}
        timeZone={timeZone}
        onClose={() => setDatesFor(null)}
        onSave={form.handleSaveLotDates}
      />
    </div>
  );
}
