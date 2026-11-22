import type { UseFormRegisterReturn } from 'react-hook-form';
import { INPUT } from '../../../../ui/styles/controls';

interface OfferDurationInputProps {
  /** Nome lido pelo leitor de tela ("Horas", "Minutos"); a unidade curta fica visível no campo. */
  label: string;
  unit: string;
  field: UseFormRegisterReturn;
  invalid: boolean;
}

/** Uma parte da duração da oferta (horas ou minutos), com a unidade dentro do campo (F3, D34). */
export function OfferDurationInput({ label, unit, field, invalid }: OfferDurationInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        aria-label={label}
        aria-invalid={invalid}
        {...field}
        className={`${INPUT} pr-12`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/60"
      >
        {unit}
      </span>
    </div>
  );
}
