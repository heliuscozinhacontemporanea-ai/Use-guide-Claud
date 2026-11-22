import { z } from 'zod';
import {
  BOOKING_CANCELLATION_POLICIES,
  TRANSFER_CANCELLATION_POLICIES,
} from '../../../shared/utils/cancellationPolicy';
import { parseReaisToMinor } from '../utils/money';

// As mensagens são chaves de tradução; o formulário mostra t(mensagem) (AGENTS.md §12.5).
const required = 'bookings.validation.required';
const tooLong = 'bookings.validation.tooLong';
const integer = 'bookings.validation.integer';
const priceInvalid = 'bookings.validation.priceInvalid';
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalText = (max: number) => z.string().trim().max(max, tooLong);
const positivePrice = (value: string) => (parseReaisToMinor(value) ?? 0) > 0;
const minutesOf = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));

// Um texto só, sem abas por idioma (F3, D34): a tradução automática da D5 fica pendente.
export const offerFormSchema = z
  .object({
    kind: z.enum(['tour', 'private_entry', 'rental', 'transfer']),
    title: z.string().trim().min(1, required).max(120, tooLong),
    description: optionalText(5000),
    // Passeio, entrada e translado compartilhado: opções de preço por pessoa.
    priceOptions: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().trim().max(60, tooLong),
          amount: z.string(),
        })
      )
      .max(10),
    durationHours: z.coerce.number().int(integer).min(0, integer).max(24, integer),
    durationMins: z.coerce.number().int(integer).min(0, integer).max(59, integer),
    meetingPoint: optionalText(300),
    pickupMode: z.enum(['meeting_point', 'buyer_address']),
    cancellationPolicy: z.enum([
      ...BOOKING_CANCELLATION_POLICIES,
      ...TRANSFER_CANCELLATION_POLICIES,
    ]),
    maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
    requiresParticipantNames: z.boolean(),
    sellingUnit: z.enum(['person', 'group']),
    // Pessoas por grupo (passeio, a partir de 2) ou por veículo (aluguel e translado, a partir de 1).
    groupMaxPeople: z.coerce.number().int(integer).min(1, integer).max(50, integer),
    // Aluguel (F3b): veículo do anúncio, períodos fixos, horário personalizado e CNH.
    vehicle: z.string(),
    requiresDriverLicense: z.boolean(),
    periods: z
      .array(
        z.object({
          id: z.string().min(1),
          start: z.string(),
          hours: z.coerce.number().int(integer).min(0, integer).max(24, integer),
          mins: z.coerce.number().int(integer).min(0, integer).max(59, integer),
          amount: z.string(),
        })
      )
      .max(12),
    hourlyEnabled: z.boolean(),
    minHours: z.coerce.number().int(integer).min(1, integer).max(24, integer),
    hourlyAmount: z.string(),
    // Translado (F3b): trecho do anúncio, privativo ou compartilhado, saídas e atendimento.
    routeFrom: z.string(),
    routeTo: z.string(),
    vehicleAmount: z.string(),
    departures: z.array(z.object({ id: z.string().min(1), start: z.string() })).max(12),
    anyTimeEnabled: z.boolean(),
    anyTimeFrom: z.string(),
    anyTimeTo: z.string(),
    minNoticeHours: z.coerce.number().int(integer).min(0, integer).max(72, integer),
  })
  .superRefine((values, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const privateTransfer = values.kind === 'transfer' && values.sellingUnit === 'group';
    const perPerson = values.kind !== 'rental' && !privateTransfer;

    if (values.kind === 'tour' || values.kind === 'transfer') {
      const total = values.durationHours * 60 + values.durationMins;
      if (total < 15 || total > 1440) issue(['durationHours'], 'bookings.validation.durationRange');
    }
    if (values.kind === 'tour' && values.sellingUnit === 'group' && values.groupMaxPeople < 2) {
      issue(['groupMaxPeople'], integer);
    }
    if (perPerson) {
      if (values.priceOptions.length === 0)
        issue(['priceOptions'], 'bookings.validation.atLeastOnePrice');
      values.priceOptions.forEach((option, index) => {
        if (!option.label) issue(['priceOptions', index, 'label'], required);
        if (!positivePrice(option.amount)) issue(['priceOptions', index, 'amount'], priceInvalid);
      });
    }

    if (values.kind === 'rental') {
      if (!values.vehicle) issue(['vehicle'], 'bookings.validation.vehicleRequired');
      values.periods.forEach((period, index) => {
        const minutes = period.hours * 60 + period.mins;
        if (!HH_MM.test(period.start) || minutes < 30 || minutesOf(period.start) + minutes > 1440) {
          issue(['periods', index, 'start'], 'bookings.validation.periodInvalid');
        }
        if (!positivePrice(period.amount)) issue(['periods', index, 'amount'], priceInvalid);
      });
      if (values.hourlyEnabled && !positivePrice(values.hourlyAmount))
        issue(['hourlyAmount'], priceInvalid);
      if (values.periods.length === 0 && !values.hourlyEnabled) {
        issue(['periods'], 'bookings.validation.atLeastOnePeriod');
      }
    }

    if (values.kind === 'transfer') {
      if (!values.routeFrom || !values.routeTo)
        issue(['routeFrom'], 'bookings.validation.routeRequired');
      if (privateTransfer) {
        if (!positivePrice(values.vehicleAmount)) issue(['vehicleAmount'], priceInvalid);
        values.departures.forEach((departure, index) => {
          if (!HH_MM.test(departure.start))
            issue(['departures', index, 'start'], 'bookings.validation.periodInvalid');
        });
        const window =
          HH_MM.test(values.anyTimeFrom) &&
          HH_MM.test(values.anyTimeTo) &&
          minutesOf(values.anyTimeFrom) < minutesOf(values.anyTimeTo);
        if (values.anyTimeEnabled && !window)
          issue(['anyTimeFrom'], 'bookings.validation.windowInvalid');
        if (values.departures.length === 0 && !values.anyTimeEnabled) {
          issue(['departures'], 'bookings.validation.atLeastOneDeparture');
        }
      }
    }
  });

export type OfferFormInput = z.input<typeof offerFormSchema>;
export type OfferFormValues = z.output<typeof offerFormSchema>;
