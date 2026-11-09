import { Handshake } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { ErrorState } from '../../../ui/components/ErrorState';
import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { LISTING_CATEGORIES } from '../constants/listingCategories';
import { usePartnerForm } from '../hooks/usePartnerForm';
import { revealFirstSignupError } from '../utils/revealFirstSignupError';
import { PartnerPresentation } from './sections/PartnerPresentation';
import { SignupProcessingState } from './sections/SignupProcessingState';
import { SignupStepActions } from './sections/SignupStepActions';
import { SignupStepPanel } from './sections/SignupStepPanel';
import { StepNavigation } from './sections/StepNavigation';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';
import { Step6Success } from './steps/Step6Success';

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPartnerPanel: () => void;
}

const CATEGORIES = LISTING_CATEGORIES;

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersModalProps) {
  const { t } = useTranslation();
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: as dependências são os gatilhos para voltar ao topo, não valores lidos no efeito.
  useEffect(() => {
    // A folha (Dialog) é quem rola; o passo novo começa do topo.
    scrollContainerRef.current
      ?.closest('[role="dialog"]')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showForm, currentStep, isOpen]);

  // Passo com campo faltando: depois de desenhar os erros, leva a pessoa ao primeiro.
  const check = (valid: boolean) => {
    if (!valid) revealFirstSignupError(scrollContainerRef.current?.closest('[role="dialog"]'));
    return valid;
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setShowForm(false);
      setCurrentStep(1);
      resetForm();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} className="sm:max-w-lg">
      <div ref={scrollContainerRef} />

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="presentation"
            initial={false}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <PartnerPresentation onStart={() => setShowForm(true)} />
          </motion.div>
        ) : (
          <FormProvider {...methods}>
            <motion.div
              key="form"
              // Página que entra da direita (regra de movimento aprovada em 2026-11-09).
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="w-full flex flex-col"
            >
              <div className="pb-4 pr-10 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-partner-soft border border-partner-line flex items-center justify-center text-partner">
                    <Handshake size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-display font-bold text-ink">
                      {t('partnerSignup.form.title')}
                    </h2>
                    {currentStep <= 5 && (
                      <StepNavigation category={formData.category} currentStep={currentStep} />
                    )}
                  </div>
                </div>
                {currentStep <= 5 && (
                  <p className="px-1 text-[13px] text-ink/70">
                    {t('partnerSignup.errors.requiredNote')}
                  </p>
                )}
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
                      onNext={() => {
                        if (check(isStep1Valid())) setCurrentStep(2);
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
                      onNext={() => {
                        if (check(validateStep2())) {
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
                      onNext={() => {
                        if (check(validateStep3())) setCurrentStep(4);
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
                      onNext={() => {
                        if (check(validateStep4())) setCurrentStep(5);
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
                      onNext={() => {
                        if (check(validateStep5())) handleSubmit();
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
    </Dialog>
  );
}
