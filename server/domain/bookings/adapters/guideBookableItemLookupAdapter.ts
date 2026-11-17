import { placeTimeOf } from '../../../shared/kernel/timeZones';
import { getItemByIdUseCase } from '../../guide';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';

// Chaves do horário de funcionamento no anúncio, de domingo a sábado (as mesmas do cadastro).
const WEEK = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

function strings(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : undefined;
}

function routes(value: unknown): Array<{ from: string; to: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((route) =>
    route && typeof route.from === 'string' && typeof route.to === 'string'
      ? [{ from: route.from, to: route.to }]
      : []
  );
}

function openingHours(value: unknown): BookableItem['openingHours'] {
  if (!value || typeof value !== 'object') return undefined;
  const hours = value as Record<string, { open?: unknown; close?: unknown; closed?: unknown }>;
  return WEEK.map((day) => {
    const entry = hours[day];
    if (!entry || entry.closed === true) return null;
    const { open, close } = entry;
    return typeof open === 'string' &&
      typeof close === 'string' &&
      HH_MM.test(open) &&
      HH_MM.test(close)
      ? { open, close }
      : null;
  });
}

export class GuideBookableItemLookupAdapter implements BookableItemLookupPort {
  async getItem(guideItemId: string): Promise<BookableItem | null> {
    const item = await getItemByIdUseCase(guideItemId);
    if (!item?.ownerId) return null;
    const info = (item.operationalInfo ?? {}) as Record<string, unknown>;
    return {
      id: item.id,
      ownerId: item.ownerId,
      partnerId:
        typeof item.partnerId === 'string' && item.partnerId ? item.partnerId : item.ownerId,
      category: String(item.category ?? ''),
      name: typeof item.name === 'string' ? item.name : '',
      ...placeTimeOf(item),
      published: item.publication === 'published',
      vehicleTypes: strings(info.vehicleTypes),
      transferRoutes: routes(info.transferRoutes),
      openingHours: openingHours(info.operatingHours),
    };
  }
}
