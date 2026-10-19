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
