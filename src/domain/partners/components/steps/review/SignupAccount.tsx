import { Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import { SIGNUP_ERROR, SIGNUP_HINT, SIGNUP_INPUT, SIGNUP_LABEL } from '../../sections/signupStyles';

type AccountField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

/** Conta de quem se cadastra como parceiro sem estar logado (fim do cadastro). */
export function SignupAccount({
  values,
  onChange,
  errorOf,
}: {
  values: Partial<Record<AccountField, string>>;
  onChange: (field: AccountField, value: string) => void;
  errorOf: (field: AccountField) => string | undefined;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const password = values.password ?? '';
  const rules = [
    { key: 'length', met: password.length >= 8 && password.length <= 20 },
    { key: 'upper', met: /[A-Z]/.test(password) },
    { key: 'lower', met: /[a-z]/.test(password) },
    { key: 'number', met: /\d/.test(password) },
  ] as const;
  const field = (name: AccountField, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={`signup-${name}`} className={SIGNUP_LABEL}>
        {t(`partnerSignup.step5.${name}`)}
      </label>
      <div className="relative">
        <input
          id={`signup-${name}`}
          type={type}
          autoComplete={autoComplete}
          value={values[name] ?? ''}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={Boolean(errorOf(name))}
          className={cn(SIGNUP_INPUT, type !== 'email' && type !== 'text' && 'pr-12')}
        />
        {(name === 'password' || name === 'confirmPassword') && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={t(
              visible ? 'partnerSignup.step5.hidePassword' : 'partnerSignup.step5.showPassword'
            )}
            className="press absolute right-0 top-0 w-12 h-12 flex items-center justify-center text-ink/60 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none rounded-xl"
          >
            {visible ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {errorOf(name) && <p className={SIGNUP_ERROR}>{errorOf(name)}</p>}
    </div>
  );
  const passwordType = visible ? 'text' : 'password';
  return (
    <section aria-labelledby="signup-account-title" className="space-y-4">
      <h3 id="signup-account-title" className="px-1 text-[17px] font-semibold text-ink">
        {t('partnerSignup.step5.account')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {field('firstName', 'text', 'given-name')}
        {field('lastName', 'text', 'family-name')}
      </div>
      {field('email', 'email', 'email')}
      {field('password', passwordType, 'new-password')}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 px-1">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              'flex items-center gap-1.5 text-[13px]',
              rule.met ? 'text-success' : 'text-ink/60'
            )}
          >
            <Check size={14} aria-hidden="true" className={rule.met ? '' : 'opacity-40'} />
            {t(`partnerSignup.step5.rules.${rule.key}`)}
          </li>
        ))}
      </ul>
      {field('confirmPassword', passwordType, 'new-password')}
      {values.password && values.confirmPassword && values.password !== values.confirmPassword && (
        <p className={SIGNUP_ERROR}>{t('partnerSignup.step5.passwordMismatch')}</p>
      )}
      <p className={SIGNUP_HINT}>{t('partnerSignup.step5.passwordHint')}</p>
    </section>
  );
}
