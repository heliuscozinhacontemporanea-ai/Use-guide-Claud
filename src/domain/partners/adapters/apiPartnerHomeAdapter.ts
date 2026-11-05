import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PartnerHomePort } from '../ports/partnerHomePort';
import type {
  PartnerCatalogEvent,
  PartnerEarnings,
  PartnerEventSales,
  PartnerHomeView,
  PartnerReportPeriod,
  PartnerReports,
  PartnerTodayItem,
} from '../types/partnerHome';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

export class ApiPartnerHomeAdapter implements PartnerHomePort {
  /** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
  async get(): Promise<PartnerHomeView> {
    const response = await firebaseApiFetch('/api/partner-home', { method: 'GET' }, OPTIONS);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: PartnerHomeView }).data;
  }

  async getAgenda(fromIso: string, toIso: string): Promise<PartnerTodayItem[]> {
    const query = new URLSearchParams({ from: fromIso, to: toIso });
    const response = await firebaseApiFetch(
      `/api/partner-home/agenda?${query}`,
      { method: 'GET' },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: PartnerTodayItem[] }).data;
  }

  async getCatalogEvents(): Promise<PartnerCatalogEvent[]> {
    const response = await firebaseApiFetch(
      '/api/partner-home/catalog',
      { method: 'GET' },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: { events: PartnerCatalogEvent[] } }).data.events;
  }

  async getEventSales(eventId: string): Promise<PartnerEventSales> {
    const response = await firebaseApiFetch(
      `/api/partner-home/events/${encodeURIComponent(eventId)}/sales`,
      { method: 'GET' },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: PartnerEventSales }).data;
  }

  async getEarnings(): Promise<PartnerEarnings> {
    const response = await firebaseApiFetch(
      '/api/partner-home/earnings',
      { method: 'GET' },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: PartnerEarnings }).data;
  }

  async getReports(period: PartnerReportPeriod): Promise<PartnerReports> {
    const response = await firebaseApiFetch(
      `/api/partner-home/reports?${new URLSearchParams({ period })}`,
      { method: 'GET' },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: PartnerReports }).data;
  }

  async saveCards(cards: string[]): Promise<string[]> {
    const response = await firebaseApiFetch(
      '/api/partner-home/cards',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      },
      OPTIONS
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    return (body as { data: { cards: string[] } }).data.cards;
  }
}
