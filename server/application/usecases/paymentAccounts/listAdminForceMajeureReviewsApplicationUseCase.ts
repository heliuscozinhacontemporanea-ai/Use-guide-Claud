import {
  type ForceMajeureReviewView,
  listForceMajeureReviewsUseCase,
} from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from './sellerAccountSummary';

export type AdminForceMajeureReviewView = ForceMajeureReviewView & SellerAccountSummary;

/** Fila de força maior com o vendedor de cada multa; quem chama garante o papel de admin. */
export async function listAdminForceMajeureReviewsApplicationUseCase(
  limit = 50
): Promise<AdminForceMajeureReviewView[]> {
  const reviews = await listForceMajeureReviewsUseCase(limit);
  const sellers = await describeSellerAccountsApplicationUseCase(
    reviews.map((review) => review.accountKey)
  );
  return reviews.map((review) => ({ ...review, ...sellerOf(sellers, review.accountKey) }));
}
