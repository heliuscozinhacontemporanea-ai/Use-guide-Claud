import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { guideService } from '../factory';
import { GuideDomainError } from '../errors/guideDomainError';
import {
  createItemSchema,
  updateItemSchema,
} from '../schemas/guideSchema';
import { CreateGuideItemDTO } from '../dtos/createGuideItemDTO';
import { UpdateGuideItemDTO } from '../dtos/updateGuideItemDTO';

function handleError(res: Response, error: unknown): Response {
  if (error instanceof GuideDomainError) {
    switch (error.code) {
      case 'INVALID_ID':
      case 'VALIDATION_ERROR':
        return res.status(400).json({
          error: error.message,
        });
      case 'FORBIDDEN':
        return res.status(403).json({
          error: error.message,
        });
      case 'NOT_FOUND':
        return res.status(404).json({
          error: error.message,
        });
    }
  }
  console.error('[GuideController]', error);
  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
}

function resolveUserContext(req: AuthenticatedRequest) {
  return (
    req.guideUserContext ?? {
      uid: req.user!.uid,
      email: req.user?.email,
      admin: req.user?.admin ?? false,
      role: req.user?.admin ? 'admin' : 'user',
    }
  );
}

export class GuideController {
  static async createItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }
      const parsed = createItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.flatten(),
        });
      }
      const dto = CreateGuideItemDTO.fromValidatedInput(parsed.data);
      const userCtx = resolveUserContext(req);
      const id = await guideService.createItem(userCtx, dto.data);
      return res.status(201).json({
        status: 'success',
        id,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }
      const parsed = updateItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.flatten(),
        });
      }
      const dto = UpdateGuideItemDTO.fromValidatedInput(parsed.data);
      const userCtx = resolveUserContext(req);
      await guideService.updateItem(userCtx, String(req.params.id ?? ''), dto.data);
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async deleteItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }
      const userCtx = resolveUserContext(req);
      await guideService.deleteItem(userCtx, String(req.params.id ?? ''));
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      return handleError(res, error);
    }
  }
}
