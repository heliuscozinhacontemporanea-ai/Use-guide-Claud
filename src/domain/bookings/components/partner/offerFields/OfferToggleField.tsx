import { type ReactNode, useId } from 'react';
import { type Control, Controller, type FieldPath } from 'react-hook-form';
import { Switch } from '../../../../../ui/components/Switch';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';

/** Opção que o parceiro liga ou não na oferta (ex.: horário personalizado); ligada, mostra os campos. */
export function OfferToggleField({
  control,
  name,
  title,
  hint,
  children,
}: {
  control: Control<OfferFormInput>;
  name: FieldPath<OfferFormInput>;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const hintId = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p id={titleId} className="text-sm font-semibold text-ink">
                {title}
              </p>
              <p id={hintId} className="text-xs text-ink/70">
                {hint}
              </p>
            </div>
            <Switch
              checked={Boolean(field.value)}
              onChange={field.onChange}
              labelledBy={titleId}
              describedBy={hintId}
            />
          </div>
          {field.value ? children : null}
        </div>
      )}
    />
  );
}
