import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react';
import { cn } from '../../shared/utils/cn';

interface CodeBoxesInputProps {
  /** Prefixo fixo da tela (ex.: `PASS`), só para leitura; não faz parte do valor. */
  prefix: string;
  length: number;
  /** Caracteres aceitos; o resto é recusado enquanto a pessoa digita. */
  alphabet: string;
  value: string;
  onChange: (value: string) => void;
  /** Chamado quando a última caixa é preenchida. */
  onComplete?: (value: string) => void;
  label: string;
  /** Rótulo de cada caixa para leitor de tela, ex.: "Caractere 1 de 6". */
  boxLabel: (index: number) => string;
  disabled?: boolean;
}

/** Código em caixas, como o de verificação de apps (D20): maiúsculas, avanço e colar inteiro. */
export function CodeBoxesInput({
  prefix,
  length,
  alphabet,
  value,
  onChange,
  onComplete,
  label,
  boxLabel,
  disabled,
}: CodeBoxesInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  const clean = (raw: string) =>
    raw
      .toUpperCase()
      .replace(new RegExp(`^${prefix}:`), '')
      .split('')
      .filter((char) => alphabet.includes(char))
      .join('');

  const update = (next: string, focusIndex: number) => {
    const trimmed = next.slice(0, length);
    onChange(trimmed);
    refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (trimmed.length === length) onComplete?.(trimmed);
  };

  const typeAt = (index: number, raw: string) => {
    const typed = clean(raw).slice(-1);
    if (!typed) return;
    const current = value.slice(0, index);
    update(`${current}${typed}${value.slice(index + 1)}`.trimEnd(), index + 1);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !chars[index]?.trim() && index > 0) {
      event.preventDefault();
      update(value.slice(0, index - 1), index - 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = clean(event.clipboardData.getData('text'));
    if (pasted) update(pasted, pasted.length);
  };

  return (
    <fieldset className="space-y-2 min-w-0 w-full" disabled={disabled}>
      <legend className="text-[13px] font-semibold text-ink/80">{label}</legend>
      <div className="flex items-center gap-1 sm:gap-2">
        <span
          className="font-display text-[15px] font-bold text-ink/70 shrink-0"
          aria-hidden="true"
        >
          {prefix}:
        </span>
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={char.trim()}
            onChange={(event) => typeAt(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
            maxLength={2}
            aria-label={boxLabel(index)}
            className={cn(
              // Caixas dividem a largura: 8 caixas cabem no celular de 360 px sem rolar para o lado.
              'flex-1 min-w-0 max-w-11 h-12 rounded-xl bg-surface border border-line text-center font-display text-lg font-bold text-ink uppercase',
              'focus-visible:ring-2 focus-visible:ring-teal-400/50 focus:border-accent-line outline-none'
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}
