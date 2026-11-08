import { FirestorePromoCodeAdapter } from './adapters/firestorePromoCodeAdapter';
import { PromoCodeService } from './services/promoCodeService';

export const promoCodeService = new PromoCodeService(new FirestorePromoCodeAdapter());
