import { X } from 'lucide-react';

export function AdminAccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
      id="denied-access-screen"
    >
      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
        <X size={40} />
      </div>
      <h2 className="text-2xl font-display font-extrabold mb-2">Acesso Restrito</h2>
      <p className="text-white/50 mb-8 max-w-xs text-sm">
        Você precisa estar autenticado com uma conta de administrador.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        Voltar para o Início
      </button>
    </div>
  );
}
