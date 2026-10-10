import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { GuideMutationPort } from '../ports/guideMutationPort';
import {
  GuideCreateItemInput,
  GuideUpdateItemInput,
} from '../types/guide';

async function ensureSuccess(response: Response, fallback: string): Promise<void> {
  if (response.ok) {
    return;
  }
  const body = await response.json().catch(() => null);
  throw new Error(body?.error ?? fallback);
}

interface CreateGuideResponse {
  id: string;
}

export class HttpGuideMutationAdapter implements GuideMutationPort {
  async createItem(data: GuideCreateItemInput): Promise<string> {
    const response = await firebaseApiFetch(
      '/api/items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      { requireAuth: true }
    );

    await ensureSuccess(response, 'Erro ao criar item');
    const result = (await response.json()) as CreateGuideResponse;
    if (typeof result.id !== 'string' || !result.id) {
      throw new Error('Resposta inválida do servidor ao criar conteúdo');
    }
    return result.id;
  }

  async updateItem(id: string, data: GuideUpdateItemInput): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/items/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      { requireAuth: true }
    );
    await ensureSuccess(response, 'Erro ao atualizar item');
  }

  async deleteItem(id: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/items/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
      { requireAuth: true }
    );
    await ensureSuccess(response, 'Erro ao excluir item');
  }
}
