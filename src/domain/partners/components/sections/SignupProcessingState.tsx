import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

export function SignupProcessingState() {
  return (
    <>
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="w-24 h-24 rounded-[2rem] border-2 border-indigo-500/20 border-t-indigo-500"
        />
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
          <Rocket size={40} className="animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-2" role="status">
        <h3 className="text-xl font-black text-white uppercase">Processando...</h3>
        <p className="text-white/50 text-sm max-w-[280px]">
          Estamos preparando seu perfil e subindo as informações. Quase lá!
        </p>
      </div>
    </>
  );
}
