import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormProvider } from 'react-hook-form';
import { X, Handshake } from 'lucide-react';
import { ModalLayout } from '../../../ui/layouts/ModalLayout';
import { useScrollLock } from '../../../shared/hooks/useScrollLock';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';
import { PartnerPresentation } from './sections/PartnerPresentation';
import { StepNavigation } from './sections/StepNavigation';
import { ErrorState } from './sections/ErrorState';
import { SignupProcessingState } from './sections/SignupProcessingState';
import { SignupStepActions } from './sections/SignupStepActions';
import { SignupStepPanel } from './sections/SignupStepPanel';
import { Step6Success } from './steps/Step6Success';
import { usePartnerForm } from '../hooks/usePartnerForm';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { LISTING_CATEGORIES } from '../constants/listingCategories';
import {
  isSignupStep1Incomplete,
  isSignupStep2Incomplete,
  isSignupStep3Incomplete,
  isSignupStep4Incomplete,
  isSignupStep5Incomplete,
} from '../utils/signupStepGates';
import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPartnerPanel: () => void;
}

const CATEGORIES = LISTING_CATEGORIES;

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<PhoneInputFieldRef | null>(null);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: as dependências são os gatilhos para voltar ao topo, não valores lidos no efeito.
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showForm, currentStep, isOpen]);

  const handleClose = () => {
    onClose();
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
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
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
                  <SignupStepPanel key="step1" className="space-y-6 py-4">
                    <Step1CompanyInfo
                      formData={formData}
                      setFormData={setFormData}
                      categories={CATEGORIES}
                    />
                    <SignupStepActions
                      className=""
                      onBack={() => setShowForm(false)}
                      nextDisabled={isSignupStep1Incomplete(formData)}
                      onNext={() => {
                        if (isStep1Valid()) setCurrentStep(2);
                      }}
                    />
                  </SignupStepPanel>
                )}
                {currentStep === 2 && (
                  <SignupStepPanel key="step2" className="space-y-6 py-4">
                    <Step2ContactInfo
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      phoneRef={phoneRef}
                      categories={CATEGORIES}
                    />
                    <SignupStepActions
                      onBack={() => setCurrentStep(1)}
                      nextDisabled={isSignupStep2Incomplete(formData)}
                      onNext={() => {
                        if (validateStep2()) {
                          setCurrentStep(formData.category === 'producer' ? 5 : 3);
                        }
                      }}
                    />
                  </SignupStepPanel>
                )}
                {currentStep === 3 && (
                  <SignupStepPanel key="step3" className="space-y-8 py-4">
                    <Step3Details
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={CATEGORIES}
                    />
                    <SignupStepActions
                      onBack={() => setCurrentStep(2)}
                      nextDisabled={isSignupStep3Incomplete(formData)}
                      onNext={() => {
                        if (validateStep3()) setCurrentStep(4);
                      }}
                    />
                  </SignupStepPanel>
                )}
                {currentStep === 4 && (
                  <SignupStepPanel key="step4" className="space-y-8 py-4">
                    <Step4Additional
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={CATEGORIES}
                    />
                    <SignupStepActions
                      onBack={() => setCurrentStep(3)}
                      nextDisabled={isSignupStep4Incomplete(formData)}
                      onNext={() => {
                        if (validateStep4()) setCurrentStep(5);
                      }}
                    />
                  </SignupStepPanel>
                )}
                {currentStep === 5 && (
                  <SignupStepPanel key="step5" className="space-y-10 py-4">
                    <Step5Media
                      formData={formData}
                      setFormData={setFormData}
                      currentUser={currentUser}
                      categories={CATEGORIES}
                      setCurrentStep={setCurrentStep}
                      fileInputRef={fileInputRef}
                    />
                    <SignupStepActions
                      isFinal
                      isSubmitting={isSubmitting}
                      onBack={() => setCurrentStep(formData.category === 'producer' ? 2 : 4)}
                      nextDisabled={isSignupStep5Incomplete(formData, Boolean(currentUser))}
                      onNext={() => {
                        if (validateStep5()) handleSubmit();
                      }}
                    />
                  </SignupStepPanel>
                )}
                {currentStep === 6 && (
                  <SignupStepPanel
                    key="step6"
                    className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                  >
                    {isSubmitting ? (
                      <SignupProcessingState />
                    ) : submitError ? (
                      <ErrorState message={submitError} onRetry={() => setCurrentStep(5)} />
                    ) : (
                      <Step6Success
                        businessName={formData.businessName}
                        onClose={handleClose}
                        onAccessPanel={() => {
                          handleClose();
                          onOpenPartnerPanel();
                        }}
                      />
                    )}
                  </SignupStepPanel>
                )}
              </AnimatePresence>
            </motion.div>
          </FormProvider>
        )}
      </AnimatePresence>
    </ModalLayout>
  );
}
