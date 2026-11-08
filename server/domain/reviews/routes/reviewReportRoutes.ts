import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ReviewReportController } from '../controllers/reviewReportController';

export const reviewReportRouter = Router();
reviewReportRouter.post('/', verifyAuthToken, ReviewReportController.report);
reviewReportRouter.get('/mine', verifyAuthToken, ReviewReportController.listMine);

export const adminReviewReportRouter = Router();
adminReviewReportRouter.get('/', verifyAuthToken, ReviewReportController.listOpen);
adminReviewReportRouter.post('/:reportId/decision', verifyAuthToken, ReviewReportController.decide);
