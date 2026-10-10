import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { readFile } from 'node:fs/promises';

describe(
  'Firestore Rules — Notifications',
  () => {
    let testEnv:
      Awaited<
        ReturnType<
          typeof initializeTestEnvironment
        >
      >;

    beforeAll(async () => {
      const rules =
        await readFile(
          new URL(
            './firestore.rules',
            import.meta.url,
          ),
          'utf8',
        );

      testEnv =
        await initializeTestEnvironment({
          projectId:
            'notifications-rules-test',

          firestore: {
            rules,
          },
        });
    });

    afterAll(async () => {
      await testEnv.cleanup();
    });

    beforeEach(async () => {
      await testEnv.clearFirestore();

      await testEnv.withSecurityRulesDisabled(
        async (context) => {
          await context
            .firestore()
            .doc('notifications/n-1')
            .set({
              recipientPartnerId:
                'partner-a',

              type: 'review',

              title:
                'Nova avaliação',

              message:
                'Mensagem',

              read: false,
            });

          await context
            .firestore()
            .doc('notifications/n-2')
            .set({
              recipientPartnerId:
                'partner-b',

              type: 'review',

              title:
                'Outra avaliação',

              message:
                'Mensagem',

              read: false,
            });

          await context
            .firestore()
            .doc(
              'partnerNotificationSettings/partner-a',
            )
            .set({
              partnerId:
                'partner-a',

              reviewNotifications:
                true,

              planExpiringNotifications:
                true,
            });
        },
      );
    });

    it('deve permitir partner ler sua própria notification', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertSucceeds(
        getDoc(
          doc(
            db,
            'notifications/n-1',
          ),
        ),
      );
    });

    it('deve bloquear leitura de notification de outro partner', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertFails(
        getDoc(
          doc(
            db,
            'notifications/n-2',
          ),
        ),
      );
    });

    it('deve bloquear leitura anônima', async () => {
      const db =
        testEnv
          .unauthenticatedContext()
          .firestore();

      await assertFails(
        getDoc(
          doc(
            db,
            'notifications/n-1',
          ),
        ),
      );
    });

    it('deve bloquear criação de notification pelo cliente', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertFails(
        setDoc(
          doc(
            db,
            'notifications/n-3',
          ),
          {
            recipientPartnerId:
              'partner-a',

            type: 'review',

            title: 'Spam',

            message:
              'Não deveria ser criado',

            read: false,
          },
        ),
      );
    });

    it('deve bloquear alteração de notification pelo cliente', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertFails(
        updateDoc(
          doc(
            db,
            'notifications/n-1',
          ),
          {
            read: true,
          },
        ),
      );
    });

    it('deve permitir leitura das próprias configurações', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertSucceeds(
        getDoc(
          doc(
            db,
            'partnerNotificationSettings/partner-a',
          ),
        ),
      );
    });

    it('deve bloquear leitura das configurações de outro partner', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertFails(
        getDoc(
          doc(
            db,
            'partnerNotificationSettings/partner-b',
          ),
        ),
      );
    });

    it('deve bloquear alteração das configurações pelo cliente', async () => {
      const db =
        testEnv
          .authenticatedContext(
            'partner-a',
          )
          .firestore();

      await assertFails(
        updateDoc(
          doc(
            db,
            'partnerNotificationSettings/partner-a',
          ),
          {
            reviewNotifications:
              false,
          },
        ),
      );
    });
  },
);
