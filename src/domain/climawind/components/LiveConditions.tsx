import React, { useState, useEffect, useRef } from 'react';
import { Navigation, ChevronRight, ArrowUpRight, Map as MapIcon } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { cn } from '../../../shared/utils/cn';
import { ConditionsDetailModal } from './ConditionsDetailModal';
import { WindMapModal } from './WindMapModal';
import { useClimaWind } from '../hooks/useClimaWind';
import { getWindColor, getWindBg } from '../../../shared/lib/weatherUtils';

const REGIONAL_LOCATION = { id: 'regional', name: 'Previsões de Ventos', lat: -2.805, lon: -40.44 };

export function LiveConditions() {
  const { data, loading } = useClimaWind(REGIONAL_LOCATION.lat, REGIONAL_LOCATION.lon);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && currentHourRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const target = currentHourRef.current;

      // Use direct scroll on container to avoid window scroll jumps from scrollIntoView
      const scrollTimeout = setTimeout(() => {
        if (container && target) {
          const scrollTarget =
            target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2;
          container.scrollTo({
            left: scrollTarget,
            behavior: 'smooth',
          });
        }
      }, 600);
      return () => clearTimeout(scrollTimeout);
    }
  }, [data]);

  if (loading || !data) return null;

  return (
    <div className="px-10 mb-12">
      <GlassCard className="relative overflow-hidden border-white/5 shadow-2xl p-1">
        <div className="relative bg-black/40 rounded-[38px] overflow-hidden">
          <div className="pt-8 px-8 pb-4 flex items-center justify-between border-b border-white/5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-2xl font-black tracking-tighter uppercase">{data.name}</h4>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                  <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest leading-none">
                    Agora
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/5 text-white/50 uppercase tracking-[0.2em]">
                  {data.condition}
                </span>
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">
                  Índice UV {data.uvIndex}
                </span>
              </div>
            </div>
            <div className="hidden md:block text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">
              Estação Viva
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-white/5 items-center">
            <div className="md:col-span-8 flex flex-row items-center justify-center gap-6 sm:gap-12 md:gap-20">
              <div
                onClick={() => setIsMapOpen(true)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 cursor-pointer group/compass"
              >
                <div className="absolute inset-0 flex items-center justify-center group-hover/compass:scale-105 transition-transform">
                  <div className="absolute inset-0 rounded-full border border-white/5" />
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 flex justify-center py-1.5"
                      style={{ transform: `rotate(${i * 30}deg)` }}
                    >
                      <div
                        className={cn(
                          'w-0.5 rounded-full',
                          i % 3 === 0 ? 'h-2.5 bg-white/30' : 'h-1.5 bg-white/10'
                        )}
                      />
                    </div>
                  ))}

                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-white/50">
                    N
                  </div>

                  <Navigation
                    size={32}
                    className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-transform duration-1000"
                    style={{ transform: `rotate(${(data.windDir + 180) % 360}deg)` }}
                  />
                </div>
              </div>

              <div
                onClick={() => setIsMapOpen(true)}
                className="flex flex-col items-center sm:items-start justify-center cursor-pointer group/speed hover:scale-105 transition-transform"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-6xl sm:text-8xl font-black tracking-tighter tabular-nums leading-none',
                      getWindColor(data.windSpeed)
                    )}
                  >
                    {data.windSpeed}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-lg sm:text-xl font-black text-white/50 italic leading-none">
                      KNOTS
                    </span>
                    <div className="flex items-center gap-1 text-rose-400 mt-1">
                      <ArrowUpRight size={12} />
                      <span className="text-[10px] sm:text-xs font-black">
                        {data.windGusts} GUSTS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Maré</p>
                  <p className="text-sm font-bold text-white">
                    {data.tide}{' '}
                    <span className="text-[10px] opacity-40 font-normal leading-none">
                      {data.tideHeight}
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-rose-400 uppercase mb-1">Ar</p>
                  <p className="text-sm font-bold text-white">
                    {data.temp}°C <span className="text-[10px] opacity-40 font-normal">Sinc.</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                >
                  <MapIcon size={16} className="text-teal-400" />
                </button>
                <button
                  onClick={() => setIsDetailOpen(true)}
                  className="flex-[3] py-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest text-teal-400 transition-all flex items-center justify-center gap-2"
                >
                  Previsão Próximos Dias <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="bg-black/20 p-4 pb-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 isolate">
              {data.hourlyWind.map((h, i) => {
                const now = new Date().getTime();
                const isCurrent =
                  h.timestamp >= now - 1000 * 60 * 30 && h.timestamp <= now + 1000 * 60 * 30;

                return (
                  <div
                    key={i}
                    ref={isCurrent ? currentHourRef : null}
                    className="flex flex-col items-center group/h cursor-default shrink-0 w-16"
                  >
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase mb-2 transition-colors',
                        isCurrent ? 'text-teal-400' : 'text-white/50 group-hover:text-white'
                      )}
                    >
                      {h.time}
                    </span>
                    <div
                      className={cn(
                        'w-full h-14 rounded-xl flex flex-col items-center justify-center border border-white/5 transition-all shadow-inner relative overflow-hidden',
                        getWindBg(h.speed),
                        isCurrent && 'ring-2 ring-teal-500/50'
                      )}
                    >
                      {isCurrent && (
                        <div className="absolute inset-0 bg-teal-400/5 animate-pulse" />
                      )}
                      <Navigation
                        size={12}
                        className={cn(
                          'mb-1 transition-transform duration-500 relative z-10',
                          getWindColor(h.speed)
                        )}
                        style={{ transform: `rotate(${(h.dir + 180) % 360}deg)` }}
                      />
                      <span className="text-xs font-black tabular-nums text-white relative z-10">
                        {h.speed}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      <ConditionsDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        location={REGIONAL_LOCATION}
      />
      <WindMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}
