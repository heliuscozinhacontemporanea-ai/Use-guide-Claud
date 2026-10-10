import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import {
  X,
  CheckCircle2,
  Rocket,
  Handshake,
  ChevronLeft,
  ChevronRight,
  Camera,
  Bed,
  Utensils,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ModalLayout } from '../../../ui/layouts/ModalLayout';
import { cn } from '../../../shared/utils/cn';
import { useUI } from '../../../shared/stores/useUIStore';
import { useScrollLock } from '../../../shared/hooks/useScrollLock';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';
import { PartnerPresentation } from './sections/PartnerPresentation';
import { StepNavigation } from './sections/StepNavigation';
import { ErrorState } from './sections/ErrorState';
import { Step6Success } from './steps/Step6Success';
import { usePartnerForm } from '../hooks/usePartnerForm';
import { Z_INDEX } from '../../../shared/constants/zIndex';

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'sight', label: 'Atrações turísticas', icon: <Camera size={18} /> },
  { id: 'hotel', label: 'Hospedagem', icon: <Bed size={18} /> },
  { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={18} /> },
  { id: 'event', label: 'Produtor de Eventos', icon: <Sparkles size={18} /> },
];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function PartnersModal({ isOpen, onClose }: PartnersModalProps) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<any>(null);

  const {
    methods,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    submitError,
    currentUser,
    isStep1Valid,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    handleSubmit,
    resetForm,
  } = usePartnerForm(CATEGORY_IDS, setCurrentStep);

  useScrollLock(isOpen);

  // Scroll to top when view or step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showForm, currentStep, isOpen]);

  const handleClose = () => {
    onClose();
    // Reset states when closing
    setTimeout(() => {
      setShowForm(false);
      setCurrentStep(1);
      resetForm();
    }, 500);
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      overlayClassName="bg-black/80 backdrop-blur-2xl"
      containerClassName="glassmorphism-vibrant rounded-[3rem]"
      zIndex={Z_INDEX.modal}
      scrollRef={scrollContainerRef}
    >
      <div style={{ zIndex: Z_INDEX.header }} className="absolute top-6 right-6">
        <button
          onClick={handleClose}
          className="p-3 rounded-full glassmorphism-vibrant border border-white/20 active:scale-90 transition-transform backdrop-blur-xl shadow-2xl shadow-black/80 group/close"
        >
          <X
            size={20}
            className="text-white group-hover/close:rotate-90 transition-transform duration-300"
            strokeWidth={3}
          />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <PartnerPresentation onStart={() => setShowForm(true)} />
        ) : (
          <FormProvider {...methods}>
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full min-h-full flex flex-col p-8"
            >
              <div className="pt-12 pb-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Handshake size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                      Cadastro de Parceiro
                    </h2>
                    <StepNavigation category={formData.category} currentStep={currentStep} />
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 py-4"
                  >
                    <Step1CompanyInfo
                      formData={formData}
                      setFormData={setFormData}
                      categories={CATEGORIES}
                    />
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={
                          !formData.category ||
                          !formData.cpfCnpj ||
                          (formData.category !== 'event' &&
                            (!formData.businessName || !formData.description))
                        }
                        onClick={() => {
                          if (isStep1Valid()) {
                            setCurrentStep(2);
                          }
                        }}
                        className={cn(
                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                          !formData.category ||
                            !formData.cpfCnpj ||
                            (formData.category !== 'event' &&
                              (!formData.businessName || !formData.description))
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
                        )}
                      >
                        Avançar
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 py-4"
                  >
                    <Step2ContactInfo
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      phoneRef={phoneRef}
                      categories={CATEGORIES}
                    />
                    <div className="flex items-center gap-4 pt-4 pb-10">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
                      >
                        <ChevronLeft size={14} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={(() => {
                          if (!formData.phone) return true;
                          if (formData.category !== 'event') {
                            if (!formData.region || !formData.googleMaps) return true;
                            if (formData.category === 'hotel' && !formData.bookingLinks)
                              return true;
                          }
                          return false;
                        })()}
                        onClick={() => {
                          if (validateStep2()) {
                            setCurrentStep(formData.category === 'event' ? 5 : 3);
                          }
                        }}
                        className={cn(
                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                          (() => {
                            if (!formData.phone) return true;
                            if (formData.category !== 'event') {
                              if (!formData.region || !formData.googleMaps) return true;
                              if (formData.category === 'hotel' && !formData.bookingLinks)
                                return true;
                            }
                            return false;
                          })()
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
                        )}
                      >
                        Avançar
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 py-4"
                  >
                    <Step3Details
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={CATEGORIES}
                    />
                    <div className="flex items-center gap-4 pt-4 pb-10">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
                      >
                        <ChevronLeft size={14} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={(() => {
                          if (formData.category === 'hotel') {
                            return (
                              formData.servesBreakfast === null ||
                              (formData.servesBreakfast && formData.breakfastIncluded === null) ||
                              (formData.servesBreakfast &&
                                formData.breakfastIncluded === false &&
                                !formData.breakfastPrice)
                            );
                          }
                          if (formData.category === 'restaurant') {
                            return !formData.subcategory;
                          }
                          if (formData.category === 'sight') {
                            return (
                              !formData.sightAccessType ||
                              (formData.sightAccessType === 'pago' && !formData.sightPrice)
                            );
                          }
                          return false;
                        })()}
                        onClick={() => {
                          if (validateStep3()) {
                            setCurrentStep(4);
                          }
                        }}
                        className={cn(
                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                          (() => {
                            if (formData.category === 'hotel') {
                              return (
                                formData.servesBreakfast === null ||
                                (formData.servesBreakfast && formData.breakfastIncluded === null) ||
                                (formData.servesBreakfast &&
                                  formData.breakfastIncluded === false &&
                                  !formData.breakfastPrice)
                              );
                            }
                            if (formData.category === 'restaurant') {
                              return !formData.subcategory;
                            }
                            if (formData.category === 'sight') {
                              return (
                                !formData.sightAccessType ||
                                (formData.sightAccessType === 'pago' && !formData.sightPrice)
                              );
                            }
                            return false;
                          })()
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
                        )}
                      >
                        Avançar
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 py-4"
                  >
                    <Step4Additional
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={CATEGORIES}
                    />
                    <div className="flex items-center gap-4 pt-4 pb-10">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
                      >
                        <ChevronLeft size={14} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={(() => {
                          if (formData.category === 'hotel') {
                            return (
                              !formData.checkInFrom ||
                              !formData.checkInTo ||
                              !formData.checkOutFrom ||
                              !formData.checkOutTo ||
                              formData.childrenAllowed === null ||
                              !formData.petsPolicy ||
                              ((formData.petsPolicy === 'Sim' ||
                                formData.petsPolicy === 'Mediante pedido') &&
                                !formData.petsExtraCost)
                            );
                          }
                          return false;
                        })()}
                        onClick={() => {
                          if (validateStep4()) {
                            setCurrentStep(5);
                          }
                        }}
                        className={cn(
                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                          (() => {
                            if (formData.category === 'hotel') {
                              return (
                                !formData.checkInFrom ||
                                !formData.checkInTo ||
                                !formData.checkOutFrom ||
                                !formData.checkOutTo ||
                                formData.childrenAllowed === null ||
                                !formData.petsPolicy ||
                                ((formData.petsPolicy === 'Sim' ||
                                  formData.petsPolicy === 'Mediante pedido') &&
                                  !formData.petsExtraCost)
                              );
                            }
                            return false;
                          })()
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
                        )}
                      >
                        Avançar
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10 py-4"
                  >
                    <Step5Media
                      formData={formData}
                      setFormData={setFormData}
                      currentUser={currentUser}
                      categories={CATEGORIES}
                      setCurrentStep={setCurrentStep}
                      fileInputRef={fileInputRef}
                    />
                    <div className="flex items-center gap-4 pt-4 pb-10">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(formData.category === 'event' ? 2 : 4)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
                      >
                        <ChevronLeft size={14} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={
                          !formData.termsAccepted ||
                          (formData.images.length === 0 && formData.category !== 'event') ||
                          (!currentUser &&
                            (!formData.firstName ||
                              !formData.email ||
                              !formData.password ||
                              formData.password.length < 8 ||
                              formData.password.length > 20 ||
                              !/[A-Z]/.test(formData.password) ||
                              !/[a-z]/.test(formData.password) ||
                              !/\d/.test(formData.password) ||
                              formData.password !== formData.confirmPassword))
                        }
                        onClick={() => {
                          if (validateStep5()) {
                            handleSubmit();
                          }
                        }}
                        className={cn(
                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                          !formData.termsAccepted ||
                            (formData.images.length === 0 && formData.category !== 'event') ||
                            (!currentUser &&
                              (!formData.firstName ||
                                !formData.email ||
                                !formData.password ||
                                formData.password.length < 8 ||
                                formData.password.length > 20 ||
                                !/[A-Z]/.test(formData.password) ||
                                !/[a-z]/.test(formData.password) ||
                                !/\d/.test(formData.password) ||
                                formData.password !== formData.confirmPassword))
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
                        )}
                      >
                        Finalizar Cadastro
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                            className="w-24 h-24 rounded-[2rem] border-2 border-indigo-500/20 border-t-indigo-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                            <Rocket size={40} className="animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-white uppercase">
                            Processando...
                          </h3>
                          <p className="text-white/50 text-sm max-w-[280px]">
                            Estamos preparando seu perfil e subindo as informações. Quase lá!
                          </p>
                        </div>
                      </>
                    ) : submitError ? (
                      <ErrorState message={submitError} onRetry={() => setCurrentStep(5)} />
                    ) : (
                      <Step6Success
                        businessName={formData.businessName}
                        onClose={() => handleClose()}
                        onAccessPanel={() => {
                          onClose();
                          navigate('/admin');
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </FormProvider>
        )}
      </AnimatePresence>
    </ModalLayout>
  );
}
