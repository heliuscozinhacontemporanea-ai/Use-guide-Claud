import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { EventsPort } from '../ports/eventsPort';
import type { CreateEventOccurrenceInput, EventListing, EventOccurrence } from '../types/event';

async function parseJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = (payload as { error?: unknown }).error;
    // Erro tipado (`{ code, message }`) vira o código, que a tela traduz (§10.2, §12.5).
    const code =
      error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;
    throw new Error(code ?? (typeof error === 'string' ? error : fallbackMessage));
  }
  return payload as T;
}

export class HttpEventsAdapter implements EventsPort {
  async getEventListingById(id: string): Promise<EventListing | null> {
    const response = await firebaseApiFetch(`/api/events/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    if (response.status === 404) return null;
    const result = await parseJsonOrThrow<{ data: EventListing }>(
      response,
      'Não foi possível carregar o evento.'
    );
    return result.data;
  }

  async listEventOccurrences(eventListingId: string): Promise<EventOccurrence[]> {
    const response = await firebaseApiFetch(
      `/api/events/${encodeURIComponent(eventListingId)}/occurrences`,
      {
        method: 'GET',
      }
    );
    if (response.status === 404) return [];
    const result = await parseJsonOrThrow<{ data: EventOccurrence[] }>(
      response,
      'Não foi possível carregar as datas do evento.'
    );
    return (result.data || [])
      .filter((occ) => occ.status !== 'canceled')
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }

  async createPartnerEventOccurrence(
    eventListingId: string,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{ data: EventOccurrence }>(
      response,
      'Erro ao criar ocorrência.'
    );
    return result.data;
  }

  async updatePartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    input: Partial<CreateEventOccurrenceInput>
  ): Promise<EventOccurrence> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{ data: EventOccurrence }>(
      response,
      'Erro ao atualizar ocorrência.'
    );
    return result.data;
  }

  async cancelPartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    reason: string
  ): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}/cancel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao cancelar a sessão.');
  }

  async postponePartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    replacement: { startsAt: string; endsAt: string; reason: string }
  ): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}/postpone`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replacement),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao adiar a sessão.');
  }

  async deletePartnerEventOccurrence(eventListingId: string, occurrenceId: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}`,
      { method: 'DELETE' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao remover ocorrência.');
  }
}
