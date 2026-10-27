import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { cn } from '../../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../../styles/controls';
import { Dialog } from '../Dialog';

export interface ReceiptLine {
  label: string;
  value: string;
  /** `total` abre a parte de baixo do recibo; `strong` só destaca (ex.: valor final). */
  emphasis?: 'total' | 'strong' | 'credit';
}

interface PurchaseReceiptSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  code: string;
  purchasedAt: string;
  /** Local e data do serviço, já traduzidos. */
  serviceLine: string;
  lines: ReceiptLine[];
  policy?: string;
  primaryAction?: { label: string; onClick: () => void };
  /** Cancelar, relatar ou o aviso de prazo encerrado; montado pelo domínio. */
  footer?: ReactNode;
}

/**
 * Detalhe de uma compra (D17): o nome em cima, o código e a data da compra logo abaixo, o recibo e
 * a política. O valor de um eventual reembolso só aparece na confirmação do cancelamento.
 */
export function PurchaseReceiptSheet({
  open,
  onClose,
  title,
  code,
  purchasedAt,
  serviceLine,
  lines,
  policy,
  primaryAction,
  footer,
}: PurchaseReceiptSheetProps) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
    >
      <div className="space-y-4">
        <div className="-mt-1">
          <p className="text-[13px] text-ink/50 [:root.light_&]:text-ink/65">
            {t('purchases.receipt.boughtAt', {
              code,
              date: formatBusinessDateTime(purchasedAt, i18n.language),
            })}
          </p>
          <p className="text-sm text-ink/70 mt-1">{serviceLine}</p>
        </div>
        {lines.length > 0 && (
          <dl className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
            {lines.map((line, index) => (
              <div
                key={`${line.label}-${index}`}
                className={cn(
                  'flex justify-between gap-3 text-sm',
                  line.emphasis === 'total' && 'border-t border-line pt-2'
                )}
              >
                <dt className="text-ink/70">{line.label}</dt>
                <dd
                  className={cn(
                    'tabular-nums',
                    (line.emphasis === 'total' || line.emphasis === 'strong') &&
                      'font-semibold text-ink',
                    line.emphasis === 'credit' && 'text-success',
                    !line.emphasis && 'text-ink'
                  )}
                >
                  {line.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {policy && <p className="text-[12px] text-ink/70">{policy}</p>}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className={cn(BUTTON_PRIMARY, 'w-full min-h-12')}
          >
            {primaryAction.label}
          </button>
        )}
        {footer && <div className="pt-1">{footer}</div>}
      </div>
    </Dialog>
  );
}
