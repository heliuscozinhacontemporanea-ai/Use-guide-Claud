import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AuthField } from './AuthField';

/** Campo de senha com o botão de mostrar; `kind` escolhe rótulo, exemplo e o nome do botão. */
export function PasswordField({
  id,
  kind = 'current',
  registration,
  error,
  autoComplete,
}: {
  id: string;
  kind?: 'current' | 'new' | 'confirm';
  registration: UseFormRegisterReturn;
  /** Chave de tradução da mensagem do esquema. */
  error?: string;
  autoComplete?: string;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <AuthField
      id={id}
      type={visible ? 'text' : 'password'}
      label={t(`auth.field.${kind}.label`)}
      placeholder={t(`auth.field.${kind}.placeholder`)}
      icon={Lock}
      registration={registration}
      error={error}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={t(visible ? `auth.field.${kind}.hide` : `auth.field.${kind}.show`)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-control text-ink-muted focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      }
    />
  );
}
