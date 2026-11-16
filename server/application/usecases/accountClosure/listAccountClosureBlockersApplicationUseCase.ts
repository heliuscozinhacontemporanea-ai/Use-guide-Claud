import { hasActiveBookingsForOwnerUseCase } from '../../../domain/bookings';
import { listEventOccurrencesUseCase, listOwnerEventListingsUseCase } from '../../../domain/events';
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { listAccountDebtsUseCase, listOpenPayoutEntriesUseCase } from '../../../domain/payment';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from '../getCommittedTicketsCountForOccurrenceApplicationUseCase';
import type { AccountClosureBlocker } from './accountClosureBlockedError';

async function hasFutureSessionWithTickets(ownerUid: string, nowIso: string): Promise<boolean> {
  const actor = { uid: ownerUid, admin: false };
  for (const event of await listOwnerEventListingsUseCase(ownerUid)) {
    const occurrences = await listEventOccurrencesUseCase(event.id);
    for (const occurrence of occurrences) {
      if (occurrence.status === 'canceled' || occurrence.endsAt <= nowIso) continue;
      if (
        (await getCommittedTicketsCountForOccurrenceApplicationUseCase(actor, occurrence.id)) > 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * O que impede encerrar a conta do dono. Sem `catch`: se uma leitura falhar, a exclusão é
 * recusada, nunca feita às cegas.
 */
export async function listAccountClosureBlockersApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<AccountClosureBlocker[]> {
  const accountKeys = (await listOwnerSalesDocumentsUseCase(ownerUid)).map((doc) => doc.accountKey);
  const [bookings, sessions, debts, payouts] = await Promise.all([
    hasActiveBookingsForOwnerUseCase(ownerUid),
    hasFutureSessionWithTickets(ownerUid, now.toISOString()),
    accountKeys.length > 0
      ? listAccountDebtsUseCase(accountKeys).then((list) =>
          // Multa suspensa (força maior em análise) ainda pode voltar a valer.
          list.some((debt) => debt.status === 'open' || debt.status === 'suspended')
        )
      : false,
    accountKeys.length > 0
      ? // Repasse retido por reclamação ou contestação também fica aberto até ser resolvido.
        listOpenPayoutEntriesUseCase(accountKeys, 1).then((list) => list.length > 0)
      : false,
  ]);
  const blockers: AccountClosureBlocker[] = [];
  if (bookings) blockers.push('bookings');
  if (sessions) blockers.push('sessions');
  if (debts) blockers.push('debts');
  if (payouts) blockers.push('payouts');
  return blockers;
}
