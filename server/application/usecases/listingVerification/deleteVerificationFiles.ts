import { deleteVerificationFileUseCase } from '../../../domain/media';

/** Falha em um arquivo não interrompe a exclusão; fica no log para limpeza manual. */
export async function deleteVerificationFiles(paths: string[]): Promise<void> {
  const results = await Promise.allSettled(
    paths.map((path) => deleteVerificationFileUseCase(path))
  );
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) {
    console.error('[deleteVerificationFiles] arquivos não apagados', { failed });
  }
}
