import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../shared/utils/cn';

export type TextButtonTone = 'ink' | 'accent' | 'warn' | 'danger';

const TONE: Record<TextButtonTone, string> = {
  ink: 'text-ink',
  accent: 'text-accent',
  warn: 'text-warn',
  danger: 'text-danger',
};

/** Ação secundária em texto (D17): a ação principal da tela continua como botão cheio. */
export function TextButton({
  tone = 'ink',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: TextButtonTone }) {
  return (
    <button
      type={type}
      className={cn(
        'press min-h-11 px-2 -mx-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        TONE[tone],
        className
      )}
      {...props}
    />
  );
}
