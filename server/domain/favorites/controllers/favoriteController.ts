import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { favoriteService } from '../factory';
import { addFavoriteSchema, removeFavoriteParamsSchema } from '../schemas/favoriteSchema';
import { FavoriteDTO } from '../dtos/FavoriteDTO';

export class FavoriteController {
  static async addFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const parsed = addFavoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
        return;
      }

      await favoriteService.addFavorite({
        userId: uid,
        itemId: parsed.data.itemId,
        itemCollection: parsed.data.itemCollection,
      });
      res.status(200).json({ status: 'success', message: 'Favorito adicionado com sucesso' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao adicionar favorito';
      console.error('[FavoriteController.addFavorite Error]:', error);
      res.status(500).json({ error: msg });
    }
  }

  static async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const parsed = removeFavoriteParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ error: 'Parâmetros inválidos', details: parsed.error.format() });
        return;
      }

      await favoriteService.removeFavorite(uid, parsed.data.itemCollection, parsed.data.itemId);
      res.status(200).json({ status: 'success', message: 'Favorito removido com sucesso' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao remover favorito';
      console.error('[FavoriteController.removeFavorite Error]:', error);
      res.status(500).json({ error: msg });
    }
  }

  static async getUserFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const favorites = await favoriteService.getUserFavorites(uid);
      res.status(200).json({ status: 'success', favorites });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter favoritos';
      console.error('[FavoriteController.getUserFavorites Error]:', error);
      res.status(500).json({ error: msg });
    }
  }
}
