import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, type Path, type Resolver, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../shared/stores/useUIStore';
import { ConfirmDialog } from '../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../ui/components/Dialog';
import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { BUTTON_DANGER, BUTTON_PRIMARY } from '../../../ui/styles/controls';
import type { UserSession } from '../../auth';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
import { getEmptyFormData, mapItemToFormData } from '../application/mappers/partnerFormMapper';
import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { LISTING_CATEGORIES } from '../constants/listingCategories';
import { useListingEditorValidation } from '../hooks/useListingEditorValidation';
import { partnerSubmissionSchema } from '../schemas/partnerSchema';
import type { PartnerContentItemInput, PartnerContentRecord } from '../types/partnerContent';
import type { FormState } from '../types/partsForm';
import { revealFirstSignupError } from '../utils/revealFirstSignupError';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';

export interface ListingEditorProps {
  /** Cadastro a editar; `null` cria um novo. */
  item: PartnerContentRecord | null;
  /** Categorias que podem ser escolhidas num cadastro novo (padrão: todas as do parceiro). */
  allowedCategoryIds?: string[];
  currentUser: UserSession | null;
  onSave: (input: PartnerContentItemInput, itemId: string | null) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onClose: () => void;
}

// Erros que o passo 1 lê do React Hook Form (os outros passos leem do estado local).
const IDENTITY_FIELDS = ['category', 'businessName', 'description'];
// Duração da saída da folha (Dialog) antes de desmontar o editor.
const CLOSE_MS = 220;

/**
 * Editor único de cadastro (decisão D9): mesmos campos e regras da inscrição, numa folha, usado pelo
 * painel do parceiro e pelo painel admin. Quem chama decide onde gravar.
 */
export function ListingEditor({
  item,
  allowedCategoryIds,
  currentUser,
  onSave,
  onDelete,
  onClose,
}: ListingEditorProps) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  // Cadastro novo com uma categoria só (ex.: "Também trabalha com…?") já vem com ela escolhida.
  const [formData, setFormData] = useState<FormState>(() =>
    item
      ? mapItemToFormData(item)
      : getEmptyFormData(allowedCategoryIds?.length === 1 ? allowedCategoryIds[0] : '')
  );
  const [open, setOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { errors, setErrors, validateAll } = useListingEditorValidation(formData);
  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const categories = LISTING_CATEGORIES.filter(
    (category) => Boolean(item) || !allowedCategoryIds || allowedCategoryIds.includes(category.id)
  );

  const methods = useForm<FormState>({
    resolver: zodResolver(partnerSubmissionSchema) as unknown as Resolver<FormState>,
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset(formData, { keepDefaultValues: true });
  }, [formData, methods]);

  const close = () => {
    setOpen(false);
    window.setTimeout(onClose, CLOSE_MS);
  };

  const handleSave = async () => {
    // Telefone vazio já tem a mensagem do schema; o campo só confere o formato do que foi digitado.
    const phoneOk = !formData.phone || (phoneRef.current?.validate() ?? true);
    const found = validateAll(phoneOk);
    if (found) {
      for (const field of IDENTITY_FIELDS) {
        const message = found[field];
        if (message) methods.setError(field as Path<FormState>, { type: 'manual', message });
      }
      revealFirstSignupError(bodyRef.current?.closest('[role="dialog"]'));
      return;
    }
    setIsSaving(true);
    try {
      const imageUrls = await Promise.all(
        formData.images.map(async (image) => {
          if (!image.file) return image.preview;
          return uploadImageUseCase(image.file, 'guia_local').catch((error: unknown) => {
            throw new Error(getImageUploadErrorMessage(error));
          });
        })
      );
      const input = mapPartnerSubmissionToGuideItem(
        formData,
        imageUrls.filter((url): url is string => Boolean(url))
      );
      await onSave(input, item?.id || null);
      showToast(t('partnerSignup.editor.saved'), 'success');
      close();
    } catch (error: unknown) {
      console.error('[ListingEditor.save]', error);
      showToast(
        error instanceof Error && error.message
          ? error.message
          : t('partnerSignup.editor.saveFailed'),
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;
    setConfirmDelete(false);
    setIsSaving(true);
    try {
      await onDelete(item.id);
      showToast(t('partnerSignup.editor.deleted'), 'success');
      close();
    } catch (error: unknown) {
      console.error('[ListingEditor.delete]', error);
      showToast(t('partnerSignup.editor.deleteFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const category = categories.find((option) => option.id === formData.category);
  const sectionTitle = 'px-1 text-[17px] font-semibold text-ink';

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => !next && !isSaving && close()}
        title={t(item?.id ? 'partnerSignup.editor.editTitle' : 'partnerSignup.editor.newTitle')}
        description={
          category
            ? t(`partnerSignup.categories.${category.id}`, { defaultValue: category.label })
            : undefined
        }
        className="sm:max-w-lg"
      >
        <FormProvider {...methods}>
          <div ref={bodyRef} className="space-y-8 pt-2">
            <Step1CompanyInfo
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              lockCategory={Boolean(item?.id)}
            />
            {formData.category && (
              <>
                <section className="space-y-4">
                  <h3 className={sectionTitle}>{t('partnerSignup.editor.contactTitle')}</h3>
                  <Step2ContactInfo
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    phoneRef={phoneRef}
                    categories={categories}
                  />
                </section>
                {formData.category !== 'producer' && (
                  <>
                    <Step3Details
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={categories}
                    />
                    <Step4Additional
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  </>
                )}
                <Step5Media
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  currentUser={currentUser}
                  categories={categories}
                  setCurrentStep={() => {}}
                  fileInputRef={fileInputRef}
                  hideReview
                />
              </>
            )}
          </div>
        </FormProvider>

        {formData.category && (
          // Ações presas ao pé da folha, por cima do formulário que rola.
          <div className="sticky -bottom-6 -mx-6 mt-6 px-6 pt-3 pb-6 bg-sheet border-t border-line flex items-center gap-3">
            {item?.id && onDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isSaving}
                aria-label={t('partnerSignup.editor.delete')}
                className={`${BUTTON_DANGER} w-12 min-h-12 px-0 flex items-center justify-center`}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className={`${BUTTON_PRIMARY} flex-1 min-h-12 text-[16px] flex items-center justify-center gap-2`}
            >
              {isSaving && (
                <Loader2
                  size={16}
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {t(isSaving ? 'partnerSignup.editor.saving' : 'partnerSignup.editor.save')}
            </button>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        data={
          confirmDelete
            ? {
                title: t('partnerSignup.editor.deleteTitle', {
                  name: formData.businessName || t('partnerSignup.editor.editTitle'),
                }),
                message: t('partnerSignup.editor.deleteText'),
                confirmLabel: t('partnerSignup.editor.delete'),
                onConfirm: handleDelete,
                onCancel: () => setConfirmDelete(false),
              }
            : null
        }
      />
    </>
  );
}
