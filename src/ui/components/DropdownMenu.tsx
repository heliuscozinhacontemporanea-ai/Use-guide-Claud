import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={8}
          className="min-w-[180px] p-1.5 rounded-2xl bg-neutral-900/95 border border-white/10 shadow-xl backdrop-blur-xl animate-scale-in outline-none"
          style={{ zIndex: Z_INDEX.dropdown }}
        >
          {items.map((item, index) => (
            <RadixDropdownMenu.Item
              key={index}
              disabled={item.disabled ?? false}
              onClick={item.onClick}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
                item.destructive
                  ? 'text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10',
                item.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </RadixDropdownMenu.Item>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}
