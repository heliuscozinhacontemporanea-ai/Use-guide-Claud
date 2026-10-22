import { getPrivateDocumentService } from '../factory';
import type { StoredPrivateDocument } from '../services/privateDocumentService';

export function storeVerificationFileUseCase(params: {
  uid: string;
  fileBase64: string;
}): Promise<StoredPrivateDocument> {
  return getPrivateDocumentService().storeVerificationFile(params);
}
