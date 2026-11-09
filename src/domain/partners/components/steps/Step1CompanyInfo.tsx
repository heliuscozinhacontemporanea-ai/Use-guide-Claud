import { motion } from 'motion/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { FormState } from '../../types/partsForm';
import { RequiredMark, SignupError } from '../sections/SignupFieldParts';
import {
  SIGNUP_CHOICE,
  SIGNUP_CHOICE_OFF,
  SIGNUP_CHOICE_ON,
  SIGNUP_HINT,
  SIGNUP_INPUT,
  SIGNUP_LABEL,
  SIGNUP_TEXTAREA,
} from '../sections/signupStyles';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Step1CompanyInfoProps {
  formData: Pick<FormState, 'category' | 'businessName' | 'description'>;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  categories: Category[];
  // Trocar a categoria de um item existente mudaria o schema de operationalInfo já gravado.
  lockCategory?: boolean;
}

export function Step1CompanyInfo({
  formData: propFormData,
  setFormData,
  categories,
  lockCategory = false,
}: Step1CompanyInfoProps) {
  const { t } = useTranslation();
  const formContext = useFormContext();

  const formData = formContext ? formContext.watch() : propFormData;
  const formErrors = formContext ? formContext.formState.errors : {};

  const handleCategoryChange = (catId: string) => {
    if (lockCategory) return;
    if (formContext) {
      formContext.setValue('category', catId, { shouldValidate: true });
    }
    setFormData((prev) => ({ ...prev, category: catId }));
  };

  const handleBusinessNameChange = (value: string) => {
    if (formContext) {
      formContext.setValue('businessName', value, { shouldValidate: true });
    }
    setFormData((prev) => ({ ...prev, businessName: value }));
  };

  const handleDescriptionChange = (value: string) => {
    const sliced = value.slice(0, 400);
    if (formContext) {
      formContext.setValue('description', sliced, { shouldValidate: true });
    }
    setFormData((prev) => ({ ...prev, description: sliced }));
  };

  const isEventProducer = formData.category === 'producer';
  const descriptionLength = (formData.description || '').length;

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className={SIGNUP_LABEL}>
          {t('partnerSignup.step1.question')}
          <RequiredMark />
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => {
            const selected = formData.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                disabled={lockCategory && !selected}
                aria-pressed={selected}
                className={cn(SIGNUP_CHOICE, selected ? SIGNUP_CHOICE_ON : SIGNUP_CHOICE_OFF)}
              >
                <span className={selected ? 'text-partner' : 'text-ink/70'}>{cat.icon}</span>
                <span className="leading-tight">
                  {t(`partnerSignup.categories.${cat.id}`, { defaultValue: cat.label })}
                </span>
              </button>
            );
          })}
        </div>
        {lockCategory && <p className={SIGNUP_HINT}>{t('partnerSignup.step1.lockedCategory')}</p>}
        <SignupError message={formErrors.category?.message?.toString()} />
      </fieldset>

      {formData.category ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="signup-business-name" className={SIGNUP_LABEL}>
              {t(
                isEventProducer
                  ? 'partnerSignup.step1.nameLabelProducer'
                  : 'partnerSignup.step1.nameLabel'
              )}
              <RequiredMark />
            </label>
            <input
              id="signup-business-name"
              type="text"
              value={formData.businessName || ''}
              onChange={(e) => handleBusinessNameChange(e.target.value)}
              placeholder={t('partnerSignup.step1.namePlaceholder')}
              maxLength={100}
              aria-required
              aria-invalid={Boolean(formErrors.businessName)}
              className={cn(SIGNUP_INPUT, formErrors.businessName && 'border-danger-line')}
            />
            <SignupError message={formErrors.businessName?.message?.toString()} />
          </div>

          {!isEventProducer && (
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="signup-description" className={SIGNUP_LABEL}>
                  {t('partnerSignup.step1.descriptionLabel')}
                  <RequiredMark />
                </label>
                <span
                  className={cn(
                    'px-1 text-[13px] tabular-nums',
                    descriptionLength > 380 ? 'text-danger' : 'text-ink/60'
                  )}
                >
                  {descriptionLength}/400
                </span>
              </div>
              <textarea
                id="signup-description"
                value={formData.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder={t('partnerSignup.step1.descriptionPlaceholder')}
                rows={4}
                aria-required
                aria-invalid={Boolean(formErrors.description)}
                className={cn(SIGNUP_TEXTAREA, formErrors.description && 'border-danger-line')}
              />
              <SignupError message={formErrors.description?.message?.toString()} />
            </div>
          )}
        </motion.div>
      ) : formErrors.category ? null : (
        <p className={SIGNUP_HINT}>{t('partnerSignup.step1.chooseFirst')}</p>
      )}
    </div>
  );
}
