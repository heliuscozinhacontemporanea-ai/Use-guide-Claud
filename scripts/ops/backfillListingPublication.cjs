// Uma vez só (D34, F1, aprovado em 2026-11-15): os anúncios que já existiam antes do rascunho ganham
// `publication: 'published'` e continuam no guia. Roda no deploy como tarefa do Cloud Run, com a
// imagem nova e a conta do servidor (ADC); sai do repositório no deploy seguinte.
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Limite de escritas por lote do Firestore é 500.
const BATCH = 400;

function log(severity, fields) {
  console.log(JSON.stringify({ severity, operation: 'backfillListingPublication', ...fields }));
}

async function main() {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  const snapshot = await db.collection('items').select('publication').get();
  const missing = snapshot.docs.filter((doc) => doc.get('publication') === undefined);
  for (let start = 0; start < missing.length; start += BATCH) {
    const batch = db.batch();
    for (const doc of missing.slice(start, start + BATCH)) {
      batch.update(doc.ref, { publication: 'published' });
    }
    await batch.commit();
  }
  log('INFO', { read: snapshot.size, updated: missing.length });
}

main().catch((error) => {
  log('ERROR', { name: error?.name ?? 'UnknownError', code: error?.code ?? null });
  process.exit(1);
});
