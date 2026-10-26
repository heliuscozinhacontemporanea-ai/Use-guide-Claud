import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { EventsPort } from '../ports/eventsPort';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventListing,
  EventOccurrence,
  UpdateEventListingInput,
} from '../types/event';

async function parseJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof (payload as { error?: string }).error === 'string'
        ? (payload as { error: string }).error
        : fallbackMessage
    );
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

  async createPartnerEventListing(
    input: CreateEventListingInput
  ): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
    const response = await firebaseApiFetch(
      '/api/partners/events',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{
      id: string;
      data?: { listing: EventListing; occurrences: EventOccurrence[] };
    }>(response, 'Erro ao criar evento.');
    return {
      id: result.id,
      listing: result.data?.listing,
      occurrences: result.data?.occurrences,
    };
  }

  async updatePartnerEventListing(id: string, input: UpdateEventListingInput): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao atualizar evento.');
  }

  async deletePartnerEventListing(id: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/partners/events/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao excluir evento.');
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

  async createAdminEventListing(
    input: CreateEventListingInput
  ): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
    const response = await firebaseApiFetch(
      '/api/admin/events',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{
      id: string;
      data?: { listing: EventListing; occurrences: EventOccurrence[] };
    }>(response, 'Erro ao criar evento administrativo.');
    return {
      id: result.id,
      listing: result.data?.listing,
      occurrences: result.data?.occurrences,
    };
  }

  async updateAdminEventListing(id: string, input: UpdateEventListingInput): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao atualizar evento administrativo.');
  }

  async deleteAdminEventListing(id: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao remover evento administrativo.');
  }

  async archiveAdminEventListing(id: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(id)}/archive`,
      { method: 'POST' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao arquivar evento.');
  }

  async cancelAdminEventListing(id: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(id)}/cancel`,
      { method: 'POST' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao cancelar evento.');
  }

  async createAdminEventOccurrence(
    eventListingId: string,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(eventListingId)}/occurrences`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{ data: EventOccurrence }>(
      response,
      'Erro ao criar ocorrência administrativa.'
    );
    return result.data;
  }

  async updateAdminEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    input: Partial<CreateEventOccurrenceInput>
  ): Promise<EventOccurrence> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const result = await parseJsonOrThrow<{ data: EventOccurrence }>(
      response,
      'Erro ao atualizar ocorrência administrativa.'
    );
    return result.data;
  }

  async deleteAdminEventOccurrence(eventListingId: string, occurrenceId: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}`,
      { method: 'DELETE' },
      { requireAuth: true, requireAppCheck: true }
    );
    await parseJsonOrThrow(response, 'Erro ao excluir ocorrência administrativa.');
  }
}
