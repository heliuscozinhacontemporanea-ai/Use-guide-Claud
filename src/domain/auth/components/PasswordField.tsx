import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../../shared/utils/cn';

interface PasswordFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
}

export function PasswordField({
  id,
  label = 'Senha',
  placeholder = 'Sua senha',
  registration,
  error,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Lock size={16} className="text-white/50" />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          {...registration}
          maxLength={100}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full h-12 pl-12 pr-12 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-white/10 focus:border-teal-500/50'
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={
            showPassword ? `Ocultar ${label.toLowerCase()}` : `Exibir ${label.toLowerCase()}`
          }
          className="absolute inset-y-0 right-4 flex items-center text-white/50 hover:text-white transition-colors min-w-[44px] min-h-[44px] justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  );
}
