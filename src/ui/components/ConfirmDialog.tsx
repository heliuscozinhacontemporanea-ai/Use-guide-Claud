import * as RadixDialog from '@radix-ui/react-dialog';
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Z_INDEX } from '../../shared/constants/zIndex';

export interface ConfirmDialogData {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmDialogProps {
  data: ConfirmDialogData | null;
}

export function ConfirmDialog({ data }: ConfirmDialogProps) {
  return (
    <RadixDialog.Root
      open={!!data}
      onOpenChange={(open) => {
        if (!open && data) data.onCancel();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          style={{ zIndex: Z_INDEX.overlay }}
        />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs outline-none animate-scale-in"
          style={{ zIndex: Z_INDEX.modalNested }}
        >
          <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
            <AlertTriangle size={28} className="text-amber-400" />
            <RadixDialog.Title className="text-sm font-medium text-white/90 leading-relaxed">
              {data?.message}
            </RadixDialog.Title>
            <div className="flex gap-3 w-full">
              <button
                onClick={data?.onCancel}
                aria-label="Cancelar"
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wide hover:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={data?.onConfirm}
                aria-label="Confirmar"
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500/80 text-white text-xs font-bold uppercase tracking-wide hover:bg-rose-500 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:outline-none"
              >
                Confirmar
              </button>
            </div>
          </GlassCard>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
