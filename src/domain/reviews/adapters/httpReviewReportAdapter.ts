import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ReviewReportApiPort } from '../ports/reviewReportApiPort';
import type {
  ModerationPage,
  MyReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
  }
  return data as T;
}

function postJson(path: string, body: unknown) {
  return firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
}

export class HttpReviewReportAdapter implements ReviewReportApiPort {
  async report(input: {
    reviewId: string;
    reason: ReviewReportReason;
    details?: string;
  }): Promise<MyReviewReport> {
    const response = await postJson('/api/review-reports', input);
    return (await readJsonOrThrow<{ data: MyReviewReport }>(response)).data;
  }

  async listMine(): Promise<MyReviewReport[]> {
    const response = await firebaseApiFetch(
      '/api/review-reports/mine',
      { method: 'GET' },
      API_OPTIONS
    );
    return (await readJsonOrThrow<{ data: MyReviewReport[] }>(response)).data;
  }

  async listOpen(cursor?: string | null): Promise<ModerationPage> {
    const params = new URLSearchParams({ limit: '30' });
    if (cursor) params.set('cursor', cursor);
    const response = await firebaseApiFetch(
      `/api/admin/review-reports?${params.toString()}`,
      { method: 'GET' },
      API_OPTIONS
    );
    return readJsonOrThrow<ModerationPage>(response);
  }

  async decide(reportId: string, outcome: ReviewReportOutcome): Promise<void> {
    const response = await postJson(
      `/api/admin/review-reports/${encodeURIComponent(reportId)}/decision`,
      { outcome }
    );
    await readJsonOrThrow<unknown>(response);
  }
}
