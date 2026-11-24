import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingClaimController } from './listingClaimController';

// Envio de documento pessoal: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/mine', verifyAuthToken, ListingClaimController.mine);
router.get('/', verifyAdminToken, ListingClaimController.list);
router.post('/items/:itemId', verifyAuthTokenStrict, ListingClaimController.submit);
router.post('/:claimId/review', verifyAdminToken, ListingClaimController.review);
router.post('/:claimId/return', verifyAdminToken, ListingClaimController.returnToUseGuide);
router.get('/:claimId/files/:kind', verifyAdminToken, ListingClaimController.readFile);

export default router;
