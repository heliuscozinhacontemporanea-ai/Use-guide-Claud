import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

const COUNTRY_CODES = [
  { code: '+55', name: 'Brasil' },
  { code: '+1', name: 'EUA/Canadá' },
  { code: '+351', name: 'Portugal' },
  { code: '+34', name: 'Espanha' },
  { code: '+33', name: 'França' },
  { code: '+44', name: 'Reino Unido' },
  { code: '+49', name: 'Alemanha' },
  { code: '+39', name: 'Itália' },
  { code: '+54', name: 'Argentina' },
  { code: '+598', name: 'Uruguai' },
  { code: '+56', name: 'Chile' },
  { code: '+57', name: 'Colômbia' },
  { code: '+52', name: 'México' },
  { code: '+81', name: 'Japão' },
  { code: '+86', name: 'China' },
];

interface PhoneInputFieldProps {
  id?: string;
  phone: string;
  ddi: string;
  onPhoneChange: (phone: string) => void;
  onDdiChange: (ddi: string) => void;
  required?: boolean;
}

export interface PhoneInputFieldRef {
  validate: () => boolean;
  focus: () => void;
}

export const PhoneInputField = forwardRef<PhoneInputFieldRef, PhoneInputFieldProps>(
  ({ id = 'phone-input-field', phone, ddi, onPhoneChange, onDdiChange, required = false }, ref) => {
    const [isDDIOpen, setIsDDIOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);

    // Fecha o dropdown de DDI ao clicar fora
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDDIOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Formatação automática do telefone (ajuda na digitação do usuário)
    const formatPhoneNumber = (value: string, currentDdi: string) => {
      const rawDigits = value.replace(/\D/g, '');
      if (currentDdi === '+55') {
        // Aplica máscara (XX) XXXXX-XXXX
        if (rawDigits.length <= 2) {
          return rawDigits;
        } else if (rawDigits.length <= 6) {
          return `(${rawDigits.slice(0, 2)}) ${rawDigits.slice(2)}`;
        } else if (rawDigits.length <= 10) {
          return `(${rawDigits.slice(0, 2)}) ${rawDigits.slice(2, 6)}-${rawDigits.slice(6)}`;
        } else {
          return `(${rawDigits.slice(0, 2)}) ${rawDigits.slice(2, 7)}-${rawDigits.slice(7, 11)}`;
        }
      }
      // Para outros DDIs, deixa livre
      return value;
    };

    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const originalValue = e.target.value;
      const formatted = formatPhoneNumber(originalValue, ddi);
      onPhoneChange(formatted);

      // Se houver erro ativo, limpa ou atualiza na digitação rápida
      if (errorMsg) {
        const numericDigits = originalValue.replace(/\D/g, '');
        if (ddi !== '+55' || numericDigits.length >= 11) {
          setErrorMsg(null);
        }
      }
    };

    const handleDdiInputChange = (value: string) => {
      // Garante que comece com + se o usuário digitar sem
      let formattedDdi = value;
      if (formattedDdi && !formattedDdi.startsWith('+')) {
        formattedDdi = '+' + formattedDdi;
      }
      onDdiChange(formattedDdi);
      setErrorMsg(null);
    };

    // Função de validação interna
    const validatePhone = (): boolean => {
      if (required && !phone.trim()) {
        setErrorMsg('Campo obrigatório');
        triggerScrollAndFocus();
        return false;
      }

      const numericDigits = phone.replace(/\D/g, '');
      if (ddi === '+55') {
        if (numericDigits.length > 0 && numericDigits.length < 11) {
          setErrorMsg('Número inserido inválido');
          triggerScrollAndFocus();
          return false;
        }
      }

      setErrorMsg(null);
      return true;
    };

    const triggerScrollAndFocus = () => {
      if (containerRef.current) {
        // Verifica se o elemento está visível no viewport antes de rolar
        const rect = containerRef.current.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
          containerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    };

    // Expõe a validação e o foco para os pais
    useImperativeHandle(ref, () => ({
      validate: validatePhone,
      focus: () => triggerScrollAndFocus(),
    }));

    // Validação no blur
    const handleBlur = () => {
      const numericDigits = phone.replace(/\D/g, '');
      if (ddi === '+55' && numericDigits.length > 0 && numericDigits.length < 11) {
        setErrorMsg('Número inserido inválido');
      } else {
        setErrorMsg(null);
      }
    };

    const hasValidationError = !!errorMsg;

    return (
      <div id={id} ref={containerRef} className="space-y-1.5 w-full relative">
        <div className="flex gap-3 items-start">
          {/* Caixa Pequena Editável (DDI) */}
          <div ref={dropdownRef} className="relative w-24 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={ddi}
                onChange={(e) => handleDdiInputChange(e.target.value)}
                className={cn(
                  'w-full h-12 px-3 pr-8 bg-white/5 border rounded-2xl text-xs font-bold text-white focus:outline-none transition-colors',
                  hasValidationError
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-slate-500/80'
                )}
                placeholder="+55"
              />
              <button
                type="button"
                onClick={() => setIsDDIOpen(!isDDIOpen)}
                className="absolute inset-y-0 right-2 flex items-center text-white/50 hover:text-white/60 transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', isDDIOpen && 'rotate-180')}
                />
              </button>
            </div>

            {/* Dropdown de códigos de países */}
            <AnimatePresence>
              {isDDIOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{ zIndex: Z_INDEX.dropdown }}
                  className="absolute left-0 mt-1.5 w-48 bg-zinc-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="max-h-48 overflow-y-auto py-1 no-scrollbar text-left">
                    {COUNTRY_CODES.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          onDdiChange(item.code);
                          setIsDDIOpen(false);
                          setErrorMsg(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-white/50">{item.code}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Caixa Maior Editável (Telefone) */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <Phone size={16} />
            </div>
            <input
              ref={phoneInputRef}
              type="tel"
              value={phone}
              onChange={handlePhoneInputChange}
              onBlur={handleBlur}
              placeholder={ddi === '+55' ? '(85) 99999-9999' : 'Telefone'}
              className={cn(
                'w-full h-12 bg-white/5 border rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none transition-all placeholder:text-white/50 font-medium',
                hasValidationError
                  ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500'
                  : 'border-white/10 focus:border-slate-500/80'
              )}
            />
          </div>
        </div>

        {/* Mensagem flutuante de erro */}
        <AnimatePresence>
          {hasValidationError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-red-400 font-bold tracking-wide uppercase mt-1 pl-1"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PhoneInputField.displayName = 'PhoneInputField';
