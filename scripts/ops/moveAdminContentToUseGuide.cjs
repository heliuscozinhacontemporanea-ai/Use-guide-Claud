// Uma vez só (escolhas da F4 e resposta 7a da D35, aprovadas em 2026-11-23): anúncios, dicas e
// eventos cujo dono é a conta pessoal de um admin passam para o dono reservado `useguide`. Roda no
// deploy como tarefa do Cloud Run, com a imagem nova e a conta do servidor (ADC), e sai do
// repositório no deploy seguinte. Pode rodar de novo sem efeito. O log só tem contagens (sem uid).
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const USE_GUIDE_OWNER_ID = 'useguide';
// Limite de escritas por lote do Firestore é 500.
const BATCH = 400;

function log(severity, fields) {
  console.log(JSON.stringify({ severity, operation: 'moveAdminContentToUseGuide', ...fields }));
}

async function adminOwners(auth, ownerIds) {
  const admins = new Set();
  for (const uid of ownerIds) {
    if (!uid || uid === USE_GUIDE_OWNER_ID) continue;
    const user = await auth.getUser(uid).catch((error) => {
      if (error?.code === 'auth/user-not-found') return null;
      throw error;
    });
    if (user?.customClaims?.admin === true) admins.add(uid);
  }
  return admins;
}

async function commitInBatches(db, updates) {
  for (let start = 0; start < updates.length; start += BATCH) {
    const batch = db.batch();
    for (const { ref, data } of updates.slice(start, start + BATCH)) batch.update(ref, data);
    await batch.commit();
  }
}

/** O mesmo dono vai para `partnerId` e `organizerId` quando eles apontavam para o admin. */
function ownerFields(doc, extra) {
  const data = { ownerId: USE_GUIDE_OWNER_ID };
  for (const field of extra) {
    const value = doc.get(field);
    if (value === undefined || value === doc.get('ownerId')) data[field] = USE_GUIDE_OWNER_ID;
  }
  return data;
}

async function main() {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  const items = await db.collection('items').select('ownerId', 'partnerId').get();
  const events = await db.collection('events').select('ownerId', 'partnerId', 'organizerId').get();
  const owners = new Set([...items.docs, ...events.docs].map((doc) => doc.get('ownerId')));
  const admins = await adminOwners(getAuth(app), owners);

  const movedItems = items.docs.filter((doc) => admins.has(doc.get('ownerId')));
  const movedEvents = events.docs.filter((doc) => admins.has(doc.get('ownerId')));
  await commitInBatches(
    db,
    movedItems.map((doc) => ({ ref: doc.ref, data: ownerFields(doc, ['partnerId']) }))
  );
  await commitInBatches(
    db,
    movedEvents.map((doc) => ({
      ref: doc.ref,
      data: ownerFields(doc, ['partnerId', 'organizerId']),
    }))
  );

  // O plano do estabelecimento guarda o dono: passa junto. Selo dado pelo admin a anúncio do Use
  // Guide só é contado, para o responsável decidir (a regra nova impede conceder de novo).
  const plans = await Promise.all(
    movedItems.map((doc) => db.collection('listingPlans').doc(doc.id).get())
  );
  const ownedPlans = plans.filter((plan) => plan.exists);
  await commitInBatches(
    db,
    ownedPlans.map((plan) => ({ ref: plan.ref, data: { ownerId: USE_GUIDE_OWNER_ID } }))
  );
  const adminSeals = ownedPlans.filter((plan) => plan.get('planType') === 'admin').length;

  log('INFO', {
    admins: admins.size,
    itemsRead: items.size,
    itemsMoved: movedItems.length,
    eventsRead: events.size,
    eventsMoved: movedEvents.length,
    plansMoved: ownedPlans.length,
    adminSealsOnUseGuide: adminSeals,
  });
}

main().catch((error) => {
  log('ERROR', { name: error?.name ?? 'UnknownError', code: error?.code ?? null });
  process.exit(1);
});
