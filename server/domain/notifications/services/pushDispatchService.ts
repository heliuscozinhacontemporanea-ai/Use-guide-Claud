import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import { PLATFORM_TIME_ZONE, timeZoneOffsetMs } from '../../../shared/kernel/timeZones';
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
const BATCH = 100;
const LEASE_MS = 5 * MINUTE_MS;
const MAX_ATTEMPTS = 5;

// Silêncio dos avisos opcionais (D25): das 23h30 às 5h30, em minutos do dia em Brasília, o fuso da
// plataforma (D28): o servidor não sabe o fuso de quem recebe.
const QUIET_START_MIN = 23 * 60 + 30;
const QUIET_END_MIN = 5 * 60 + 30;

function platformMinuteOfDay(now: Date): number {
  const local = new Date(now.getTime() + timeZoneOffsetMs(PLATFORM_TIME_ZONE, now.getTime()));
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

function platformDayStart(now: Date): Date {
  return new Date(businessDayStartMs(now.toISOString()));
}

/** Avisos opcionais nunca chegam das 23h30 às 5h30 (D25, revisão). */
export function isQuietHour(now: Date): boolean {
  const minute = platformMinuteOfDay(now);
  return minute >= QUIET_START_MIN || minute < QUIET_END_MIN;
}

/** Próximas 5h30 em Brasília: quando o aviso adiado sai. */
export function nextMorning(now: Date): Date {
  const morning = new Date(platformDayStart(now).getTime() + QUIET_END_MIN * MINUTE_MS);
  return platformMinuteOfDay(now) < QUIET_END_MIN ? morning : new Date(morning.getTime() + DAY_MS);
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
    const since = platformDayStart(now);
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
