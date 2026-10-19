import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
import { PartnerProfile } from '../../types/partner';
import { cn } from '../../../../shared/utils/cn';

interface PartnerHeaderProps {
  partnerProfile: PartnerProfile | null;
  onNavigateBack: () => void;
  isVerified: boolean;
  onVerifyClick?: () => void;
  onOpenPlansModal?: () => void;
  notificationBell?: React.ReactNode;
  renderNotificationBell?: (partnerId: string) => React.ReactNode;
}

const PLAN_SUBTITLE: Record<string, string> = {
  trial: 'Teste grátis',
  monthly: 'Assinante plano “Mensal”',
  'semi-annual': 'Assinante plano “Semestral”',
  annual: 'Assinante plano “Anual”',
  admin: 'Selo concedido pela equipe Use Guide',
};

const getPlanSubtitle = (type: string | null | undefined): string =>
  (type && PLAN_SUBTITLE[type]) || 'Selo de empresa verificada';

export function PartnerHeader({
  partnerProfile,
  onNavigateBack,
  isVerified,
  onVerifyClick,
  onOpenPlansModal,
  notificationBell,
  renderNotificationBell,
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
              <p className="text-[10px] text-teal-400 font-semibold tracking-wide">
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
                  partnerProfile?.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold text-white">
                {partnerProfile?.status === 'pending' ? 'Em análise' : 'Ativo'}
              </span>
            </div>
          </div>
          {renderNotificationBell && partnerProfile ? renderNotificationBell(partnerProfile.id) : notificationBell}
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        onClick={onOpenPlansModal || onVerifyClick}
        className="py-4 px-6 rounded-3xl border border-white/10 bg-white/5 glassmorphism-vibrant flex items-center justify-between gap-6 w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {isVerified ? (
            <>
              <VerifiedBadge size="lg" className="text-[41px]" />
              <div className="flex flex-col">
                <span className="text-base font-display font-black text-white">
                  Sua empresa é verificada
                </span>
                <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1">
                  {getPlanSubtitle(partnerProfile?.verificationType)}
                </p>
              </div>
            </>
          ) : (
            <>
              <BadgeCheck size={41} className="text-white/50" />
              <div className="flex flex-col">
                <span className="text-base font-display font-black text-white/80">
                  Mostrar que sua empresa é verificada
                </span>
                <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest mt-1">
                  Não assinante
                </p>
              </div>
            </>
          )}
        </div>
        <ChevronRight size={20} className="text-white/50 shrink-0" />
      </motion.button>
    </div>
  );
}
