import { getPrivateDocumentService } from '../factory';

export function deleteVerificationFileUseCase(path: string): Promise<void> {
  return getPrivateDocumentService().deleteVerificationFile(path);
}
