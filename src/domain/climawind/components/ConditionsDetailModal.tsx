import { useState, useEffect } from 'react';
import { X, Navigation } from 'lucide-react';
import { getWeatherDesc } from '../../../shared/lib/weatherUtils';
import { useScrollLock } from '../../../shared/hooks/useScrollLock';
import { ModalLayout } from '../../../ui/layouts/ModalLayout';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  maxWind: number;
  maxGusts: number;
  windDir: number;
  condition: string;
}

interface ConditionsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { id: string; name: string; lat: number; lon: number };
}

export function ConditionsDetailModal({ isOpen, onClose, location }: ConditionsDetailModalProps) {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const fetchForecast = async (retries = 3) => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await firebaseApiFetch(
          `/api/weather?latitude=${location.lat}&longitude=${location.lon}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code&wind_speed_unit=kn&timezone=auto&forecast_days=10`,
          { signal: controller.signal },
          { requireAuth: false }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          let errorJson: { message?: string; error?: string } | null = null;
          try {
            errorJson = JSON.parse(errorText);
          } catch {
            /* ignore */
          }
          throw new Error(
            errorJson?.message || errorJson?.error || `HTTP error! status: ${res.status}`
          );
        }

        const json = await res.json();

        if (!json?.daily) {
          throw new Error('Invalid forecast API response');
        }

        const dailyTime = json.daily.time || [];
        const dailyTempMax = json.daily.temperature_2m_max || [];
        const dailyTempMin = json.daily.temperature_2m_min || [];
        const dailyWindMax = json.daily.wind_speed_10m_max || [];
        const dailyGustsMax = json.daily.wind_gusts_10m_max || [];
        const dailyWindDir = json.daily.wind_direction_10m_dominant || [];
        const dailyWeatherCode = json.daily.weather_code || [];

        const days = dailyTime
          .map((time: string, i: number) => {
            const d = new Date(time);
            if (Number.isNaN(d.getTime())) return null;
            return {
              date: d.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              }),
              maxTemp: Math.round(dailyTempMax[i] ?? 0),
              minTemp: Math.round(dailyTempMin[i] ?? 0),
              maxWind: Math.round(dailyWindMax[i] ?? 0),
              maxGusts: Math.round(dailyGustsMax[i] ?? 0),
              windDir: dailyWindDir[i] ?? 0,
              condition: getWeatherDesc(dailyWeatherCode[i] ?? 0),
            };
          })
          .filter(Boolean);

        setForecast(days);
        setLoading(false);
      } catch (error) {
        if (retries > 0) {
          console.warn(`Fetch forecast failed, retrying... (${retries} left)`, error);
          setTimeout(() => fetchForecast(retries - 1), 2000);
        } else {
          console.error('Error fetching forecast after retries:', error);
          setLoading(false);
        }
      }
    };

    fetchForecast();
  }, [isOpen, location]);

  if (!isOpen) return null;

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName="bg-black/[0.15] backdrop-blur-md"
      containerClassName="relative w-full max-w-4xl bg-slate-950 rounded-t-[40px] sm:rounded-[40px] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] max-h-[85vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-black/50 to-transparent">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-2">{location.name}</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="w-fit text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] bg-teal-500/10 px-3 py-1 rounded-full text-center">
              Previsão 10 Dias
            </span>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">
              Dados via Satélites
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all hover:rotate-90"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-6 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-xs font-black text-white/50 uppercase tracking-[0.5em] animate-pulse text-center">
              Processando Modelos...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {forecast.map((day, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-2 group border-b border-white/5 md:border-none pb-4 md:pb-0"
              >
                {/* Date Column */}
                <div className="w-full md:w-28 shrink-0 flex md:block items-baseline gap-2">
                  <p className="text-[10px] font-black uppercase text-white/50 md:mb-0.5">
                    {day.date.split(',')[0]}
                  </p>
                  <p className="text-base md:text-lg font-bold text-white group-hover:text-teal-400 transition-colors uppercase md:normal-case">
                    {day.date.split(',')[1]}
                  </p>
                </div>

                {/* Wind Strip - High Visibility */}
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between group-hover:bg-white/5 transition-all gap-4">
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 md:gap-10">
                    {/* Direction Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shadow-inner">
                        <Navigation
                          size={14}
                          className="text-teal-400"
                          style={{ transform: `rotate(${(day.windDir + 180) % 360}deg)` }}
                        />
                      </div>
                      <span className="text-[8px] font-black text-white/50">{day.windDir}°</span>
                    </div>

                    {/* Speeds */}
                    <div className="flex items-center gap-6 md:gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/50 uppercase mb-1">
                          Vento
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl md:text-2xl font-black tabular-nums text-white">
                            {day.maxWind}
                          </span>
                          <span className="text-[10px] font-bold text-white/50 italic">kts</span>
                        </div>
                      </div>
                      <div className="flex flex-col border-l border-white/5 pl-6 md:pl-8">
                        <span className="text-[9px] font-black text-rose-500/50 uppercase mb-1">
                          Rajada
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl md:text-2xl font-black tabular-nums text-rose-500">
                            {day.maxGusts}
                          </span>
                          <span className="text-[10px] font-bold text-rose-500/40 italic">kts</span>
                        </div>
                      </div>
                    </div>

                    {/* Temp (Hidden on very small screens, visible from sm) */}
                    <div className="hidden sm:flex flex-col border-l border-white/5 pl-6 md:pl-8">
                      <span className="text-[9px] font-black text-white/50 uppercase mb-1">
                        Temp Ar
                      </span>
                      <p className="text-base md:text-lg font-bold">
                        {day.maxTemp}° / <span className="opacity-30">{day.minTemp}°</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-white/5 sm:border-none pt-3 sm:pt-0 sm:px-6">
                    <span className="text-[10px] font-black uppercase text-teal-400/60 bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/10 whitespace-nowrap">
                      {day.condition}
                    </span>
                    {day.maxWind >= 16 && (
                      <div className="mt-0 sm:mt-2 flex gap-1">
                        {[1, 2, 3].map((bit) => (
                          <div
                            key={bit}
                            className="w-1 h-1 bg-teal-400 rounded-full animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
