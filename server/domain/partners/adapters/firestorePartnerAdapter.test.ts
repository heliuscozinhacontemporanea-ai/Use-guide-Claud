import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirestorePartnerAdapter } from './firestorePartnerAdapter';
import { PartnerDomainError } from '../errors/partnerDomainError';
import {
  isValidCPF,
  isValidCNPJ,
  isValidCpfCnpj,
  normalizeDocument,
} from '../services/documentIdentity';
import { registerPartnerSchema } from '../schemas/partnerSchema';
import type { PartnerBusiness, RegisterPartnerResult } from '../types/partnerTypes';

interface StoreDoc {
  exists: boolean;
  data: Record<string, unknown>;
  version: number;
}

class TransactionConflictError extends Error {
  constructor(public readonly path: string) {
    super(`Transaction conflict on ${path}`);
    this.name = 'TransactionConflictError';
  }
}

const { store, mockAdminDb } = vi.hoisted(() => {
  const store = new Map<string, StoreDoc>();

  const getDocKey = (collection: string, id: string) =>
    `${collection}/${id}`;

  const createRef = (collection: string, id: string) => {
    const key = getDocKey(collection, id);

    return {
      id,
      collection,
      path: key,
      get: vi.fn(async () => {
        const item = store.get(key);

        return {
          id,
          exists: item?.exists === true,
          data: () => item?.data ?? {},
          version: item?.version ?? 0,
        };
      }),
    };
  };

  const commitTransaction = (
    reads: Map<string, number>,
    writes: Array<() => void>
  ) => {
    for (const [path, version] of reads) {
      const current = store.get(path);
      const currentVersion = current?.version ?? 0;

      if (currentVersion !== version) {
        throw new TransactionConflictError(path);
      }
    }

    for (const write of writes) {
      write();
    }
  };

  const runTransactionWithRetry = async (
    updateFunction: (transaction: {
      get: (ref: ReturnType<typeof createRef>) => Promise<{
        id: string;
        exists: boolean;
        data: () => Record<string, unknown>;
        version: number;
      }>;
      set: (
        ref: ReturnType<typeof createRef>,
        data: Record<string, unknown>,
        options?: { merge?: boolean }
      ) => void;
      update: (
        ref: ReturnType<typeof createRef>,
        data: Record<string, unknown>
      ) => void;
      delete: (ref: ReturnType<typeof createRef>) => void;
    }) => Promise<unknown>
  ): Promise<unknown> => {
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const reads = new Map<string, number>();
      const writes: Array<() => void> = [];

      const transaction = {
        get: async (ref: ReturnType<typeof createRef>) => {
          const snapshot = await ref.get();
          reads.set(ref.path, snapshot.version);
          return snapshot;
        },

        set: (
          ref: ReturnType<typeof createRef>,
          data: Record<string, unknown>,
          options?: { merge?: boolean }
        ) => {
          writes.push(() => {
            const current = store.get(ref.path);
            const version = (current?.version ?? 0) + 1;

            if (options?.merge && current?.exists) {
              store.set(ref.path, {
                exists: true,
                data: {
                  ...current.data,
                  ...data,
                },
                version,
              });
              return;
            }

            store.set(ref.path, {
              exists: true,
              data: { ...data },
              version,
            });
          });
        },

        update: (
          ref: ReturnType<typeof createRef>,
          data: Record<string, unknown>
        ) => {
          writes.push(() => {
            const current = store.get(ref.path);
            const version = (current?.version ?? 0) + 1;

            store.set(ref.path, {
              exists: true,
              data: {
                ...(current?.data ?? {}),
                ...data,
              },
              version,
            });
          });
        },

        delete: (ref: ReturnType<typeof createRef>) => {
          writes.push(() => {
            store.delete(ref.path);
          });
        },
      };

      try {
        const result = await updateFunction(transaction);

        commitTransaction(reads, writes);

        return result;
      } catch (error) {
        if (
          !(error instanceof TransactionConflictError) ||
          attempt === maxAttempts
        ) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 5 * attempt)
        );
      }
    }

    throw new Error('Transação excedeu o número máximo de tentativas.');
  };

  const mockAdminDb = {
    collection: vi.fn((collectionName: string) => ({
      doc: (docId: string) => createRef(collectionName, docId),

      get: vi.fn(async () => {
        const docs: Array<{
          id: string;
          exists: boolean;
          data: () => Record<string, unknown>;
        }> = [];

        store.forEach((value, key) => {
          if (
            key.startsWith(`${collectionName}/`) &&
            value.exists
          ) {
            docs.push({
              id: key.slice(collectionName.length + 1),
              exists: true,
              data: () => value.data,
            });
          }
        });

        return {
          docs,
          empty: docs.length === 0,
        };
      }),
    })),

    runTransaction: vi.fn(runTransactionWithRetry),
  };

  return {
    store,
    mockAdminDb,
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: mockAdminDb,
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
  },
}));

