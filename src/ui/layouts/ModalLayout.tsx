import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayClassName?: string;
  containerClassName?: string;
  zIndexClass?: string;
  zIndex?: number;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function ModalLayout({
  isOpen,
  onClose,
  children,
  overlayClassName = 'bg-black/[0.15] backdrop-blur-md',
  containerClassName = 'bg-slate-950 border border-white/20 rounded-[2.5rem]',
  zIndexClass,
  zIndex = Z_INDEX.modal,
  scrollRef,
}: ModalLayoutProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className={cn(
            'fixed inset-0 p-4 flex items-center justify-center overflow-hidden',
            overlayClassName,
            zIndexClass
          )}
        >
          <motion.div
            ref={scrollRef}
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={cn(
              'w-full max-w-lg h-[85vh] overflow-y-auto no-scrollbar relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]',
              containerClassName
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
