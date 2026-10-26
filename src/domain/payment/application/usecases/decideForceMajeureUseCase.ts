import { adminFinanceApiAdapter } from '../../factory';

/** Aprovada, a multa é perdoada; recusada, volta a valer com 24 h para pagar (D16, 3A). */
export function decideForceMajeureUseCase(debtId: string, approve: boolean): Promise<void> {
  return adminFinanceApiAdapter.decideForceMajeure(debtId, approve);
}
