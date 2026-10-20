import type { ListingDocumentType } from '../types/listingVerification';

/** Exibição mascarada (AGENTS.md §7.6): CPF mostra só o dígito verificador; CNPJ, a ordem e o dígito. */
export function maskDocument(type: ListingDocumentType, normalized: string): string {
  if (type === 'cpf') return `***.***.***-${normalized.slice(-2)}`;
  return `**.***.***/${normalized.slice(8, 12)}-${normalized.slice(-2)}`;
}
