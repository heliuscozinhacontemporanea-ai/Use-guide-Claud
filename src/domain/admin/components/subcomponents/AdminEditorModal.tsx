import { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, RefreshCw } from 'lucide-react';
import { CATEGORIES } from '../../../../shared/constants/categories';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import {
  eventDateRangeFromSessions,
  listEventOccurrencesUseCase,
  validateEventSessions,
  type EventSessionsLoadState,
} from '../../../events';
import type { GuideItem } from '../../../guide';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
import {
  adminGuideEditorFormSchema,
  type AdminGuideEditorSchemaValues,
} from '../../schemas/adminGuideEditorFormSchema';
import { AdminEditorBasicInfo } from './AdminEditorBasicInfo';
import { AdminEditorGallery } from './AdminEditorGallery';
import { AdminEditorLocation } from './AdminEditorLocation';
import { AdminEditorEventFields, type AdminEventSlots } from './AdminEditorEventFields';
import { AdminEditorActions } from './AdminEditorActions';

// Atrações e passeios usam o editor de cadastro do parceiro (decisão D9); aqui ficam as dicas.
export const ADMIN_CREATABLE_ITEM_CATEGORIES = ['tips'] as const;

export type AdminEditorSaveData = GuideItem & {
  occurrences?: AdminGuideEditorSchemaValues['occurrences'];
  /** Sessões que existiam quando o editor abriu (as ausentes de `occurrences` são apagadas). */
  savedOccurrenceIds?: string[];
};

interface AdminEditorModalProps extends AdminEventSlots {
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
  renderSessionsField,
  renderTicketingManager,
}: AdminEditorModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useUI();
  const [occurrencesState, setOccurrencesState] = useState<EventSessionsLoadState>('idle');
  const savedOccurrenceIdsRef = useRef<string[]>([]);

  const form = useForm<AdminGuideEditorSchemaValues>({
    defaultValues: {
      name: isEditing.name || '',
      description: isEditing.description || '',
      image: isEditing.image || '',
      images: isEditing.images || [],
      category: isEditing.category || (activeTab === 'events' ? 'event' : 'tips'),
      location: isEditing.location || 'Jericoacoara',
      instagramLink: isEditing.instagramLink || '',
      websiteLink: isEditing.websiteLink || '',
      phone: isEditing.phone || '',
      googleMapsLink: isEditing.googleMapsLink || '',
      eventCategory: isEditing.eventCategory || '',
      customCategory: isEditing.customCategory || '',
      date: isEditing.date || new Date().toISOString(),
      endDate: isEditing.endDate || new Date().toISOString(),
      occurrences: [],
    },
  });

  const { handleSubmit, setValue, watch, reset } = form;

  useEffect(() => {
    reset({
      name: isEditing.name || '',
      description: isEditing.description || '',
      image: isEditing.image || '',
      images: isEditing.images || [],
      category: isEditing.category || (activeTab === 'events' ? 'event' : 'tips'),
      location: isEditing.location || 'Jericoacoara',
      instagramLink: isEditing.instagramLink || '',
      websiteLink: isEditing.websiteLink || '',
      phone: isEditing.phone || '',
      googleMapsLink: isEditing.googleMapsLink || '',
      eventCategory: isEditing.eventCategory || '',
      customCategory: isEditing.customCategory || '',
      date: isEditing.date || new Date().toISOString(),
      endDate: isEditing.endDate || new Date().toISOString(),
      occurrences: [],
    });
    savedOccurrenceIdsRef.current = [];

    if (activeTab === 'events' && isEditing.id) {
      setOccurrencesState('loading');
      listEventOccurrencesUseCase(isEditing.id)
        .then((occurrences) => {
          savedOccurrenceIdsRef.current = occurrences.map((occ) => occ.id);
          setValue(
            'occurrences',
            occurrences.map((occ) => ({
              id: occ.id,
              startsAt: occ.startsAt,
              endsAt: occ.endsAt,
              capacity: occ.capacity,
            }))
          );
          setOccurrencesState('ready');
        })
        .catch((err) => {
          console.error('[AdminEditorModal] load occurrences:', err);
          setOccurrencesState('error');
        });
    } else {
      setOccurrencesState('ready');
    }
  }, [isEditing, activeTab, reset, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      const currentImages = watch('images') || [];
      for (const file of Array.from(files)) {
        const url = await uploadImageUseCase(file, 'guia_local');
        urls.push(url);
      }
      const combined = [...currentImages, ...urls].slice(0, 5);
      setValue('images', combined, { shouldDirty: true });
      if (!watch('image') && combined[0]) {
        setValue('image', combined[0], { shouldDirty: true });
      }
      showToast('Imagem(ns) enviada(s) com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro no upload:', err);
      showToast(getImageUploadErrorMessage(err), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (activeTab === 'events') {
      if (occurrencesState === 'loading' || occurrencesState === 'error') {
        showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
        return;
      }
      const sessions = values.occurrences ?? [];
      const sessionsError = validateEventSessions(sessions);
      if (sessionsError) {
        showToast(sessionsError, 'error');
        return;
      }
      setIsLoading(true);
      try {
        await onSave({
          ...isEditing,
          ...values,
          category: values.category as GuideItem['category'],
          ...(activeTab === 'events' ? eventDateRangeFromSessions(sessions) : {}),
          occurrences: sessions,
          savedOccurrenceIds: savedOccurrenceIdsRef.current,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const parsed = adminGuideEditorFormSchema.safeParse(values);
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message || 'Preencha os campos obrigatórios', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...isEditing,
        ...parsed.data,
        category: parsed.data.category as GuideItem['category'],
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 bg-[#020508]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-display font-black text-white">
              {isEditing.id ? 'Editar Registro' : 'Novo Registro'}
            </h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
              {activeTab === 'events' ? 'Evento' : 'Dica ou Ponto de Interesse'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(null)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
            <AdminEditorBasicInfo
              isAdminUser={isAdminUser}
              availableCategories={Object.values(CATEGORIES).map((c) => ({ id: c.id, label: c.label }))}
            />

            {activeTab === 'events' ? (
              <AdminEditorEventFields
                eventListingId={isEditing.id || undefined}
                occurrencesState={occurrencesState}
                renderSessionsField={renderSessionsField}
                renderTicketingManager={renderTicketingManager}
              />
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Categoria <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  {...form.register('category')}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
                >
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <AdminEditorGallery
              isUploading={isUploading}
              onImageUpload={handleImageUpload}
            />

            <AdminEditorLocation />

            <AdminEditorActions
              hasId={Boolean(isEditing.id)}
              isLoading={isLoading}
              showDeleteConfirm={showDeleteConfirm}
              onSave={onSubmit}
              onRequestDelete={() => setShowDeleteConfirm(true)}
            />
          </form>
        </FormProvider>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            style={{ zIndex: Z_INDEX.modalNested }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-white">Excluir registro?</h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (isEditing.id) {
                      await onDeleteConfirm(isEditing.id);
                    }
                    setShowDeleteConfirm(false);
                    setIsEditing(null);
                  }}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
