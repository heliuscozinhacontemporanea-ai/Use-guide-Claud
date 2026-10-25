import { Copyright, Palette, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../../shared/utils/cn';
import { useAuthContext } from '../../../auth/context/AuthContext';
import { UserRole } from '../../../auth/types/auth';
import { useNotificationSettings } from '../../../notifications';

export function AboutGeneralTab() {
  const { user } = useAuthContext();
  const isPartner = user?.role === UserRole.PARTNER;
  const { settings, updateSetting } = useNotificationSettings(isPartner ? user.uid : undefined);

  return (
    <motion.div
      key="general-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 text-left"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-1.5 text-orange-400 font-display font-black text-[10px] uppercase tracking-wider">
          <Sparkles size={11} />
          <span>A Essência do Guia</span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed font-sans font-medium">
          Guia de viagem de luxo sob medida e meticulosamente desenvolvido para desbravar os
          destinos paradisíacos de <strong>Jericoacoara</strong>, <strong>Preá</strong> e{' '}
          <strong>Barrinha de Baixo</strong>.
        </p>
        <p className="text-[10px] text-white/55 leading-relaxed font-sans">
          Equipado com a estética líquida <i>Glassmorphism</i> e transições inspiradas no design
          nativo Arredondados, o app oferece curadoria premium de hospedagens, cafés, picos
          ecológicos e condições de vento do momento.
        </p>
      </div>

      {isPartner && settings && (
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5 ml-1">
            <Palette size={10} className="text-teal-400" />
            Preferências de Notificação
          </h3>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white">Avaliações Recebidas</span>
                <span className="text-[8px] text-white/50">
                  Receber alertas de novas avaliações no seu item
                </span>
              </div>
              <button
                onClick={() => updateSetting('reviewNotifications', !settings.reviewNotifications)}
                aria-label="Alternar notificações de novas avaliações"
                className={cn(
                  'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center',
                  settings.reviewNotifications ? 'bg-teal-500' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                    settings.reviewNotifications ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white">Vencimento de Plano</span>
                <span className="text-[8px] text-white/50">
                  Receber alertas quando o plano estiver próximo do vencimento
                </span>
              </div>
              <button
                onClick={() =>
                  updateSetting('planExpiringNotifications', !settings.planExpiringNotifications)
                }
                aria-label="Alternar notificações de vencimento de plano"
                className={cn(
                  'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center',
                  settings.planExpiringNotifications ? 'bg-teal-500' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                    settings.planExpiringNotifications ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/50">
        <span className="flex items-center gap-1">
          <Copyright size={8} strokeWidth={2.5} />
          2026 Use Guide
        </span>
        <span>Use Group</span>
      </div>
    </motion.div>
  );
}
