import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SellerSummary } from '../../types/adminFinance';

export function SellerLine({ seller }: { seller: SellerSummary }) {
  const { t } = useTranslation();
  return (
    <p className="flex items-start gap-1.5 text-xs text-ink/70">
      <Store size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span className="min-w-0 break-words">
        {seller.sellerName ?? t('adminFinance.unknownSeller')}
        {seller.maskedDocument && <span className="font-mono"> · {seller.maskedDocument}</span>}
      </span>
    </p>
  );
}
