import { paymentAccountService } from '../factory';

/** Uid do dono de cada conta por `accountKey`; quem chama garante o papel de admin. */
export function getPaymentAccountOwnersUseCase(
  accountKeys: string[]
): Promise<Record<string, string>> {
  return paymentAccountService.getOwners(accountKeys);
}
