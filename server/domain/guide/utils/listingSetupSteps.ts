import type { GuideItemRecord } from '../types/guideTypes';
import { sellsThroughApp } from './sellsThroughApp';

/** Passos de "Para aparecer no guia" (D34): cada um abre uma página do guia no Início do painel. */
export type ListingStepId = 'name' | 'photos' | 'about' | 'where' | 'details' | 'contacts';

/** O que falta num passo, para a página do passo dizer ao dono (a tela traduz). */
export type ListingField =
  | 'name'
  | 'state'
  | 'city'
  | 'images'
  | 'description'
  | 'languages'
  | 'address'
  | 'googleMapsLink'
  | 'region'
  | 'instagram'
  | 'website'
  | 'breakfast'
  | 'amenities'
  | 'checkIn'
  | 'checkOut'
  | 'children'
  | 'pets'
  | 'bookingLink'
  | 'cuisine'
  | 'meals'
  | 'services'
  | 'hours'
  | 'menu'
  | 'access'
  | 'activities'
  | 'itinerary'
  | 'luggage'
  | 'rentalItems'
  | 'routes'
  | 'vehicles';

export interface ListingStep {
  id: ListingStepId;
  done: boolean;
  missing: ListingField[];
}

export type ListingSetupInput = Pick<
  GuideItemRecord,
  | 'category'
  | 'name'
  | 'state'
  | 'city'
  | 'images'
  | 'description'
  | 'address'
  | 'googleMapsLink'
  | 'location'
  | 'instagramLink'
  | 'websiteLink'
  | 'bookingLink'
  | 'operationalInfo'
  | 'declinedLinks'
>;

/** Os dias que o editor grava em `operatingHours` (o 1º é domingo). */
const WEEK = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;

const filled = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0;

/**
 * Lista de múltipla escolha respondida: com pelo menos uma opção, ou vazia quando o dono marcou
 * "Nenhuma destas" (D34). Ausente é "ainda não respondida". Texto é o formato antigo do editor.
 */
const answered = (value: unknown): boolean => Array.isArray(value) || filled(value);

const someOf = (value: unknown): boolean =>
  (Array.isArray(value) && value.some(filled)) || filled(value);

function hoursComplete(hours: NonNullable<ListingSetupInput['operationalInfo']>['operatingHours']) {
  return WEEK.every((day) => {
    const value = hours?.[day];
    return value !== undefined && (value.closed || (filled(value.open) && filled(value.close)));
  });
}

function step(id: ListingStepId, checks: Array<[ListingField, boolean]>): ListingStep {
  const missing = checks.filter(([, ok]) => !ok).map(([field]) => field);
  return { id, done: missing.length === 0, missing };
}

