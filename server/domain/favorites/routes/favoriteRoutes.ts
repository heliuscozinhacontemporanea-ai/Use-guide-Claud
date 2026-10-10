import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';

const router = Router();

router.get('/', verifyAuthToken, FavoriteController.getUserFavorites);
router.post('/', verifyAuthToken, FavoriteController.addFavorite);
router.delete('/:itemCollection/:itemId', verifyAuthToken, FavoriteController.removeFavorite);

export default router;
