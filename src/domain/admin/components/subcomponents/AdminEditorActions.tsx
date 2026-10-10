import React from 'react';
import { RefreshCw, Save, Trash2 } from 'lucide-react';

interface AdminEditorActionsProps {
  hasId: boolean;
  isLoading: boolean;
  showDeleteConfirm: boolean;
  onSave: () => void;
  onRequestDelete: () => void;
}

export function AdminEditorActions({
  hasId,
  isLoading,
  showDeleteConfirm,
  onSave,
  onRequestDelete,
}: AdminEditorActionsProps) {
  if (showDeleteConfirm) {
    return null;
  }

  return (
    <div className="p-8 pt-2 border-t border-white/5 pb-12 sm:pb-8" id="editor-modal-footer">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading}
          className="flex-1 sm:flex-none sm:min-w-[240px] min-h-[44px] bg-teal-500 text-black py-5 px-12 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-teal-400 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-teal-500/30 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          id="btn-trigger-save"
        >
          {isLoading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <Save size={18} strokeWidth={3} />
          )}
          Salvar
        </button>

        {hasId && (
          <button
            type="button"
            aria-label="Excluir Registro"
            onClick={onRequestDelete}
            disabled={isLoading}
            className="min-w-[44px] min-h-[44px] p-5 bg-rose-500/10 text-rose-500 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            title="Excluir Registro"
            id="btn-trigger-destruction-modal"
          >
            <Trash2 size={20} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
