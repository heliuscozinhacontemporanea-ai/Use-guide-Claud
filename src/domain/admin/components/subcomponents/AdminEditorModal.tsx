import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, RefreshCw } from 'lucide-react';
import { CATEGORIES } from '../../../../shared/constants/categories';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { listEventOccurrencesUseCase } from '../../../events';
import type { GuideItem } from '../../../guide';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
import {
  adminGuideEditorFormSchema,
  type AdminGuideEditorSchemaValues,
} from '../../schemas/adminGuideEditorFormSchema';
import { AdminEditorBasicInfo } from './AdminEditorBasicInfo';
import { AdminEditorGallery } from './AdminEditorGallery';
import { AdminEditorLocation } from './AdminEditorLocation';
import { AdminEditorOperationalInfo } from './AdminEditorOperationalInfo';
import { AdminEditorEventFields } from './AdminEditorEventFields';
import { AdminEditorActions } from './AdminEditorActions';

export const ADMIN_CREATABLE_ITEM_CATEGORIES = [
  'tips',
  'tour',
  'sight',
] as const;

export type AdminEditorSaveData = GuideItem & {
  occurrences?: AdminGuideEditorSchemaValues['occurrences'];
  /** Sessões salvas que o admin removeu no editor e devem ser apagadas no servidor. */
  removedOccurrenceIds?: string[];
};

type OccurrencesLoadState = 'idle' | 'loading' | 'ready' | 'error';

interface AdminEditorModalProps {
  isEditing: GuideItem;
  setIsEditing: (item: GuideItem | null) => void;
  activeTab: 'items' | 'events';
  isAdminUser: boolean;
  onSave: (data: AdminEditorSaveData) => Promise<void>;
  onDeleteConfirm: (id: string) => Promise<void>;
}

