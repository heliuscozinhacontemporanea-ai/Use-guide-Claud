import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { PromoterController } from './promoterController';

export const promoterRouter = Router();
promoterRouter.get('/', verifyAuthToken, PromoterController.list);
promoterRouter.post(
  '/',
  verifyAuthToken,
  rateLimitByUser('promoter-invite', 60, 60 * 60_000),
  PromoterController.invite
);
promoterRouter.get('/me', verifyAuthToken, PromoterController.mine);
promoterRouter.post('/:promoterId/end', verifyAuthToken, PromoterController.end);
promoterRouter.post('/:promoterId/response', verifyAuthToken, PromoterController.respond);
