import { verificationFileAdapter } from '../../factory';

export async function uploadVerificationFileUseCase(file: File): Promise<{ fileId: string }> {
  return verificationFileAdapter.uploadVerificationFile(file);
}
