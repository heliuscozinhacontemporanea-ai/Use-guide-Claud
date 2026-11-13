/** Textos da verificação por estabelecimento (D12). pt-BR é a fonte; en e fr têm as mesmas chaves. */
export interface VerificationTranslation {
  status: {
    not_submitted: string;
    pending: string;
    approved: string;
    rejected: string;
  };
  dialog: {
    title: string;
    intro: string;
    close: string;
    loading: string;
    retry: string;
  };
  panel: {
    pending: string;
    approved: string;
    approvedCpf: string;
    rejected: string;
    document: string;
    resubmit: string;
  };
  form: {
    documentType: string;
    cpf: string;
    cnpj: string;
    cnpjHint: string;
    document: string;
    holderRole: string;
    owner: string;
    representative: string;
    filesTitle: string;
    fileHint: string;
    chooseFile: string;
    replaceFile: string;
    fileSelected: string;
    cpfReuseHint: string;
    cadastur: string;
    cadasturHint: string;
    submit: string;
    submitting: string;
    sent: string;
    linkedText: string;
    source: string;
    sourcePlaceholder: string;
    noSource: string;
  };
  files: {
    cnpjCard: string;
    identity: string;
    authorization: string;
  };
  validation: {
    documentInvalidCpf: string;
    documentInvalidCnpj: string;
    holderRoleRequired: string;
    identityRequired: string;
    cnpjCardRequired: string;
    authorizationRequired: string;
    sourceRequired: string;
  };
  admin: {
    tab: string;
    title: string;
    filterLabel: string;
    filters: {
      pending: string;
      approved: string;
      rejected: string;
    };
    empty: string;
    loadMore: string;
    ownerUnknown: string;
    sentBy: string;
    submittedAt: string;
    reviewedAt: string;
    holderOwner: string;
    holderRepresentative: string;
    cadastur: string;
    reason: string;
    openFile: string;
    fileError: string;
    approve: string;
    approveConfirm: string;
    approved: string;
    reject: string;
    rejectReason: string;
    rejectReasonHint: string;
    confirmReject: string;
    cancel: string;
    rejected: string;
  };
  errors: {
    VALIDATION_ERROR: string;
    UNAUTHENTICATED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    DOCUMENT_IN_USE: string;
    CNPJ_ALREADY_USED: string;
    ALREADY_VERIFIED: string;
    NOT_PENDING: string;
    CRYPTO_UNAVAILABLE: string;
    INVALID_DOCUMENT_FILE: string;
    IMAGE_TOO_LARGE: string;
    STORAGE_UNAVAILABLE: string;
    INTERNAL_ERROR: string;
  };
}

