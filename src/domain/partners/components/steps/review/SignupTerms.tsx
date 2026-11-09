import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import { SIGNUP_ERROR } from '../../sections/signupStyles';

/** Aceite dos termos do parceiro no fim do cadastro. */
export function SignupTerms({
  accepted,
  onChange,
  error,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <button
        type="button"
        role="checkbox"
        aria-checked={accepted}
        onClick={() => onChange(!accepted)}
        className="press w-full min-h-14 flex items-start gap-3 rounded-2xl px-1 py-2 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center',
            accepted ? 'bg-partner-fill border-partner-fill text-on-fill' : 'border-ink/35'
          )}
        >
          {accepted && <Check size={14} strokeWidth={3} />}
        </span>
        <span>
          <span className="block text-[15px] font-semibold text-ink">
            {t('partnerSignup.step5.terms')}
          </span>
          <span className="block text-[13px] text-ink/70">
            {t('partnerSignup.step5.termsHint')}
          </span>
        </span>
      </button>
      {error && <p className={SIGNUP_ERROR}>{error}</p>}
    </div>
  );
}
