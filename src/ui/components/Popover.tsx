import { ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
  className?: string;
}

export function Popover({
  trigger,
  children,
  align = 'center',
  side = 'bottom',
  showCloseButton = false,
  className,
}: PopoverProps) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          side={side}
          sideOffset={8}
          className={cn(
            'p-4 rounded-2xl bg-neutral-900/95 border border-white/10 shadow-2xl backdrop-blur-xl text-white outline-none animate-scale-in max-w-xs w-full',
            className
          )}
          style={{ zIndex: Z_INDEX.dropdown }}
        >
          {children}

          {showCloseButton && (
            <RadixPopover.Close
              aria-label="Fechar popover"
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <X size={16} />
            </RadixPopover.Close>
          )}

          <RadixPopover.Arrow className="fill-neutral-900/95" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
