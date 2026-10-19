import { RefreshCw, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChangeEvent, ReactNode } from 'react';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import type { EventSessionsFieldProps, EventSessionsLoadState } from '../../events';
import type { PartnerBusiness } from '../types/partner';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { PartnerEventForm } from './PartnerEventForm';

interface PartnerEventEditorProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  businesses?: PartnerBusiness[];
  sessionsLoadState: EventSessionsLoadState;
  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
  showDeleteConfirm: boolean;
  onRequestDelete: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

/** Modal do editor de evento do parceiro, com a confirmação de exclusão. Não fecha ao clicar fora. */
export function PartnerEventEditor({
  item,
  onChange,
  onClose,
  onSave,
  isLoading,
  isUploading,
  onImageUpload,
  businesses,
  sessionsLoadState,
  renderSessionsField,
  renderEventTicketingManager,
  showDeleteConfirm,
  onRequestDelete,
  onConfirmDelete,
}: PartnerEventEditorProps) {
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
          aria-labelledby="partner-event-editor-title"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
          className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
        >
          <div className="p-8 flex items-center justify-between flex-shrink-0">
            <div>
              <h3
                id="partner-event-editor-title"
                className="text-xl font-display font-black text-white tracking-tight"
              >
                {item.id ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <p className="text-[10px] text-white/50 font-medium tracking-wide">
                Preencha os detalhes do seu evento
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar editor de evento"
              className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl text-white/50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <PartnerEventForm
            item={item}
            onChange={onChange}
            isUploading={isUploading}
            onImageUpload={onImageUpload}
            businesses={businesses}
            sessionsLoadState={sessionsLoadState}
            renderSessionsField={renderSessionsField}
            renderEventTicketingManager={renderEventTicketingManager}
          />

          <div className="p-8 border-t border-white/5 flex gap-3 items-center flex-shrink-0">
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 min-h-[44px] bg-[#00D4FF] text-black py-4 rounded-2xl font-semibold tracking-wide text-[12px] shadow-lg shadow-[#00D4FF]/20 active:scale-95 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {isLoading && <RefreshCw className="animate-spin" size={16} aria-hidden="true" />}
              Salvar
            </button>
            {item.id && (
              <button
                type="button"
                onClick={() => onRequestDelete(true)}
                disabled={isLoading}
                aria-label="Excluir evento"
                className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
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
              aria-labelledby="partner-event-delete-title"
              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
                <Trash2 size={32} aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="partner-event-delete-title"
                  className="text-lg font-display font-black text-white"
                >
                  Excluir {item.name || 'evento'}?
                </h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isLoading}
                  className="w-full min-h-[44px] bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDelete(false)}
                  className="w-full min-h-[44px] bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
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
