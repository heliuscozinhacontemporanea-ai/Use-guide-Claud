import { useState, useEffect, useCallback } from 'react';
import { ClimaWindData } from '../types/climaWind';
import { climaWindAdapter } from '../factory';

// Coordenadas centrais padrão de Jericoacoara para previsão regionalizada
const JERI_LAT = -2.805;
const JERI_LON = -40.44;

export function useClimaWind(
  lat: number = JERI_LAT,
  lon: number = JERI_LON,
  pollingIntervalMs: number = 1000 * 60 * 30
) {
  const [data, setData] = useState<ClimaWindData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClimaWind = useCallback(
    async (retries = 3) => {
      try {
        setError(null);
        const result = await climaWindAdapter.fetchWindData(lat, lon);
        setData(result);
        setLoading(false);
      } catch (err: unknown) {
        if (retries > 0) {
          console.warn(`Consulta falhou. Retentando em 2 segundos... (${retries} restantes)`);
          setTimeout(() => loadClimaWind(retries - 1), 2000);
        } else {
          const errMsg =
            err instanceof Error ? err.message : 'Erro ao recuperar dados meteorológicos.';
          setError(errMsg);
          setLoading(false);
          console.error('Falha crítica ao obter condições de vento e maré:', err);
        }
      }
    },
    [lat, lon]
  );

  useEffect(() => {
    setLoading(true);
    loadClimaWind();

    // Polling a cada 30 minutos — respeita limites de quota das APIs meteorológicas
    const intervalId = setInterval(() => loadClimaWind(), pollingIntervalMs);
    return () => clearInterval(intervalId);
  }, [loadClimaWind, pollingIntervalMs]);

  const refresh = () => {
    setLoading(true);
    return loadClimaWind();
  };

  return { data, loading, error, refresh };
}
