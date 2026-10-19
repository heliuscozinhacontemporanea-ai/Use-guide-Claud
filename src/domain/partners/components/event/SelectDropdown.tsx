import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../shared/utils/cn';

export interface SelectDropdownOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  options: SelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage?: string;
  /** Espaço à esquerda para um ícone posicionado por quem usa. */
  withIcon?: boolean;
  ariaLabel: string;
}

/** Lista suspensa do editor de evento; fecha ao escolher ou ao clicar fora. */
export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder,
  emptyMessage,
  withIcon = false,
  ariaLabel,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl pr-5 py-4 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all text-left flex items-center justify-between hover:bg-white/10',
          withIcon ? 'pl-12' : 'pl-5'
        )}
      >
        <span className={selected ? 'text-white' : 'text-white/50'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('text-white/50 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar"
        >
          {options.length === 0 && emptyMessage ? (
            <div className="px-5 py-3.5 text-white/50 text-xs">{emptyMessage}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full min-h-[44px] px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
              >
                <span
                  className={option.value === value ? 'text-indigo-400 font-bold' : 'text-white/80'}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <Check size={14} className="text-indigo-400" aria-hidden="true" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
