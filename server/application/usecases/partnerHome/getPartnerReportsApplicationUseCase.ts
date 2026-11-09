import { summarizeBookingUnitsUseCase } from '../../../domain/bookings';
import { listOwnerGuideItemsUseCase } from '../../../domain/guide';
import { listPayoutEntriesUseCase, type PayoutEntryView } from '../../../domain/payment';
import { summarizeOrderTicketsUseCase } from '../../../domain/ticketing';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import {
  buildPartnerReports,
  type PartnerReportsView,
  type ReportPeriod,
  type ReportSaleUnits,
  reportBuckets,
} from './buildPartnerReports';
import { panelTimeZone } from './panelTimeZone';

const PAGE = 100;
// Teto de leitura por pedido; acima disso o relatório avisa que está incompleto.
const MAX_PAGES = 20;

/** Relatórios (p23): vendas dos CNPJs do próprio parceiro no período. */
export async function getPartnerReportsApplicationUseCase(
  ownerUid: string,
  period: ReportPeriod,
  now: Date = new Date()
): Promise<PartnerReportsView> {
  const nowIso = now.toISOString();
  const [accounts, establishments] = await Promise.all([
    listPartnerPaymentAccountsApplicationUseCase(ownerUid),
    listOwnerGuideItemsUseCase(ownerUid),
  ]);
  const timeZone = panelTimeZone(establishments);
  const since = reportBuckets(period, nowIso, timeZone)[0] ?? nowIso;
  const keys = accounts.map((account) => account.accountKey);
  const entries: PayoutEntryView[] = [];
  let cursor: string | undefined;
  let truncated = false;
  for (let page = 0; keys.length > 0; page++) {
    if (page === MAX_PAGES) {
      truncated = true;
      break;
    }
    const result = await listPayoutEntriesUseCase(keys, PAGE, cursor);
    entries.push(...result.data);
    const last = result.data[result.data.length - 1];
    if (!result.nextCursor || !last || last.createdAt < since) break;
    cursor = result.nextCursor;
  }
  return buildPartnerReports(
    period,
    nowIso,
    timeZone,
    entries,
    truncated,
    await loadUnits(ownerUid, entries, since)
  );
}

/** Ingressos e pessoas das vendas do período, lidos em lote de cada domínio. */
async function loadUnits(
  ownerUid: string,
  entries: PayoutEntryView[],
  since: string
): Promise<Map<string, ReportSaleUnits>> {
  const recent = entries.filter((entry) => entry.status !== 'canceled' && entry.createdAt >= since);
  const ids = (type: string) =>
    recent.filter((entry) => entry.referenceType === type).map((entry) => entry.referenceId);
  // Sem as unidades o relatório ainda mostra valor e vendas.
  const [orders, bookings] = await Promise.all([
    summarizeOrderTicketsUseCase(ownerUid, ids('ticket_order')).catch(() => ({})),
    summarizeBookingUnitsUseCase(ownerUid, ids('booking')).catch(() => ({})),
  ]);
  return new Map<string, ReportSaleUnits>([...Object.entries(orders), ...Object.entries(bookings)]);
}
