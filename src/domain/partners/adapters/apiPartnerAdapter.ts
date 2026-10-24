import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { PartnerPort } from '../ports/partnerPort';
import { PartnerAccountStatus, PartnerProfile, PartnerRegistrationPayload } from '../types/partner';

export class ApiPartnerAdapter implements PartnerPort {
  async registerPartner(payload: PartnerRegistrationPayload): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/partners/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: payload }),
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao realizar upgrade para parceiro no backend');
    }
  }

  async getPartnerProfile(partnerId: string): Promise<PartnerProfile | null> {
    const response = await firebaseApiFetch(
      `/api/partners/profile/${encodeURIComponent(partnerId)}`,
      {
        method: 'GET',
      },
      {
        requireAuth: true,
        requireAppCheck: true,
      }
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Erro ao carregar perfil do parceiro');
    }
    return response.json();
  }

  async getAllPartners(): Promise<PartnerProfile[]> {
    const response = await firebaseApiFetch(
      '/api/admin/partners',
      {
        method: 'GET',
      },
      {
        requireAuth: true,
        requireAppCheck: true,
      }
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Erro ao carregar parceiros');
    }
    return response.json();
  }

  async updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/partners/status',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerId, status }),
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao atualizar status do parceiro no backend');
    }
  }

  async deletePartnerProfile(partnerId: string): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/partners/${partnerId}`,
      {
        method: 'DELETE',
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao remover parceiro no backend');
    }
  }
}
