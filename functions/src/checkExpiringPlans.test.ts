import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => {
  process.env.FIRESTORE_DATABASE_ID = 'test-database-id';
  const state = {
    partners: [] as Array<{
      id: string;
      data: () => Record<
        string,
        unknown
      >;
    }>,

    settings:
      new Map<
        string,
        Record<string, unknown>
      >(),

    notifications:
      new Map<
        string,
        Record<string, unknown>
      >(),
  };

  return {
    state,

    scheduledHandler: undefined as (() => Promise<void>) | undefined,

    db: {
      collection: vi.fn(),
    },

    FieldValue: {
      serverTimestamp: vi.fn(
        () => 'SERVER_TIMESTAMP',
      ),
    },
  };
});

vi.mock(
  'firebase-admin/firestore',
  () => ({
    getFirestore: vi.fn(
      () => mocks.db,
    ),

    FieldValue:
      mocks.FieldValue,
  }),
);

vi.mock(
  'firebase-admin/app',
  () => ({
    initializeApp: vi.fn(),
  }),
);

vi.mock(
  'firebase-functions/v2/scheduler',
  () => ({
    onSchedule: vi.fn(
      (
        _options: unknown,
        handler: () => Promise<void>,
      ) => {
        mocks.scheduledHandler =
          handler;

        return handler;
      },
    ),
  }),
);

import './checkExpiringPlans';

describe(
  'checkExpiringPlans',
  () => {
    beforeEach(() => {
      mocks.state.partners = [];

      mocks.state.settings.clear();

      mocks.state.notifications.clear();

      vi.clearAllMocks();

      mocks.db.collection.mockImplementation(
        (
          collectionName: string,
        ) => {
          if (
            collectionName ===
            'partners'
          ) {
            return {
              where: vi.fn(
                () => ({
                  get: vi.fn(
                    async () => ({
                      docs:
                        mocks
                          .state
                          .partners,
                    }),
                  ),
                }),
              ),
            };
          }

          if (
            collectionName ===
            'partnerNotificationSettings'
          ) {
            return {
              doc: vi.fn(
                (
                  partnerId: string,
                ) => ({
                  get: vi.fn(
                    async () => {
                      const data =
                        mocks
                          .state
                          .settings
                          .get(
                            partnerId,
                          );

                      return {
                        exists:
                          !!data,

                        data: () =>
                          data,
                      };
                    },
                  ),
                }),
              ),
            };
          }

          if (
            collectionName ===
            'notifications'
          ) {
            return {
              doc: vi.fn(
                (
                  notificationId: string,
                ) => ({
                  get: vi.fn(
                    async () => ({
                      exists:
                        mocks
                          .state
                          .notifications
                          .has(
                            notificationId,
                          ),

                      data: () =>
                        mocks
                          .state
                          .notifications
                          .get(
                            notificationId,
                          ),
                    }),
                  ),

                  set: vi.fn(
                    async (
                      data: Record<
                        string,
                        unknown
                      >,
                    ) => {
                      mocks
                        .state
                        .notifications
                        .set(
                          notificationId,
                          data,
                        );
                    },
                  ),
                }),
              ),
            };
          }

          throw new Error(
            `Coleção inesperada: ${collectionName}`,
          );
        },
      );
    });

    it('deve gerar notification para plano prestes a expirar', async () => {
      const verifiedUntil =
        new Date();

      verifiedUntil.setDate(
        verifiedUntil.getDate() + 2,
      );

      mocks.state.partners = [
        {
          id: 'partner-1',

          data: () => ({
            isVerified: true,
            verifiedUntil:
              verifiedUntil.toISOString(),
          }),
        },
      ];

      mocks.state.settings.set(
        'partner-1',
        {
          planExpiringNotifications:
            true,
        },
      );

      await mocks.scheduledHandler?.();

      expect(
        mocks.state.notifications.size,
      ).toBe(1);
    });

    it('não deve notificar quando a configuração estiver desabilitada', async () => {
      const verifiedUntil =
        new Date();

      verifiedUntil.setDate(
        verifiedUntil.getDate() + 2,
      );

      mocks.state.partners = [
        {
          id: 'partner-1',

          data: () => ({
            isVerified: true,

            verifiedUntil:
              verifiedUntil.toISOString(),
          }),
        },
      ];

      mocks.state.settings.set(
        'partner-1',
        {
          planExpiringNotifications:
            false,
        },
      );

      await mocks.scheduledHandler?.();

      expect(
        mocks.state.notifications.size,
      ).toBe(0);
    });

    it('não deve duplicar uma notification já existente', async () => {
      const verifiedUntil =
        new Date();

      verifiedUntil.setDate(
        verifiedUntil.getDate() + 2,
      );

      mocks.state.partners = [
        {
          id: 'partner-1',

          data: () => ({
            isVerified: true,

            verifiedUntil:
              verifiedUntil.toISOString(),
          }),
        },
      ];

      const expirationDate =
        verifiedUntil
          .toISOString()
          .split('T')[0];

      const id =
        `plan_expiring_partner-1_2d_${expirationDate}`;

      mocks.state.notifications.set(
        id,
        {
          recipientPartnerId:
            'partner-1',

          type:
            'plan_expiring',
        },
      );

      await mocks.scheduledHandler?.();

      expect(
        mocks.state.notifications.size,
      ).toBe(1);
    });
  },
);
