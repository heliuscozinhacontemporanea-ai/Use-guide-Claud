/** Textos da verificação por estabelecimento (D12). pt-BR é a fonte; en e fr têm as mesmas chaves. */
export interface VerificationTranslation {
  status: {
    not_submitted: string;
    pending: string;
    approved: string;
    rejected: string;
  };
  chipLabel: string;
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
  signup: {
    nextStep: string;
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
  chipLabel: 'Verificação de {{name}}: {{status}}',
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
  signup: {
    nextStep:
      'Próximo passo: envie a verificação do estabelecimento no painel. Ela libera o selo do Use Guide e as vendas.',
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

export const verificationEn: VerificationTranslation = {
  status: {
    not_submitted: 'Verify business',
    pending: 'Verification under review',
    approved: 'Verified by Use Guide',
    rejected: 'Verification declined',
  },
  chipLabel: 'Verification of {{name}}: {{status}}',
  dialog: {
    title: 'Business verification',
    intro:
      'Use Guide checks each business before granting the badge and enabling sales. The document number is encrypted and only shown masked.',
    close: 'Close',
    loading: 'Loading the verification...',
    retry: 'Try again',
  },
  panel: {
    pending: 'We received the documents. Follow the review result here.',
    approved: 'Business verified.',
    approvedCpf:
      'Business verified with a CPF. Selling tickets, tours or bookings requires a CNPJ (MEI works).',
    rejected: 'The verification was declined. Reason: {{reason}}',
    document: 'Document: {{document}}',
    resubmit: 'Fix the details and send it again.',
  },
  form: {
    documentType: 'Business document',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint: 'Selling tickets, tours or bookings requires a CNPJ (MEI works).',
    document: 'Document number',
    holderRole: 'Your link to the document',
    owner: 'I am the holder, partner or director',
    representative: 'I am a representative (manager or employee)',
    filesTitle: 'Files',
    fileHint: 'JPEG, PNG, WebP or PDF, up to 6 MB.',
    chooseFile: 'Choose file',
    replaceFile: 'Replace file',
    fileSelected: 'Selected: {{name}}',
    cpfReuseHint:
      'If this CPF was already checked for another business in your account, you do not need to send the ID again.',
    cadastur: 'Cadastur (optional)',
    cadasturHint: 'Registration number at the Ministry of Tourism, if you have one.',
    submit: 'Send for verification',
    submitting: 'Sending...',
    sent: 'Verification sent.',
    linkedText:
      "The producer profile uses the document of one of your businesses and follows that business's verification.",
    source: 'Source business',
    sourcePlaceholder: 'Select',
    noSource: 'Add a business before verifying the producer profile.',
  },
  files: {
    cnpjCard: 'CNPJ card issued by the Federal Revenue',
    identity: 'Photo ID (RG or driver’s license)',
    authorization: 'Authorization signed by a partner',
  },
  validation: {
    documentInvalidCpf: 'Invalid CPF.',
    documentInvalidCnpj: 'Invalid CNPJ.',
    holderRoleRequired: 'Tell us your link to the document.',
    identityRequired: 'Upload the photo ID.',
    cnpjCardRequired: 'Upload the CNPJ card.',
    authorizationRequired: 'Upload the authorization signed by a partner.',
    sourceRequired: 'Choose a business.',
  },
  admin: {
    tab: 'Verifications',
    title: 'Business verification',
    filterLabel: 'Filter verifications',
    filters: {
      pending: 'Under review',
      approved: 'Approved',
      rejected: 'Declined',
    },
    empty: 'No verifications in this list.',
    loadMore: 'Load more',
    ownerUnknown: 'Unnamed account',
    sentBy: 'Sent by {{name}}',
    submittedAt: 'Sent on {{date}}',
    reviewedAt: 'Reviewed on {{date}}',
    holderOwner: 'Holder, partner or director',
    holderRepresentative: 'Representative',
    cadastur: 'Cadastur: {{number}}',
    reason: 'Reason: {{reason}}',
    openFile: 'Open: {{file}}',
    fileError: 'The file could not be opened.',
    approve: 'Approve',
    approveConfirm:
      'Approve the verification? Check the CNPJ card at the Federal Revenue, the person’s link to the company (QSA or MEI) and the ID. With an approved CNPJ, the business can sell.',
    approved: 'Verification approved.',
    reject: 'Decline',
    rejectReason: 'Reason for declining',
    rejectReasonHint: 'The partner sees this text. Use at least 5 characters.',
    confirmReject: 'Confirm decline',
    cancel: 'Cancel',
    rejected: 'Verification declined.',
  },
  signup: {
    nextStep:
      'Next step: send the business verification from the panel. It unlocks the Use Guide badge and sales.',
  },
  errors: {
    VALIDATION_ERROR: 'Check the verification details and files.',
    UNAUTHENTICATED: 'Sign in again to continue.',
    FORBIDDEN: 'You do not have access to this verification.',
    NOT_FOUND: 'Business not found.',
    DOCUMENT_IN_USE: 'This document belongs to another account.',
    CNPJ_ALREADY_USED: 'This CNPJ is used by another business. Branches use their own CNPJ.',
    ALREADY_VERIFIED: 'This business is already verified with this document.',
    NOT_PENDING: 'This verification was already reviewed.',
    CRYPTO_UNAVAILABLE: 'Verification is unavailable right now. Please try later.',
    INVALID_DOCUMENT_FILE: 'File not accepted. Upload JPEG, PNG, WebP or PDF.',
    IMAGE_TOO_LARGE: 'The file is larger than 6 MB. Choose a smaller file.',
    STORAGE_UNAVAILABLE: 'Storage is unavailable. Please try again shortly.',
    INTERNAL_ERROR: 'The verification could not be completed. Please try again.',
  },
};

export const verificationFr: VerificationTranslation = {
  status: {
    not_submitted: 'Vérifier l’établissement',
    pending: 'Vérification en cours',
    approved: 'Vérifié par Use Guide',
    rejected: 'Vérification refusée',
  },
  chipLabel: 'Vérification de {{name}} : {{status}}',
  dialog: {
    title: 'Vérification de l’établissement',
    intro:
      'Use Guide contrôle chaque établissement avant d’accorder le badge et d’ouvrir les ventes. Le numéro du document est chiffré et n’apparaît que masqué.',
    close: 'Fermer',
    loading: 'Chargement de la vérification...',
    retry: 'Réessayer',
  },
  panel: {
    pending: 'Nous avons reçu les documents. Suivez ici le résultat de l’analyse.',
    approved: 'Établissement vérifié.',
    approvedCpf:
      'Établissement vérifié avec un CPF. Pour vendre des billets, des excursions ou des réservations, un CNPJ est nécessaire (le MEI convient).',
    rejected: 'La vérification a été refusée. Motif : {{reason}}',
    document: 'Document : {{document}}',
    resubmit: 'Corrigez les informations et renvoyez-les.',
  },
  form: {
    documentType: 'Document de l’établissement',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint:
      'Pour vendre des billets, des excursions ou des réservations, un CNPJ est nécessaire (le MEI convient).',
    document: 'Numéro du document',
    holderRole: 'Votre lien avec le document',
    owner: 'Je suis le titulaire, associé ou dirigeant',
    representative: 'Je suis un représentant (gérant ou employé)',
    filesTitle: 'Fichiers',
    fileHint: 'JPEG, PNG, WebP ou PDF, 6 Mo maximum.',
    chooseFile: 'Choisir un fichier',
    replaceFile: 'Remplacer le fichier',
    fileSelected: 'Sélectionné : {{name}}',
    cpfReuseHint:
      'Si ce CPF a déjà été contrôlé pour un autre établissement de votre compte, inutile de renvoyer la pièce d’identité.',
    cadastur: 'Cadastur (facultatif)',
    cadasturHint: 'Numéro d’enregistrement au ministère du Tourisme, si vous en avez un.',
    submit: 'Envoyer pour vérification',
    submitting: 'Envoi...',
    sent: 'Vérification envoyée.',
    linkedText:
      'Le profil de producteur utilise le document de l’un de vos établissements et suit sa vérification.',
    source: 'Établissement d’origine',
    sourcePlaceholder: 'Sélectionner',
    noSource: 'Ajoutez un établissement avant de vérifier le profil de producteur.',
  },
  files: {
    cnpjCard: 'Carte CNPJ délivrée par la Receita Federal',
    identity: 'Pièce d’identité avec photo (RG ou permis de conduire)',
    authorization: 'Autorisation signée par un associé',
  },
  validation: {
    documentInvalidCpf: 'CPF invalide.',
    documentInvalidCnpj: 'CNPJ invalide.',
    holderRoleRequired: 'Indiquez votre lien avec le document.',
    identityRequired: 'Envoyez la pièce d’identité.',
    cnpjCardRequired: 'Envoyez la carte CNPJ.',
    authorizationRequired: 'Envoyez l’autorisation signée par un associé.',
    sourceRequired: 'Choisissez un établissement.',
  },
  admin: {
    tab: 'Vérifications',
    title: 'Vérification des établissements',
    filterLabel: 'Filtrer les vérifications',
    filters: {
      pending: 'En cours',
      approved: 'Approuvées',
      rejected: 'Refusées',
    },
    empty: 'Aucune vérification dans cette liste.',
    loadMore: 'Charger plus',
    ownerUnknown: 'Compte sans nom',
    sentBy: 'Envoyé par {{name}}',
    submittedAt: 'Envoyé le {{date}}',
    reviewedAt: 'Revu le {{date}}',
    holderOwner: 'Titulaire, associé ou dirigeant',
    holderRepresentative: 'Représentant',
    cadastur: 'Cadastur : {{number}}',
    reason: 'Motif : {{reason}}',
    openFile: 'Ouvrir : {{file}}',
    fileError: 'Impossible d’ouvrir le fichier.',
    approve: 'Approuver',
    approveConfirm:
      'Approuver la vérification ? Contrôlez la carte CNPJ auprès de la Receita, le lien de la personne avec l’entreprise (QSA ou MEI) et la pièce d’identité. Avec un CNPJ approuvé, l’établissement peut vendre.',
    approved: 'Vérification approuvée.',
    reject: 'Refuser',
    rejectReason: 'Motif du refus',
    rejectReasonHint: 'Le partenaire voit ce texte. 5 caractères minimum.',
    confirmReject: 'Confirmer le refus',
    cancel: 'Annuler',
    rejected: 'Vérification refusée.',
  },
  signup: {
    nextStep:
      'Prochaine étape : envoyez la vérification de l’établissement depuis le panneau. Elle débloque le badge Use Guide et les ventes.',
  },
  errors: {
    VALIDATION_ERROR: 'Vérifiez les informations et les fichiers.',
    UNAUTHENTICATED: 'Reconnectez-vous pour continuer.',
    FORBIDDEN: 'Vous n’avez pas accès à cette vérification.',
    NOT_FOUND: 'Établissement introuvable.',
    DOCUMENT_IN_USE: 'Ce document appartient à un autre compte.',
    CNPJ_ALREADY_USED:
      'Ce CNPJ est déjà utilisé par un autre établissement. Les filiales utilisent leur propre CNPJ.',
    ALREADY_VERIFIED: 'Cet établissement est déjà vérifié avec ce document.',
    NOT_PENDING: 'Cette vérification a déjà été revue.',
    CRYPTO_UNAVAILABLE: 'La vérification est indisponible pour le moment. Réessayez plus tard.',
    INVALID_DOCUMENT_FILE: 'Fichier refusé. Envoyez un JPEG, PNG, WebP ou PDF.',
    IMAGE_TOO_LARGE: 'Le fichier dépasse 6 Mo. Choisissez un fichier plus léger.',
    STORAGE_UNAVAILABLE: 'Le stockage est indisponible. Réessayez dans un instant.',
    INTERNAL_ERROR: 'Impossible de finaliser la vérification. Réessayez.',
  },
};
