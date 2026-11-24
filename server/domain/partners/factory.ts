import { PartnerService } from './services/partnerService';
import { FirestorePartnerAdapter } from './adapters/firestorePartnerAdapter';
import { FirestoreListingVerificationAdapter } from './adapters/firestoreListingVerificationAdapter';
import { ListingVerificationService } from './services/listingVerificationService';
import { FirestoreListingClaimAdapter } from './adapters/firestoreListingClaimAdapter';
import { ListingClaimService } from './services/listingClaimService';
import { FirestoreListingPlanAdapter } from './adapters/firestoreListingPlanAdapter';
import { ListingPlanService } from './services/listingPlanService';
import { blindIndex, fieldEncryption } from '../../infrastructure/crypto/fieldEncryptionFactory';

const partnerAdapter = new FirestorePartnerAdapter();

export const partnerService = new PartnerService(partnerAdapter);

let listingVerificationService: ListingVerificationService | undefined;

/** Lazy: a criptografia só resolve chave e cliente KMS na primeira chamada (AGENTS.md §2.2 item 4). */
export function getListingVerificationService(): ListingVerificationService {
  listingVerificationService ??= new ListingVerificationService(
    new FirestoreListingVerificationAdapter(),
    fieldEncryption,
    blindIndex
  );
  return listingVerificationService;
}

let listingClaimService: ListingClaimService | undefined;

/** "Sou o dono" (D35): lazy pelo mesmo motivo da verificação. */
export function getListingClaimService(): ListingClaimService {
  listingClaimService ??= new ListingClaimService(
    new FirestoreListingClaimAdapter(),
    new FirestoreListingVerificationAdapter(),
    fieldEncryption,
    blindIndex
  );
  return listingClaimService;
}

export const listingPlanService = new ListingPlanService(new FirestoreListingPlanAdapter());
