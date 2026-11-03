import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type {
  NotificationOutboxPort,
  OutboxEntry,
  PushDevicePort,
  PushSenderPort,
} from '../ports/pushPorts';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES,
  OPTIONAL_TYPES,
} from '../types/notificationTypes';
import { renderNotificationText } from '../utils/renderNotificationText';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;
const BATCH = 100;
const LEASE_MS = 5 * MINUTE_MS;
const MAX_ATTEMPTS = 5;

function fortalezaHour(now: Date): number {
  return new Date(now.getTime() - FORTALEZA_OFFSET_MS).getUTCHours();
}

function fortalezaDayStart(now: Date): Date {
  const local = now.getTime() - FORTALEZA_OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS);
}

/** Avisos opcionais nunca chegam das 21h às 9h (D25, revisão). */
export function isQuietHour(now: Date): boolean {
  const hour = fortalezaHour(now);
  return hour >= 21 || hour < 9;
}

export function nextMorning(now: Date): Date {
  const nine = new Date(fortalezaDayStart(now).getTime() + 9 * HOUR_MS);
  return fortalezaHour(now) < 9 ? nine : new Date(nine.getTime() + DAY_MS);
}

export interface DispatchResult {
  sent: number;
  skipped: number;
  deferred: number;
  failed: number;
}

export class PushDispatchService {
  constructor(
    private readonly outbox: NotificationOutboxPort,
    private readonly devices: PushDevicePort,
    private readonly sender: PushSenderPort,
    private readonly notifications: NotificationRepositoryPort
  ) {}

  async dispatch(now: Date): Promise<DispatchResult> {
    const result: DispatchResult = { sent: 0, skipped: 0, deferred: 0, failed: 0 };
    for (const entry of await this.outbox.claimDue(now, BATCH, LEASE_MS)) {
      try {
        result[await this.deliver(entry, now)] += 1;
      } catch {
        result.failed += 1;
        if (entry.attempts + 1 >= MAX_ATTEMPTS) {
          await this.outbox.complete(entry.id);
        } else {
          const backoff = MINUTE_MS * 2 ** (entry.attempts + 1);
          await this.outbox.retryLater(
            entry.id,
            entry.attempts + 1,
            new Date(now.getTime() + backoff)
          );
        }
      }
    }
    return result;
  }

  private async deliver(entry: OutboxEntry, now: Date): Promise<'sent' | 'skipped' | 'deferred'> {
    const preferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...((await this.notifications.getPreferences(entry.recipientUid)) ?? {}),
    };
    const optional = OPTIONAL_TYPES[entry.type];
    const dailySales =
      NOTIFICATION_TYPES[entry.type] === 'sales' &&
      entry.type !== 'sale_daily_digest' &&
      preferences.salesAlerts === 'daily';
    if ((optional && !preferences[optional]) || dailySales) {
      await this.outbox.complete(entry.id);
      return 'skipped';
    }
    if (optional && isQuietHour(now)) {
      await this.outbox.defer(entry.id, nextMorning(now));
      return 'deferred';
    }

    const devices = await this.devices.listForUser(entry.recipientUid);
    const invalid = new Set<string>();
    const byLocale = new Map<string, string[]>();
    for (const device of devices) {
      byLocale.set(device.locale, [...(byLocale.get(device.locale) ?? []), device.token]);
    }
    for (const [locale, tokens] of byLocale) {
      const text = renderNotificationText(entry.type, entry.params, locale);
      if (!text) continue;
      const { invalidTokens } = await this.sender.send(tokens, {
        ...text,
        link: entry.link,
        tag: entry.id,
      });
      for (const token of invalidTokens) invalid.add(token);
    }
    if (invalid.size > 0) {
      await this.devices.remove(
        devices.filter((device) => invalid.has(device.token)).map((device) => device.id)
      );
    }
    await this.outbox.complete(entry.id);
    return devices.length > 0 ? 'sent' : 'skipped';
  }

  /** Às 20h, quem escolheu o resumo recebe um push com as vendas do dia (D25). */
  async enqueueDailySalesDigest(now: Date): Promise<number> {
    const since = fortalezaDayStart(now);
    const day = since.toISOString().slice(0, 10);
    let queued = 0;
    for (const uid of await this.notifications.listDailySalesRecipients()) {
      const count = await this.notifications.countSalesSince(uid, since);
      if (count === 0) continue;
      const created = await this.outbox.enqueue(
        {
          id: `sale_daily_digest_${uid}_${day}`,
          recipientUid: uid,
          type: 'sale_daily_digest',
          params: { count },
          link: { screen: 'partner' },
        },
        now
      );
      if (created) queued += 1;
    }
    return queued;
  }
}
