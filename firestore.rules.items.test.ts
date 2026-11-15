import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

describe('Firestore Rules — anúncios em rascunho (D34)', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(new URL('./firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'items-rules-test',
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
      await db.doc('items/published').set({
        name: 'Peixada do Preá',
        ownerId: 'owner-1',
        publication: 'published',
        isActive: true,
      });
      await db.doc('items/draft').set({
        name: 'Pousada Brisa',
        ownerId: 'owner-1',
        publication: 'draft',
        isActive: true,
      });
    });
  });

  const visitor = () => testEnv.unauthenticatedContext().firestore();
  const owner = () => testEnv.authenticatedContext('owner-1').firestore();
  const other = () => testEnv.authenticatedContext('owner-2').firestore();
  const admin = () => testEnv.authenticatedContext('admin-1', { admin: true }).firestore();

  it('visitante lê o anúncio publicado e não lê o rascunho', async () => {
    await assertSucceeds(getDoc(doc(visitor(), 'items/published')));
    await assertFails(getDoc(doc(visitor(), 'items/draft')));
  });

  it('outra pessoa logada não lê o rascunho de alguém', async () => {
    await assertFails(getDoc(doc(other(), 'items/draft')));
  });

  it('o dono e o admin leem o rascunho', async () => {
    await assertSucceeds(getDoc(doc(owner(), 'items/draft')));
    await assertSucceeds(getDoc(doc(admin(), 'items/draft')));
  });

  it('a busca do guia precisa filtrar por publicação; a do dono, pelo dono', async () => {
    await assertSucceeds(
      getDocs(query(collection(visitor(), 'items'), where('publication', '==', 'published')))
    );
    await assertFails(getDocs(collection(visitor(), 'items')));
    await assertSucceeds(
      getDocs(query(collection(owner(), 'items'), where('ownerId', '==', 'owner-1')))
    );
  });
});
