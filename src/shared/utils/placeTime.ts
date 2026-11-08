import { PLATFORM_TIME_ZONE, timeZoneOffsetMs } from './timeZones';

/** Fuso e cidade do lugar do serviço, copiados do estabelecimento (D28). */
export interface PlaceTime {
  timeZone?: string;
  city?: string;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

function instantOf(iso?: string): number {
  const ms = iso ? Date.parse(iso) : Number.NaN;
  return Number.isNaN(ms) ? Date.now() : ms;
}

/** O aparelho está num fuso diferente do lugar nesse instante (ex.: quem planeja de Manaus). */
export function isDeviceInOtherZone(place: PlaceTime | undefined, iso?: string): boolean {
  const ms = instantOf(iso);
  const placeOffset = timeZoneOffsetMs(place?.timeZone ?? PLATFORM_TIME_ZONE, ms);
  const deviceOffset = -new Date(ms).getTimezoneOffset() * 60_000;
  return placeOffset !== deviceOffset;
}

/** "UTC−4", "UTC−3", "UTC−2:30". */
export function utcOffsetLabel(timeZone: string, iso?: string): string {
  const minutes = Math.round(timeZoneOffsetMs(timeZone, instantOf(iso)) / 60_000);
  if (minutes === 0) return 'UTC';
  const abs = Math.abs(minutes);
  const rest = abs % 60;
  return `UTC${minutes < 0 ? '−' : '+'}${Math.floor(abs / 60)}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
}

/** " (horário de Jericoacoara)" depois da hora, só para quem está em outro fuso; senão, vazio. */
export function placeTimeSuffix(t: Translate, place: PlaceTime | undefined, iso?: string): string {
  if (!isDeviceInOtherZone(place, iso)) return '';
  return ` ${place?.city ? t('placeTime.suffix', { place: place.city }) : t('placeTime.suffixLocal')}`;
}

/** Linha única de um formulário: "Horários de Manaus (UTC−4)."; vazio no mesmo fuso do aparelho. */
export function placeTimeFormNote(t: Translate, place: PlaceTime | undefined): string {
  if (!isDeviceInOtherZone(place)) return '';
  const offset = utcOffsetLabel(place?.timeZone ?? PLATFORM_TIME_ZONE);
  return place?.city
    ? t('placeTime.formNote', { place: place.city, offset })
    : t('placeTime.formNoteLocal', { offset });
}
