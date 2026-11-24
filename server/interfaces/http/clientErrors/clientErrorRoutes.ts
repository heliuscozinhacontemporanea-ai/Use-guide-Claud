import { Router } from 'express';
import { rateLimitByIp } from '../../../infrastructure/http/rateLimitByIp';
import { ClientErrorController } from './clientErrorController';

const router = Router();

// Aberta a visitantes, como o app; o App Check vale para ela como para toda rota /api.
router.post('/', rateLimitByIp('client-errors', 30, 10 * 60_000), ClientErrorController.report);

export default router;
