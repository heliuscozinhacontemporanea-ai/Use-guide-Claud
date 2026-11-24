import type { Request, Response } from 'express';
import { writeClientError } from '../../../infrastructure/logging/clientErrorLog';
import { scrubStack, scrubText } from '../../../shared/kernel/scrubPersonalData';
import { clientErrorSchema } from './schemas/clientErrorSchemas';

/** Erros do navegador para o Error Reporting (decisão de 2026-11-24): limpos aqui de novo. */
export class ClientErrorController {
  static report(req: Request, res: Response): Response {
    const parsed = clientErrorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Relato de erro inválido.' } });
    }
    const data = parsed.data;
    writeClientError({
      kind: data.kind,
      name: scrubText(data.name),
      message: scrubText(data.message),
      ...(data.stack ? { stack: scrubStack(data.stack) } : {}),
      ...(data.componentStack ? { componentStack: scrubStack(data.componentStack) } : {}),
      // Só o caminho: parâmetros e âncora podem levar dado pessoal.
      route: data.route.split(/[?#]/)[0] || '/',
      ...(req.get('user-agent') ? { userAgent: req.get('user-agent')?.slice(0, 200) } : {}),
    });
    return res.status(204).send();
  }
}
