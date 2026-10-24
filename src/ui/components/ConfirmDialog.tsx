import * as RadixDialog from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/utils/cn';
import { GlassCard } from './GlassCard';
import { Z_INDEX } from '../../shared/constants/zIndex';

/** `danger` (padrão) para excluir ou cancelar; `positive` para aprovar ou liberar algo. */
export type ConfirmDialogTone = 'danger' | 'positive';

export interface ConfirmDialogData {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: ConfirmDialogTone;
  /** Rótulo do botão de confirmar; o padrão é "Confirmar". */
  confirmLabel?: string;
}

interface ConfirmDialogProps {
  data: ConfirmDialogData | null;
}

export function ConfirmDialog({ data }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const positive = data?.tone === 'positive';
  const Icon = positive ? CheckCircle2 : AlertTriangle;
  return (
    <RadixDialog.Root
      open={!!data}
      onOpenChange={(open) => {
        if (!open && data) data.onCancel();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-scrim backdrop-blur-sm animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
          style={{ zIndex: Z_INDEX.overlay }}
        />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none"
          style={{ zIndex: Z_INDEX.modalNested }}
        >
          <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
            <Icon
              size={28}
              className={positive ? 'text-success' : 'text-warn'}
              aria-hidden="true"
            />
            <RadixDialog.Title className="text-sm font-medium text-white/90 leading-relaxed">
              {data?.message}
            </RadixDialog.Title>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={data?.onCancel}
                className="press flex-1 min-h-[44px] py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wide hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={data?.onConfirm}
                className={cn(
                  'press flex-1 min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide focus-visible:ring-2 focus-visible:outline-none',
                  positive
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-emerald-400/50'
                    : 'bg-rose-600 !text-[#fff8f0] hover:bg-rose-500 focus-visible:ring-rose-400/50'
                )}
              >
                {data?.confirmLabel ?? t('common.confirm')}
              </button>
            </div>
          </GlassCard>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
