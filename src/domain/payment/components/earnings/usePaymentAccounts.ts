import { useCallback, useEffect, useState } from 'react';
import { getPartnerTermsUseCase } from '../../application/usecases/getPartnerTermsUseCase';
import { listPaymentAccountsUseCase } from '../../application/usecases/listPaymentAccountsUseCase';
import type { PartnerPaymentAccount, PartnerTermsView } from '../../types/payment';
import { accountErrorKey } from '../accounts/paymentAccountStatus';

/** Contas de recebimento por CNPJ e o aceite dos termos do parceiro (D14, D15). */
export function usePaymentAccounts() {
  const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
  const [terms, setTerms] = useState<PartnerTermsView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, currentTerms] = await Promise.all([
        listPaymentAccountsUseCase(),
        getPartnerTermsUseCase(),
      ]);
      setAccounts(list);
      setTerms(currentTerms);
    } catch (err) {
      setError(accountErrorKey(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { accounts, terms, setTerms, error, loading, reload };
}
