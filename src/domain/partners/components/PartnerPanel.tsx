import {
  BarChart3,
  Home as Bed,
  Calendar,
  RefreshCw,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Z_INDEX } from '../../../shared/constants/zIndex';

// Componentes estruturais e utilitários da UI
import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
import { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { getEmptyFormData, usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
import { partnerSubmissionSchema } from '../schemas/partnerSchema';
import { PartnerProfile, SubscriptionPlan } from '../types/partner';
import type { PartnerContentRecord } from '../types/partnerContent';
import type { FormState } from '../types/partsForm';
import { PartnerEventForm } from './PartnerEventForm';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';
import { PartnerEventsTable } from './subcomponents/PartnerEventsTable';
import { PartnerHeader } from './subcomponents/PartnerHeader';
import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
import { PlansModal } from './subcomponents/PlansModal';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';

export interface PartnerPanelProps {
  profile?: PartnerProfile;
  subscriptionPlans?: SubscriptionPlan[];
  renderReports?: (props: {
    partnerId: string;
    items: PartnerContentRecord[];
    events: PartnerContentRecord[];
  }) => React.ReactNode;
  renderNotificationBell?: (partnerId: string) => React.ReactNode;
  renderCheckoutModal?: (props: {
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
    itemName: string;
    amount: number;
    onPaymentSuccess: () => Promise<void>;
  }) => React.ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
  planSubscriptionSlot?: React.ReactNode;
  renderBookableOffersManager?: (
    items: Array<{ id: string; name: string; category: string }>
  ) => React.ReactNode;
}

export function PartnerPanel({
  profile,
  subscriptionPlans,
  renderReports,
  renderNotificationBell,
  renderCheckoutModal,
  renderEventTicketingManager,
  planSubscriptionSlot,
  renderBookableOffersManager,
}: PartnerPanelProps) {
  const { goTo } = useLocalizedRouting();

  const {
    user,
    userLoading,
    partnerProfile,
    profileStatus,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    isLoading,
    isUploading,
    showDeleteConfirm,
    setShowDeleteConfirm,
    setCurrentStep,
    editorFormData,
    setEditorFormData,
    errors,
    setErrors,
    dataLoading,
    isVerified,
    isEventProducer,
    itemsList,
    eventsList,
    handleDelete,
    handleToggleActive,
    handleImageUpload,
    handleSaveEvent,
    handleSaveItem,
    handleEditItem,
  } = usePartnerPanelActions(profile);

  const [showPlansModal, setShowPlansModal] = React.useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
    itemId: '',
    itemName: '',
    amount: 0,
  });

  const handleCheckoutSuccess = async () => {
    setShowCheckoutModal(false);
    console.info(
      '[Checkout Success] Pagamento concluído. O status e a verificação serão sincronizados automaticamente pelo servidor/webhook.'
    );
  };

  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
  const fileInputRefForEditor = useRef<HTMLInputElement | null>(null);

  const editorMethods = useForm<FormState>({
    resolver: zodResolver(partnerSubmissionSchema) as unknown as Resolver<FormState>,
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange',
  });

  useEffect(() => {
    if (editorFormData) {
      editorMethods.reset(editorFormData, { keepDefaultValues: true });
    }
  }, [editorFormData, editorMethods]);

  // Efeito reativo estrutural para garantir que parceiros cadastrados como produtores de eventos fiquem e usem unicamente a aba de eventos
  React.useEffect(() => {
    if (isEventProducer && activeTab === 'items') {
      setActiveTab('events');
    }
  }, [isEventProducer, activeTab, setActiveTab]);

  // Efeito estratégico para bloquear scroll do body e corrigir deslocamento de cabeçalho no mobile devido ao teclado
  React.useEffect(() => {
    if (isEditing) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleFocusOut = () => {
        setTimeout(() => {
          const activeEl = document.activeElement;
          if (
            activeEl &&
            (activeEl.tagName === 'INPUT' ||
              activeEl.tagName === 'TEXTAREA' ||
              activeEl.getAttribute('contenteditable') === 'true')
          ) {
            return;
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 120);
      };

      document.addEventListener('focusout', handleFocusOut);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('focusout', handleFocusOut);
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
    }
  }, [isEditing]);

  const categories = [
    { id: 'sight', label: 'Atrações Turísticas', icon: <Sparkles size={16} /> },
    { id: 'hotel', label: 'Hospedagem', icon: <Bed size={16} /> },
    { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={16} /> },
    { id: 'event', label: 'Produtor de Eventos', icon: <Calendar size={16} /> },
  ];

  if (userLoading || profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user || profileStatus === 'empty') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <h2 className="text-2xl font-display font-extrabold mb-2 text-white">Acesso Restrito</h2>
        <p className="text-white/50 mb-8 max-w-xs">
          Este é o portal exclusivo para parceiros cadastrados.
        </p>
        <button
          onClick={() => goTo('explore')}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-40 px-4 bg-[#020508]/60 font-sans selection:bg-teal-500/30 relative overflow-hidden backdrop-blur-md">
      <BackgroundBlobs />

      <div
        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
      >
        <PartnerHeader
          partnerProfile={partnerProfile}
          onNavigateBack={() => goTo('explore')}
          isVerified={isVerified}
          onVerifyClick={() => setShowPlansModal(true)}
          notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
        />

        {planSubscriptionSlot}

        <PartnerTabsNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isEventProducer={isEventProducer}
          isVerified={isVerified}
        />

        {activeTab === 'reports' ? (
          isVerified ? (
            renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
          ) : (
            <div className="py-24 text-center glassmorphism rounded-[3rem] border border-white/10 p-12">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <BarChart3 size={40} />
              </div>
              <h3 className="text-xl font-display font-black text-white mb-2">
                Relatórios Bloqueados
              </h3>
              <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
                O acesso aos relatórios é exclusivo para parceiros com o selo de verificação ativo.
              </p>
              <button
                type="button"
                onClick={() => setShowPlansModal(true)}
                className="px-8 py-4 bg-blue-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-400 transition-all cursor-pointer"
              >
                Ativar Verificação
              </button>
            </div>
          )
        ) : activeTab === 'items' ? (
          <>
            <PartnerItemsTable
              itemsList={itemsList}
              loading={dataLoading}
              onEditItem={(item) => handleEditItem(item)}
              onToggleActive={handleToggleActive}
              onCreateNew={() => {
                const emptyForm = getEmptyFormData('');
                setEditorFormData(emptyForm);
                setCurrentStep(1);
                setIsEditing({
                  id: '',
                  name: '',
                  description: '',
                  category: '',
                  image: '',
                  location: '',
                });
              }}
            />
            {renderBookableOffersManager?.(
              itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
            )}
          </>
        ) : (
          <PartnerEventsTable
            eventsList={eventsList}
            loading={dataLoading}
            onEditEvent={(item) =>
              setIsEditing({
                ...item,
                images: item.images || (item.image ? [item.image] : []),
              })
            }
            onToggleActive={handleToggleActive}
            onCreateNew={() =>
              setIsEditing({
                id: '',
                name: '',
                description: '',
                category: 'event',
                location: '',
                ownerId: user?.uid || '',
                image: '',
                images: [],
                operationalInfo: {},
              })
            }
          />
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && isEditing.category === 'event' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditing(null);
            }}
            style={{ zIndex: Z_INDEX.modal }}
            className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
              className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
            >
              <div className="p-8 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-xl font-display font-black text-white tracking-tight">
                    {isEditing.id ? 'Editar Evento' : 'Novo Evento'}
                  </h3>
                  <p className="text-[10px] text-white/50 font-medium tracking-wide">
                    Preencha os detalhes do seu evento
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(null)}
                  className="p-3 bg-white/5 rounded-2xl text-white/50"
                >
                  <X size={24} />
                </button>
              </div>

              <PartnerEventForm
                item={isEditing}
                onChange={(updatedItem) => setIsEditing(updatedItem)}
                isUploading={isUploading}
                onImageUpload={handleImageUpload}
                partnerCategory={partnerProfile?.category}
                businesses={partnerProfile?.businesses}
                renderEventTicketingManager={renderEventTicketingManager}
              />

              <div className="p-8 border-t border-white/5 flex gap-3 items-center flex-shrink-0">
                <button
                  onClick={async () => {
                    await handleSaveEvent();
                  }}
                  disabled={isLoading}
                  className={`flex-1 bg-[#00D4FF] text-black py-4 rounded-2xl font-semibold tracking-wide text-[12px] shadow-lg shadow-[#00D4FF]/20 active:scale-95 flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'cursor-not-allowed opacity-80'
                      : 'hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {isLoading && <RefreshCw className="animate-spin" size={16} />} Salvar
                </button>
                {isEditing.id && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isEditing && isEditing.category !== 'event' && editorFormData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsEditing(null);
                setEditorFormData(null);
              }
            }}
            style={{ zIndex: Z_INDEX.modal }}
            className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
              className="w-full max-w-2xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
            >
              <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-xl font-display font-black text-white tracking-tight">
                    {isEditing.id ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
                  </h3>
                  <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-0.5">
                    Ficha Única de Cadastro •{' '}
                    {categories.find((c) => c.id === editorFormData.category)?.label ||
                      'Selecione uma Categoria'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditing(null);
                    setEditorFormData(null);
                  }}
                  className="p-3 bg-white/5 rounded-2xl text-white/50 hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <FormProvider {...editorMethods}>
                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar scroll-smooth">
                  <div className="space-y-6">
                    <Step1CompanyInfo
                      formData={editorFormData}
                      setFormData={setEditorFormData}
                      categories={categories.filter((c) => c.id !== 'event')}
                    />
                  </div>

                  {editorFormData.category && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-12"
                    >
                      <div className="space-y-6">
                        <Step2ContactInfo
                          formData={editorFormData}
                          setFormData={setEditorFormData}
                          errors={errors}
                          setErrors={setErrors}
                          phoneRef={phoneRef}
                          categories={categories}
                        />
                      </div>

                      <div className="space-y-6">
                        <Step3Details
                          formData={editorFormData}
                          setFormData={setEditorFormData}
                          errors={errors}
                          setErrors={setErrors}
                          categories={categories}
                        />
                      </div>

                      <div className="space-y-6">
                        <Step4Additional
                          formData={editorFormData}
                          setFormData={setEditorFormData}
                          errors={errors}
                          setErrors={setErrors}
                          categories={categories}
                        />
                      </div>

                      <div className="space-y-6">
                        <Step5Media
                          formData={editorFormData}
                          setFormData={setEditorFormData}
                          currentUser={user}
                          categories={categories}
                          setCurrentStep={() => {}}
                          fileInputRef={fileInputRefForEditor}
                          hideReview={true}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </FormProvider>

              {editorFormData.category && (
                <div className="p-8 border-t border-white/5 flex flex-row items-center gap-4 w-full flex-shrink-0">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      await handleSaveItem(() => phoneRef.current?.validate() ?? true);
                    }}
                    className={`py-4 rounded-2xl font-semibold tracking-wide text-[12px] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 ${
                      isEditing.id ? 'flex-1' : 'w-full'
                    } bg-teal-500 text-black shadow-teal-500/20 ${
                      isLoading
                        ? 'cursor-not-allowed opacity-80'
                        : 'hover:scale-[1.02] cursor-pointer'
                    }`}
                  >
                    {isLoading && <RefreshCw className="animate-spin" size={16} />}
                    Salvar
                  </button>

                  {isEditing.id && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isLoading}
                      className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: Z_INDEX.modalNested }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-white">Excluir Item?</h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não poderá ser desfeita. Deseja realmente remover este item?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Trash2 size={14} />
                  )}{' '}
                  Excluir
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        userId={user.uid}
        partnerProfile={partnerProfile || undefined}
        plans={subscriptionPlans ?? []}
        onSelectPaidPlan={(planId, planName, amount) => {
          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amount });
          setShowCheckoutModal(true);
        }}
      />

      {renderCheckoutModal?.({
        isOpen: showCheckoutModal,
        onClose: () => setShowCheckoutModal(false),
        itemId: checkoutPlanInfo.itemId,
        itemName: checkoutPlanInfo.itemName,
        amount: checkoutPlanInfo.amount,
        onPaymentSuccess: handleCheckoutSuccess,
      })}

      <style>{`
        .glassmorphism { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
