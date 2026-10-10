import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { AdminDomainError } from '../errors/adminDomainError';
import { UpdateSubscriptionPlanDTO } from '../dtos/updateSubscriptionPlanDTO';
import { updatePlanSchema } from '../schemas/adminPlanSchema';
import {
  getSubscriptionPlansUseCase,
  updateSubscriptionPlanUseCase,
} from '../index';

function handleAdminPlanError(
  res: Response,
  error: unknown
): Response {
  if (error instanceof AdminDomainError) {
    switch (error.code) {
      case 'INVALID_ID':
      case 'VALIDATION_ERROR':
        return res.status(400).json({
          error: error.message,
        });
      case 'NOT_FOUND':
        return res.status(404).json({
          error: error.message,
        });
      case 'FORBIDDEN':
        return res.status(403).json({
          error: error.message,
        });
    }
  }
  console.error('[AdminPlansController]', error);
  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
}

export class AdminPlansController {
  static async updatePlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const rawPlanId = req.params.id;
      const planId = Array.isArray(rawPlanId)
        ? rawPlanId[0]
        : rawPlanId;
      if (!planId) {
        return res.status(400).json({
          error: 'ID do plano é obrigatório',
        });
      }
      const parsed = updatePlanSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.flatten(),
        });
      }
      const dto = UpdateSubscriptionPlanDTO.fromValidatedInput(parsed.data);
      await updateSubscriptionPlanUseCase(planId, dto.fields);
      return res.status(200).json({
        status: 'success',
        message: 'Plano atualizado com sucesso',
      });
    } catch (error: unknown) {
      return handleAdminPlanError(res, error);
    }
  }

  static async getPlans(
    _req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const plans = await getSubscriptionPlansUseCase();
      return res.status(200).json({
        status: 'success',
        plans,
      });
    } catch (error: unknown) {
      return handleAdminPlanError(res, error);
    }
  }
}
