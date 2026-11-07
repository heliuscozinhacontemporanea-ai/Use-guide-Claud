import { partnerService } from '../factory';

/** Tour concluído ou "Não mostrar novamente": não abre mais sozinho, em nenhum aparelho. */
export function completePartnerPanelTourUseCase(partnerId: string): Promise<void> {
  return partnerService.setPanelTourDone(partnerId);
}
