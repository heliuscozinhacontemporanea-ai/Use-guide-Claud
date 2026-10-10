import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Palette,
  Shield,
  Scale,
  Terminal,
  BookOpen,
  Copyright,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { useAuthContext } from '../../auth/context/AuthContext';
import { UserRole } from '../../auth/types/auth';
import { useNotificationSettings } from '../../notifications';
import { LICENSES } from '../data/licenses';
import { useAppVersion } from '../hooks/useAppVersion';

interface AboutViewProps {
  onBack: () => void;
}

type TabType = 'general' | 'licenses' | 'terms';

export function AboutView({ onBack }: AboutViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const { appVersion } = useAppVersion();

  const { user } = useAuthContext();
  const isPartner = user?.role === UserRole.PARTNER;
  const { settings, updateSetting } = useNotificationSettings(isPartner ? user.uid : undefined);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-6 pt-2 pr-2">
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-orange-400 leading-tight">
            Sobre o App
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Use Guide v{appVersion?.version || '1.0.0'}{' '}
            {appVersion?.revision ? `(${appVersion.revision})` : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/5 mb-4">
        {[
          { id: 'general', label: 'Geral', icon: Palette },
          { id: 'licenses', label: 'Licenças', icon: Terminal },
          { id: 'terms', label: 'Termos', icon: Shield },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-300',
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              <TabIcon size={10} className={cn(isActive ? 'text-orange-400' : 'opacity-60')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
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
                  Equipado com a estética líquida <i>Glassmorphism</i> e transições inspiradas no
                  design nativo Arredondados, o app oferece curadoria premium de hospedagens, cafés,
                  picos ecológicos e condições de vento do momento.
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
                        <span className="text-[10px] font-bold text-white">
                          Avaliações Recebidas
                        </span>
                        <span className="text-[8px] text-white/50">
                          Receber alertas de novas avaliações no seu item
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting('reviewNotifications', !settings.reviewNotifications)
                        }
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
                        <span className="text-[10px] font-bold text-white">
                          Vencimento de Plano
                        </span>
                        <span className="text-[8px] text-white/50">
                          Receber alertas quando o plano estiver próximo do vencimento
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting(
                            'planExpiringNotifications',
                            !settings.planExpiringNotifications
                          )
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
          )}

          {activeTab === 'licenses' && (
            <motion.div
              key="licenses-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-2 text-left"
            >
              {LICENSES.map((pkg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white">{pkg.name}</span>
                    <span className="text-[7px] font-mono font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded-full">
                      {pkg.license}
                    </span>
                  </div>
                  <p className="text-[8px] font-mono text-white/50">{pkg.copyright}</p>
                  <p className="text-[9px] text-white/60 leading-snug font-sans">
                    {pkg.description}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'terms' && (
            <motion.div
              key="terms-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 text-left"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col transition-all duration-300">
                  <h4 className="text-[10px] font-display font-black text-white/90 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5 mb-1.5">
                    <Scale size={11} className="text-orange-400" />
                    Termos de Uso
                  </h4>
                  <div
                    className={cn(
                      'overflow-y-auto pr-1 text-[9px] text-white/65 leading-relaxed font-sans transition-all duration-300 no-scrollbar',
                      termsExpanded ? 'max-h-[350px]' : 'max-h-20'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="font-bold text-white/80">1 - Aceitação dos termos</p>
                        <p>
                          Ao utilizar o Use Guide, você concorda com estes Termos de Uso e com nossa
                          Política de Privacidade. Caso não concorde, recomendamos que não utilize o
                          aplicativo.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">2 - Objetivo do aplicativo</p>
                        <p>
                          O Use Guide foi desenvolvido para auxiliar usuários na exploração de
                          destinos e experiências de viagem, oferecendo informações, mapas e
                          recomendações personalizadas.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">3 - Cadastro e conta</p>
                        <ul className="list-disc pl-3 space-y-0.5">
                          <li>O usuário deve fornecer informações verdadeiras e atualizadas.</li>
                          <li>
                            Você é responsável por manter a confidencialidade de suas credenciais de
                            acesso.
                          </li>
                          <li>O uso da conta é pessoal e intransferível.</li>
                        </ul>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">4 - Uso permitido</p>
                        <p>
                          É permitido utilizar o aplicativo apenas para fins pessoais e legítimos.
                        </p>
                        <p>É proibido:</p>
                        <ul className="list-disc pl-3 space-y-0.5">
                          <li>
                            Usar o aplicativo para atividades ilegais ou que violem direitos de
                            terceiros
                          </li>
                          <li>Copiar, modificar ou distribuir o conteúdo sem autorização</li>
                          <li>Tentar acessar áreas restritas ou sistemas internos do aplicativo</li>
                        </ul>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">5 - Conteúdo e responsabilidade</p>
                        <p>
                          O Use Guide fornece informações de forma ilustrativa e não garante
                          precisão absoluta em rotas, mapas ou recomendações. O usuário é
                          responsável por avaliar riscos ao seguir trilhas ou rotas sugeridas.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">6 - Serviços de terceiros</p>
                        <p>
                          O aplicativo pode integrar serviços externos (ex.: Firebase, Google Maps).
                          O Use Guide não se responsabiliza por falhas ou alterações nesses
                          serviços.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">7 - Limitação de responsabilidade</p>
                        <p>O Use Guide não se responsabiliza por:</p>
                        <ul className="list-disc pl-3 space-y-0.5">
                          <li>Danos causados pelo uso indevido do aplicativo</li>
                          <li>
                            Problemas decorrentes de falhas técnicas ou indisponibilidade temporária
                          </li>
                          <li>Decisões tomadas pelo usuário com base nas informações fornecidas</li>
                        </ul>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">8 - Alterações nos termos</p>
                        <p>
                          Estes termos podem ser atualizados periodicamente. Alterações relevantes
                          serão comunicadas dentro do aplicativo.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">9 - Contato</p>
                        <p>
                          Em caso de dúvidas ou solicitações relacionadas a estes Termos de Uso,
                          entre em contato pelo e‑mail: ajuda@useguide.com.br
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setTermsExpanded(!termsExpanded)}
                    className="w-full flex items-center justify-center pt-1.5 mt-1 border-t border-white/5 text-white/50 hover:text-white/80 active:scale-95 transition-all outline-none"
                    title={termsExpanded ? 'Recolher' : 'Expandir'}
                  >
                    <motion.div
                      animate={{ rotate: termsExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col transition-all duration-300">
                  <h4 className="text-[10px] font-display font-black text-white/90 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5 mb-1.5">
                    <BookOpen size={11} className="text-pink-400" />
                    Privacidade de Dados
                  </h4>
                  <div
                    className={cn(
                      'overflow-y-auto pr-1 text-[9px] text-white/65 leading-relaxed font-sans transition-all duration-300 no-scrollbar',
                      privacyExpanded ? 'max-h-[350px]' : 'max-h-20'
                    )}
                  >
                    <div className="space-y-2">
                      <p>
                        O Use Guide respeita sua privacidade e está comprometido em proteger seus
                        dados pessoais. Esta política explica como coletamos, usamos e protegemos
                        suas informações.
                      </p>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">1 - Coleta de informações</p>
                        <p>
                          Podemos coletar dados como nome, e‑mail, localização e informações de uso
                          do app. Esses dados são obtidos com seu consentimento e utilizados apenas
                          para oferecer uma experiência personalizada.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">2 - Uso dos dados</p>
                        <p>As informações coletadas são usadas para:</p>
                        <ul className="list-disc pl-3 space-y-0.5">
                          <li>Exibir pontos e produtos de interesse</li>
                          <li>Personalizar recomendações</li>
                          <li>Melhorar desempenho e segurança do app</li>
                          <li>Enviar notificações relevantes</li>
                        </ul>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">3 - Compartilhamento</p>
                        <p>
                          O Use Guide pode integrar serviços de terceiros, como serviços do Google.
                          Esses parceiros seguem normas de privacidade próprias e compatíveis com a
                          LGPD.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">4 - Segurança</p>
                        <p>
                          Seus dados são armazenados em servidores seguros, protegidos por
                          criptografia e acessados apenas por pessoas autorizadas.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">5 - Direitos do usuário</p>
                        <p>
                          Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer
                          momento. Basta enviar uma solicitação para ajuda@useguide.com.br
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">6 - Cookies</p>
                        <p>
                          O app web pode usar cookies e identificadores para melhorar sua
                          experiência. Você pode desativá‑los nas configurações do dispositivo.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">7 - Alterações</p>
                        <p>
                          Esta política pode ser atualizada periodicamente. Alterações relevantes
                          serão comunicadas dentro do app.
                        </p>
                      </div>

                      <div className="space-y-1 mt-2">
                        <p className="font-bold text-white/80">8 - Contato</p>
                        <p>
                          Em caso de dúvidas ou solicitações sobre privacidade, entre em contato
                          pelo e‑mail: ajuda@useguide.com.br
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrivacyExpanded(!privacyExpanded)}
                    className="w-full flex items-center justify-center pt-1.5 mt-1 border-t border-white/5 text-white/50 hover:text-white/80 active:scale-95 transition-all outline-none"
                    title={privacyExpanded ? 'Recolher' : 'Expandir'}
                  >
                    <motion.div
                      animate={{ rotate: privacyExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                </div>
              </div>

              <div className="p-2 text-center text-[8px] font-black uppercase tracking-widest text-white/50 bg-black/10 rounded-xl">
                Última atualização: 20 de Maio de 2026
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
