import { describe, expect, it, vi } from 'vitest';
import { PartnerDomainError } from '../errors/partnerDomainError';
import {
  backfillPartnerDocumentKeys,
  detectDocumentKeyDuplicates,
  type PartnerDocumentRecord,
} from './backfillPartnerDocumentKeys';

describe('backfillPartnerDocumentKeys detection algorithm', () => {
  it('should extract valid mappings for unique CPFs and CNPJs (numeric and alphanumeric)', () => {
    const records: PartnerDocumentRecord[] = [
      { id: 'partner-1', cpfCnpj: '123.456.789-09' },
      { id: 'partner-2', cpfCnpj: '12.ABC.345/01DE-35' },
      { id: 'partner-3', cpfCnpjClean: '52998224725' },
      { id: 'partner-4', cpfCnpj: null, cpfCnpjClean: null },
    ];

    const result = detectDocumentKeyDuplicates(records);

    expect(result.conflicts).toHaveLength(0);
    expect(result.invalidDocuments).toHaveLength(0);
    expect(result.validMappings).toEqual([
      { normalizedDocument: '12345678909', partnerId: 'partner-1' },
      { normalizedDocument: '12ABC34501DE35', partnerId: 'partner-2' },
      { normalizedDocument: '52998224725', partnerId: 'partner-3' },
    ]);
  });

  it('should detect duplicate CPFs between different partner IDs and return all conflicting IDs', () => {
    const records: PartnerDocumentRecord[] = [
      { id: 'partner-a', cpfCnpj: '529.982.247-25' },
      { id: 'partner-b', cpfCnpj: '52998224725' },
      { id: 'partner-c', cpfCnpj: '123.456.789-09' },
    ];

    const result = detectDocumentKeyDuplicates(records);

    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toEqual({
      normalizedDocument: '52998224725',
      partnerIds: ['partner-a', 'partner-b'],
    });
    expect(result.validMappings).toEqual([
      { normalizedDocument: '12345678909', partnerId: 'partner-c' },
    ]);
  });

  it('should detect duplicate alphanumeric CNPJs regardless of casing or formatting', () => {
    const records: PartnerDocumentRecord[] = [
      { id: 'partner-alpha', cpfCnpj: '12.abc.345/01de-35' },
      { id: 'partner-beta', cpfCnpj: '12ABC34501DE35' },
      { id: 'partner-gamma', cpfCnpj: '12-ABC-345-01DE-35' },
    ];

    const result = detectDocumentKeyDuplicates(records);

    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.normalizedDocument).toBe('12ABC34501DE35');
    expect(result.conflicts[0]?.partnerIds).toEqual([
      'partner-alpha',
      'partner-beta',
      'partner-gamma',
    ]);
    expect(result.validMappings).toHaveLength(0);
  });

  it('should detect invalid documents and collect them in invalidDocuments', () => {
    const records: PartnerDocumentRecord[] = [
      { id: 'partner-valid', cpfCnpj: '52998224725' },
      { id: 'partner-invalid-1', cpfCnpj: '111.111.111-11' },
      { id: 'partner-invalid-2', cpfCnpjClean: '12345' },
    ];

    const result = detectDocumentKeyDuplicates(records);

    expect(result.invalidDocuments).toHaveLength(2);
    expect(result.invalidDocuments).toEqual([
      {
        partnerId: 'partner-invalid-1',
        rawValue: '111.111.111-11',
        normalizedDocument: '11111111111',
      },
      { partnerId: 'partner-invalid-2', rawValue: '12345', normalizedDocument: '12345' },
    ]);
    expect(result.validMappings).toEqual([
      { normalizedDocument: '52998224725', partnerId: 'partner-valid' },
    ]);
  });

  it('should not conflict if the same partner has identical document in multiple record entries', () => {
    const records: PartnerDocumentRecord[] = [
      { id: 'partner-1', cpfCnpj: '123.456.789-09' },
      { id: 'partner-1', cpfCnpjClean: '12345678909' },
    ];

    const result = detectDocumentKeyDuplicates(records);

    expect(result.conflicts).toHaveLength(0);
    expect(result.validMappings).toEqual([
      { normalizedDocument: '12345678909', partnerId: 'partner-1' },
    ]);
  });

  it('should throw PartnerDomainError when backfilling with invalid documents in DB', async () => {
    const mockDb = {
      collection: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: [{ id: 'partner-1', data: () => ({ cpfCnpj: '111.111.111-11' }) }],
        }),
      }),
    } as unknown as typeof import('../../../infrastructure/firebase/adminClient').adminDb;

    await expect(backfillPartnerDocumentKeys(mockDb)).rejects.toThrow(PartnerDomainError);
    await expect(backfillPartnerDocumentKeys(mockDb)).rejects.toThrow(
      'Migração de partnerDocumentKeys interrompida porque existem documentos inválidos.'
    );
  });

  it('should throw PartnerDomainError with CONFLICT code when backfilling with duplicate partners in DB', async () => {
    const mockDb = {
      collection: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: [
            { id: 'partner-1', data: () => ({ cpfCnpj: '529.982.247-25' }) },
            { id: 'partner-2', data: () => ({ cpfCnpj: '52998224725' }) },
          ],
        }),
      }),
    } as unknown as typeof import('../../../infrastructure/firebase/adminClient').adminDb;

    await expect(backfillPartnerDocumentKeys(mockDb)).rejects.toThrow(PartnerDomainError);
    await expect(backfillPartnerDocumentKeys(mockDb)).rejects.toThrow(/partner-1, partner-2/);
  });

  it('should successfully write partnerDocumentKeys when there are no duplicates', async () => {
    const batchSetMock = vi.fn();
    const batchCommitMock = vi.fn().mockResolvedValue(undefined);
    const mockBatch = {
      set: batchSetMock,
      commit: batchCommitMock,
    };

    const docMock = vi.fn((key: string) => ({ id: key }));
    const mockDb = {
      collection: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: [
            { id: 'partner-1', data: () => ({ cpfCnpj: '529.982.247-25' }) },
            { id: 'partner-2', data: () => ({ cpfCnpj: '123.456.789-09' }) },
          ],
        }),
        doc: docMock,
      }),
      batch: vi.fn().mockReturnValue(mockBatch),
    } as unknown as typeof import('../../../infrastructure/firebase/adminClient').adminDb;

    const result = await backfillPartnerDocumentKeys(mockDb);

    expect(result).toEqual({
      totalProcessed: 2,
      keysCreated: 2,
    });
    expect(batchSetMock).toHaveBeenCalledTimes(2);
    expect(batchCommitMock).toHaveBeenCalledTimes(1);
  });
});
