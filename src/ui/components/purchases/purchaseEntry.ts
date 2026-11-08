import type { ReactNode } from 'react';
import type { StatusTone } from '../StatusText';

/** Em que seção do histórico a compra aparece: o estado do dinheiro, não a data do serviço. */
export type PurchaseSection = 'done' | 'pending' | 'canceled';

/** Uma linha do histórico de compras, montada pelo domínio que vendeu (ingresso, reserva…). */
export interface PurchaseEntry {
  /** Único entre todos os domínios (ex.: `ticket:<id>`). */
  key: string;
  section: PurchaseSection;
  icon: ReactNode;
  title: string;
  code: string;
  purchasedAt: string;
  /** "Evento em 8 de nov.", já traduzido. */
  serviceLine: string;
  amountMinor: number;
  /** Valor riscado: a compra não foi cobrada ou voltou inteira. */
  struck: boolean;
  status: { tone: StatusTone; text: string };
  /** Ação rápida na própria linha, como "Pagar" numa compra pendente. */
  quickAction?: { label: string; onClick: () => void; disabled?: boolean };
}
