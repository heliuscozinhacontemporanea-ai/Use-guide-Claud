import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { WindMapLeaflet } from './WindMapLeaflet';
import { WindPoint } from '../types/climaWind';
import { useScrollLock } from '../../../shared/hooks/useScrollLock';
import { generateWindGrid } from '../utils/windGrid';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

const NAMED_POINTS: WindPoint[] = [
  { id: 'jeri', name: 'Jericoacoara', lat: -2.796, lng: -40.508 },
  { id: 'prea', name: 'Preá', lat: -2.812, lng: -40.415 },
  { id: 'barrinha', name: 'Barrinha', lat: -2.805, lng: -40.38 },
  { id: 'tatajuba', name: 'Tatajuba', lat: -2.845, lng: -40.685 },
  { id: 'acarau', name: 'Acaraú', lat: -2.885, lng: -40.115 },
];

const GRID_CENTER_LAT = -2.83;
const GRID_CENTER_LON = -40.48;

const GRID_POINTS: WindPoint[] = generateWindGrid(GRID_CENTER_LAT, GRID_CENTER_LON, 7, 0.08);

const ALL_WIND_POINTS: WindPoint[] = [...GRID_POINTS, ...NAMED_POINTS];

interface WindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WindMapModal({ isOpen, onClose }: WindMapModalProps) {
  const [points, setPoints] = useState<WindPoint[]>(ALL_WIND_POINTS);

  useScrollLock(isOpen);

  const fetchWindData = useCallback(async (retries = 3) => {
    try {
      const lats = ALL_WIND_POINTS.map((p) => p.lat).join(',');
      const lons = ALL_WIND_POINTS.map((p) => p.lng).join(',');

      const searchParams = new URLSearchParams();
      searchParams.append('latitude', lats);
      searchParams.append('longitude', lons);
      searchParams.append('current', 'wind_speed_10m,wind_direction_10m');
      searchParams.append('wind_speed_unit', 'kn');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await firebaseApiFetch(
        `/api/weather?${searchParams.toString()}`,
        { signal: controller.signal },
        { requireAuth: false, requireAppCheck: true }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        let errorMsg = `HTTP ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || errorJson.error || errorMsg;
        } catch {
          /* use default */
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      const updatedPoints = ALL_WIND_POINTS.map((p, i) => {
        const pointData = Array.isArray(data) ? data[i] : i === 0 ? data : null;

        if (!pointData || !pointData.current) {
          console.warn(`No data for point ${p.name || p.id}`, pointData);
          return { ...p, speed: 0, dir: 0 };
        }

        return {
          ...p,
          speed: Math.round(pointData.current.wind_speed_10m ?? 0),
          dir: pointData.current.wind_direction_10m ?? 0,
        };
      });

      setPoints(updatedPoints);
    } catch (error: unknown) {
      const isAbort = error instanceof Error && error.name === 'AbortError';
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      if (isAbort) {
        console.warn('Wind data fetch timed out');
      }

      if (retries > 0) {
        console.warn(`Fetch wind data failed, retrying... (${retries} left)`, errorMessage);
        setTimeout(() => fetchWindData(retries - 1), 3000);
      } else {
        console.error('Final error fetching map wind data:', errorMessage);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWindData();
    }
  }, [isOpen, fetchWindData]);

  if (!isOpen) return null;

  return (
    <ModalLayout onClose={onClose}>
      <div className="relative w-full h-full">
        <WindMapLeaflet points={points} />
      </div>
    </ModalLayout>
  );
}

function ModalLayout({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 p-4 md:p-12 flex items-center justify-center bg-black/[0.2] backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-4xl h-[75vh] bg-[#0c111a]/40 rounded-[3rem] md:rounded-[4rem] relative overflow-hidden flex flex-col border border-white/20 shadow-[0_0_120px_rgba(0,0,0,0.8)]"
      >
        {/* Grain Overlay for Liquid Glass effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Glass Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-8 right-8 z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-xl group focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <X
            size={20}
            className="text-white group-hover:rotate-90 transition-transform duration-300"
          />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
