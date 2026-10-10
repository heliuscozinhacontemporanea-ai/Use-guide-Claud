import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';
import type { PaymentStatus, PaymentTransaction } from '../ports/paymentGatewayPort';
import type {
  TransactionRecord,
  TransactionRepositoryPort,
} from '../ports/transactionRepositoryPort';

function mapDocToTransactionRecord(
  id: string,
  data: Record<string, unknown>
): TransactionRecord {
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : null,
    referenceType:
      data.referenceType === 'ticket_order' || data.referenceType === 'plan_payment'
        ? data.referenceType
        : undefined,
    referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
    providerPaymentId:
      typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
    connectedAccountId:
      typeof data.connectedAccountId === 'string' ? data.connectedAccountId : null,
    amount: typeof data.amount === 'number' ? data.amount : null,
    amountMinor: typeof data.amountMinor === 'number' ? data.amountMinor : null,
    platformFeeMinor:
      typeof data.platformFeeMinor === 'number' ? data.platformFeeMinor : null,
    paymentMethod:
      typeof data.paymentMethod === 'string' ? data.paymentMethod : null,
    status: typeof data.status === 'string' ? data.status : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    paymentDetail:
      data.paymentDetail && typeof data.paymentDetail === 'object'
        ? (data.paymentDetail as Record<string, unknown>)
        : undefined,
  };
}

function mapDocToConnectedAccountRecord(
  partnerId: string,
  data: Record<string, unknown>
): StripeConnectedAccountRecord {
  const rawStatus = String(data.status || 'pending');
  const status: StripeConnectedAccountRecord['status'] =
    rawStatus === 'restricted' ||
    rawStatus === 'enabled' ||
    rawStatus === 'disabled'
      ? rawStatus
      : 'pending';

  return {
    partnerId,
    stripeAccountId: String(data.stripeAccountId || data.connectedAccountId || ''),
    status,
    chargesEnabled: Boolean(data.chargesEnabled),
    payoutsEnabled: Boolean(data.payoutsEnabled),
    detailsSubmitted: Boolean(data.detailsSubmitted),
    requirementsCurrentlyDue: Array.isArray(data.requirementsCurrentlyDue)
      ? data.requirementsCurrentlyDue.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],
    requirementsPastDue: Array.isArray(data.requirementsPastDue)
      ? data.requirementsPastDue.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
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

    const paymentTxRef = adminDb
      .collection('paymentTransactions')
      .doc(transactionId);
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
    const snapshot = await adminDb
      .collection('transactions')
      .doc(transactionId)
      .get();
    if (!snapshot.exists) {
      return null;
    }
    return mapDocToTransactionRecord(
      snapshot.id,
      (snapshot.data() ?? {}) as Record<string, unknown>
    );
  }

  async getTransactionByIdempotencyKey(
    idempotencyKey: string
  ): Promise<TransactionRecord | null> {
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
    return mapDocToTransactionRecord(
      doc.id,
      (doc.data() ?? {}) as Record<string, unknown>
    );
  }

  async saveTransactionRecord(record: {
    transactionId: string;
    idempotencyKey: string;
    userId: string;
    referenceType: 'ticket_order' | 'plan_payment';
    referenceId: string;
    providerPaymentId: string;
    connectedAccountId?: string;
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
      ...(record.connectedAccountId
        ? { connectedAccountId: record.connectedAccountId }
        : {}),
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
          ...(record.connectedAccountId
            ? { connectedAccountId: record.connectedAccountId }
            : {}),
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

  async getConnectedAccountRecord(
    partnerId: string
  ): Promise<StripeConnectedAccountRecord | null> {
    const snap = await adminDb
      .collection('paymentConnectedAccounts')
      .doc(partnerId)
      .get();
    if (!snap.exists) return null;
    return mapDocToConnectedAccountRecord(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async getConnectedAccountRecordByStripeAccountId(
    stripeAccountId: string
  ): Promise<StripeConnectedAccountRecord | null> {
    const snap = await adminDb
      .collection('paymentConnectedAccounts')
      .where('stripeAccountId', '==', stripeAccountId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    if (!doc) return null;
    return mapDocToConnectedAccountRecord(
      doc.id,
      (doc.data() || {}) as Record<string, unknown>
    );
  }

  async saveConnectedAccountRecord(
    record: StripeConnectedAccountRecord
  ): Promise<void> {
    await adminDb
      .collection('paymentConnectedAccounts')
      .doc(record.partnerId)
      .set(record, { merge: true });
  }

  async markWebhookEventProcessed(params: {
    eventId: string;
    eventType: string;
  }): Promise<boolean> {
    const docRef = adminDb
      .collection('stripeWebhookEvents')
      .doc(params.eventId);
    return adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (snap.exists) {
        return false;
      }
      tx.set(docRef, {
        eventId: params.eventId,
        eventType: params.eventType,
        processedAt: new Date().toISOString(),
      });
      return true;
    });
  }
}
