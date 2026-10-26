import { saleClaimService } from '../factory';
import type { OpenSaleClaimInput } from '../services/saleClaimService';
import type { SaleClaim } from '../types/saleClaim';

/** Quem chama confere que o comprador é dono da venda e informa as datas do serviço. */
export function openSaleClaimUseCase(input: OpenSaleClaimInput): Promise<SaleClaim> {
  return saleClaimService.open(input);
}
