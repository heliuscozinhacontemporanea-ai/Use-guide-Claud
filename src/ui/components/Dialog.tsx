import { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Aberto por cima de outro modal (ex.: termos dentro do checkout). */
  nested?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  nested = false,
}: DialogProps) {
  const { t } = useTranslation();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-scrim backdrop-blur-md animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.overlay }}
        />
        {/* Celular: folha que sobe da borda (como num app nativo). Do sm em diante: cartão central. */}
        <RadixDialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 mx-auto w-full max-w-md max-h-[92dvh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-3xl bg-surface border border-line shadow-2xl backdrop-blur-xl text-ink outline-none overscroll-contain animate-sheet-up data-[state=closed]:animate-sheet-down motion-reduce:animate-none',
            'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:pb-6 sm:rounded-3xl sm:animate-scale-in sm:data-[state=closed]:animate-scale-out',
            className
          )}
          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
          // O Radix foca o primeiro controle (o botão fechar) e o anel de foco aparece sem o usuário usar o teclado.
          // Focar a própria folha mantém o Tab e o leitor de tela começando dentro do diálogo.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
          <div
            aria-hidden="true"
            className="mx-auto -mt-2 mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden"
          />
          {title && (
            <RadixDialog.Title className="text-lg font-bold text-ink tracking-tight mb-1 pr-10">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="text-xs text-ink/70 mb-4 leading-relaxed">
              {description}
            </RadixDialog.Description>
          )}

          {children}

          <RadixDialog.Close
            aria-label={t('common.close')}
            className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-ink/60 hover:text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <X size={20} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
