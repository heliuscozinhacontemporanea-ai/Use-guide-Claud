import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

interface SignupStepActionsProps {
  onBack: () => void;
  onNext: () => void;
  /** Última etapa: o botão envia a inscrição em vez de avançar. */
  isFinal?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Voltar e Continuar (ou Enviar) do cadastro; o avanço é a ação principal, no roxo do parceiro.
 * O Continuar fica sempre ativo: com campo faltando, o passo mostra os erros (decisão de 2026-11-09).
 */
export function SignupStepActions({
  onBack,
  onNext,
  isFinal = false,
  isSubmitting = false,
  className = 'pb-2',
}: SignupStepActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex items-center gap-3 pt-5', className)}>
      <button
        type="button"
        onClick={onBack}
        className={cn(BUTTON_SECONDARY, 'flex-1 min-h-[52px] text-[15px]')}
      >
        {t('partnerSignup.form.back')}
      </button>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onNext}
        className="press flex-[2] min-h-[52px] rounded-2xl bg-partner-fill text-on-fill text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        {isSubmitting && (
          <Loader2
            size={16}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {isFinal
          ? t(isSubmitting ? 'partnerSignup.form.sending' : 'partnerSignup.form.submit')
          : t('partnerSignup.form.next')}
      </button>
    </div>
  );
}
