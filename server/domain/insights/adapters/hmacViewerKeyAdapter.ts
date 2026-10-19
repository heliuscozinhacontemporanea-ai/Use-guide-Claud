import { createHmac } from 'crypto';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import type { ViewerKeyPort } from '../ports/viewerKeyPort';

/**
 * HMAC-SHA-256 com a chave `INSIGHTS_VIEWER_KEY` (Secret Manager): a chave gravada não revela o
 * uid nem o IP. Sem segredo configurado, falha na primeira chamada (AGENTS.md §2.2 item 4, §7.7).
 */
export class HmacViewerKeyAdapter implements ViewerKeyPort {
  keyFor(viewer: string): string {
    const secret = process.env.INSIGHTS_VIEWER_KEY?.trim();
    if (!secret || secret.length < 32) {
      console.error('[insights] INSIGHTS_VIEWER_KEY ausente ou com menos de 32 caracteres.');
      throw new InsightsUnavailableError();
    }
    return createHmac('sha256', secret).update(viewer).digest('base64url');
  }
}
