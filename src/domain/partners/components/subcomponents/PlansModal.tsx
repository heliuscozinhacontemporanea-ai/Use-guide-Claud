import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Award, BarChart3, Shield, Sparkles, Loader2 } from 'lucide-react';
import { ModalLayout } from '../../../../ui/layouts/ModalLayout';
import { PartnerProfile, SubscriptionPlan } from '../../types/partner';
import { useUI } from '../../../../shared/stores/useUIStore';
import { activateTrialUseCase } from '../../application/usecases/activateTrialUseCase';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { useTranslation } from 'react-i18next';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  partnerProfile?: PartnerProfile;
  plans: SubscriptionPlan[];
  onSelectPaidPlan: (planId: string, planName: string, amountMinor: number) => void;
}

export function PlansModal({
  isOpen,
  onClose,
  userId,
  partnerProfile,
  plans,
  onSelectPaidPlan,
}: PlansModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan['id']>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUpgradeView, setShowUpgradeView] = useState(false);
  const { showToast } = useUI();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    if (isOpen) {
      setShowUpgradeView(false);
      setSuccessMessage(null);
      setSelectedPlan('monthly');
    }
  }, [isOpen]);

  const isTrialActive = React.useMemo(() => {
    if (
      !partnerProfile?.isVerified ||
      partnerProfile?.verificationType !== 'trial' ||
      !partnerProfile?.verifiedUntil
    ) {
      return false;
    }
    const expiresAt = new Date(partnerProfile.verifiedUntil);
    const now = new Date();
    return expiresAt > now;
  }, [partnerProfile]);

  const isTrialExpiredOrUsed = React.useMemo(() => {
    return !!(
      partnerProfile?.hasUsedTrial ||
      (partnerProfile?.verificationType === 'trial' && !isTrialActive)
    );
  }, [partnerProfile, isTrialActive]);

  const remainingDays = React.useMemo(() => {
    if (!partnerProfile?.verifiedUntil) return 0;
    const expiresAt = new Date(partnerProfile.verifiedUntil);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [partnerProfile]);

  const benefits = [
    {
      icon: <Award className="text-teal-400 shrink-0" size={18} />,
      title: 'Selo Azul de Verificação',
      text: 'Exibido em todo o site e app para atestar a legitimidade do seu estabelecimento.',
    },
    {
      icon: <BarChart3 className="text-teal-400 shrink-0" size={18} />,
      title: 'Relatórios Completos',
      text: 'Gráficos interativos e métricas em tempo real sobre cliques, acessos e visualizações.',
    },
    {
      icon: <Shield className="text-teal-400 shrink-0" size={18} />,
      title: 'Destaque nos Resultados',
      text: 'Seus itens e eventos sobem na prioridade dos algoritmos de busca dos turistas.',
    },
  ];

  const handleActivateTrial = async () => {
    setIsLoading(true);
    try {
      await activateTrialUseCase(userId);
      setSuccessMessage(
        'Seu período de testes de 7 dias grátis foi ativado com sucesso! Aproveite.'
      );
    } catch (err) {
      console.error('[PlansModal Error] Erro ao ativar plano trial:', err);
      showToast('Falha ao ativar o período de testes grátis. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedPlan === 'trial') {
      handleActivateTrial();
    } else {
      const activeOption = plans.find((p) => p.id === selectedPlan);
      if (activeOption) {
        onSelectPaidPlan(
          activeOption.id,
          `Selo de Empresa Verificada - ${activeOption.name}`,
          activeOption.priceMinor
        );
        onClose();
      }
    }
  };

  const formatPrice = (priceMinor: number) => {
    if (priceMinor === 0) return 'Grátis';
    return formatMoneyMinor(priceMinor, i18n.language);
  };

  const formatMonthlyEquivalent = (valueMinor: number | null | undefined) => {
    if (!valueMinor) return null;
    return `${formatMoneyMinor(valueMinor, i18n.language)}/mês`;
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName="bg-black/60 backdrop-blur-md"
      containerClassName="bg-[#030712]/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 w-full max-w-xl overflow-hidden relative"
      zIndex={Z_INDEX.modal}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>

      <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar pt-10">
        {successMessage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
              <Check size={32} className="stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-display font-black text-white">Trial Ativado!</h4>
              <p className="text-sm text-white/60 leading-relaxed px-4">{successMessage}</p>
            </div>
            <button
              onClick={() => {
                setSuccessMessage(null);
                onClose();
              }}
              className="w-full py-4 bg-emerald-400 text-slate-950 font-black tracking-wider text-xs rounded-2xl cursor-pointer hover:bg-emerald-300 transition-all active:scale-95"
            >
              COMEÇAR A USAR AGORA
            </button>
          </motion.div>
        ) : isTrialActive && !showUpgradeView ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-2xl">
              <Sparkles size={32} className="animate-pulse" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-teal-400 font-bold uppercase tracking-wide">
                seu plano trial expira em "{remainingDays}" dias
              </p>
              <h3 className="text-2xl font-display font-black text-white">
                Plano Trial está ativo
              </h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed pt-1">
                Aproveite o seu selo azul de verificação para todos os estabelecimentos cadastrados
                e o acesso completo aos relatórios de desempenho e cliques.
              </p>
            </div>
            <div className="pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan('monthly');
                  setShowUpgradeView(true);
                }}
                className="text-xs font-black tracking-widest text-teal-400 hover:text-teal-300 uppercase underline cursor-pointer hover:no-underline transition-all"
              >
                Quero mudar meu plano
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Sparkles size={10} />
                <span>Credenciamento Premium</span>
              </span>
              <h3 className="text-2xl font-display font-black text-white">Selo de Verificação</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Destaque sua empresa em Jericoacoara, acesse relatórios de tráfego analíticos e
                potencialize suas vendas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5"
                >
                  {b.icon}
                  <div>
                    <h5 className="text-xs font-bold text-white/90">{b.title}</h5>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <span className="block text-xs font-black uppercase tracking-wider text-white/50">
                Escolha o melhor plano:
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {plans.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-white/50 text-xs">Nenhum plano disponível no momento.</p>
                  </div>
                ) : (
                  plans.map((p) => {
                    const isTrial = p.id === 'trial';
                    const isTrialUnavailable = isTrial && (isTrialExpiredOrUsed || isTrialActive);

                    if (isTrial && isTrialUnavailable) {
                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] opacity-60 flex items-center justify-between text-left relative overflow-hidden select-none"
                        >
                          <div>
                            <span className="text-xs font-black uppercase tracking-wide text-white/50">
                              {p.name}
                            </span>
                            <span className="block text-[10px] text-white/50 mt-1">
                              plano trial já utilizado
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-black text-rose-300/80 uppercase tracking-widest px-2.5 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                              Indisponível
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const isSelected = selectedPlan === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500/40 shadow-[0_4px_25px_rgba(20,184,166,0.1)] cursor-pointer'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wide text-white group-hover:text-teal-300 transition-colors">
                              {p.name}
                            </span>
                            <span className="block text-[10px] text-white/50 mt-0.5">
                              {p.description}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-baseline gap-1 justify-end">
                              <span className="text-lg font-black text-teal-400">
                                {formatPrice(p.priceMinor)}
                              </span>
                              <span className="text-[10px] text-white/50 font-medium">
                                {p.period}
                              </span>
                            </div>
                            {p.monthlyEquivalentMinor && (
                              <span className="block text-[9px] text-teal-300/80 font-bold">
                                {formatMonthlyEquivalent(p.monthlyEquivalentMinor)}
                              </span>
                            )}
                          </div>
                        </div>

                        {p.savingLabel && (
                          <div className="absolute top-0 right-0">
                            <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-bl-xl border-l border-b border-amber-500/30">
                              {p.savingLabel}
                            </span>
                          </div>
                        )}

                        {p.badge && !p.savingLabel && (
                          <div className="absolute top-0 right-0">
                            <span className="bg-teal-500/20 text-teal-300 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-bl-xl border-l border-b border-teal-500/30">
                              {p.badge}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={isLoading || plans.length === 0}
              className="w-full h-12 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black tracking-wider text-xs rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4 shadow-xl shadow-teal-500/10"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>PROCESSANDO...</span>
                </>
              ) : selectedPlan === 'trial' ? (
                <span>ATIVAR 7 DIAS GRÁTIS</span>
              ) : (
                <span>PROSSEGUIR PARA O PAGAMENTO</span>
              )}
            </button>
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
