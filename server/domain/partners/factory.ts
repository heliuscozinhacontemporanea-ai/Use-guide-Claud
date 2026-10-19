import { PartnerService } from './services/partnerService';
import { FirestorePartnerAdapter } from './adapters/firestorePartnerAdapter';
import { FirestoreListingVerificationAdapter } from './adapters/firestoreListingVerificationAdapter';
import { ListingVerificationService } from './services/listingVerificationService';
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
