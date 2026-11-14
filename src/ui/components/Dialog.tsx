import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { type ReactNode, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/utils/cn';
import { useSheetLayer } from '../motion/sheetLayers';
import { DialogPanel } from './sheet/DialogPanel';
import { useSheetHistory } from './sheet/useSheetHistory';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Aberto por cima de outro modal (ex.: termos dentro do checkout). */
  nested?: boolean;
  /** false: passo obrigatório, sem botão fechar, Esc, toque fora, arraste nem voltar. */
  dismissible?: boolean;
}

/**
 * Toda folha ou diálogo do app (DESIGN.md §7, §9, D33). No celular é uma folha que sobe com a mola
 * padrão, fecha arrastando para baixo e entra no histórico; a primeira folha aberta faz o app virar
 * cartão e as de baixo recuam. Do `sm:` em diante é um cartão central.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  nested = false,
  dismissible = true,
}: DialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const layer = useSheetLayer(id, open);
  // A folha de baixo continua puxando o fundo enquanto sai, já fora da lista de abertas.
  const drivesBackdrop = useRef(false);
  if (open) drivesBackdrop.current = layer.isBottom;
  const releaseVelocity = useRef<number | undefined>(undefined);

  useSheetHistory(id, open && dismissible, () => onOpenChange(false));

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount key="dialog">
            <DialogPanel
              nested={nested}
              dismissible={dismissible}
              drivesBackdrop={drivesBackdrop.current}
              receded={layer.hasAbove}
              className={className}
              releaseVelocity={releaseVelocity}
              onDragClose={(velocity) => {
                releaseVelocity.current = velocity;
                onOpenChange(false);
              }}
            >
              <div
                aria-hidden="true"
                className="mx-auto -mt-2 mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden"
              />
              {title && (
                <RadixDialog.Title className="text-title font-semibold text-ink mb-1 pr-10">
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="text-meta text-ink-muted mb-4">
                  {description}
                </RadixDialog.Description>
              )}

              {children}

              {dismissible && (
                <RadixDialog.Close
                  aria-label={t('common.close')}
                  className={cn(
                    'press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-ink/[0.06]',
                    'focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none'
                  )}
                >
                  <X size={20} aria-hidden="true" />
                </RadixDialog.Close>
              )}
            </DialogPanel>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
