import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { PartnerDomainError } from '../errors/partnerDomainError';
import { isValidCpfCnpj, normalizeDocument } from './documentIdentity';

export interface PartnerDocumentRecord {
  id: string;
  cpfCnpj?: string | null;
  cpfCnpjClean?: string | null;
}

export interface DocumentKeyMapping {
  normalizedDocument: string;
  partnerId: string;
}

export interface DuplicateDocumentConflict {
  normalizedDocument: string;
  partnerIds: string[];
}

export interface InvalidPartnerDocument {
  partnerId: string;
  rawValue: string;
  normalizedDocument: string;
}

export function detectDocumentKeyDuplicates(records: PartnerDocumentRecord[]): {
  validMappings: DocumentKeyMapping[];
  conflicts: DuplicateDocumentConflict[];
  invalidDocuments: InvalidPartnerDocument[];
} {
  const documentToPartners = new Map<string, string[]>();
  const invalidDocuments: InvalidPartnerDocument[] = [];

  for (const record of records) {
    const raw = record.cpfCnpj || record.cpfCnpjClean;
    if (!raw) continue;

    const normalized = normalizeDocument(raw);
    if (!normalized) continue;

    if (!isValidCpfCnpj(raw)) {
      invalidDocuments.push({
        partnerId: record.id,
        rawValue: raw,
        normalizedDocument: normalized,
      });
      continue;
    }

    const existing = documentToPartners.get(normalized) ?? [];
    if (!existing.includes(record.id)) {
      existing.push(record.id);
    }
    documentToPartners.set(normalized, existing);
  }

  const conflicts: DuplicateDocumentConflict[] = [];
  const validMappings: DocumentKeyMapping[] = [];

  for (const [normalizedDocument, partnerIds] of documentToPartners.entries()) {
    if (partnerIds.length > 1) {
      conflicts.push({
        normalizedDocument,
        partnerIds,
      });
    } else if (partnerIds.length === 1 && partnerIds[0]) {
      validMappings.push({
        normalizedDocument,
        partnerId: partnerIds[0],
      });
    }
  }

  return { validMappings, conflicts, invalidDocuments };
}

export interface BackfillPartnerDocumentKeysResult {
  totalProcessed: number;
  keysCreated: number;
}

export async function backfillPartnerDocumentKeys(
  db = adminDb
): Promise<BackfillPartnerDocumentKeysResult> {
  const snapshot = await db.collection('partners').get();
  const records: PartnerDocumentRecord[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      cpfCnpj: typeof data.cpfCnpj === 'string' ? data.cpfCnpj : null,
      cpfCnpjClean: typeof data.cpfCnpjClean === 'string' ? data.cpfCnpjClean : null,
    };
  });

  const { validMappings, conflicts, invalidDocuments } = detectDocumentKeyDuplicates(records);

  if (invalidDocuments.length > 0) {
    throw new PartnerDomainError(
      'INVALID_ARGUMENT',
      'Migração de partnerDocumentKeys interrompida porque existem documentos inválidos.'
    );
  }

  if (conflicts.length > 0) {
    const conflictDescriptions = conflicts
      .map(
        (c) =>
          `Documento ${c.normalizedDocument} possui conflito entre os Partner IDs: [${c.partnerIds.join(', ')}]`
      )
      .join(' | ');

    throw new PartnerDomainError(
      'CONFLICT',
      `Migração de partnerDocumentKeys interrompida. Foram encontradas duplicidades de CPF/CNPJ: ${conflictDescriptions}`
    );
  }

  if (validMappings.length === 0) {
    return {
      totalProcessed: records.length,
      keysCreated: 0,
    };
  }

  const BATCH_SIZE = 400;
  for (let i = 0; i < validMappings.length; i += BATCH_SIZE) {
    const chunk = validMappings.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const mapping of chunk) {
      const docRef = db.collection('partnerDocumentKeys').doc(mapping.normalizedDocument);
      batch.set(
        docRef,
        {
          partnerId: mapping.partnerId,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  }

  return {
    totalProcessed: records.length,
    keysCreated: validMappings.length,
  };
}
