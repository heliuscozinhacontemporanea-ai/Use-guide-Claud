import { getPrivateDocumentService } from '../factory';

export function readVerificationFileUseCase(
  path: string
): Promise<{ data: Buffer; contentType: string } | null> {
  return getPrivateDocumentService().readVerificationFile(path);
}
