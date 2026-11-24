import type { Response } from 'express';
import { registerPartnerApplicationUseCase } from '../../../application/usecases/registerPartnerApplicationUseCase';
import { PartnerDomainError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { registerPartnerSchema } from './schemas/partnerRegistrationSchemas';

// TODO(B45): erro em texto solto; vira `{ code, message }` junto com o adapter do app.
function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof PartnerDomainError) {
    switch (error.code) {
      case 'FORBIDDEN':
        return res.status(403).json({ error: error.message });
      case 'NOT_FOUND':
        return res.status(404).json({ error: error.message });
      case 'CONFLICT':
        return res.status(409).json({ error: error.message });
      case 'EMAIL_NOT_VERIFIED':
        return res.status(403).json({ error: { code: error.code, message: error.message } });
      default:
        return res.status(400).json({ error: error.message });
    }
  }
  console.error('[PartnerRegistrationController Error]:', error);
  return res.status(500).json({ error: 'Erro ao cadastrar parceiro' });
}

/** "Seja parceiro": aceite dos termos e perfil de parceiro, pela camada de aplicação (D35, item 9). */
export class PartnerRegistrationController {
  static async registerOrUpgrade(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }
      const parsed = registerPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
      }
      await registerPartnerApplicationUseCase(
        { uid, emailVerified: req.user?.emailVerified === true },
        { termsAccepted: parsed.data.formData.termsAccepted }
      );
      return res
        .status(200)
        .json({ status: 'success', message: 'Parceiro cadastrado com sucesso' });
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }
}
