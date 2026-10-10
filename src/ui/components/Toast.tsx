import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Z_INDEX } from '../../shared/constants/zIndex';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  info: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
};

interface ToastContainerProps {
  toasts: ToastData[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center w-full px-4 pointer-events-none"
      style={{ zIndex: Z_INDEX.toast }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg max-w-sm w-full pointer-events-auto ${COLORS[toast.type]}`}
            >
              <Icon size={18} className="shrink-0" />
              <p className="text-sm font-medium text-white/90">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
