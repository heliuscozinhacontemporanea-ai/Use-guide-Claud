import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  callInternalJob: vi.fn(),
  jobUrlValue: 'https://use-guide.run.app/internal/partners/check-expiring-plans',
  scheduledHandler: undefined as (() => Promise<void>) | undefined,
}));

vi.mock('firebase-functions/params', () => ({
  defineString: () => ({ value: () => mocks.jobUrlValue }),
  defineSecret: () => ({ value: () => 'test-secret' }),
}));

vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: vi.fn((_options: unknown, handler: () => Promise<void>) => {
    mocks.scheduledHandler = handler;
    return handler;
  }),
}));

vi.mock('./callInternalJob', () => ({
  callInternalJob: mocks.callInternalJob,
  internalJobKey: { value: () => 'test-secret' },
}));

import './checkExpiringPlans';

describe('checkExpiringPlans (Cloud Function)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve invocar callInternalJob com a URL do job e nome do job corretos', async () => {
    await mocks.scheduledHandler?.();
    expect(mocks.callInternalJob).toHaveBeenCalledWith(
      'https://use-guide.run.app/internal/partners/check-expiring-plans',
      'checkExpiringPlans'
    );
  });
});
