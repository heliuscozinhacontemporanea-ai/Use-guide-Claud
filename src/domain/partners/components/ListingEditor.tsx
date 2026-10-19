import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { useUI } from '../../../shared/stores/useUIStore';
import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import type { UserSession } from '../../auth';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
import { getEmptyFormData, mapItemToFormData } from '../application/mappers/partnerFormMapper';
import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { LISTING_CATEGORIES } from '../constants/listingCategories';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { useListingEditorValidation } from '../hooks/useListingEditorValidation';
import { partnerSubmissionSchema } from '../schemas/partnerSchema';
import type { PartnerContentItemInput, PartnerContentRecord } from '../types/partnerContent';
import type { FormState } from '../types/partsForm';
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
  /** CPF/CNPJ da conta do parceiro; o admin edita sem ele. */
  cpfCnpj?: string;
  onSave: (input: PartnerContentItemInput, itemId: string | null) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Editor único de cadastro (decisão D9): mesmos campos e regras da inscrição, usado pelo painel do
 * parceiro e pelo painel admin. Quem chama decide onde gravar.
 */
export function ListingEditor({
  item,
  allowedCategoryIds,
  currentUser,
  cpfCnpj,
  onSave,
  onDelete,
  onClose,
}: ListingEditorProps) {
  const { showToast } = useUI();
  const [formData, setFormData] = useState<FormState>(() =>
    item ? mapItemToFormData(item, cpfCnpj) : { ...getEmptyFormData(''), cpfCnpj: cpfCnpj ?? '' }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { errors, setErrors, validateAll } = useListingEditorValidation(formData);
  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEditorScrollLock(true);

  const handleSave = async () => {
    if (!validateAll(phoneRef.current?.validate() ?? true)) return;
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
      showToast('Cadastro salvo.', 'success');
      onClose();
    } catch (error: unknown) {
      console.error('[ListingEditor.save]', error);
      showToast(
        error instanceof Error && error.message ? error.message : 'Não foi possível salvar.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(item.id);
      showToast('Cadastro excluído.', 'success');
      onClose();
    } catch (error: unknown) {
      console.error('[ListingEditor.delete]', error);
      showToast('Não foi possível excluir o cadastro.', 'error');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const categoryLabel =
    LISTING_CATEGORIES.find((category) => category.id === formData.category)?.label ||
    'Selecione uma categoria';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: Z_INDEX.modal }}
        className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-editor-title"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
          className="w-full max-w-2xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
        >
          <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3
                id="listing-editor-title"
                className="text-xl font-display font-black text-white tracking-tight"
              >
                {item?.id ? 'Editar cadastro' : 'Novo cadastro'}
              </h3>
              <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-0.5">
                Ficha única de cadastro • {categoryLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar editor"
              className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl text-white/50 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <FormProvider {...methods}>
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar scroll-smooth">
              <div className="space-y-6">
                <Step1CompanyInfo
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  mode="editor"
                  lockCategory={Boolean(item?.id)}
                />
              </div>

              {formData.category && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <Step2ContactInfo
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      phoneRef={phoneRef}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step3Details
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step4Additional
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step5Media
                      formData={formData}
                      setFormData={setFormData}
                      currentUser={currentUser}
                      categories={categories}
                      setCurrentStep={() => {}}
                      fileInputRef={fileInputRef}
                      hideReview={true}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </FormProvider>

          {formData.category && (
            <div className="p-8 border-t border-white/5 flex flex-row items-center gap-4 w-full flex-shrink-0">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="flex-1 min-h-[44px] py-4 rounded-2xl font-semibold tracking-wide text-[12px] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 bg-teal-500 text-black shadow-teal-500/20 disabled:cursor-not-allowed disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                {isSaving && <RefreshCw className="animate-spin" size={16} aria-hidden="true" />}
                Salvar
              </button>
              {item?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                  aria-label="Excluir cadastro"
                  className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: Z_INDEX.modalNested }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="listing-delete-title"
              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 size={32} aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="listing-delete-title"
                  className="text-lg font-display font-black text-white"
                >
                  Excluir {formData.businessName || 'cadastro'}?
                </h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="w-full min-h-[44px] bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {isSaving ? (
                    <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full min-h-[44px] bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
