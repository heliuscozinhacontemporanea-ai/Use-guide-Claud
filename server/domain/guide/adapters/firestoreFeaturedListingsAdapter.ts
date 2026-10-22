import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { FeaturedListingsPort } from '../ports/featuredListingsPort';
import type { FeaturedListingsProjection } from '../types/featuredListing';

export class FirestoreFeaturedListingsAdapter implements FeaturedListingsPort {
  async replaceAll(projections: FeaturedListingsProjection[]): Promise<void> {
    const batch = adminDb.batch();
    for (const projection of projections) {
      batch.set(adminDb.collection('featuredListings').doc(projection.list), projection);
    }
    await batch.commit();
  }
}
