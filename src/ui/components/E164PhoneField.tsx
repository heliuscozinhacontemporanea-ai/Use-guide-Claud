import { useState } from 'react';
import { formatNationalNumber, splitE164, toE164 } from '../../shared/utils/phone';
import { PhoneInputField } from './PhoneInputField';

interface E164PhoneFieldProps {
  id: string;
  /** Telefone em E.164 (ex: +5588999999999) ou vazio. */
  value: string | undefined;
  onChange: (e164: string | undefined) => void;
}

/** Campo de telefone com DDI que entrega o valor já em E.164 (AGENTS.md §12.4). */
export function E164PhoneField({ id, value, onChange }: E164PhoneFieldProps) {
  // O número salvo abre com a mesma máscara de quando a pessoa digita.
  const [{ ddi, nationalNumber }, setParts] = useState(() => {
    const parts = splitE164(value);
    return { ...parts, nationalNumber: formatNationalNumber(parts.ddi, parts.nationalNumber) };
  });

  const update = (next: { ddi: string; nationalNumber: string }) => {
    setParts(next);
    onChange(toE164(next.ddi, next.nationalNumber));
  };

  return (
    <PhoneInputField
      id={id}
      phone={nationalNumber}
      ddi={ddi}
      onPhoneChange={(phone) => update({ ddi, nationalNumber: phone })}
      onDdiChange={(nextDdi) => update({ ddi: nextDdi, nationalNumber })}
    />
  );
}
