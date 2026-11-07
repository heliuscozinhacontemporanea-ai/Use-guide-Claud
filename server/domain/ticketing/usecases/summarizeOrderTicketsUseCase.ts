import { orderReportService } from '../factory';
import type { OrderReportUnits } from '../services/orderReportService';

/** Ingressos por pedido do dono do evento (Relatórios, p23). */
export function summarizeOrderTicketsUseCase(
  ownerUid: string,
  orderIds: string[]
): Promise<Record<string, OrderReportUnits>> {
  return orderReportService.summarize(ownerUid, orderIds);
}
