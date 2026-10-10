import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { AdminReportsPort } from '../ports/adminReportsPort';
import type { AdminPartnerSummary, AdminStats } from '../types/admin';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return body.error?.message || body.error || fallback;
}

export class HttpAdminReportsAdapter implements AdminReportsPort {
  async getStats(): Promise<AdminStats> {
    const response = await firebaseApiFetch(
      '/api/admin/stats',
      { method: 'GET' },
      { requireAuth: true, requireAppCheck: true }
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Falha ao buscar estatísticas do administrador'));
    }
    return response.json();
  }

  async getPartners(): Promise<AdminPartnerSummary[]> {
    const response = await firebaseApiFetch(
      '/api/admin/partners',
      { method: 'GET' },
      { requireAuth: true, requireAppCheck: true }
    );
    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'Falha ao buscar lista de parceiros do administrador')
      );
    }
    return response.json();
  }
}
