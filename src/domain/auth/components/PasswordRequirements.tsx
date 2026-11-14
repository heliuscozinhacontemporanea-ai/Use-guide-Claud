import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { checkPasswordRequirements } from '../utils/passwordRequirements';

/** O que a senha nova ainda precisa ter, marcado conforme a pessoa digita. */
export function PasswordRequirements({ password }: { password: string }) {
  const { t } = useTranslation();
  const checks = checkPasswordRequirements(password);
  const rules = [
    { key: 'length', ok: checks.hasMinLength },
    { key: 'upper', ok: checks.hasUppercase },
    { key: 'lower', ok: checks.hasLowercase },
    { key: 'number', ok: checks.hasNumber },
    { key: 'special', ok: checks.hasSpecial },
  ] as const;
  return (
    <div className="p-4 rounded-card bg-surface border border-line">
      <p className="mb-2 text-meta font-semibold text-ink">{t('auth.reset.requirements')}</p>
      <ul className="flex flex-col gap-1.5">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              'flex items-center gap-1.5 text-meta',
              rule.ok ? 'text-success' : 'text-ink-muted'
            )}
          >
            {rule.ok ? (
              <Check size={16} className="shrink-0" aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="w-4 flex justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </span>
            )}
            {t(`auth.requirements.${rule.key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