export const verificationPtBR: VerificationTranslation = {
  status: {
    not_submitted: 'Verificar estabelecimento',
    pending: 'Verificação em análise',
    approved: 'Verificado pelo Use Guide',
    rejected: 'Verificação recusada',
  },
  dialog: {
    title: 'Verificação do estabelecimento',
    intro:
      'O Use Guide confere cada estabelecimento antes de liberar o selo e as vendas. O número do documento fica cifrado e só aparece mascarado.',
    close: 'Fechar',
    loading: 'Carregando a verificação...',
    retry: 'Tentar novamente',
  },
  panel: {
    pending: 'Recebemos os documentos. Acompanhe aqui o resultado da análise.',
    approved: 'Estabelecimento verificado.',
    approvedCpf:
      'Estabelecimento verificado com CPF. Para vender ingressos, passeios ou reservas é preciso CNPJ (MEI serve).',
    rejected: 'A verificação foi recusada. Motivo: {{reason}}',
    document: 'Documento: {{document}}',
    resubmit: 'Corrija os dados e envie de novo.',
  },
  form: {
    documentType: 'Documento do estabelecimento',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint: 'Para vender ingressos, passeios ou reservas é preciso CNPJ (MEI serve).',
    document: 'Número do documento',
    holderRole: 'Seu vínculo com o documento',
    owner: 'Sou o titular, sócio ou administrador',
    representative: 'Sou representante (gerente ou funcionário)',
    filesTitle: 'Arquivos',
    fileHint: 'JPEG, PNG, WebP ou PDF, até 6 MB.',
    chooseFile: 'Escolher arquivo',
    replaceFile: 'Trocar arquivo',
    fileSelected: 'Selecionado: {{name}}',
    cpfReuseHint:
      'Se este CPF já foi conferido em outro estabelecimento da sua conta, não é preciso enviar a identidade de novo.',
    cadastur: 'Cadastur (opcional)',
    cadasturHint: 'Número do registro no Ministério do Turismo, se tiver.',
    submit: 'Enviar para verificação',
    submitting: 'Enviando...',
    sent: 'Verificação enviada.',
    linkedText:
      'O perfil de produtor usa o documento de um dos seus estabelecimentos e segue a verificação dele.',
    source: 'Estabelecimento de origem',
    sourcePlaceholder: 'Selecione',
    noSource: 'Cadastre um estabelecimento antes de verificar o perfil de produtor.',
  },
  files: {
    cnpjCard: 'Cartão CNPJ emitido pela Receita Federal',
    identity: 'Documento de identidade com foto (RG ou CNH)',
    authorization: 'Autorização assinada por um sócio',
  },
  validation: {
    documentInvalidCpf: 'CPF inválido.',
    documentInvalidCnpj: 'CNPJ inválido.',
    holderRoleRequired: 'Informe seu vínculo com o documento.',
    identityRequired: 'Envie o documento de identidade.',
    cnpjCardRequired: 'Envie o Cartão CNPJ.',
    authorizationRequired: 'Envie a autorização assinada por um sócio.',
    sourceRequired: 'Escolha um estabelecimento.',
  },
  admin: {
    tab: 'Verificações',
    title: 'Verificação de estabelecimentos',
    filterLabel: 'Filtrar verificações',
    filters: {
      pending: 'Em análise',
      approved: 'Aprovadas',
      rejected: 'Recusadas',
    },
    empty: 'Nenhuma verificação nesta lista.',
    loadMore: 'Carregar mais',
    ownerUnknown: 'Conta sem nome',
    sentBy: 'Enviado por {{name}}',
    submittedAt: 'Enviado em {{date}}',
    reviewedAt: 'Revisado em {{date}}',
    holderOwner: 'Titular, sócio ou administrador',
    holderRepresentative: 'Representante',
    cadastur: 'Cadastur: {{number}}',
    reason: 'Motivo: {{reason}}',
    openFile: 'Abrir: {{file}}',
    fileError: 'Não foi possível abrir o arquivo.',
    approve: 'Aprovar',
    approveConfirm:
      'Aprovar a verificação? Confira o Cartão CNPJ na Receita, o vínculo da pessoa com a empresa (QSA ou MEI) e a identidade. Com CNPJ aprovado, o estabelecimento pode vender.',
    approved: 'Verificação aprovada.',
    reject: 'Recusar',
    rejectReason: 'Motivo da recusa',
    rejectReasonHint: 'O parceiro vê este texto. Use pelo menos 5 caracteres.',
    confirmReject: 'Confirmar recusa',
    cancel: 'Cancelar',
    rejected: 'Verificação recusada.',
  },
  errors: {
    VALIDATION_ERROR: 'Confira os dados e os arquivos da verificação.',
    UNAUTHENTICATED: 'Entre de novo na sua conta para continuar.',
    FORBIDDEN: 'Você não tem acesso a esta verificação.',
    NOT_FOUND: 'Estabelecimento não encontrado.',
    DOCUMENT_IN_USE: 'Este documento já está em outra conta.',
    CNPJ_ALREADY_USED:
      'Este CNPJ já está em outro estabelecimento. Filiais usam o CNPJ da própria filial.',
    ALREADY_VERIFIED: 'Este estabelecimento já está verificado com este documento.',
    NOT_PENDING: 'Esta verificação já foi revisada.',
    CRYPTO_UNAVAILABLE: 'A verificação está indisponível no momento. Tente mais tarde.',
    INVALID_DOCUMENT_FILE: 'Arquivo não aceito. Envie JPEG, PNG, WebP ou PDF.',
    IMAGE_TOO_LARGE: 'O arquivo passa de 6 MB. Escolha um arquivo menor.',
    STORAGE_UNAVAILABLE: 'O armazenamento está indisponível. Tente novamente em instantes.',
    INTERNAL_ERROR: 'Não foi possível concluir a verificação. Tente novamente.',
  },
};
