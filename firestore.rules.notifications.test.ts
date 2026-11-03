import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

describe('Firestore Rules — Notificações (D25)', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(new URL('./firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'notifications-rules-test',
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db
        .doc('notifications/n-1')
        .set({ recipientUid: 'user-a', type: 'ticket_received', params: {}, read: false });
      await db
        .doc('notifications/n-2')
        .set({ recipientUid: 'user-b', type: 'sale_ticket', params: {}, read: false });
      await db.doc('notificationPreferences/user-a').set({ news: false });
    });
  });

  it('cada conta lê só os próprios avisos', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertSucceeds(getDoc(doc(db, 'notifications/n-1')));
    await assertFails(getDoc(doc(db, 'notifications/n-2')));
  });

  it('visitante sem login não lê avisos', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'notifications/n-1')));
  });

  it('o app não cria nem altera avisos (escrita só pelo backend)', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      setDoc(doc(db, 'notifications/n-3'), { recipientUid: 'user-a', type: 'admin_message' })
    );
    await assertFails(updateDoc(doc(db, 'notifications/n-1'), { read: true }));
  });

  it('escolhas de notificação ficam só no backend, até para o dono', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(getDoc(doc(db, 'notificationPreferences/user-a')));
    await assertFails(setDoc(doc(db, 'notificationPreferences/user-a'), { news: true }));
  });

  it('aparelhos do push e fila de envio ficam só no backend', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(getDoc(doc(db, 'pushDevices/d-1')));
    await assertFails(setDoc(doc(db, 'pushDevices/d-1'), { uid: 'user-a', token: 'x' }));
    await assertFails(getDoc(doc(db, 'notificationOutbox/n-1')));
  });
});
