import { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
          style={{ zIndex: Z_INDEX.overlay }}
        />
        <RadixDialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-2xl backdrop-blur-xl text-white outline-none animate-scale-in',
            className
          )}
          style={{ zIndex: Z_INDEX.modal }}
        >
          {title && (
            <RadixDialog.Title className="text-lg font-bold text-white tracking-tight mb-1">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="text-xs text-white/60 mb-4 leading-relaxed">
              {description}
            </RadixDialog.Description>
          )}

          {children}

          <RadixDialog.Close
            aria-label="Fechar modal"
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <X size={20} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
