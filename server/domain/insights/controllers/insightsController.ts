import { Response } from 'express';
import { z } from 'zod';
import { insightsService } from '../factory';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';

const trackInteractionSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
    itemCollection: z.enum(['items', 'events']),
    type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
  })
  .strict();

const getItemStatsParamsSchema = z.object({
  itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
  itemCollection: z.enum(['items', 'events']).optional(),
});

export class InsightsController {
  static async trackInteraction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parseResult = trackInteractionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação no payload de interação',
          details: parseResult.error.issues,
        });
        return;
      }

      const userId = req.user?.uid ?? null;

      await insightsService.trackInteraction({
        itemId: parseResult.data.itemId,
        itemCollection: parseResult.data.itemCollection,
        type: parseResult.data.type,
        userId,
      });

      res.status(200).json({ success: true, message: 'Interação registrada com sucesso.' });
    } catch (error) {
      console.error('[InsightsController.trackInteraction Error]:', error);
      res.status(500).json({ error: 'Erro interno ao registrar interação.' });
    }
  }

  static async getItemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const parseResult = getItemStatsParamsSchema.safeParse(req.params);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação no parâmetro da requisição',
          details: parseResult.error.issues,
        });
        return;
      }

      const itemCollection = (parseResult.data.itemCollection ||
        req.query.itemCollection ||
        'items') as 'items' | 'events';
      const stats = await insightsService.getItemStats(parseResult.data.itemId, itemCollection, {
        uid: req.user.uid,
        admin: req.user.admin,
      });
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      if (error?.message === 'FORBIDDEN') {
        res.status(403).json({ error: 'Acesso não autorizado às métricas deste item.' });
        return;
      }
      console.error('[InsightsController.getItemStats Error]:', error);
      res.status(500).json({ error: 'Erro interno ao obter estatísticas.' });
    }
  }
}
