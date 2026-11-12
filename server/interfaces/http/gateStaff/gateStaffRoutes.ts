import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { GateStaffController } from './gateStaffController';

export const gateStaffRouter = Router();
gateStaffRouter.use(verifyAuthToken);
gateStaffRouter.get('/', GateStaffController.listForOwner);
gateStaffRouter.post(
  '/',
  rateLimitByUser('gate-staff-invite', 60, 60 * 60_000),
  GateStaffController.invite
);
gateStaffRouter.get('/me', GateStaffController.mine);
gateStaffRouter.get('/occurrences/:occurrenceId/counts', GateStaffController.counts);
gateStaffRouter.delete('/:memberId', GateStaffController.remove);
gateStaffRouter.post('/:memberId/response', GateStaffController.respond);
gateStaffRouter.post('/:memberId/leave', GateStaffController.leave);
