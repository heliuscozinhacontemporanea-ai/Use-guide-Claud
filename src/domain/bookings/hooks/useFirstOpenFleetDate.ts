import { useEffect, useState } from 'react';
import { getPublicFleetDayUseCase } from '../application/usecases/getPublicFleetDayUseCase';
import type { PublicOffer } from '../types/bookings';
import { placeInputToIso } from '../utils/dates';
import { hasBookableTime } from '../utils/fleetAvailability';

/**
 * Primeiro dia, entre os dados, que ainda tem horário para reservar (resposta 17 da comparação com os
 * protótipos, 2026-11-22). Lê um dia por vez e para no primeiro; sem nenhum, fica o primeiro dia.
 * `null` enquanto procura.
 */
export function useFirstOpenFleetDate(
  offer: Pick<PublicOffer, 'id' | 'kind' | 'durationMinutes' | 'timeZone'>,
  dates: string[]
): string | null {
  const [found, setFound] = useState<string | null>(null);
  const { id, kind, durationMinutes, timeZone } = offer;

  useEffect(() => {
    let active = true;
    setFound(null);
    const placeIso = (date: string, hhmm: string) => placeInputToIso(`${date}T${hhmm}`, timeZone);
    (async () => {
      for (const date of dates) {
        try {
          const day = await getPublicFleetDayUseCase(id, date);
          if (!active) return;
          if (hasBookableTime({ kind, durationMinutes }, day, Date.now(), placeIso)) {
            setFound(date);
            return;
          }
        } catch {
          // Erro de rede num dia: mostra o primeiro dia, onde o erro aparece com "Tentar de novo".
          break;
        }
      }
      if (active) setFound(dates[0] ?? '');
    })();
    return () => {
      active = false;
    };
  }, [id, kind, durationMinutes, timeZone, dates]);

  return found;
}
