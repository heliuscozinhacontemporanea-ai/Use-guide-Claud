import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

interface Step6SuccessProps {
  businessName: string;
  onClose: () => void;
  onAccessPanel: () => void;
}

/** Fim do cadastro (V2): leva ao painel, onde o "Resolva agora" mostra os primeiros passos. */
export function Step6Success({ businessName, onClose, onAccessPanel }: Step6SuccessProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center py-4" id="success-step-container">
      <span className="w-16 h-16 rounded-[20px] bg-success-soft border border-success-line text-success flex items-center justify-center">
        <CheckCircle2 size={32} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[24px] leading-tight font-display font-bold text-ink">
        {t('partnerSignup.success.title')}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
        {t('partnerSignup.success.text', { name: businessName })}
      </p>
      <button
        type="button"
        onClick={onAccessPanel}
        className="press mt-6 w-full min-h-[52px] rounded-2xl bg-partner-fill text-on-fill text-[16px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        {t('partnerSignup.success.openPanel')}
      </button>
      <button
        type="button"
        onClick={onClose}
        className={`${BUTTON_SECONDARY} mt-3 w-full min-h-[52px]`}
      >
        {t('partnerSignup.success.later')}
      </button>
    </div>
  );
}
