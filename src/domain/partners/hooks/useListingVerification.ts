import { useCallback, useEffect, useState } from 'react';
import { uploadVerificationFileUseCase } from '../../media';
import { getListingVerificationUseCase } from '../application/usecases/getListingVerificationUseCase';
import { submitListingVerificationUseCase } from '../application/usecases/submitListingVerificationUseCase';
import type { DocumentVerificationFormValues } from '../schemas/listingVerificationFormSchema';
import type { ListingVerificationView, VerificationFileKind } from '../types/listingVerification';
import { getVerificationErrorMessage } from '../utils/verificationErrorMessage';

const FILE_KINDS: VerificationFileKind[] = ['identity', 'cnpjCard', 'authorization'];

/** Só os arquivos que a escolha atual exige saem do navegador (minimização, AGENTS.md §7.5). */
function filesToSend(values: DocumentVerificationFormValues): Array<[VerificationFileKind, File]> {
  return FILE_KINDS.flatMap((kind): Array<[VerificationFileKind, File]> => {
    const file = values[kind];
    if (!file) return [];
    if (kind === 'cnpjCard' && values.documentType !== 'cnpj') return [];
    if (kind === 'authorization' && values.holderRole !== 'representative') return [];
    return [[kind, file]];
  });
}

export function useListingVerification(itemId: string) {
  const [data, setData] = useState<ListingVerificationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getListingVerificationUseCase(itemId));
    } catch (err: unknown) {
      setError(getVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = useCallback(async (send: () => Promise<ListingVerificationView>) => {
    setSubmitting(true);
    try {
      const view = await send();
      setData(view);
      return view;
    } catch (err: unknown) {
      throw new Error(getVerificationErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitDocument = useCallback(
    (values: DocumentVerificationFormValues) =>
      run(async () => {
        const files: Partial<Record<VerificationFileKind, string>> = {};
        for (const [kind, file] of filesToSend(values)) {
          files[kind] = (await uploadVerificationFileUseCase(file)).fileId;
        }
        return submitListingVerificationUseCase(itemId, {
          mode: 'document',
          documentType: values.documentType,
          document: values.document,
          holderRole: values.holderRole || undefined,
          files,
          cadastur: values.cadastur || null,
        });
      }),
    [itemId, run]
  );

  const submitLinked = useCallback(
    (sourceItemId: string) =>
      run(() => submitListingVerificationUseCase(itemId, { mode: 'linked', sourceItemId })),
    [itemId, run]
  );

  return { data, loading, error, submitting, reload, submitDocument, submitLinked };
}
