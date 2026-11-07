import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { userService } from '../factory';
import { MediaDomainError } from '../../media';
import {
  updateUserPreferencesSchema,
  updateUserProfileSchema,
  uploadUserPhotoSchema,
} from '../schemas/userSchema';
import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const profile = await userService.getProfile(uid);
      return res.status(200).json(profile || {});
    } catch (error) {
      console.error('[UserController.getProfile Error]:', error);
      return res.status(500).json({ error: 'Não foi possível obter os dados do perfil.' });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const parseResult = updateUserProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Dados de perfil inválidos',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const updatedProfile = await userService.updateProfile(uid, parseResult.data);
      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('[UserController.updateProfile Error]:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar o perfil.' });
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response) {
    const uid = req.user?.uid;
    if (!uid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login para salvar o idioma.' } });
    }
    const parseResult = updateUserPreferencesSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Idioma não suportado.' } });
    }
    try {
      await userService.updatePreferences(uid, parseResult.data);
      return res.status(204).end();
    } catch (error) {
      console.error('[UserController.updatePreferences Error]:', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Não foi possível salvar o idioma.' },
      });
    }
  }

  static async uploadPhoto(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const parseResult = uploadUserPhotoSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Imagem inválida',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const photoURL = await userService.uploadPhoto(uid, parseResult.data.photoBase64);
      return res.status(200).json({ photoURL });
    } catch (error) {
      if (error instanceof MediaDomainError) {
        return res
          .status(error.statusCode)
          .json({ error: { code: error.code, message: error.message } });
      }
      console.error('[UserController.uploadPhoto Error]:', error);
      return res.status(500).json({ error: 'Não foi possível realizar o upload da foto.' });
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      await deleteUserAccountApplicationUseCase(uid);
      return res
        .status(200)
        .json({ status: 'success', message: 'Conta e dados associados excluídos com sucesso' });
    } catch (error) {
      console.error('[UserController.deleteAccount Error]:', error);
      return res.status(500).json({ error: 'Não foi possível excluir a conta.' });
    }
  }
}
