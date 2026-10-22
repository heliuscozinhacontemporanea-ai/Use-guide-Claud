import { z } from 'zod';
import { isValidCNPJ, isValidCPF } from '../../../shared/utils/documentValidator';

const optionalFile = z.custom<File | null>((value) => value === null || value instanceof File);

/** Mensagens são chaves de tradução (AGENTS.md §12.5): o formulário exibe `t(message)`. */
export const documentVerificationFormSchema = z
  .object({
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().trim(),
    holderRole: z.enum(['owner', 'representative', '']),
    cadastur: z.string().trim().max(30),
    identity: optionalFile,
    cnpjCard: optionalFile,
    authorization: optionalFile,
  })
  .superRefine((data, ctx) => {
    const isCnpj = data.documentType === 'cnpj';
    const validDocument = isCnpj ? isValidCNPJ(data.document) : isValidCPF(data.document);
    if (!validDocument) {
      ctx.addIssue({
        code: 'custom',
        path: ['document'],
        message: isCnpj
          ? 'verification.validation.documentInvalidCnpj'
          : 'verification.validation.documentInvalidCpf',
      });
    }
    if (!data.holderRole) {
      ctx.addIssue({
        code: 'custom',
        path: ['holderRole'],
        message: 'verification.validation.holderRoleRequired',
      });
    }
    // CPF já conferido em outro estabelecimento da conta dispensa a identidade; o servidor decide.
    if (isCnpj && !data.identity) {
      ctx.addIssue({
        code: 'custom',
        path: ['identity'],
        message: 'verification.validation.identityRequired',
      });
    }
    if (isCnpj && !data.cnpjCard) {
      ctx.addIssue({
        code: 'custom',
        path: ['cnpjCard'],
        message: 'verification.validation.cnpjCardRequired',
      });
    }
    if (data.holderRole === 'representative' && !data.authorization) {
      ctx.addIssue({
        code: 'custom',
        path: ['authorization'],
        message: 'verification.validation.authorizationRequired',
      });
    }
  });

export type DocumentVerificationFormValues = z.infer<typeof documentVerificationFormSchema>;

export const EMPTY_DOCUMENT_VERIFICATION_FORM: DocumentVerificationFormValues = {
  documentType: 'cnpj',
  document: '',
  holderRole: '',
  cadastur: '',
  identity: null,
  cnpjCard: null,
  authorization: null,
};
