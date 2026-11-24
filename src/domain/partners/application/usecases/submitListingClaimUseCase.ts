import { uploadVerificationFileUseCase } from '../../../media';
import { listingClaimAdapter } from '../../factory';
import type { DocumentVerificationFormValues } from '../../schemas/listingVerificationFormSchema';
import type { VerificationFileKind } from '../../types/listingVerification';

const FILE_KINDS: VerificationFileKind[] = ['cnpjCard', 'identity', 'authorization'];

/**
 * "Assumir anúncio" (D35): os arquivos sobem como na verificação (D12) e o pedido vai com os caminhos.
 * O número do documento vai só pela API e o servidor guarda cifrado.
 */
export async function submitListingClaimUseCase(
  itemId: string,
  values: DocumentVerificationFormValues,
  termsAccepted: boolean
): Promise<void> {
  const files: Partial<Record<VerificationFileKind, string>> = {};
  for (const kind of FILE_KINDS) {
    const file = values[kind];
    if (!file) continue;
    if (kind === 'cnpjCard' && values.documentType !== 'cnpj') continue;
    if (kind === 'authorization' && values.holderRole !== 'representative') continue;
    files[kind] = (await uploadVerificationFileUseCase(file)).fileId;
  }
  await listingClaimAdapter.submit(itemId, {
    documentType: values.documentType,
    document: values.document,
    holderRole: values.holderRole as 'owner' | 'representative',
    files,
    cadastur: values.cadastur.trim() || null,
    ...(termsAccepted ? { termsAccepted: true as const } : {}),
  });
}
