import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './formatRelativeTime';

describe('formatRelativeTime', () => {
  it('deve retornar "Hoje" para datas nulas ou inválidas', () => {
    expect(formatRelativeTime(null)).toBe('Hoje');
    expect(formatRelativeTime(undefined)).toBe('Hoje');
    expect(formatRelativeTime('invalid-date')).toBe('Hoje');
  });

  it('deve retornar "Hoje" para data recente (poucos segundos ou hoje)', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Hoje');
  });

  it('deve formatar "1 dia atrás" corretamente', () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe('1 dia atrás');
  });

  it('deve formatar dias atrás para menos de 7 dias', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 dias atrás');
  });

  it('deve suportar objetos com toDate() do Firestore', () => {
    const mockTimestamp = {
      toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };
    expect(formatRelativeTime(mockTimestamp)).toBe('2 dias atrás');
  });

  it('deve suportar objetos com seconds do Firestore', () => {
    const secondsTwoDaysAgo = Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000);
    const mockTimestamp = { seconds: secondsTwoDaysAgo };
    expect(formatRelativeTime(mockTimestamp)).toBe('2 dias atrás');
  });
});