describe('FirestorePartnerAdapter', () => {
  let adapter: FirestorePartnerAdapter;

  const getDocKey = (collection: string, id: string) =>
    `${collection}/${id}`;

  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
    adapter = new FirestorePartnerAdapter();
  });

  describe('document validation and normalization', () => {
    it('normaliza CPF/CNPJ e valores alfanuméricos', () => {
      expect(
        normalizeDocument(' 123.456.789-09 ')
      ).toBe('12345678909');

      expect(
        normalizeDocument('12.345.678/0001-95')
      ).toBe('12345678000195');

      expect(
        normalizeDocument('abc-123.xyz')
      ).toBe('ABC123XYZ');
    });

    it('rejeita CPF inválido', () => {
      expect(isValidCPF('11111111111')).toBe(false);
      expect(isValidCPF('12345678900')).toBe(false);
      expect(isValidCPF('12345')).toBe(false);
      expect(isValidCPF('52998224725')).toBe(true);
    });

    it('rejeita CNPJ inválido', () => {
      expect(
        isValidCNPJ('11111111111111')
      ).toBe(false);

      expect(
        isValidCNPJ('12345678000100')
      ).toBe(false);

      expect(isValidCNPJ('123')).toBe(false);
      expect(
        isValidCNPJ('00000000000191')
      ).toBe(true);
    });

    it('valida CPF/CNPJ por identidade documental', () => {
      expect(
        isValidCpfCnpj('529.982.247-25')
      ).toBe(true);

      expect(
        isValidCpfCnpj('00.000.000/0001-91')
      ).toBe(true);

      expect(
        isValidCpfCnpj('123.456.789-00')
      ).toBe(false);
    });

    it('rejeita termsAccepted=false', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'hotel',
          cpfCnpj: '52998224725',
          termsAccepted: false,
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('registerPartner', () => {
    it('cria Partner, índice documental e publicPartners', async () => {
      const uid = 'partner-user-1';

      const result = await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });

      expect(result.created).toBe(true);

      expect(
        store.get(getDocKey('partners', uid))?.data
      ).toMatchObject({
        category: 'hotel',
        cpfCnpj: '52998224725',
        cpfCnpjClean: '52998224725',
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
        status: 'active',
        termsAccepted: true,
        businesses: [],
      });

      expect(
        store.get(
          getDocKey(
            'partnerDocumentKeys',
            '52998224725'
          )
        )?.data.partnerId
      ).toBe(uid);

      expect(
        store.get(getDocKey('publicPartners', uid))?.data
      ).toMatchObject({
        id: uid,
        category: 'hotel',
        isVerified: false,
        verifiedUntil: null,
        isVerificationSuspended: false,
        status: 'active',
        businesses: [],
      });
    });

    it('rejeita CPF/CNPJ já utilizado por outro parceiro', async () => {
      store.set(
        getDocKey(
          'partnerDocumentKeys',
          '52998224725'
        ),
        {
          exists: true,
          data: {
            partnerId: 'partner-other',
          },
          version: 1,
        }
      );

      await expect(
        adapter.registerPartner('new-user', {
          category: 'restaurant',
          cpfCnpj: '529.982.247-25',
          termsAccepted: true,
        })
      ).rejects.toThrow(
        new PartnerDomainError(
          'CONFLICT',
          'CPF/CNPJ já cadastrado para outro parceiro.'
        )
      );
    });

    it('permite atualização do mesmo parceiro sem conflito', async () => {
      const uid = 'partner-user-1';

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });

      const result = await adapter.registerPartner(uid, {
        category: 'restaurant',
        cpfCnpj: '529.982.247-25',
        termsAccepted: true,
      });

      expect(result.created).toBe(false);

      expect(
        store.get(getDocKey('partners', uid))?.data.category
      ).toBe('restaurant');

      expect(
        store.get(
          getDocKey(
            'partnerDocumentKeys',
            '52998224725'
          )
        )?.data.partnerId
      ).toBe(uid);
    });

    it('remove o índice antigo quando o documento muda', async () => {
      const uid = 'partner-user-1';

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '00.000.000/0001-91',
        termsAccepted: true,
      });

      expect(
        store.has(
          getDocKey(
            'partnerDocumentKeys',
            '52998224725'
          )
        )
      ).toBe(false);

      expect(
        store.has(
          getDocKey(
            'partnerDocumentKeys',
            '00000000000191'
          )
        )
      ).toBe(true);
    });

    it('remove o índice antigo para Partner legado sem cpfCnpjClean', async () => {
      const uid = 'partner-legacy';

      store.set(getDocKey('partners', uid), {
        exists: true,
        version: 1,
        data: {
          category: 'hotel',
          cpfCnpj: '529.982.247-25',
          businesses: [],
          isVerified: false,
          verifiedUntil: null,
          verificationType: null,
          isVerificationSuspended: false,
          status: 'active',
          hasUsedTrial: false,
          termsAccepted: true,
        },
      });

      store.set(
        getDocKey(
          'partnerDocumentKeys',
          '52998224725'
        ),
        {
          exists: true,
          version: 1,
          data: {
            partnerId: uid,
          },
        }
      );

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '00.000.000/0001-91',
        termsAccepted: true,
      });

      expect(
        store.has(
          getDocKey(
            'partnerDocumentKeys',
            '52998224725'
          )
        )
      ).toBe(false);

      expect(
        store.has(
          getDocKey(
            'partnerDocumentKeys',
            '00000000000191'
          )
        )
      ).toBe(true);
    });
  });

  describe('deletePartnerProfile', () => {
    it('remove índice documental de Partner legado', async () => {
      const uid = 'partner-legacy-delete';

      store.set(getDocKey('partners', uid), {
        exists: true,
        version: 1,
        data: {
          category: 'hotel',
          cpfCnpj: '529.982.247-25',
          businesses: [],
          isVerified: false,
          verifiedUntil: null,
          verificationType: null,
          isVerificationSuspended: false,
          status: 'active',
          hasUsedTrial: false,
          termsAccepted: true,
        },
      });

      store.set(
        getDocKey(
          'partnerDocumentKeys',
          '52998224725'
        ),
        {
          exists: true,
          version: 1,
          data: {
            partnerId: uid,
          },
        }
      );

      store.set(
        getDocKey('publicPartners', uid),
        {
          exists: true,
          version: 1,
          data: {
            id: uid,
          },
        }
      );

      await adapter.deletePartnerProfile(uid);

      expect(
        store.has(getDocKey('partners', uid))
      ).toBe(false);

      expect(
        store.has(getDocKey('publicPartners', uid))
      ).toBe(false);

      expect(
        store.has(
          getDocKey(
            'partnerDocumentKeys',
            '52998224725'
          )
        )
      ).toBe(false);
    });
  });

  describe('status', () => {
    it('retorna NOT_FOUND para Partner inexistente', async () => {
      await expect(
        adapter.updatePartnerStatus(
          'missing-partner',
          'suspended'
        )
      ).rejects.toThrow(
        new PartnerDomainError(
          'NOT_FOUND',
          'Perfil de parceiro não encontrado'
        )
      );
    });

    it('atualiza status e publicPartners atomicamente', async () => {
      const uid = 'partner-status';

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });

      await adapter.updatePartnerStatus(
        uid,
        'suspended'
      );

      expect(
        store.get(getDocKey('partners', uid))?.data.status
      ).toBe('suspended');

      expect(
        store.get(getDocKey('publicPartners', uid))?.data.status
      ).toBe('suspended');
    });
  });

  describe('businesses', () => {
    const uid = 'partner-business';

    const business: PartnerBusiness = {
      businessId: 'item-101',
      businessName: 'Pousada Encantada',
      type: 'item',
    };

    beforeEach(async () => {
      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });
    });

    it('linkBusiness adiciona negócio e sincroniza projeção pública', async () => {
      await adapter.linkBusiness(uid, business);

      expect(
        store.get(getDocKey('partners', uid))?.data.businesses
      ).toEqual([business]);

      expect(
        store.get(getDocKey('publicPartners', uid))?.data.businesses
      ).toEqual([business]);
    });

    it('updateBusiness atualiza negócio existente', async () => {
      await adapter.linkBusiness(uid, business);

      await adapter.updateBusiness(uid, {
        ...business,
        businessName: 'Pousada Encantada VIP',
      });

      expect(
        store.get(getDocKey('partners', uid))?.data.businesses
      ).toEqual([
        {
          ...business,
          businessName: 'Pousada Encantada VIP',
        },
      ]);

      expect(
        store.get(getDocKey('publicPartners', uid))?.data.businesses
      ).toEqual([
        {
          ...business,
          businessName: 'Pousada Encantada VIP',
        },
      ]);
    });

    it('updateBusiness retorna NOT_FOUND quando business não está vinculado', async () => {
      await expect(
        adapter.updateBusiness(uid, {
          businessId: 'missing-business',
          businessName: 'Inexistente',
          type: 'item',
        })
      ).rejects.toThrow(
        new PartnerDomainError(
          'NOT_FOUND',
          'Negócio não encontrado no perfil do parceiro'
        )
      );
    });

    it('unlinkBusiness remove negócio', async () => {
      await adapter.linkBusiness(uid, business);
      await adapter.unlinkBusiness(
        uid,
        business.businessId
      );

      expect(
        store.get(getDocKey('partners', uid))?.data.businesses
      ).toEqual([]);

      expect(
        store.get(getDocKey('publicPartners', uid))?.data.businesses
      ).toEqual([]);
    });

    it('unlinkBusiness é idempotente para Partner inexistente', async () => {
      await expect(
        adapter.unlinkBusiness(
          'missing-partner',
          'item-101'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('verification', () => {
    it('persiste e projeta isVerificationSuspended', async () => {
      const uid = 'partner-verification';

      await adapter.registerPartner(uid, {
        category: 'hotel',
        cpfCnpj: '52998224725',
        termsAccepted: true,
      });

      await adapter.updatePartnerVerificationProfile(
        uid,
        {
          isVerified: true,
          verifiedUntil: '2027-01-01T00:00:00.000Z',
          verificationType: 'annual',
          isVerificationSuspended: true,
        }
      );

      expect(
        store.get(getDocKey('partners', uid))?.data
      ).toMatchObject({
        isVerified: true,
        isVerificationSuspended: true,
      });

      expect(
        store.get(getDocKey('publicPartners', uid))?.data
      ).toMatchObject({
        isVerified: true,
        isVerificationSuspended: true,
      });
    });
  });

  describe('transactional document uniqueness', () => {
    it('uma disputa concorrente pelo mesmo CPF/CNPJ possui apenas um vencedor', async () => {
      const results = await Promise.allSettled([
        adapter.registerPartner(
          'partner-concurrent-A',
          {
            category: 'hotel',
            cpfCnpj: '52998224725',
            termsAccepted: true,
          }
        ),
        adapter.registerPartner(
          'partner-concurrent-B',
          {
            category: 'restaurant',
            cpfCnpj: '52998224725',
            termsAccepted: true,
          }
        ),
      ]);

      const fulfilled = results.filter(
        (
          result
        ): result is PromiseFulfilledResult<RegisterPartnerResult> =>
          result.status === 'fulfilled'
      );

      const rejected = results.filter(
        (
          result
        ): result is PromiseRejectedResult =>
          result.status === 'rejected'
      );

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const rejectedError = rejected[0]?.reason;

      expect(
        rejectedError
      ).toBeInstanceOf(PartnerDomainError);

      expect(
        (rejectedError as PartnerDomainError).code
      ).toBe('CONFLICT');

      const index = store.get(
        getDocKey(
          'partnerDocumentKeys',
          '52998224725'
        )
      );

      expect(index?.exists).toBe(true);

      expect([
        'partner-concurrent-A',
        'partner-concurrent-B',
      ]).toContain(index?.data.partnerId);
    });
  });
});
