import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { useSwipeDownToClose } from '../hooks/useSwipeDownToClose';

interface AuthModalShellProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const sheetVariants = {
  initial: {
    y: '100vh',
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: (isSwipeClosing: boolean) => ({
    y: '100vh',
    transition: isSwipeClosing
      ? { duration: 0 }
      : { duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  }),
};

export function AuthModalShell({ isOpen, onClose, children }: AuthModalShellProps) {
  const { containerRef, y, isSwipeClosingRef } = useSwipeDownToClose({
    onClose,
    enabled: isOpen,
    threshold: 90,
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait" custom={isSwipeClosingRef.current}>
      {isOpen && (
        <div
          style={{ zIndex: Z_INDEX.modalNested }}
          className="fixed inset-0 overflow-hidden pointer-events-none"
        >
          <motion.div
            ref={containerRef}
            custom={isSwipeClosingRef.current}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ y }}
            className="fixed inset-x-0 bottom-0 top-[40px] w-full max-w-[480px] mx-auto bg-zinc-850 backdrop-blur-2xl rounded-t-[15px] border-t border-x border-white/15 flex flex-col overflow-hidden pointer-events-auto"
          >
            <div
              data-drag-handle="true"
              className="w-full pt-2 pb-3 flex justify-center items-center cursor-grab active:cursor-grabbing shrink-0 touch-none select-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-white/50 hover:bg-white/70 transition-colors" />
            </div>

            <div
              data-scroll-container="true"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)',
              }}
              className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col"
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
