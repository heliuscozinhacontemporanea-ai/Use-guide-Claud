/**
 * Fusos do Brasil (D28, 2026-11-08). O fuso do estabelecimento sai do estado e da cidade: o parceiro
 * não escolhe fuso. Espelhado em `server/shared/kernel/timeZones.ts`, conferido por teste de paridade.
 * Lei 12.876/2013; sem horário de verão desde 2019, mas os nomes IANA continuam certos se ele voltar.
 */
export const BR_STATES = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

export type BrState = (typeof BR_STATES)[number];

/** Contas da plataforma (termos, jobs, destaques) e o que não tem estabelecimento. */
export const PLATFORM_TIME_ZONE = 'America/Sao_Paulo';

const STATE_TIME_ZONE: Record<BrState, string> = {
  AC: 'America/Rio_Branco',
  AL: 'America/Maceio',
  AM: 'America/Manaus',
  AP: 'America/Belem',
  BA: 'America/Bahia',
  CE: 'America/Fortaleza',
  DF: 'America/Sao_Paulo',
  ES: 'America/Sao_Paulo',
  GO: 'America/Sao_Paulo',
  MA: 'America/Fortaleza',
  MG: 'America/Sao_Paulo',
  MS: 'America/Campo_Grande',
  MT: 'America/Cuiaba',
  PA: 'America/Belem',
  PB: 'America/Fortaleza',
  PE: 'America/Recife',
  PI: 'America/Fortaleza',
  PR: 'America/Sao_Paulo',
  RJ: 'America/Sao_Paulo',
  RN: 'America/Fortaleza',
  RO: 'America/Porto_Velho',
  RR: 'America/Boa_Vista',
  RS: 'America/Sao_Paulo',
  SC: 'America/Sao_Paulo',
  SE: 'America/Maceio',
  SP: 'America/Sao_Paulo',
  TO: 'America/Araguaina',
};

// Cidades com fuso diferente do resto do estado: oeste do Amazonas (UTC−5) e Fernando de Noronha (UTC−2).
const CITY_TIME_ZONE: Partial<Record<BrState, Record<string, string>>> = {
  AM: {
    'atalaia do norte': 'America/Eirunepe',
    'benjamin constant': 'America/Eirunepe',
    'boca do acre': 'America/Eirunepe',
    eirunepe: 'America/Eirunepe',
    envira: 'America/Eirunepe',
    guajara: 'America/Eirunepe',
    ipixuna: 'America/Eirunepe',
    itamarati: 'America/Eirunepe',
    pauini: 'America/Eirunepe',
    'sao paulo de olivenca': 'America/Eirunepe',
    tabatinga: 'America/Eirunepe',
  },
  PE: { 'fernando de noronha': 'America/Noronha' },
};

export function isBrState(value: unknown): value is BrState {
  return BR_STATES.includes(value as BrState);
}

function normalizeCity(city: string): string {
  return city
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Fuso do lugar pelo estado e pela cidade. */
export function timeZoneForBrazilianCity(state: BrState, city: string): string {
  return CITY_TIME_ZONE[state]?.[normalizeCity(city)] ?? STATE_TIME_ZONE[state];
}

function partsIn(timeZone: string, ms: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ms));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    y: get('year'),
    m: get('month'),
    d: get('day'),
    h: get('hour'),
    min: get('minute'),
    s: get('second'),
  };
}

/** Diferença do fuso para o UTC nesse instante, em ms (UTC−3 → −10 800 000). */
export function timeZoneOffsetMs(timeZone: string, ms: number): number {
  const p = partsIn(timeZone, ms);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(ms / 1000) * 1000;
}

const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** "AAAA-MM-DDTHH:MM" na hora do lugar → ISO UTC; vazio se o valor não tiver esse formato. */
export function zonedDateTimeToIso(value: string, timeZone: string): string {
  const match = LOCAL_PATTERN.exec(value);
  if (!match) return '';
  const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
  const asUtc = Date.UTC(y, m - 1, d, h, min);
  // Duas passadas acertam a hora mesmo na troca de horário de verão, se ele voltar.
  const first = asUtc - timeZoneOffsetMs(timeZone, asUtc);
  return new Date(asUtc - timeZoneOffsetMs(timeZone, first)).toISOString();
}

/** ISO → "AAAA-MM-DDTHH:MM" na hora do lugar, para `<input type="datetime-local">`. */
export function isoToZonedDateTime(iso: string, timeZone: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  return new Date(ms + timeZoneOffsetMs(timeZone, ms)).toISOString().slice(0, 16);
}

/** Dia "AAAA-MM-DD" do instante na hora do lugar. */
export function zonedDayKey(iso: string, timeZone: string): string {
  return isoToZonedDateTime(iso, timeZone).slice(0, 10);
}
