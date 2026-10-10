import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-6 text-center space-y-8"
      id="error-state-container"
    >
      <div
        className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20"
        id="error-alert-circle"
      >
        <AlertCircle size={40} />
      </div>
      <div className="space-y-2 text-center" id="error-message-box">
        <h3 className="text-xl font-black text-white uppercase">Ops! Algo deu errado</h3>
        <p className="text-red-400/60 text-xs max-w-[300px]">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-8 py-4 rounded-2xl bg-white/5 border border-red-500/20 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        id="error-retry-btn"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
