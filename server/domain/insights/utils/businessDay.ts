const BUSINESS_TIME_ZONE = 'America/Fortaleza';

/** Dia (AAAA-MM-DD) no fuso do negócio, para o contador diário não depender do fuso do servidor. */
export function businessDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Os últimos `count` dias de negócio até `today`, do mais antigo para o mais recente. */
export function lastBusinessDays(today: Date, count: number): string[] {
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    days.push(businessDayKey(new Date(today.getTime() - offset * 86_400_000)));
  }
  return days;
}

/** Mês atual e anterior (AAAA-MM) no fuso do negócio, para comparar as visitas do mês. */
export function businessMonthKeys(today: Date): { current: string; previous: string } {
  const current = businessDayKey(today).slice(0, 7);
  const [year, month] = current.split('-').map(Number) as [number, number];
  const previous = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
  return { current, previous };
}
