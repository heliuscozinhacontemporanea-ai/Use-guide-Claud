import { Router } from 'express';
import { GuideController } from '../controllers/guideController';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';

export const itemRouter = Router();
itemRouter.post('/', verifyAdminToken, GuideController.createItem);
itemRouter.put('/:id', verifyAdminToken, GuideController.updateItem);
itemRouter.delete('/:id', verifyAdminToken, GuideController.deleteItem);


