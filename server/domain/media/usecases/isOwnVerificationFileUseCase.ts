import { getPrivateDocumentService } from '../factory';

export function isOwnVerificationFileUseCase(uid: string, path: string): boolean {
  return getPrivateDocumentService().isOwnVerificationFile(uid, path);
}
