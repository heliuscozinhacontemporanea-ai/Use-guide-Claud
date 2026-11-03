import { listConfirmedBookingsStartingBetweenUseCase } from '../../../domain/bookings';
import { createNotificationUseCase, type NewNotification } from '../../../domain/notifications';
import {
  listCheckedInTicketsEndedBetweenUseCase,
  listIssuedTicketsStartingBetweenUseCase,
} from '../../../domain/ticketing';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Janelas largas de propósito: o job roda a cada 15 min e o `dedupeKey` garante um aviso só por
 * pessoa e sessão, mesmo se uma rodada falhar ou duas se sobrepuserem.
 */
const DAY_BEFORE = { from: 23 * HOUR_MS, to: 25 * HOUR_MS };
const SOON = { from: 30 * MINUTE_MS, to: 2 * HOUR_MS };
const AFTER_EVENT = { from: -6 * HOUR_MS, to: -1 * HOUR_MS };

function range(now: Date, window: { from: number; to: number }): [string, string] {
  return [
    new Date(now.getTime() + window.from).toISOString(),
    new Date(now.getTime() + window.to).toISOString(),
  ];
}

async function send(notification: NewNotification): Promise<boolean> {
  return createNotificationUseCase(notification).catch(() => false);
}

/** Um aviso por pessoa e sessão, com a quantidade de ingressos dela. */
async function ticketReminders(
  now: Date,
  window: { from: number; to: number },
  type: 'ticket_reminder_day' | 'ticket_reminder_soon'
): Promise<number> {
  const tickets = await listIssuedTicketsStartingBetweenUseCase(...range(now, window));
  const groups = new Map<string, typeof tickets>();
  for (const ticket of tickets) {
    const key = `${ticket.ownerUserId}_${ticket.occurrenceId}`;
    groups.set(key, [...(groups.get(key) ?? []), ticket]);
  }
  let sent = 0;
  for (const [key, group] of groups) {
    const first = group[0];
    if (!first) continue;
    const created = await send({
      recipientUid: first.ownerUserId,
      type,
      params: {
        event: first.eventSnapshot?.title || '',
        startsAt: first.eventSnapshot?.startsAt || '',
        count: group.length,
      },
      link: { screen: 'tickets' },
      dedupeKey: `${type}_${key}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

async function bookingReminders(
  now: Date,
  window: { from: number; to: number },
  type: 'booking_reminder_day' | 'booking_reminder_soon'
): Promise<number> {
  let sent = 0;
  for (const booking of await listConfirmedBookingsStartingBetweenUseCase(...range(now, window))) {
    const created = await send({
      recipientUid: booking.buyerId,
      type,
      params: { offer: booking.offerSnapshot.title, startsAt: booking.offerSnapshot.startsAt },
      link: { screen: 'bookings' },
      dedupeKey: `${type}_${booking.id}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

/** Quem entrou no evento (check-in) recebe o convite para avaliar; é opcional (D25). */
async function eventReviewInvites(now: Date): Promise<number> {
  const tickets = await listCheckedInTicketsEndedBetweenUseCase(...range(now, AFTER_EVENT));
  const seen = new Set<string>();
  let sent = 0;
  for (const ticket of tickets) {
    const key = `${ticket.ownerUserId}_${ticket.occurrenceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const created = await send({
      recipientUid: ticket.ownerUserId,
      type: 'review_request',
      params: { offer: ticket.eventSnapshot?.title || '' },
      link: { screen: 'tickets' },
      dedupeKey: `review_request_ticket_${key}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

/** Job dos lembretes (D25): véspera, 2 h antes e convite para avaliar depois do evento. */
export async function sendServiceRemindersApplicationUseCase(now = new Date()): Promise<{
  dayBefore: number;
  soon: number;
  reviewInvites: number;
}> {
  const dayBefore =
    (await ticketReminders(now, DAY_BEFORE, 'ticket_reminder_day')) +
    (await bookingReminders(now, DAY_BEFORE, 'booking_reminder_day'));
  const soon =
    (await ticketReminders(now, SOON, 'ticket_reminder_soon')) +
    (await bookingReminders(now, SOON, 'booking_reminder_soon'));
  return { dayBefore, soon, reviewInvites: await eventReviewInvites(now) };
}