function detailChecks(item: ListingSetupInput): Array<[ListingField, boolean]> {
  const info = item.operationalInfo ?? {};
  switch (item.category) {
    case 'hotel': {
      const breakfast = info.breakfast;
      const breakfastOk =
        typeof breakfast?.serves === 'boolean' &&
        (!breakfast.serves ||
          (typeof breakfast.included === 'boolean' &&
            someOf(breakfast.types) &&
            (breakfast.included || filled(breakfast.price))));
      const allowsPets = info.petsPolicy === 'Sim' || info.petsPolicy === 'Mediante pedido';
      return [
        ['breakfast', breakfastOk],
        ['amenities', answered(info.amenities)],
        ['checkIn', filled(info.checkIn?.from) && filled(info.checkIn?.to)],
        ['checkOut', filled(info.checkOut?.from) && filled(info.checkOut?.to)],
        ['children', typeof info.childrenAllowed === 'boolean'],
        ['pets', filled(info.petsPolicy) && (!allowsPets || filled(info.petsExtraCost))],
        ['bookingLink', filled(item.bookingLink)],
      ];
    }
    case 'restaurant':
      return [
        ['cuisine', filled(info.cuisineType)],
        ['meals', answered(info.mealTypes)],
        ['services', answered(info.additionalServices)],
        ['amenities', answered(info.amenities)],
        ['hours', hoursComplete(info.operatingHours)],
        ['menu', filled(info.menuLink) || (item.declinedLinks ?? []).includes('menu')],
      ];
    case 'sight':
      return [
        ['access', info.access === 'pago' || info.access === 'gratuito'],
        ['services', answered(info.services)],
        ['amenities', answered(info.amenities)],
        ['activities', answered(info.activities)],
        ['hours', hoursComplete(info.operatingHours)],
      ];
    case 'tour':
      return [
        ['itinerary', filled(info.itinerary)],
        ['luggage', filled(info.luggageInfo)],
      ];
    case 'rental':
      return [
        ['rentalItems', someOf(info.vehicleTypes)],
        ['hours', hoursComplete(info.operatingHours)],
      ];
    case 'transfer':
      return [
        [
          'routes',
          (info.transferRoutes ?? []).some((route) => filled(route.from) && filled(route.to)),
        ],
        ['vehicles', someOf(info.vehicleTypes)],
        ['luggage', filled(info.luggageInfo)],
      ];
    default:
      return [];
  }
}

/**
 * Passos de "Para aparecer no guia" do anúncio, com o que falta em cada um (D34). É a mesma regra
 * para o ✓ do guia no Início, para a página do passo e para a rota de publicar. O produtor de eventos
 * não aparece no guia (D9) e só tem o passo do nome; dica é do admin e não tem passos.
 */
export function listingSetupSteps(item: ListingSetupInput): ListingStep[] {
  if (item.category === 'tips') return [];
  const nameStep = step('name', [
    ['name', filled(item.name)],
    ['state', filled(item.state)],
    ['city', filled(item.city)],
  ]);
  if (item.category === 'producer') return [nameStep];
  const info = item.operationalInfo ?? {};
  const declined = item.declinedLinks ?? [];
  // Translado não tem sede: só a região é obrigatória (escolhas da F1, 2026-11-15).
  const fixedPlace = item.category !== 'transfer';
  const steps = [
    nameStep,
    step('photos', [['images', (item.images ?? []).some(filled)]]),
    step('about', [
      ['description', filled(item.description)],
      ['languages', someOf(info.languages)],
    ]),
    step('where', [
      ['address', !fixedPlace || filled(item.address)],
      ['googleMapsLink', !fixedPlace || filled(item.googleMapsLink)],
      ['region', filled(item.location)],
    ]),
    step('details', detailChecks(item)),
  ];
  // Quem vende pelo app não mostra Instagram nem site (C2): o passo só existe na vitrine.
  if (sellsThroughApp(item.category, info.access)) return steps;
  return [
    ...steps,
    step('contacts', [
      ['instagram', filled(item.instagramLink) || declined.includes('instagram')],
      ['website', filled(item.websiteLink) || declined.includes('website')],
    ]),
  ];
}

/** Passos que estavam completos em `before` e não estão em `after`. */
export function stepsLost(before: ListingStep[], after: ListingStep[]): ListingStep[] {
  return after.filter(
    (current) => !current.done && before.some((old) => old.id === current.id && old.done)
  );
}

/**
 * O mínimo para o admin publicar um anúncio do Use Guide (escolhas da F4): nome, cidade, região e 1
 * foto. O resto fica para quem assumir o anúncio completar ("Complete seu anúncio", D35).
 */
export function minimumPublishSteps(item: ListingSetupInput): ListingStep[] {
  if (item.category === 'tips') return [];
  return [
    step('name', [
      ['name', filled(item.name)],
      ['state', filled(item.state)],
      ['city', filled(item.city)],
    ]),
    step('photos', [['images', (item.images ?? []).some(filled)]]),
    step('where', [['region', filled(item.location)]]),
  ];
}
