import { FavoritesPort, FavoriteDocument } from '../ports/favoritesPort';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { FieldValue } from 'firebase-admin/firestore';

export class FirestoreFavoritesAdapter implements FavoritesPort {
  async addFavorite(data: FavoriteDocument): Promise<void> {
    const docId = `${data.userId}_${data.itemCollection}_${data.itemId}`;
    const docRef = adminDb.collection('favorites').doc(docId);
    await docRef.set(
      {
        userId: data.userId,
        itemId: data.itemId,
        itemCollection: data.itemCollection,
        itemTypeLabel: data.itemTypeLabel || '',
        partnerId: data.partnerId || null,
        ...(data.itemDetails ? { itemDetails: data.itemDetails } : {}),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  async removeFavorite(
    userId: string,
    itemCollection: 'items' | 'events',
    itemId: string
  ): Promise<void> {
    const docId = `${userId}_${itemCollection}_${itemId}`;
    await adminDb.collection('favorites').doc(docId).delete();
  }

  async getUserFavorites(userId: string): Promise<FavoriteDocument[]> {
    const snapshot = await adminDb.collection('favorites').where('userId', '==', userId).get();
    return snapshot.docs.map((doc) => doc.data() as FavoriteDocument);
  }
}
