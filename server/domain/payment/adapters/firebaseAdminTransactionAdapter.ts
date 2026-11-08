import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PaymentStatus, PaymentTransaction } from '../ports/paymentGatewayPort';
import type {
  TransactionRecord,
  TransactionRepositoryPort,
  WebhookEventClaimResult,
} from '../ports/transactionRepositoryPort';

function mapDocToTransactionRecord(id: string, data: Record<string, unknown>): TransactionRecord {
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : null,
    referenceType:
      typeof data.referenceType === 'string' && data.referenceType ? data.referenceType : undefined,
    referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
    providerPaymentId: typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
    accountKey: typeof data.accountKey === 'string' ? data.accountKey : null,
    amount: typeof data.amount === 'number' ? data.amount : null,
    amountMinor: typeof data.amountMinor === 'number' ? data.amountMinor : null,
    platformFeeMinor: typeof data.platformFeeMinor === 'number' ? data.platformFeeMinor : null,
    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : null,
    status: typeof data.status === 'string' ? data.status : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    paymentDetail:
      data.paymentDetail && typeof data.paymentDetail === 'object'
        ? (data.paymentDetail as Record<string, unknown>)
        : undefined,
  };
}

export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPort {
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    statusDetail?: string
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const docRef = adminDb.collection('transactions').doc(transactionId);
    const docSnap = await docRef.get();

    const paymentTxRef = adminDb.collection('paymentTransactions').doc(transactionId);
    const paymentTxSnap = await paymentTxRef.get();

    if (paymentTxSnap.exists) {
      await paymentTxRef.update({
        status,
        updatedAt: nowIso,
      });
    }

    if (!docSnap.exists) {
      return paymentTxSnap.exists;
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: nowIso,
    };

    if (statusDetail !== undefined) {
      updateData['paymentDetail.statusDetail'] = statusDetail || null;
    }

    await docRef.update(updateData);
    return true;
  }

  async getTransaction(transactionId: string): Promise<TransactionRecord | null> {
    const snapshot = await adminDb.collection('transactions').doc(transactionId).get();
    if (!snapshot.exists) {
      return null;
    }
    return mapDocToTransactionRecord(
      snapshot.id,
      (snapshot.data() ?? {}) as Record<string, unknown>
    );
  }

  async getTransactionByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null> {
    const snapshot = await adminDb
      .collection('transactions')
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }
    return mapDocToTransactionRecord(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
  }

  async saveTransactionRecord(record: {
    transactionId: string;
    idempotencyKey: string;
    userId: string;
    referenceType: string;
    referenceId: string;
    providerPaymentId: string;
    accountKey?: string;
    amountMinor: number;
    platformFeeMinor: number;
    paymentMethod: string;
    status: PaymentStatus | string;
    paymentResult?: Record<string, unknown>;
  }): Promise<PaymentTransaction> {
    const nowIso = new Date().toISOString();
    const paymentTransaction: PaymentTransaction = {
      id: record.transactionId,
      referenceType: record.referenceType,
      referenceId: record.referenceId,
      provider: 'stripe',
      providerPaymentId: record.providerPaymentId,
      ...(record.accountKey ? { accountKey: record.accountKey } : {}),
      amountMinor: record.amountMinor,
      platformFeeMinor: record.platformFeeMinor,
      currency: 'BRL',
      status: (record.status as PaymentStatus) || 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await adminDb
      .collection('paymentTransactions')
      .doc(record.transactionId)
      .set(paymentTransaction, { merge: true });

    await adminDb
      .collection('transactions')
      .doc(record.transactionId)
      .set(
        {
          idempotencyKey: record.idempotencyKey,
          userId: record.userId,
          referenceType: record.referenceType,
          referenceId: record.referenceId,
          provider: 'stripe',
          providerPaymentId: record.providerPaymentId,
          ...(record.accountKey ? { accountKey: record.accountKey } : {}),
          amount: record.amountMinor / 100,
          amountMinor: record.amountMinor,
          platformFeeMinor: record.platformFeeMinor,
          currency: 'BRL',
          paymentMethod: record.paymentMethod,
          status: record.status,
          createdAt: nowIso,
          updatedAt: nowIso,
          paymentDetail: record.paymentResult ?? {},
        },
        { merge: true }
      );

    return paymentTransaction;
  }

  async claimWebhookEvent(params: {
    eventId: string;
    eventType: string;
    leaseMs: number;
  }): Promise<WebhookEventClaimResult> {
    const docRef = adminDb.collection('stripeWebhookEvents').doc(params.eventId);
    return adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const now = Date.now();
      const data = (snap.exists ? snap.data() : undefined) ?? {};
      if (data.status === 'processed') {
        return 'already_processed';
      }
      if (
        data.status === 'processing' &&
        typeof data.leaseExpiresAt === 'number' &&
        data.leaseExpiresAt > now
      ) {
        return 'in_progress';
      }
      tx.set(
        docRef,
        {
          eventId: params.eventId,
          eventType: params.eventType,
          status: 'processing',
          leaseExpiresAt: now + params.leaseMs,
          attempts: (typeof data.attempts === 'number' ? data.attempts : 0) + 1,
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );
      return 'claimed';
    });
  }

  async completeWebhookEvent(eventId: string): Promise<void> {
    const now = new Date().toISOString();
    await adminDb
      .collection('stripeWebhookEvents')
      .doc(eventId)
      .set(
        { status: 'processed', processedAt: now, updatedAt: now, leaseExpiresAt: null },
        { merge: true }
      );
  }

  async releaseWebhookEvent(eventId: string, errorMessage: string): Promise<void> {
    await adminDb
      .collection('stripeWebhookEvents')
      .doc(eventId)
      .set(
        {
          status: 'failed',
          lastError: errorMessage.slice(0, 500),
          updatedAt: new Date().toISOString(),
          leaseExpiresAt: null,
        },
        { merge: true }
      );
  }
}
