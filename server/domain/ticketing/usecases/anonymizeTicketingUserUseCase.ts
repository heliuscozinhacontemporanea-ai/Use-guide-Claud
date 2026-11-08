import { ticketHolderService } from '../factory';

/** Exclusão de conta: tira o dado pessoal do ticketing e mantém pedidos e ingressos (§7.5). */
export function anonymizeTicketingUserUseCase(uid: string): Promise<number> {
  return ticketHolderService.anonymizeUser(uid);
}
