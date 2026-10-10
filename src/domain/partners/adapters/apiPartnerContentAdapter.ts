import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PartnerContentPort } from '../ports/partnerContentPort';
import type { PartnerContentEventInput, PartnerContentItemInput } from '../types/partnerContent';

export class ApiPartnerContentAdapter implements PartnerContentPort {
  private async request<T>(path: string, init: RequestInit): Promise<T | undefined> {
    const response = await firebaseApiFetch(path, init, {
      requireAuth: true,
      requireAppCheck: true,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Erro na operação do conteúdo do parceiro');
    }
    if (response.status === 204) {
      return undefined;
    }
    return response.json();
  }

  async createItem(data: PartnerContentItemInput): Promise<string> {
    const result = await this.request<{
      id: string;
    }>('/api/partners/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result || typeof result.id !== 'string' || !result.id) {
      throw new Error('Resposta inválida da API ao criar item do parceiro.');
    }

    return result.id;
  }

  async updateItem(id: string, data: Partial<PartnerContentItemInput>): Promise<void> {
    await this.request<void>(`/api/partners/items/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.request<void>(`/api/partners/items/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async createEvent(data: PartnerContentEventInput): Promise<string> {
    const result = await this.request<{
      id: string;
    }>('/api/partners/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result || typeof result.id !== 'string' || !result.id) {
      throw new Error('Resposta inválida da API ao criar evento do parceiro.');
    }

    return result.id;
  }

  async updateEvent(id: string, data: Partial<PartnerContentEventInput>): Promise<void> {
    await this.request<void>(`/api/partners/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request<void>(`/api/partners/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
