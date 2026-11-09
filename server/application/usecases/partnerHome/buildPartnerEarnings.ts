import type { PayoutEntryView } from '../../../domain/payment';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';

export type PartnerPayoutStatus = 'scheduled' | 'held' | 'paid';

/** Venda dentro de um repasse (p21). */
export interface PartnerPayoutLine {
  id: string;
  title: string | null;
  referenceType: string;
  serviceEndsAt: string;
  grossMinor: number;
  serviceFeeMinor: number;
  refundedMinor: number;
  platformFeeMinor: number;
  offsetMinor: number;
  /** O que cai na conta por esta venda, já sem desconto de dívida. */
  netMinor: number;
}

/**
 * Repasse como o parceiro vê (p20): as vendas do mesmo CNPJ que caem no mesmo dia. No Stripe cada
 * venda é uma transferência própria; o agrupamento é só da tela.
 */
export interface PartnerPayoutGroup {
  id: string;
  status: PartnerPayoutStatus;
  /** Dia em que cai (programado) ou caiu (pago); retido: a data em que cairia. */
  date: string;
  accountKey: string;
  account: { maskedDocument: string; name: string | null };
  amountMinor: number;
  holdReasons: string[];
  lines: PartnerPayoutLine[];
}

export interface PartnerEarningsView {
  toReceiveMinor: number;
  receivedThisMonthMinor: number;
  payouts: PartnerPayoutGroup[];
  accounts: { count: number; ready: number };
}

export interface EarningsInput {
  nowIso: string;
  /** Fuso do painel (D28), para agrupar por dia. */
  timeZone: string;
  monthStartIso: string;
  open: PayoutEntryView[];
  released: PayoutEntryView[];
  accounts: Array<{
    accountKey: string;
    maskedDocument: string;
    itemIds: string[];
    ready: boolean;
  }>;
  names: Map<string, string>;
}

const PAID_GROUPS = 10;
const net = (entry: PayoutEntryView) => Math.max(0, entry.partnerAmountMinor - entry.offsetMinor);

function line(entry: PayoutEntryView): PartnerPayoutLine {
  return {
    id: entry.id,
    title: entry.title,
    referenceType: entry.referenceType,
    serviceEndsAt: entry.serviceEndsAt,
    grossMinor: entry.grossMinor,
    serviceFeeMinor: entry.serviceFeeMinor,
    refundedMinor: entry.refundedMinor,
    platformFeeMinor: entry.platformFeeMinor,
    offsetMinor: entry.offsetMinor,
    netMinor: net(entry),
  };
}

/** Ganhos do parceiro: o que falta receber, o que já caiu no mês e os repasses (D14, D16). */
export function buildPartnerEarnings(input: EarningsInput): PartnerEarningsView {
  const accountOf = (accountKey: string) => {
    const account = input.accounts.find((entry) => entry.accountKey === accountKey);
    const name = account?.itemIds.map((id) => input.names.get(id)).find(Boolean) ?? null;
    return { maskedDocument: account?.maskedDocument ?? '', name };
  };

  const grouped = (
    entries: PayoutEntryView[],
    status: PartnerPayoutStatus,
    dateOf: (entry: PayoutEntryView) => string
  ) => {
    const groups = new Map<string, PartnerPayoutGroup>();
    for (const entry of entries) {
      const day = new Date(businessDayStartMs(dateOf(entry), input.timeZone)).toISOString();
      const id = `${status}_${entry.accountKey}_${day}`;
      const group = groups.get(id) ?? {
        id,
        status,
        date: dateOf(entry),
        accountKey: entry.accountKey,
        account: accountOf(entry.accountKey),
        amountMinor: 0,
        holdReasons: [],
        lines: [],
      };
      group.amountMinor += net(entry);
      group.lines.push(line(entry));
      groups.set(id, group);
    }
    return [...groups.values()];
  };

  const pending = input.open.filter((entry) => entry.status === 'pending');
  // Retida fica sozinha: cada uma espera a própria decisão (reclamação, disputa, prova do serviço).
  const held = input.open
    .filter((entry) => entry.status === 'on_hold')
    .map(
      (entry): PartnerPayoutGroup => ({
        id: `held_${entry.id}`,
        status: 'held',
        date: entry.releaseAt,
        accountKey: entry.accountKey,
        account: accountOf(entry.accountKey),
        amountMinor: net(entry),
        holdReasons: entry.holdReasons,
        lines: [line(entry)],
      })
    );
  const scheduled = grouped(pending, 'scheduled', (entry) => entry.releaseAt).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const paid = grouped(input.released, 'paid', (entry) => entry.releasedAt ?? entry.releaseAt)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PAID_GROUPS);

  return {
    toReceiveMinor: input.open.reduce((sum, entry) => sum + net(entry), 0),
    receivedThisMonthMinor: input.released
      .filter((entry) => (entry.releasedAt ?? '') >= input.monthStartIso)
      .reduce((sum, entry) => sum + net(entry), 0),
    payouts: [...scheduled, ...held, ...paid],
    accounts: {
      count: input.accounts.length,
      ready: input.accounts.filter((account) => account.ready).length,
    },
  };
}
