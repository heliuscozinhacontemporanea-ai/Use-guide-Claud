import { motion } from 'motion/react';
import { LegalTermsDocument } from '../../../../ui/legal/LegalTermsDocument';

/** Termos de uso, compras e cancelamento, termos do parceiro e privacidade (D15). */
export function AboutTermsTab() {
  return (
    <motion.div
      key="terms-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="p-4 rounded-2xl bg-surface border border-line text-left"
    >
      <LegalTermsDocument />
    </motion.div>
  );
}
