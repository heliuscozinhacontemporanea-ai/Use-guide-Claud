import type { ReactNode } from 'react';
import { cn } from '../../shared/utils/cn';

export type StatusTone = 'success' | 'warn' | 'info' | 'danger' | 'muted';

const TEXT: Record<StatusTone, string> = {
  success: 'text-success',
  warn: 'text-warn',
  info: 'text-info',
  danger: 'text-danger',
  muted: 'text-ink/70',
};

const DOT: Record<StatusTone, string> = {
  success: 'bg-success',
  warn: 'bg-warn',
  info: 'bg-info',
  danger: 'bg-danger',
  muted: 'bg-ink/40',
};

/** Status como texto com ponto colorido, sem caixa (D17). */
export function StatusText({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 text-[13px] font-semibold',
        TEXT[tone],
        className
      )}
    >
      <span
        className={cn('inline-block w-1.5 h-1.5 shrink-0 rounded-full -translate-y-px', DOT[tone])}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}
