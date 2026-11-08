import { listOwnerGuideItemsUseCase } from '../../../domain/guide';
import {
  listOpenPayoutEntriesUseCase,
  listReleasedPayoutEntriesUseCase,
} from '../../../domain/payment';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { buildPartnerEarnings, type PartnerEarningsView } from './buildPartnerEarnings';
import { businessMonthStarts } from './partnerHomeCardsData';

const OPEN_LIMIT = 200;
const RELEASED_LIMIT = 300;

/** Ganhos (p20): só os CNPJs do próprio parceiro, lidos pelo uid logado. */
export async function getPartnerEarningsApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<PartnerEarningsView> {
  const nowIso = now.toISOString();
  const months = businessMonthStarts(nowIso);
  const [accounts, establishments] = await Promise.all([
    listPartnerPaymentAccountsApplicationUseCase(ownerUid),
    listOwnerGuideItemsUseCase(ownerUid),
  ]);
  const keys = accounts.map((account) => account.accountKey);
  const [open, released] = await Promise.all([
    listOpenPayoutEntriesUseCase(keys, OPEN_LIMIT),
    // Mês atual e o anterior: o atual soma o "Recebido em", o anterior completa a lista de pagos.
    listReleasedPayoutEntriesUseCase(keys, new Date(months.previous).toISOString(), RELEASED_LIMIT),
  ]);
  return buildPartnerEarnings({
    nowIso,
    monthStartIso: new Date(months.current).toISOString(),
    open,
    released,
    accounts: accounts.map((account) => ({
      accountKey: account.accountKey,
      maskedDocument: account.maskedDocument,
      itemIds: account.itemIds,
      ready: account.account?.readyForSales === true,
    })),
    names: new Map(establishments.map((item) => [item.id, item.name])),
  });
}
