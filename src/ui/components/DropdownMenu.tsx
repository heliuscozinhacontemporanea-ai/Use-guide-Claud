import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

export interface DropdownMenuItem {
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
          className="min-w-[200px] p-1.5 rounded-2xl bg-surface-solid border border-line shadow-xl animate-scale-in motion-reduce:animate-none outline-none"
          style={{ zIndex: Z_INDEX.popover }}
        >
          {items.map((item, index) => (
            <RadixDropdownMenu.Item
              key={index}
              disabled={item.disabled ?? false}
              onSelect={item.onClick}
              className={cn(
                'flex items-center gap-2.5 min-h-11 px-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
                item.destructive
                  ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
                  : 'text-ink hover:bg-ink/[0.06] focus:bg-ink/[0.06]',
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
