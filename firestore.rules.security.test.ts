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
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { readFile } from 'node:fs/promises';

describe('Firestore Rules — Security Suite', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(
      new URL('./firestore.rules', import.meta.url),
      'utf8'
    );

    testEnv = await initializeTestEnvironment({
      projectId: 'security-rules-test',
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
      const db = context.firestore();

      await db.doc('items/item-1').set({
        name: 'Restaurante Teste',
        category: 'restaurant',
      });

      await db.doc('events/event-1').set({
        name: 'Festival Teste',
        eventCategory: 'show',
        status: 'published',
        visibility: 'public',
      });

      await db.doc('events/event-draft').set({
        name: 'Festival Rascunho',
        eventCategory: 'show',
        ownerId: 'partner-1',
        status: 'draft',
        visibility: 'public',
      });

      await db.doc('events/event-paused').set({
        name: 'Festival Pausado',
        eventCategory: 'show',
        status: 'paused',
        visibility: 'public',
      });

      await db.doc('events/event-private').set({
        name: 'Festival Privado',
        eventCategory: 'show',
        status: 'published',
        visibility: 'private',
      });

      await db.doc('reviews/review-1').set({
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: 'Muito bom',
      });

      await db.doc('partners/partner-1').set({
        businessName: 'Parceiro Teste',
      });

      await db.doc('publicPartners/partner-1').set({
        businessName: 'Parceiro Teste',
      });

      await db.doc('users/user-1').set({
        uid: 'user-1',
        displayName: 'User Teste',
        email: 'user1@test.com',
        phone: '8899999999',
        role: 'user',
      });

      await db.doc('users/user-2').set({
        uid: 'user-2',
        displayName: 'User Dois',
        email: 'user2@test.com',
        phone: '8888888888',
        role: 'user',
      });

      await db.doc('publicProfiles/user-1').set({
        uid: 'user-1',
        displayName: 'User Teste',
        photoURL: null,
      });

      await db.doc('notifications/notif-1').set({
        recipientPartnerId: 'user-1',
        title: 'Nova notificação',
      });

      await db.doc('partnerNotificationSettings/user-1').set({
        reviewNotifications: true,
      });

      await db.doc('transactions/tx-1').set({
        userId: 'user-1',
        amount: 50,
        status: 'approved',
      });

      await db.doc('transactions/tx-2').set({
        userId: 'user-2',
        amount: 100,
        status: 'approved',
      });

      await db.doc('interactionStats/items_item-1_2026-10-19').set({
        itemId: 'item-1',
        itemCollection: 'items',
        day: '2026-10-19',
        viewsSignedIn: 1,
      });

      await db.doc('interactionGuards/guard-1').set({ expiresAt: new Date() });

      await db.doc('favorites/fav-1').set({
        userId: 'user-1',
        itemId: 'item-1',
        itemCollection: 'items',
      });

      await db.doc('subscriptionPlans/plan-1').set({
        name: 'Plano Pro',
        price: 99,
      });
    });
  });

  describe('Permissões de Leitura Permitidas', () => {
    it('anonymous → items read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(db, 'items/item-1')));
    });

    it('anonymous → published public events read allowed, draft/paused/private denied', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(db, 'events/event-1')));
      await assertFails(getDoc(doc(db, 'events/event-draft')));
      await assertFails(getDoc(doc(db, 'events/event-paused')));
      await assertFails(getDoc(doc(db, 'events/event-private')));
    });

    it('owner and admin → can read non-public/draft events; other users cannot', async () => {
      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
      const otherUserDb = testEnv.authenticatedContext('user-1').firestore();
      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertSucceeds(getDoc(doc(ownerDb, 'events/event-draft')));
      await assertSucceeds(getDoc(doc(adminDb, 'events/event-draft')));
      await assertFails(getDoc(doc(otherUserDb, 'events/event-draft')));
    });

    it('anonymous → reviews read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(db, 'reviews/review-1')));
    });

    it('anonymous cannot read private partner', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'partners/partner-1')));
    });

    it('partner can read own private profile', async () => {
      const db = testEnv.authenticatedContext('partner-1').firestore();
      await assertSucceeds(getDoc(doc(db, 'partners/partner-1')));
    });

    it('other user cannot read private partner', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'partners/partner-1')));
    });

    it('anonymous can read public partner', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(db, 'publicPartners/partner-1')));
    });

    it('authenticated user → own notifications read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertSucceeds(getDoc(doc(db, 'notifications/notif-1')));
    });

    it('authenticated user → own user profile read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertSucceeds(getDoc(doc(db, 'users/user-1')));
    });

    it('authenticated user → cannot read other user profile', async () => {
      const db = testEnv.authenticatedContext('user-2').firestore();
      await assertFails(getDoc(doc(db, 'users/user-1')));
    });

    it('anonymous → cannot read user profile', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'users/user-1')));
    });

    it('authenticated user → cannot read other user notifications', async () => {
      const db = testEnv.authenticatedContext('user-2').firestore();
      await assertFails(getDoc(doc(db, 'notifications/notif-1')));
    });

    it('client → transactions read denied (server-only)', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'transactions/tx-1')));
      await assertFails(getDoc(doc(db, 'transactions/tx-2')));
    });

    it('partner → own partnerSubscriptions read and write denied (server-only)', async () => {
      const db = testEnv.authenticatedContext('partner-1').firestore();
      await assertFails(getDoc(doc(db, 'partnerSubscriptions/partner-1')));
      await assertFails(setDoc(doc(db, 'partnerSubscriptions/partner-1'), { status: 'active' }));
    });

    it('admin with admin=true claim → partners read allowed', async () => {
      const db = testEnv
        .authenticatedContext('admin-user', { admin: true })
        .firestore();
      await assertSucceeds(getDoc(doc(db, 'partners/partner-1')));
    });

    it('fake admin with admin=false and role=admin → partners read denied', async () => {
      const fakeAdminDb = testEnv
        .authenticatedContext('user-1', { admin: false, role: 'admin' })
        .firestore();
      await assertFails(getDoc(doc(fakeAdminDb, 'partners/partner-1')));
    });

    it('insights → interactionStats e interactionGuards negados até para admin', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
      const anonDb = testEnv.unauthenticatedContext().firestore();
      for (const db of [adminDb, ownerDb, anonDb]) {
        await assertFails(getDoc(doc(db, 'interactionStats/items_item-1_2026-10-19')));
        await assertFails(getDoc(doc(db, 'interactionGuards/guard-1')));
        await assertFails(
          setDoc(doc(db, 'interactionStats/items_item-1_2026-10-19'), { viewsAnonymous: 999 })
        );
      }
    });
  });

  describe('Negação de Escritas pelo Cliente (Backend-Only Mutation)', () => {
    it('client → items write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'items/item-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(db, 'items/item-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(db, 'items/item-1')));
    });

    it('client → events write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'events/event-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(db, 'events/event-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(db, 'events/event-1')));
    });

    it('client → reviews write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'reviews/review-new'), { rating: 5 }));
      await assertFails(updateDoc(doc(db, 'reviews/review-1'), { rating: 4 }));
      await assertFails(deleteDoc(doc(db, 'reviews/review-1')));
    });

    it('client → partners write negado', async () => {
      const dbAuth = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(dbAuth, 'partners/partner-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(dbAuth, 'partners/partner-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(dbAuth, 'partners/partner-1')));

      const dbAnon = testEnv.unauthenticatedContext().firestore();
      await assertFails(setDoc(doc(dbAnon, 'partners/partner-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(dbAnon, 'partners/partner-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(dbAnon, 'partners/partner-1')));

      const dbAdmin = testEnv.authenticatedContext('admin-1', { admin: true }).firestore();
      await assertFails(setDoc(doc(dbAdmin, 'partners/partner-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(dbAdmin, 'partners/partner-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(dbAdmin, 'partners/partner-1')));
    });

    it('client → users write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'users/user-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(db, 'users/user-1'), { name: 'Editado' }));
      await assertFails(deleteDoc(doc(db, 'users/user-1')));
    });

    it('client → notifications write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'notifications/notif-new'), { title: 'Novo' }));
      await assertFails(updateDoc(doc(db, 'notifications/notif-1'), { title: 'Editado' }));
      await assertFails(deleteDoc(doc(db, 'notifications/notif-1')));
    });

    it('client → partnerNotificationSettings write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'partnerNotificationSettings/user-1'), { reviewNotifications: false }));
      await assertFails(updateDoc(doc(db, 'partnerNotificationSettings/user-1'), { reviewNotifications: false }));
      await assertFails(deleteDoc(doc(db, 'partnerNotificationSettings/user-1')));
    });

    it('client → transactions write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'transactions/tx-new'), { amount: 20 }));
      await assertFails(updateDoc(doc(db, 'transactions/tx-1'), { amount: 30 }));
      await assertFails(deleteDoc(doc(db, 'transactions/tx-1')));
    });

    it('client → interactionStats e interactionGuards write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      const statPath = 'interactionStats/items_item-1_2026-10-19';
      await assertFails(updateDoc(doc(db, statPath), { viewsSignedIn: 999 }));
      await assertFails(deleteDoc(doc(db, statPath)));
      await assertFails(setDoc(doc(db, 'interactionGuards/guard-new'), { expiresAt: new Date() }));
      await assertFails(deleteDoc(doc(db, 'interactionGuards/guard-1')));
    });

    it('client → favorites write negado', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'favorites/fav-new'), { itemId: 'item-2' }));
      await assertFails(updateDoc(doc(db, 'favorites/fav-1'), { itemId: 'item-3' }));
      await assertFails(deleteDoc(doc(db, 'favorites/fav-1')));
    });

    it('client → subscriptionPlans write negado', async () => {
      const dbAnon = testEnv.unauthenticatedContext().firestore();
      await assertFails(setDoc(doc(dbAnon, 'subscriptionPlans/plan-new'), { name: 'Novo' }));

      const dbAuth = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(dbAuth, 'subscriptionPlans/plan-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(dbAuth, 'subscriptionPlans/plan-1'), { price: 10 }));
      await assertFails(deleteDoc(doc(dbAuth, 'subscriptionPlans/plan-1')));

      const dbAdmin = testEnv.authenticatedContext('admin-1', { admin: true }).firestore();
      await assertFails(setDoc(doc(dbAdmin, 'subscriptionPlans/plan-new'), { name: 'Novo' }));
      await assertFails(updateDoc(doc(dbAdmin, 'subscriptionPlans/plan-1'), { price: 10 }));
      await assertFails(deleteDoc(doc(dbAdmin, 'subscriptionPlans/plan-1')));
    });
  });

  describe('Regras de Segurança Estritas — /users e integridade de dados', () => {
    it('1. usuário anônimo não lê /users', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'users/user-1')));
    });

    it('2. usuário A lê próprio /users/A', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertSucceeds(getDoc(doc(db, 'users/user-1')));
    });

    it('3. usuário A não lê /users/B', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'users/user-2')));
    });

    it('4. usuário A não escreve /users/A', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(db, 'users/user-1'), { displayName: 'Hacked' }));
      await assertFails(deleteDoc(doc(db, 'users/user-1')));
    });

    it('5. usuário A não escreve /users/B', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'users/user-2'), { displayName: 'Injected' }));
      await assertFails(updateDoc(doc(db, 'users/user-2'), { displayName: 'Modified' }));
      await assertFails(deleteDoc(doc(db, 'users/user-2')));
    });

    it('6. cliente autenticado não altera role', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(db, 'users/user-1'), { role: 'admin' }));
    });

    it('7. cliente autenticado não altera roles', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(db, 'users/user-1'), { roles: ['admin'] }));
    });

    it('8. cliente não altera email', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(db, 'users/user-1'), { email: 'attacker@evil.com' }));
    });

    it('9. cliente não altera phone de outro usuário', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(db, 'users/user-2'), { phone: '0000000000' }));
    });

    it('10. items/events continuam sem escrita client-side', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'items/hacked-item'), { name: 'Hacked' }));
      await assertFails(updateDoc(doc(db, 'items/item-1'), { name: 'Changed' }));
      await assertFails(deleteDoc(doc(db, 'items/item-1')));

      await assertFails(setDoc(doc(db, 'events/hacked-event'), { name: 'Hacked Event' }));
      await assertFails(updateDoc(doc(db, 'events/event-1'), { name: 'Changed Event' }));
      await assertFails(deleteDoc(doc(db, 'events/event-1')));
    });

    it('anonymous → pode ler publicProfiles, mas escrita client-side é negada', async () => {
      const dbAnon = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(dbAnon, 'publicProfiles/user-1')));
      await assertFails(setDoc(doc(dbAnon, 'publicProfiles/user-1'), { displayName: 'Hack' }));

      const dbAuth = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(updateDoc(doc(dbAuth, 'publicProfiles/user-1'), { displayName: 'Hack' }));
    });
  });
});
