import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listPaymentAccountsUseCase } from '../../domain/payment';

/** Em qual documento o evento recebe (p18); a troca fica no estabelecimento ou em Ganhos › Contas. */
export function EventPaymentAccountCard({
  establishmentId,
  establishmentName,
}: {
  establishmentId: string;
  establishmentName: string;
}) {
  const { t } = useTranslation();
  const [masked, setMasked] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listPaymentAccountsUseCase()
      .then((accounts) => {
        const account = accounts.find((entry) => entry.itemIds.includes(establishmentId));
        if (active) setMasked(account?.maskedDocument ?? null);
      })
      // Sem a conta, o cartão só não aparece: a edição do evento continua.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [establishmentId]);

  if (!masked) return null;
  return (
    <section className="rounded-[20px] bg-surface border border-line p-4 space-y-1">
      <p className="text-[13px] text-ink/70">{t('partnerCatalog.editor.accountTitle')}</p>
      <p className="text-[15px] font-semibold text-ink break-words">
        {establishmentName} · {masked}
      </p>
      <p className="text-[13px] text-ink/70">{t('partnerCatalog.editor.accountHint')}</p>
    </section>
  );
}
