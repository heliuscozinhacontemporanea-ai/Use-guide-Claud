import React from 'react';
import { motion } from 'motion/react';
import { Check, CreditCard, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { GlassCard } from '../../../../ui/components/GlassCard';

interface SuccessPaymentGlassProps {
  itemName: string;
  amount: number;
  paymentId: string;
  onClose: () => void;
}

export function SuccessPaymentGlass({
  itemName,
  amount,
  paymentId,
  onClose,
}: SuccessPaymentGlassProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="text-center relative flex flex-col justify-center items-center py-6 px-1 space-y-6"
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/20 rounded-full filter blur-3xl -z-10 pointer-events-none animate-pulse" />

      <div className="relative">
        <div className="relative w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
          <Check size={40} className="stroke-[3]" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 text-teal-300">
          <ShieldCheck size={11} />
          <span>Pagamento Confirmado</span>
        </span>

        <h4 className="text-2xl font-black text-white tracking-tight pt-1">
          Pagamento Bem-Sucedido!
        </h4>

        <p className="text-xs text-white/60 leading-relaxed px-4">
          Seu pagamento para <strong className="text-white font-semibold">{itemName}</strong> foi
          confirmado com segurança via Stripe.
        </p>
      </div>

      <GlassCard className="w-full p-5 space-y-4 bg-slate-900/35 border border-white/10 backdrop-blur-xl rounded-2xl text-left">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="text-xs text-white/50">Valor Pago</span>
          <span className="text-lg font-black text-teal-400">R$ {amount.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-white/50 block">Processamento</span>
            <span className="text-white/80 font-bold flex items-center gap-1.5">
              <CreditCard size={15} className="text-teal-300" />
              <span>Stripe (Cartão / Pix)</span>
            </span>
          </div>

          <div className="space-y-1 text-right">
            <span className="text-white/50 block">Data</span>
            <span className="text-white/80 font-bold flex items-center gap-1 justify-end">
              <Calendar size={13} className="text-teal-400/70" />
              <span>Hoje</span>
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-start gap-2.5 text-[11px] text-white/50 leading-normal border-t border-white/5">
          <Mail size={14} className="text-teal-400 shrink-0 mt-0.5" />
          <span>Seu plano já está ativo e atualizado em sua conta de parceiro.</span>
        </div>
      </GlassCard>

      <div className="font-mono text-[10px] text-white/50 tracking-widest uppercase">
        ID Transação: <span className="text-teal-400 px-1 font-bold">{paymentId}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black tracking-wider text-sm active:scale-[0.98] transition-all cursor-pointer shadow-[0_15px_30px_-5px_rgba(45,212,191,0.25)] flex justify-center items-center"
      >
        CONCLUIR
      </button>
    </motion.div>
  );
}
