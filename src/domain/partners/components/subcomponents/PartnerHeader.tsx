import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { PartnerProfile } from '../../types/partner';
import { cn } from '../../../../shared/utils/cn';

interface PartnerHeaderProps {
  partnerProfile: PartnerProfile | null;
  onNavigateBack: () => void;
  notificationBell?: React.ReactNode;
}

/** O selo e o plano são de cada estabelecimento (D11): ficam nos cartões de cadastro, não aqui. */
export function PartnerHeader({
  partnerProfile,
  onNavigateBack,
  notificationBell,
}: PartnerHeaderProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
            aria-label="Voltar para página principal"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
              Painel do Parceiro
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-accent font-semibold tracking-wide">
                {partnerProfile?.businessName || 'Meu Negócio'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-[10px] font-semibold text-white/50 tracking-wide">
              Status da Conta
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  partnerProfile?.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                )}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold text-white">
                {partnerProfile?.status === 'suspended' ? 'Suspensa' : 'Ativa'}
              </span>
            </div>
          </div>
          {notificationBell}
        </div>
      </motion.div>
    </div>
  );
}
