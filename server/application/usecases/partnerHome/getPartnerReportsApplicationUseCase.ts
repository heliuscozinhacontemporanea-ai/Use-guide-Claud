import { listPayoutEntriesUseCase, type PayoutEntryView } from '../../../domain/payment';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import {
  buildPartnerReports,
  type PartnerReportsView,
  type ReportPeriod,
  reportBuckets,
} from './buildPartnerReports';

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
  const since = reportBuckets(period, nowIso)[0] ?? nowIso;
  const accounts = await listPartnerPaymentAccountsApplicationUseCase(ownerUid);
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
  return buildPartnerReports(period, nowIso, entries, truncated);
}
