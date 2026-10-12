import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

describe('Firestore Rules — bookings', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(new URL('./firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'bookings-rules-test',
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
      await setDoc(doc(db, 'publicBookableOffers/published-1'), { status: 'published' });
      await setDoc(doc(db, 'publicBookableOffers/draft-1'), { status: 'draft' });
      await setDoc(doc(db, 'bookableOffers/offer-1'), { ownerId: 'partner-1' });
      await setDoc(doc(db, 'availabilitySlots/slot-1'), { offerId: 'offer-1' });
      await setDoc(doc(db, 'bookings/booking-1'), { buyerId: 'buyer-1' });
      await setDoc(doc(db, 'bookingParticipants/booking-1_0'), { bookingId: 'booking-1' });
      await setDoc(doc(db, 'bookingAuditLogs/log-1'), { bookingId: 'booking-1' });
    });
  });

  it('anônimo lê oferta pública publicada, mas não rascunho', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, 'publicBookableOffers/published-1')));
    await assertFails(getDoc(doc(db, 'publicBookableOffers/draft-1')));
  });

  it('ninguém escreve na projeção pública pelo cliente', async () => {
    const db = testEnv.authenticatedContext('partner-1', { admin: true }).firestore();
    await assertFails(setDoc(doc(db, 'publicBookableOffers/published-1'), { status: 'published' }));
    await assertFails(deleteDoc(doc(db, 'publicBookableOffers/published-1')));
  });

  it('coleções internas negam leitura e escrita até para o dono', async () => {
    const buyer = testEnv.authenticatedContext('buyer-1').firestore();
    const partner = testEnv.authenticatedContext('partner-1').firestore();
    await assertFails(getDoc(doc(buyer, 'bookings/booking-1')));
    await assertFails(setDoc(doc(buyer, 'bookings/booking-2'), { buyerId: 'buyer-1' }));
    await assertFails(getDoc(doc(buyer, 'bookingParticipants/booking-1_0')));
    await assertFails(getDoc(doc(partner, 'bookableOffers/offer-1')));
    await assertFails(setDoc(doc(partner, 'bookableOffers/offer-1'), { ownerId: 'partner-1' }));
    await assertFails(getDoc(doc(partner, 'availabilitySlots/slot-1')));
    await assertFails(setDoc(doc(partner, 'availabilitySlots/slot-1'), { capacityTotal: 999 }));
  });

  it('auditoria só é lida por admin e nunca escrita pelo cliente', async () => {
    const admin = testEnv.authenticatedContext('admin-1', { admin: true }).firestore();
    const user = testEnv.authenticatedContext('buyer-1').firestore();
    await assertSucceeds(getDoc(doc(admin, 'bookingAuditLogs/log-1')));
    await assertFails(getDoc(doc(user, 'bookingAuditLogs/log-1')));
    await assertFails(setDoc(doc(admin, 'bookingAuditLogs/log-2'), { bookingId: 'x' }));
  });
});
