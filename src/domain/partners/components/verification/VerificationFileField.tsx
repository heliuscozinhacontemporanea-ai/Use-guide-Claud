import { FileUp } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface VerificationFileFieldProps {
  label: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

export function VerificationFileField({
  label,
  file,
  error,
  onChange,
}: VerificationFileFieldProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-semibold text-white/80">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'press w-full min-h-[44px] flex items-center gap-2 px-4 rounded-2xl border bg-white/5 text-xs text-white/80 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50',
          error ? 'border-danger-line' : 'border-white/10'
        )}
      >
        <FileUp size={14} aria-hidden="true" />
        <span className="truncate">
          {file
            ? t('verification.form.fileSelected', { name: file.name })
            : t('verification.form.chooseFile')}
        </span>
        {file && (
          <span className="ml-auto text-accent shrink-0">{t('verification.form.replaceFile')}</span>
        )}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
