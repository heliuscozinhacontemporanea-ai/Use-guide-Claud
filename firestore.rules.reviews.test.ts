import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { readFile } from 'node:fs/promises';

describe('Firestore Rules — Reviews', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(
      new URL('./firestore.rules', import.meta.url),
      'utf8'
    );

    testEnv = await initializeTestEnvironment({
      projectId: 'notifications-rules-test',
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

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .doc('reviews/item-1__user-1')
        .set({
          itemId: 'item-1',
          userId: 'user-1',
          userName: 'Carlos Silva',
          rating: 5,
          comment: 'Excelente local!',
          partnerId: 'partner-1',
        });
    });
  });

  it('deve permitir leitura pública de avaliações sem autenticação', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(
      getDoc(doc(db, 'reviews/item-1__user-1'))
    );
  });

  it('deve permitir leitura de avaliações para usuário autenticado', async () => {
    const db = testEnv.authenticatedContext('user-2').firestore();

    await assertSucceeds(
      getDoc(doc(db, 'reviews/item-1__user-1'))
    );
  });

  it('deve bloquear criação direta de review pelo cliente autenticado (exclusivo do servidor)', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();

    await assertFails(
      setDoc(doc(db, 'reviews/item-1__user-1'), {
        itemId: 'item-1',
        userId: 'user-1',
        rating: 5,
        comment: 'Tentativa de escrita direta',
      })
    );
  });

  it('deve bloquear atualização direta de review pelo cliente autenticado', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();

    await assertFails(
      updateDoc(doc(db, 'reviews/item-1__user-1'), {
        rating: 1,
        comment: 'Tentativa de alteração direta',
      })
    );
  });

  it('deve bloquear exclusão direta de review pelo cliente autenticado', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();

    await assertFails(
      deleteDoc(doc(db, 'reviews/item-1__user-1'))
    );
  });

  it('deve impedir que usuário autenticado altere rating/reviewCount de item', async () => {
    const context = testEnv.authenticatedContext('user-1');
    const db = context.firestore();
    await assertFails(
      setDoc(doc(db, 'items', 'item-1'), {
        rating: 5,
        reviewCount: 999,
      })
    );
  });

  it('deve impedir que usuário autenticado altere rating/reviewCount de evento', async () => {
    const context = testEnv.authenticatedContext('user-1');
    const db = context.firestore();
    await assertFails(
      setDoc(doc(db, 'events', 'event-1'), {
        rating: 5,
        reviewCount: 999,
      })
    );
  });

  it('deve impedir update direto do aggregate de item', async () => {
    const context = testEnv.authenticatedContext('user-1');
    const db = context.firestore();
    await assertFails(
      updateDoc(doc(db, 'items', 'item-1'), {
        rating: 5,
        reviewCount: 100,
      })
    );
  });
});
