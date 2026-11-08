import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PromoCodesController } from './promoCodesController';

const router = Router();

router.get('/', verifyAuthToken, PromoCodesController.list);
router.post('/', verifyAuthToken, PromoCodesController.create);
router.put('/:id', verifyAuthToken, PromoCodesController.replace);
router.patch('/:id', verifyAuthToken, PromoCodesController.updateLimits);
router.delete('/:id', verifyAuthToken, PromoCodesController.remove);

export default router;
