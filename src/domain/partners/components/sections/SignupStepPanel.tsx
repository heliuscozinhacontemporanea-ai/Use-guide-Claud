import type React from 'react';
import { motion } from 'motion/react';

/** Use com `key` por etapa: o `AnimatePresence` do modal anima a saída pela troca de chave. */
interface SignupStepPanelProps {
  className: string;
  children: React.ReactNode;
}

export function SignupStepPanel({ className, children }: SignupStepPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
