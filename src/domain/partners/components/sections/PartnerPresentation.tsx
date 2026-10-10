import React from 'react';
import { motion } from 'motion/react';
import { Handshake, Rocket, TrendingUp, Users, Target } from 'lucide-react';

interface PartnerPresentationProps {
  onStart: () => void;
}

export function PartnerPresentation({ onStart }: PartnerPresentationProps) {
  const benefits = [
    {
      icon: <TrendingUp className="text-emerald-400" />,
      title: 'Visibilidade Premium',
      description: 'Destaque seu negócio no radar dos turistas que visitam o litoral cearense.',
    },
    {
      icon: <Users className="text-blue-400" />,
      title: 'Público Qualificado',
      description:
        'Conecte-se diretamente com viajantes buscando experiências autênticas e de qualidade.',
    },
    {
      icon: <Target className="text-purple-400" />,
      title: 'Marketing Direcionado',
      description: 'Apareça nas categorias certas para quem já tem intenção de consumo.',
    },
    {
      icon: <Rocket className="text-orange-400" />,
      title: 'Crescimento de Vendas',
      description: 'Link direto para seu WhatsApp facilitando reservas e pedidos imediatos.',
    },
  ];

  return (
    <motion.div
      key="presentation"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
      id="partner-presentation-wrapper"
    >
      {/* Header / Hero */}
      <div
        className="relative h-64 w-full flex items-center justify-center overflow-hidden shrink-0"
        id="presentation-hero"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent" />
        <div className="relative z-10 text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto border border-white/20 shadow-xl">
            <Handshake size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-black text-white leading-tight uppercase tracking-tighter">
            Parceiros <span className="text-indigo-400">Use Guide</span>
          </h2>
          <p className="text-white/60 text-sm max-w-sm mx-auto font-medium">
            Transforme seu negócio na próxima parada obrigatória do litoral cearense.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8 space-y-10" id="presentation-content">
        {/* Top CTA Button directly after subtitle and before "Why be a partner" section */}
        <div className="flex justify-center -mt-2 pb-2">
          <button
            type="button"
            onClick={onStart}
            className="px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="start-onboard-top-btn"
          >
            <Rocket size={13} />
            <span>Iniciar Credenciamento</span>
          </button>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
            Por que ser um parceiro?
          </span>
          <p className="text-white/80 leading-relaxed font-sans text-xs max-w-md mx-auto">
            O Use Guide não é apenas um guia, é uma plataforma de conexão. Unimos os melhores
            empreendimentos e experiências do litoral cearense diretamente aos viajantes que
            valorizam a gastronomia local, o conforto, roteiros e eventos, criando momentos
            inesquecíveis.
          </p>
        </div>

        {/* Premium Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="premium-benefits-grid">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300 relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mt-4 mb-2">
                {benefit.title}
              </h3>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works - Interactive Timeline */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400">
              Jornada do Sucesso
            </span>
            <h3 className="text-lg font-display font-black text-white uppercase tracking-wider">
              Como funciona a Ativação
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                title: 'Preenchimento Rápido',
                description:
                  'Insira os dados do seu estabelecimento, descreva seus diferenciais, faça o upload de fotos e configure seus canais de contato.',
              },
              {
                title: 'Curadoria & Auditoria',
                description:
                  'Analisamos a autenticidade e a qualidade do perfil para garantir que esteja alinhado às expectativas dos viajantes.',
              },
              {
                title: 'Visibilidade Imediata',
                description:
                  'Com o perfil ativo, seu acesso ao Painel do Parceiro é liberado, e você aparece diretamente no radar de buscas e rotas do app.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex gap-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 items-start relative group text-left"
              >
                <div className="absolute left-9 top-14 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/10 to-transparent group-last:hidden" />
                <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-xs font-black shrink-0">
                  0{i + 1}
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="pt-6 pb-12 text-center space-y-4">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-6 rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            id="start-onboard-bottom-btn"
          >
            <Rocket
              size={18}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
            <span>Quero ser Parceiro</span>
          </button>
          <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-black">
            ✦ Cadastro 100% online & totalmente gratuito ✦
          </p>
        </div>
      </div>
    </motion.div>
  );
}
