import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Enquanto o cadastro sobe: um giro discreto em roxo, a cor da área de parceiro (§11.1). */
export function SignupProcessingState() {
  const { t } = useTranslation();
  return (
    <>
      <span className="w-16 h-16 rounded-2xl bg-partner-soft border border-partner-line text-partner flex items-center justify-center">
        <Loader2 size={28} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
      </span>
      <div className="space-y-2" role="status">
        <h3 className="text-[19px] font-semibold text-ink">
          {t('partnerSignup.processing.title')}
        </h3>
        <p className="text-[15px] text-ink/70 max-w-[300px]">
          {t('partnerSignup.processing.text')}
        </p>
      </div>
    </>
  );
}
