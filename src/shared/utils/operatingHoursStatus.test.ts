import { describe, expect, it } from 'vitest';
import { getOperatingStatus, type OperatingHours } from './operatingHoursStatus';

const HOURS: OperatingHours = {
  domingo: { open: '12:00', close: '22:00', closed: false },
  segunda: { open: '12:00', close: '22:00', closed: true },
  terça: { open: '12:00', close: '22:00', closed: false },
  quarta: { open: '18:00', close: '02:00', closed: false },
  quinta: { open: '12:00', close: '22:00', closed: false },
  sexta: { open: '12:00', close: '23:00', closed: false },
  sábado: { open: '12:00', close: '23:00', closed: false },
};
const TZ = 'America/Fortaleza'; // UTC−3

describe('aberto agora, na hora do lugar', () => {
  it('terça 15:00 no lugar está aberto e fecha às 22:00', () => {
    // 2026-11-10 é terça; 18:00 UTC = 15:00 em Fortaleza.
    expect(getOperatingStatus(HOURS, new Date('2026-11-10T18:00:00Z'), TZ)).toEqual({
      state: 'open',
      closesAt: '22:00',
    });
  });

  it('antes de abrir mostra a hora de abrir; depois de fechar, fechado hoje', () => {
    expect(getOperatingStatus(HOURS, new Date('2026-11-10T13:00:00Z'), TZ)).toEqual({
      state: 'closed',
      opensAt: '12:00',
    });
    expect(getOperatingStatus(HOURS, new Date('2026-11-11T02:00:00Z'), TZ)).toEqual({
      state: 'closedToday',
    });
  });

  it('segunda fechada e madrugada de quinta ainda no horário de quarta', () => {
    expect(getOperatingStatus(HOURS, new Date('2026-11-09T18:00:00Z'), TZ)).toEqual({
      state: 'closedToday',
    });
    // Quinta 01:00 em Fortaleza = 04:00 UTC.
    expect(getOperatingStatus(HOURS, new Date('2026-11-12T04:00:00Z'), TZ)).toEqual({
      state: 'open',
      closesAt: '02:00',
    });
  });

  it('sem horário cadastrado não diz nada', () => {
    expect(getOperatingStatus(undefined, new Date(), TZ)).toBeNull();
  });
});
