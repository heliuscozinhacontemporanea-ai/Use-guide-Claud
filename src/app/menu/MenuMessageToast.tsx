import { AnimatePresence, motion } from 'motion/react';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { cn } from '../../shared/utils/cn';

interface MenuMessage {
  type: 'success' | 'error';
  text: string;
}

/** Aviso curto do perfil (salvou, erro), por cima da folha; toque fecha. */
export function MenuMessageToast({
  message,
  onDismiss,
}: {
  message: MenuMessage | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ zIndex: Z_INDEX.toast }}
          className={cn(
            'absolute top-4 left-4 right-4 p-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl cursor-pointer text-white',
            message.type === 'success'
              ? 'bg-teal-500/80 border-teal-500/40 shadow-teal-500/20'
              : 'bg-rose-500/80 border-rose-500/40 shadow-rose-500/20'
          )}
          onClick={onDismiss}
        >
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
