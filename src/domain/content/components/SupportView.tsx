import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  MessageSquare,
  Mail,
  HelpCircle,
  ChevronDown,
  Search,
  Check,
  Copy,
  Layers,
  Wind,
  User,
  Award,
  Compass,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { FAQCategoryType } from '../types/content';
import { FAQ_DATA } from '../data/faqItems';
import { whatsAppUrl } from '../../../shared/utils/phone';

interface SupportViewProps {
  onBack: () => void;
  userEmail?: string | null | undefined;
}

export function SupportView({ onBack, userEmail }: SupportViewProps) {
  const [activeCategory, setActiveCategory] = useState<FAQCategoryType>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const supportEmail = 'atendimento@useguide.com.br';
  // Número real vem da configuração (AGENTS.md §11.10: nada de número fictício no código).
  const whatsappUrl = whatsAppUrl(
    import.meta.env.VITE_SUPPORT_WHATSAPP?.trim(),
    'Olá, preciso de suporte no Use Guide.'
  );

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-4 pt-2 pr-2">
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-sky-400 leading-tight">
            Suporte & FAQ
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Estamos aqui para ajudar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
              <MessageSquare size={16} />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
                WhatsApp
              </span>
              <span className="block text-[8px] text-emerald-300/60 truncate">
                Atendimento humano
              </span>
            </div>
          </a>
        )}

        <button
          onClick={handleCopyEmail}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 active:scale-95 transition-all text-left group relative"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
            {copiedEmail ? <Check size={16} className="text-teal-400" /> : <Mail size={16} />}
          </div>
          <div className="overflow-hidden">
            <span className="block text-[10px] font-black uppercase tracking-wider text-sky-400">
              {copiedEmail ? 'Copiado!' : 'E-mail'}
            </span>
            <span className="block text-[8px] text-sky-300/60 truncate">{supportEmail}</span>
          </div>
          {!copiedEmail && (
            <Copy
              size={10}
              className="absolute right-2 top-2 opacity-40 group-hover:opacity-100 transition-opacity"
            />
          )}
        </button>
      </div>

      <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dúvida..."
            className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-[11px] text-white placeholder:text-white/50 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-white/50" />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {[
            { id: 'all', label: 'Tudo', icon: Layers },
            { id: 'general', label: 'Geral', icon: Compass },
            { id: 'kitesurf', label: 'Vento', icon: Wind },
            { id: 'account', label: 'Conta', icon: User },
            { id: 'partner', label: 'Parceiro', icon: Award },
          ].map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as FAQCategoryType)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                )}
              >
                <CatIcon size={10} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const FaqIcon = faq.icon;
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'rounded-2xl border transition-all duration-300 overflow-hidden text-left',
                    isOpen
                      ? 'bg-white/10 border-sky-500/40 shadow-lg shadow-sky-500/5'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  )}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isOpen ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-white/50'
                        )}
                      >
                        <FaqIcon size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-white/90 leading-tight">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-white/50 shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180 text-sky-400'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 text-[10px] text-white/70 leading-relaxed font-sans">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <HelpCircle size={24} className="mx-auto text-white/50" />
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                Nenhuma dúvida encontrada
              </p>
            </div>
          )}
        </div>
      </div>

      {userEmail && (
        <div className="pt-2 text-[8px] text-center text-white/50 font-mono">
          Suporte identificado para: {userEmail}
        </div>
      )}
    </div>
  );
}
