import type { LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { INPUT } from '../../../ui/styles/controls';

/** Campo das telas de acesso: rótulo para o leitor de tela, ícone, erro traduzido pela chave. */
export function AuthField({
  id,
  label,
  icon: Icon,
  registration,
  error,
  trailing,
  ...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
  id: string;
  label: string;
  icon?: LucideIcon;
  registration: UseFormRegisterReturn;
  /** Chave de tradução da mensagem do esquema (AGENTS.md §12.5). */
  error?: string;
  /** Botão dentro do campo, à direita (ex.: mostrar a senha). */
  trailing?: ReactNode;
}) {
  const { t } = useTranslation();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
          />
        )}
        <input
          id={id}
          maxLength={100}
          {...registration}
          {...input}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            INPUT,
            'min-h-12',
            Icon && 'pl-11',
            trailing && 'pr-12',
            error && 'border-danger'
          )}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} role="alert" className="px-1 mt-1 text-caption text-danger">
          {t(error)}
        </p>
      )}
    </div>
  );
}
