import { backfillPartnerDocumentKeys } from '../domain/partners/services/backfillPartnerDocumentKeys';

try {
  const result = await backfillPartnerDocumentKeys();

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('[backfillPartnerDocumentKeys]', error);

  process.exitCode = 1;
}
