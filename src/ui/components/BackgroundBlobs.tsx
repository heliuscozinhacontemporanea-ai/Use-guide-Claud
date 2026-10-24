import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '../../shared/utils/cn';

export function BackgroundBlobs() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-all duration-700 ease-in-out',
        isLight
          ? 'bg-gradient-to-br from-[#f6f1e7] via-[#f3eee4] to-[#ece4d5]'
          : 'bg-gradient-to-br from-[#060B1E] via-[#010A01] to-[#000033]'
      )}
    >
      {/* Elegantes linhas de mapa em baixa opacidade para um look Glassmorphism premium */}
      <svg
        className={cn(
          'absolute inset-0 w-full h-full transition-all duration-700 ease-in-out',
          isLight ? 'opacity-[0.12] text-stone-400' : 'opacity-[0.06] text-cyan-500/60'
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grade de mapa bem delicada */}
          <pattern id="map-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="3 3"
            />
          </pattern>
        </defs>

        {/* Camada de grade */}
        <rect width="100%" height="100%" fill="url(#map-grid)" />

        {/* Linhas topográficas / contornos de rota */}
        <path
          d="M-100,250 C150,150 350,450 750,200 C1050,10 1250,320 1650,280 C1950,240 2050,550 2250,500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M-50,330 C200,210 380,510 780,270 C1100,90 1280,400 1680,350 C1980,310 2080,620 2280,570"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M-120,180 C120,60 320,380 720,120 C980,-60 1220,240 1600,200 C1900,160 2000,450 2180,410"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />

        {/* Avenidas / Linhas diagonais cruzadas imitando um mapa de rotas */}
        <line x1="-10%" y1="85%" x2="110%" y2="15%" stroke="currentColor" strokeWidth="1.5" />
        <line x1="25%" y1="-10%" x2="75%" y2="110%" stroke="currentColor" strokeWidth="1" />
        <line
          x1="-5%"
          y1="20%"
          x2="105%"
          y2="90%"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="6 3"
        />

        {/* Pontos de interesse do mapa (marcador sutil) */}
        <circle
          cx="80%"
          cy="35%"
          r="140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="10 5"
        />
        <circle cx="80%" cy="35%" r="70" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="80%" cy="35%" r="8" fill="currentColor" opacity="0.3" />
        <circle cx="80%" cy="35%" r="20" fill="none" stroke="currentColor" strokeWidth="1" />

        <circle
          cx="20%"
          cy="70%"
          r="200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="8 4"
        />
        <circle cx="20%" cy="70%" r="100" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <circle
          cx="20%"
          cy="70%"
          r="6"
          fill="currentColor"
          opacity="0.3"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Rotas secundárias e pontes */}
        <path
          d="M 20% 70% Q 40% 50% 80% 35%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
        <path d="M 20% 70% L 10% 90% L -5% 95%" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 80% 35% L 95% 15%" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Blobs de Gradiente flutuantes para a estética de vidro */}
      {/* Luz intensa no Canto Superior Esquerdo */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'absolute -top-[15%] -left-[15%] w-[600px] h-[600px] rounded-full blur-[140px] will-change-transform transition-all duration-700 ease-in-out',
          isLight ? 'bg-blue-400/[0.14]' : 'bg-blue-500/[0.18]'
        )}
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'absolute top-[5%] left-[10%] w-[450px] h-[450px] rounded-full blur-[120px] will-change-transform transition-all duration-700 ease-in-out',
          isLight ? 'bg-cyan-300/[0.10]' : 'bg-cyan-400/[0.12]'
        )}
      />

      {/* Luz central suave, deslocada ligeiramente para cima e para a esquerda */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[110px] will-change-transform transition-all duration-700 ease-in-out',
          isLight ? 'bg-indigo-400/[0.04]' : 'bg-indigo-500/[0.05]'
        )}
      />

      {/* Canto inferior direito intencionalmente mantido escuro (sem blobs de luz) */}
    </div>
  );
}
