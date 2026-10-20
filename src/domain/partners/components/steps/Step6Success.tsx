
import { motion } from 'motion/react';
import { CheckCircle2, Rocket, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step6SuccessProps {
  businessName: string;
  onClose: () => void;
  onAccessPanel: () => void;
}

export function Step6Success({ businessName, onClose, onAccessPanel }: Step6SuccessProps) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center py-6 text-center space-y-8"
      id="success-step-container"
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <CheckCircle2 size={48} />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold"
        >
          🚀
        </motion.div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            Cadastro Concluído!
          </h3>
          <p className="text-white/50 text-sm max-w-[280px] mx-auto leading-relaxed">
            Parabéns! Sua empresa <span className="text-white font-bold">{businessName}</span> foi
            registrada com sucesso e já está{' '}
            <span className="text-emerald-400 font-bold uppercase">Ativa</span> no Use Guide.
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
          <p className="text-[10px] font-black uppercase text-indigo-400">Próximos Passos</p>
          <ul className="space-y-1.5">
            {[
              'Acesse seu Painel do Parceiro agora',
              'Complete seu perfil com fotos',
              'Gerencie seus itens e eventos',
            ].map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-[10px] text-white/60 font-bold">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                {tip}
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 pt-2 text-xs text-white/80">
            <ShieldCheck size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
            {t('verification.signup.nextStep')}
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onAccessPanel}
            className="w-full py-5 rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="success-access-panel-btn"
          >
            <Rocket size={16} />
            Acessar Painel do Parceiro
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            id="success-back-home-btn"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
}
