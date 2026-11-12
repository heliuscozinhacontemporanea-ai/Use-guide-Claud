import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useConnection } from '../../../../shared/hooks/useConnection';
import { hasEntryKeys, saveEntryKeys } from '../../adapters/webCryptoEntryPassVerifier';
import { getEntryVerificationKeysUseCase } from '../../application/usecases/getEntryVerificationKeysUseCase';

/** A portaria da atração neste aparelho: pronta para conferir o QR sem internet ou não (C5). */
export interface EntryOfflineKeysState {
  status: 'missing' | 'ready' | 'no_connection';
  online: boolean;
  busy: boolean;
  failed: boolean;
  download: () => void;
}

/**
 * A portaria de atração não baixa lista: guarda as chaves que conferem o QR (D20). Com internet,
 * elas são guardadas assim que o cartão aparece; sem internet, o cartão avisa que falta preparar.
 */
export function EntryOfflineKeys({
  offerId,
  children,
}: {
  offerId: string;
  children: (state: EntryOfflineKeysState) => ReactNode;
}) {
  const { isActuallyOnline: isOnline } = useConnection();
  const [ready, setReady] = useState(() => hasEntryKeys(offerId));
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = useCallback(async () => {
    setBusy(true);
    setFailed(false);
    try {
      saveEntryKeys(offerId, await getEntryVerificationKeysUseCase(offerId));
      setReady(hasEntryKeys(offerId));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }, [offerId]);

  useEffect(() => {
    if (isOnline && !hasEntryKeys(offerId)) void download();
  }, [isOnline, offerId, download]);

  return children({
    status: ready ? 'ready' : isOnline ? 'missing' : 'no_connection',
    online: isOnline,
    busy,
    failed,
    download: () => void download(),
  });
}
