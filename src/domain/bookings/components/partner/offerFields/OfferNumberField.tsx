import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { INPUT } from '../../../../../ui/styles/controls';

/** Campo de número ou valor do editor de oferta, com o erro traduzido embaixo. */
export function OfferNumberField({
  label,
  field,
  error,
  decimal = false,
  type = 'number',
}: {
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  /** Valor em reais ("150,90"): teclado decimal, sem setas de número. */
  decimal?: boolean;
  type?: 'number' | 'time';
}) {
  const { t } = useTranslation();
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink/70">{label}</span>
      <input
        {...field}
        type={decimal ? 'text' : type}
        inputMode={decimal ? 'decimal' : type === 'number' ? 'numeric' : undefined}
        aria-invalid={Boolean(error)}
        className={INPUT}
      />
      {error && (
        <span role="alert" className="block text-xs text-danger">
          {t(error)}
        </span>
      )}
    </label>
  );
}
