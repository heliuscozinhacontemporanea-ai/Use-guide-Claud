import { describe, expect, it } from 'vitest';
import * as app from '../../../src/shared/utils/timeZones';
import {
  BR_STATES,
  isoToZonedDateTime,
  PLATFORM_TIME_ZONE,
  timeZoneForBrazilianCity,
  zonedDateTimeToIso,
  zonedDayKey,
} from './timeZones';

describe('fusos do Brasil', () => {
  it('estado e cidade dão o fuso, com as exceções do Amazonas e de Noronha', () => {
    expect(timeZoneForBrazilianCity('CE', 'Jijoca de Jericoacoara')).toBe('America/Fortaleza');
    expect(timeZoneForBrazilianCity('AM', 'Manaus')).toBe('America/Manaus');
    expect(timeZoneForBrazilianCity('AM', 'Tabatinga')).toBe('America/Eirunepe');
    expect(timeZoneForBrazilianCity('AM', 'São Paulo de Olivença')).toBe('America/Eirunepe');
    expect(timeZoneForBrazilianCity('AC', 'Rio Branco')).toBe('America/Rio_Branco');
    expect(timeZoneForBrazilianCity('PE', 'Fernando de Noronha')).toBe('America/Noronha');
    expect(timeZoneForBrazilianCity('PE', 'Recife')).toBe('America/Recife');
    expect(BR_STATES).toHaveLength(27);
    expect(PLATFORM_TIME_ZONE).toBe('America/Sao_Paulo');
  });

  it('20:00 digitado em Jericoacoara e em Manaus vira o instante certo, e volta igual', () => {
    expect(zonedDateTimeToIso('2026-12-20T20:00', 'America/Fortaleza')).toBe(
      '2026-12-20T23:00:00.000Z'
    );
    expect(zonedDateTimeToIso('2026-12-20T20:00', 'America/Manaus')).toBe(
      '2026-12-21T00:00:00.000Z'
    );
    expect(zonedDateTimeToIso('2026-12-20T20:00', 'America/Rio_Branco')).toBe(
      '2026-12-21T01:00:00.000Z'
    );
    expect(isoToZonedDateTime('2026-12-21T00:00:00.000Z', 'America/Manaus')).toBe(
      '2026-12-20T20:00'
    );
    expect(zonedDayKey('2026-12-21T02:30:00.000Z', 'America/Fortaleza')).toBe('2026-12-20');
    expect(zonedDateTimeToIso('20/12/2026', 'America/Fortaleza')).toBe('');
  });

  it('o app usa a mesma tabela que o servidor', () => {
    expect([...app.BR_STATES]).toEqual([...BR_STATES]);
    for (const state of BR_STATES) {
      for (const city of ['Capital', 'Tabatinga', 'Fernando de Noronha']) {
        expect(app.timeZoneForBrazilianCity(state, city)).toBe(
          timeZoneForBrazilianCity(state, city)
        );
      }
    }
    expect(app.PLATFORM_TIME_ZONE).toBe(PLATFORM_TIME_ZONE);
  });
});
