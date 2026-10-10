import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { userService } from '../factory';
import { MediaDomainError } from '../../media';
import { updateUserProfileSchema, uploadUserPhotoSchema } from '../schemas/userSchema';
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('[UserController.updateProfile Error]:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar o perfil.' });
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('[UserController.deleteAccount Error]:', error);
      return res.status(500).json({ error: 'Não foi possível excluir a conta.' });
    }
  }
}
