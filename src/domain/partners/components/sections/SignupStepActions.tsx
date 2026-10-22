import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

interface SignupStepActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  /** Última etapa: o botão envia a inscrição em vez de avançar. */
  isFinal?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function SignupStepActions({
  onBack,
  onNext,
  nextDisabled,
  isFinal = false,
  isSubmitting = false,
  className = 'pb-10',
}: SignupStepActionsProps) {
  return (
    <div className={cn('flex items-center gap-4 pt-4', className)}>
      <button
        type="button"
        onClick={onBack}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Voltar
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className={cn(
          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl focus-visible:ring-2 focus-visible:ring-teal-400/50',
          nextDisabled
            ? 'bg-white/5 text-white/50 cursor-not-allowed'
            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
        )}
      >
        {isFinal ? 'Finalizar Cadastro' : 'Avançar'}
        {!isFinal && <ChevronRight size={14} aria-hidden="true" />}
        {isFinal &&
          (isSubmitting ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} aria-hidden="true" />
          ))}
      </button>
    </div>
  );
}
