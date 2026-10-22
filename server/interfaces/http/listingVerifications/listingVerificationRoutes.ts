import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingVerificationController } from './listingVerificationController';

// Envio de documento pessoal: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/', verifyAdminToken, ListingVerificationController.list);
router.get('/:itemId', verifyAuthToken, ListingVerificationController.get);
router.put('/:itemId', verifyAuthTokenStrict, ListingVerificationController.submit);
router.post('/:itemId/review', verifyAdminToken, ListingVerificationController.review);
router.get('/:itemId/files/:kind', verifyAdminToken, ListingVerificationController.readFile);

export default router;