export function AdminEditorModal({
  isEditing,
  setIsEditing,
  activeTab,
  isAdminUser,
  onSave,
  onDeleteConfirm,
}: AdminEditorModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useUI();
  const [occurrencesState, setOccurrencesState] = useState<OccurrencesLoadState>('idle');
  const savedOccurrenceIdsRef = useRef<string[]>([]);

  const form = useForm<AdminGuideEditorSchemaValues>({
    resolver: zodResolver(
      adminGuideEditorFormSchema
    ) as unknown as Resolver<AdminGuideEditorSchemaValues>,
    defaultValues: {
      name: '',
      description: '',
      category: activeTab === 'events' ? 'event' : 'tips',
      location: 'Jericoacoara',
      image: '',
      images: [],
      occurrences: [],
    },
  });

  useEffect(() => {
    const defaultStart = isEditing?.date || new Date().toISOString();
    const defaultEnd =
      isEditing?.endDate || new Date(new Date(defaultStart).getTime() + 3 * 3600 * 1000).toISOString();

    form.reset({
      name: isEditing?.name || '',
      description: isEditing?.description || '',
      category: isEditing?.category || (activeTab === 'events' ? 'event' : 'tips'),
      location: isEditing?.location || 'Jericoacoara',
      image: isEditing?.image || '',
      images: isEditing?.images || [],
      date: isEditing?.date,
      endDate: isEditing?.endDate,
      // Evento novo começa com uma sessão; as sessões de um evento salvo vêm do servidor (efeito abaixo).
      occurrences:
        activeTab === 'events' && !isEditing?.id
          ? [{ startsAt: defaultStart, endsAt: defaultEnd, capacity: 100 }]
          : [],
      eventCategory: isEditing?.eventCategory,
      customCategory: isEditing?.customCategory,
      googleMapsLink: isEditing?.googleMapsLink,
      instagramLink: isEditing?.instagramLink,
      whatsappLink: isEditing?.whatsappLink,
      websiteLink: isEditing?.websiteLink,
      bookingLink: isEditing?.bookingLink,
      operationalInfo: isEditing?.operationalInfo as Record<string, unknown> | undefined,
    });
  }, [isEditing.id, activeTab, form]);

  useEffect(() => {
    savedOccurrenceIdsRef.current = [];
    if (activeTab !== 'events' || !isEditing.id) {
      setOccurrencesState('idle');
      return;
    }
    let active = true;
    setOccurrencesState('loading');
    listEventOccurrencesUseCase(isEditing.id)
      .then((list) => {
        if (!active) return;
        savedOccurrenceIdsRef.current = list.map((occ) => occ.id);
        form.setValue(
          'occurrences',
          list.map((occ) => ({
            id: occ.id,
            startsAt: occ.startsAt,
            endsAt: occ.endsAt,
            capacity: occ.capacity,
            salesStartsAt: occ.salesStartsAt,
            salesEndsAt: occ.salesEndsAt,
          }))
        );
        setOccurrencesState('ready');
      })
      .catch((error: unknown) => {
        console.error('[AdminEditorModal] sessões', error);
        if (active) setOccurrencesState('error');
      });
    return () => {
      active = false;
    };
  }, [isEditing.id, activeTab, form]);

  const isCreatingNew = !isEditing?.id;

  const availableCategories =
    activeTab === 'items'
      ? Object.values(CATEGORIES).filter((c) => {
          if (c.id === 'event') return false;
          if (isCreatingNew) {
            return ADMIN_CREATABLE_ITEM_CATEGORIES.includes(
              c.id as (typeof ADMIN_CREATABLE_ITEM_CATEGORIES)[number]
            );
          }
          return true;
        })
      : [{ id: 'event', label: CATEGORIES.event.label }];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = form.getValues('images') || [];
    if (currentImages.length >= 5) {
      showToast('Você já atingiu o limite de 5 fotos.', 'error');
      return;
    }

    const filesArray = Array.from(files);
    const filesToUpload = filesArray.slice(0, 5 - currentImages.length);

    setIsUploading(true);
    try {
      const folderName = activeTab === 'items' ? 'guia_local' : 'agenda_eventos';
      const uploadedUrls = await Promise.all(
        filesToUpload.map((file) => uploadImageUseCase(file, folderName))
      );

      const newImages = [...currentImages, ...uploadedUrls];
      form.setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
      if (!form.getValues('image') && uploadedUrls[0]) {
        form.setValue('image', uploadedUrls[0], { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      showToast(getImageUploadErrorMessage(error), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Sem a lista real de sessões, salvar trataria as sessões existentes como removidas.
  const occurrencesBlocked = occurrencesState === 'loading' || occurrencesState === 'error';

  const handleSaveWrapper = form.handleSubmit(
    async (values) => {
      if (occurrencesBlocked) {
        showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
        return;
      }
      setIsLoading(true);
      try {
        const firstOccurrence = values.occurrences?.[0];
        const keptIds = new Set(
          (values.occurrences ?? []).map((occ) => occ.id).filter((id): id is string => Boolean(id))
        );
        await onSave({
          ...isEditing,
          ...values,
          category: values.category as GuideItem['category'],
          date: firstOccurrence?.startsAt || values.date,
          endDate: firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
          occurrences: values.occurrences,
          removedOccurrenceIds: savedOccurrenceIdsRef.current.filter((id) => !keptIds.has(id)),
        });
      } finally {
        setIsLoading(false);
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      const nestedMessage =
        firstError && typeof firstError === 'object' && 'message' in firstError
          ? firstError.message
          : Array.isArray(firstError)
            ? firstError[0]?.startsAt?.message ||
              firstError[0]?.endsAt?.message ||
              firstError[0]?.capacity?.message
            : undefined;
      showToast(
        String(nestedMessage ?? 'Verifique os campos do formulário.'),
        'error'
      );
    }
  );

  const handleDeleteWrapper = async () => {
    setIsLoading(true);
    try {
      await onDeleteConfirm(isEditing.id);
      setIsEditing(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('[AdminEditorModal] excluir', err);
      showToast('Não foi possível excluir o registro.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div
        style={{ zIndex: Z_INDEX.modal }}
        className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
        id="editor-modal-container"
      >
        <motion.div
          initial={{ y: '100%', scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: '100%', scale: 0.95 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[95vh] shadow-2xl"
        >
          <div className="p-8 pb-4 flex items-center justify-between" id="editor-modal-header">
            <div>
              <h3 className="text-2xl font-display font-extrabold tracking-tight">
                {isEditing.id ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mt-1">
                Configuração de propriedades
              </p>
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => {
                setIsEditing(null);
                setShowDeleteConfirm(false);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className="p-8 pt-4 overflow-y-auto space-y-6 no-scrollbar pb-10 flex-1"
            id="editor-modal-scrollable"
          >
            <AnimatePresence mode="wait">
              {showDeleteConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-12 flex flex-col items-center text-center space-y-6"
                  id="modal-delete-confirmation"
                >
                  <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 mb-2 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                    <Trash2 size={44} />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-extrabold text-white">
                      Confirmar Exclusão?
                    </h4>
                    <p className="text-white/50 text-sm mt-2 max-w-[240px] mx-auto">
                      Esta ação é permanente e não poderá ser desfeita no banco de dados.
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteWrapper}
                      disabled={isLoading}
                      className="w-full min-h-[44px] bg-rose-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                      id="btn-confirm-destruction"
                    >
                      {isLoading ? (
                        <RefreshCw className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Sim, Excluir Registro
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="w-full min-h-[44px] bg-white/5 text-white/50 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <AdminEditorBasicInfo
                    isAdminUser={isAdminUser}
                    availableCategories={availableCategories}
                  />

                  <AdminEditorGallery
                    isUploading={isUploading}
                    onImageUpload={handleImageUpload}
                  />

                  {activeTab === 'events' && (
                    <AdminEditorEventFields
                      eventListingId={isEditing.id || undefined}
                      occurrencesState={occurrencesState}
                    />
                  )}

                  <AdminEditorLocation />

                  {activeTab === 'items' && <AdminEditorOperationalInfo />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AdminEditorActions
            hasId={Boolean(isEditing.id)}
            isLoading={isLoading}
            showDeleteConfirm={showDeleteConfirm}
            onSave={handleSaveWrapper}
            onRequestDelete={() => setShowDeleteConfirm(true)}
          />
        </motion.div>
      </div>
    </FormProvider>
  );
}
