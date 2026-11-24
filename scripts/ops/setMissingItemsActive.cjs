// Uma vez só (B76, autorizado pelo responsável em 2026-11-24): anúncios antigos sem `isActive`
// recebem `true`. O app mostrava esses anúncios (falta do campo = ativo), mas o servidor exige `true`
// e os deixava fora do sitemap.xml e do HTML com metadados. Roda no deploy como tarefa do Cloud Run,
// com a imagem nova e a conta do servidor (ADC), antes do site que passa a exigir o campo, e sai do
// repositório no deploy seguinte. Pode rodar de novo sem efeito. O log só tem contagens.
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Limite de escritas por lote do Firestore é 500.
const BATCH = 400;

function log(severity, fields) {
  console.log(JSON.stringify({ severity, operation: 'setMissingItemsActive', ...fields }));
}

async function main() {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  const items = await db.collection('items').select('isActive', 'publication').get();

  // Só o que não é booleano muda: `false` é anúncio pausado e continua pausado.
  const missing = items.docs.filter((doc) => typeof doc.get('isActive') !== 'boolean');
  for (let start = 0; start < missing.length; start += BATCH) {
    const batch = db.batch();
    for (const doc of missing.slice(start, start + BATCH)) batch.update(doc.ref, { isActive: true });
    await batch.commit();
  }

  log('INFO', {
    itemsRead: items.size,
    itemsUpdated: missing.length,
    publishedUpdated: missing.filter((doc) => doc.get('publication') === 'published').length,
    pausedKept: items.docs.filter((doc) => doc.get('isActive') === false).length,
  });
}

main().catch((error) => {
  log('ERROR', { name: error?.name ?? 'UnknownError', code: error?.code ?? null });
  process.exit(1);
});
