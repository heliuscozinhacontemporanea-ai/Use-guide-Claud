import { motion } from 'motion/react';
import { LICENSES } from '../../data/licenses';

export function AboutLicensesTab() {
  return (
    <motion.div
      key="licenses-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="space-y-2 text-left"
    >
      {LICENSES.map((pkg, idx) => (
        <div
          key={idx}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white">{pkg.name}</span>
            <span className="text-[7px] font-mono font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded-full">
              {pkg.license}
            </span>
          </div>
          <p className="text-[8px] font-mono text-white/50">{pkg.copyright}</p>
          <p className="text-[9px] text-white/60 leading-snug font-sans">{pkg.description}</p>
        </div>
      ))}
    </motion.div>
  );
}
