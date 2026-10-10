import { describe, expect, it } from 'vitest';
import {
  checkInFormSchema,
  createTicketTypeFormSchema,
  ticketCheckoutFormSchema,
} from '../schemas/ticketingFormSchema';
import { formatMoneyMinorBrl } from '../types/ticketing';

describe('Ticketing Frontend Schemas & Formatters', () => {
  it('formats minor currency units in BRL accurately', () => {
    expect(formatMoneyMinorBrl(0)).toBe('Gratuito');
    expect(formatMoneyMinorBrl(12550)).toContain('125,50');
  });

  it('rejects ticket type creation when maxPerOrder is less than minPerOrder', () => {
    const res = createTicketTypeFormSchema.safeParse({
      name: 'Lote VIP',
      kind: 'paid',
      priceMajor: 120,
      quantity: 50,
      minPerOrder: 5,
      maxPerOrder: 2,
    });
    expect(res.success).toBe(false);
  });

  it('rejects paid ticket type without positive price', () => {
    const res = createTicketTypeFormSchema.safeParse({
      name: 'Lote Pago Inválido',
      kind: 'paid',
      priceMajor: 0,
      quantity: 50,
      minPerOrder: 1,
      maxPerOrder: 5,
    });
    expect(res.success).toBe(false);
  });

  it('accepts free ticket type with zero price', () => {
    const res = createTicketTypeFormSchema.safeParse({
      name: 'Entrada Gratuita',
      kind: 'free',
      priceMajor: 0,
      quantity: 100,
      minPerOrder: 1,
      maxPerOrder: 4,
    });
    expect(res.success).toBe(true);
  });

  it('rejects checkout order form with invalid buyer email', () => {
    const res = ticketCheckoutFormSchema.safeParse({
      buyerName: 'Maria',
      buyerEmail: 'email-invalido',
      buyerDocument: '12345678901',
      paymentMethod: 'pix',
    });
    expect(res.success).toBe(false);
  });

  it('validates check-in form code', () => {
    expect(checkInFormSchema.safeParse({ codeOrTicketId: 'ab' }).success).toBe(false);
    expect(checkInFormSchema.safeParse({ codeOrTicketId: 'tkt_12345678' }).success).toBe(true);
  });
});
