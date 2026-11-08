import crypto from 'crypto';
import { adminDb } from './adminClient';

const RATE_LIMITS = 'rateLimits';

/**
 * Janela fixa num documento por chave, atualizado em transação (Cloud Run não guarda estado em
 * memória, §2.3). A chave vira hash para nunca gravar uid ou IP em texto (§7.5).
 * Devolve false quando o limite da janela já foi atingido.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs = Date.now()
): Promise<boolean> {
  const id = crypto.createHash('sha256').update(key).digest('hex');
  const ref = adminDb.collection(RATE_LIMITS).doc(id);
  return adminDb.runTransaction(async (tx) => {
    const data = (await tx.get(ref)).data();
    const windowStart = typeof data?.windowStart === 'number' ? data.windowStart : 0;
    const fresh = nowMs - windowStart >= windowMs;
    const count = fresh ? 0 : typeof data?.count === 'number' ? data.count : 0;
    if (count >= limit) return false;
    tx.set(ref, {
      windowStart: fresh ? nowMs : windowStart,
      count: count + 1,
      // Campo para a política de TTL do Firestore apagar janelas antigas.
      expiresAt: new Date((fresh ? nowMs : windowStart) + windowMs * 2),
    });
    return true;
  });
}
