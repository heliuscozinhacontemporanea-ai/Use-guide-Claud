import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useSwipeToClose } from './useSwipeToClose';
import { useUIStore } from '../../shared/stores/useUIStore';

interface SidebarLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isCropping?: boolean;
  onSettingsClick?: () => void;
}

interface MenuCustomProps {
  isSwipeClosing?: boolean;
  isLoginClosingBySwipe?: boolean;
}

const menuVariants = {
  initial: {
    x: '-100vw',
    y: 0,
    scale: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  normal: (custom?: MenuCustomProps) => ({
    x: 0,
    y: 0,
    scale: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    transition: {
      duration: custom?.isLoginClosingBySwipe ? 0.22 : 0.45,
      ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
    },
  }),
  retracted: {
    x: 0,
    y: 16,
    scale: 0.9,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: (custom?: MenuCustomProps) => ({
    x: '-100vw',
    transition: custom?.isSwipeClosing
      ? { duration: 0 }
      : { duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  }),
};

export function SidebarLayout({
  isOpen,
  onClose,
  children,
  isCropping = false,
  onSettingsClick,
}: SidebarLayoutProps) {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
  const isLoginClosingBySwipe = useUIStore((state) => state.isLoginClosingBySwipe);
  const { containerRef, x, isSwipeClosingRef } = useSwipeToClose({
    onClose,
    enabled: isOpen && !isCropping,
    threshold: 90,
  });

  const customProps: MenuCustomProps = {
    isSwipeClosing: isSwipeClosingRef.current,
    isLoginClosingBySwipe,
  };

  const isRetracted = isLoginModalOpen && !isLoginClosingBySwipe;

  const menuContent = (
    <AnimatePresence mode="wait" custom={customProps}>
      {isOpen && (
        <motion.div
          ref={containerRef}
          key="side-menu-fullscreen"
          custom={customProps}
          variants={menuVariants}
          initial="initial"
          animate={isRetracted ? 'retracted' : 'normal'}
          exit="exit"
          style={{
            x,
            zIndex: Z_INDEX.modal,
            transformOrigin: 'top center',
            willChange: 'transform',
          }}
          className={cn(
            'fixed inset-0 w-full h-[100dvh] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col',
            isCropping ? 'bg-black' : 'bg-black text-white'
          )}
        >
          <div
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)',
            }}
            className="w-full max-w-[480px] mx-auto min-h-full flex-1 flex flex-col p-6 sm:p-8 relative no-scrollbar"
          >
            {onSettingsClick && !isCropping && (
              <button
                type="button"
                onClick={onSettingsClick}
                aria-label="Configurações"
                className="absolute top-[30px] right-6 sm:top-[38px] sm:right-8 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition-all z-20 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Settings size={25} />
              </button>
            )}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
