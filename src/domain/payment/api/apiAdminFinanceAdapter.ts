import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { AdminFinanceApiPort } from '../ports/adminFinanceApiPort';
import type {
  AdminAccountDebt,
  AdminForceMajeureReview,
  AdminPage,
  AdminSaleClaim,
  SaleClaimDecisionInput,
} from '../types/adminFinance';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function okOrThrow(response: Response): Promise<Response> {
  if (response.ok) return response;
  const data = await response.json().catch(() => ({}));
  throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'UNAVAILABLE');
}

async function getJson<T>(path: string): Promise<T> {
  const response = await firebaseApiFetch(path, { method: 'GET' }, API_OPTIONS);
  return (await okOrThrow(response)).json() as Promise<T>;
}

async function post(path: string, body: unknown): Promise<void> {
  const response = await firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
  await okOrThrow(response);
}

function page(path: string, cursor?: string): string {
  const params = new URLSearchParams({ limit: '30' });
  if (cursor) params.set('cursor', cursor);
  return `${path}?${params.toString()}`;
}

const debtPath = (debtId: string) => `/api/admin/account-debts/${encodeURIComponent(debtId)}`;

export class ApiAdminFinanceAdapter implements AdminFinanceApiPort {
  listSaleClaims(cursor?: string): Promise<AdminPage<AdminSaleClaim>> {
    return getJson(page('/api/admin/sale-claims', cursor));
  }

  decideSaleClaim(claimId: string, decision: SaleClaimDecisionInput): Promise<void> {
    return post(`/api/admin/sale-claims/${encodeURIComponent(claimId)}/decision`, decision);
  }

  async listForceMajeureReviews(): Promise<AdminForceMajeureReview[]> {
    return (
      await getJson<{ data: AdminForceMajeureReview[] }>('/api/admin/account-debts/force-majeure')
    ).data;
  }

  async readForceMajeureProof(debtId: string): Promise<Blob> {
    const response = await firebaseApiFetch(
      `${debtPath(debtId)}/force-majeure/proof`,
      { method: 'GET' },
      API_OPTIONS
    );
    return (await okOrThrow(response)).blob();
  }

  decideForceMajeure(debtId: string, approve: boolean): Promise<void> {
    return post(`${debtPath(debtId)}/force-majeure/decision`, { approve });
  }

  listAccountDebts(cursor?: string): Promise<AdminPage<AdminAccountDebt>> {
    return getJson(page('/api/admin/account-debts', cursor));
  }

  waiveAccountDebt(debtId: string): Promise<void> {
    return post(`${debtPath(debtId)}/waive`, {});
  }
}
