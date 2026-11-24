import { randomUUID } from 'crypto';

/** Chave de idempotência quando o app não manda uma (AGENTS.md §8.5); não é segredo. */
export function newIdempotencyKey(): string {
  return randomUUID();
}
