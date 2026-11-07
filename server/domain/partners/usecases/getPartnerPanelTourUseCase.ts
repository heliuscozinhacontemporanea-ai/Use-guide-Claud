import { partnerService } from '../factory';

/** Quando o parceiro concluiu o tour do painel ou marcou "Não mostrar novamente"; null se nunca. */
export function getPartnerPanelTourUseCase(partnerId: string): Promise<string | null> {
  return partnerService.getPanelTourDoneAt(partnerId);
}
