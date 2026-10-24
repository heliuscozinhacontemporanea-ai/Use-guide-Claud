import { Response } from 'express';
import { registerPartnerApplicationUseCase } from '../../../application/usecases/registerPartnerApplicationUseCase';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { RegisterPartnerDTO } from '../dtos/RegisterPartnerDTO';
import { PartnerDomainError } from '../errors/partnerDomainError';
import { partnerService } from '../factory';
import { registerPartnerSchema, updatePartnerStatusSchema } from '../schemas/partnerSchema';

function handleControllerError(res: Response, error: unknown, defaultMessage: string): Response {
  if (error instanceof PartnerDomainError) {
    switch (error.code) {
      case 'INVALID_ARGUMENT':
        return res.status(400).json({ error: error.message });
      case 'FORBIDDEN':
        return res.status(403).json({ error: error.message });
      case 'NOT_FOUND':
        return res.status(404).json({ error: error.message });
      case 'CONFLICT':
        return res.status(409).json({ error: error.message });
      default:
        return res.status(400).json({ error: error.message });
    }
  }
  const msg = error instanceof Error ? error.message : defaultMessage;
  console.error(`[PartnerController Error]:`, error);
  return res.status(500).json({ error: msg });
}

export class PartnerController {
  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const parsed = updatePartnerStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
      }

      const partnerId = parsed.data.partnerId || uid;

      await partnerService.updatePartnerStatus(
        { uid, admin: req.user?.admin },
        partnerId,
        parsed.data.status
      );

      return res
        .status(200)
        .json({ status: 'success', message: 'Status do parceiro atualizado com sucesso' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao alterar status do parceiro');
    }
  }

  static async registerOrUpgrade(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const parsed = registerPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
      }

      const dto = RegisterPartnerDTO.fromValidatedInput(parsed.data);
      await registerPartnerApplicationUseCase(uid, dto.formData);
      return res
        .status(200)
        .json({ status: 'success', message: 'Parceiro cadastrado com sucesso' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao cadastrar parceiro');
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const rawPartnerId = req.params.partnerId || req.user?.uid;
      const partnerId = Array.isArray(rawPartnerId) ? rawPartnerId[0] : rawPartnerId;
      if (!partnerId) {
        return res.status(400).json({ error: 'ID do parceiro é obrigatório' });
      }

      if (!req.user?.admin && req.user?.uid !== partnerId) {
        return res.status(403).json({
          error: 'Acesso não autorizado',
        });
      }

      const profile = await partnerService.getProfile(partnerId);
      if (!profile) {
        return res.status(404).json({ error: 'Perfil de parceiro não encontrado' });
      }
      return res.status(200).json(profile);
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao buscar perfil de parceiro');
    }
  }

  static async deletePartner(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const rawPartnerId = req.params.partnerId || uid;
      const partnerId = (Array.isArray(rawPartnerId) ? rawPartnerId[0] : rawPartnerId) || uid;

      if (!req.user?.admin && uid !== partnerId) {
        return res.status(403).json({ error: 'Sem permissão para excluir este parceiro' });
      }

      await partnerService.deletePartnerProfile(partnerId);
      return res.status(200).json({ status: 'success', message: 'Parceiro excluído com sucesso' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir parceiro');
    }
  }
}
