/** Textos do "Sou o dono" (D35). pt-BR é a fonte. */
export interface ClaimTranslation {
  row: { question: string; action: string };
  title: string;
  lead: string;
  note: string;
  submit: string;
  loginNote: string;
  sent: { title: string; text: string; button: string };
  suggest: { title: string; action: string; hint: string };
  panel: {
    pending: string;
    pendingText: string;
    pendingHint: string;
    rejected: string;
    rejectedText: string;
    resend: string;
    approved: string;
    approvedText: string;
  };
  admin: {
    tag: string;
    place: string;
    sentBy: string;
    holder: { owner: string; representative: string };
    other: string;
    open: string;
    approve: string;
    reject: string;
    confirmTitle: string;
    confirmText: string;
    return: string;
    returnConfirm: string;
    returned: string;
    approvedToast: string;
    rejectedToast: string;
    returnedToast: string;
    empty: string;
  };
  errors: {
    EMAIL_NOT_VERIFIED: string;
    TERMS_REQUIRED: string;
    LISTING_NOT_CLAIMABLE: string;
    ALREADY_APPROVED: string;
    DOCUMENT_IN_USE: string;
    CNPJ_ALREADY_USED: string;
    LISTING_IN_USE: string;
    NOT_PENDING: string;
    failed: string;
  };
}

export const claimPtBR: ClaimTranslation = {
  row: { question: 'É o dono deste lugar?', action: 'Sou o dono' },
  title: 'Assumir anúncio',
  lead: 'O Use Guide confere os documentos e passa o anúncio para a sua conta, com as fotos e as avaliações.',
  note: 'O número do documento fica cifrado e só aparece mascarado. Enquanto o pedido está em análise, o anúncio continua no ar como está.',
  submit: 'Enviar pedido',
  loginNote:
    'Entre ou crie sua conta para assumir {{name}}. Depois, você volta direto para o pedido.',
  sent: {
    title: 'Pedido enviado',
    text: 'O Use Guide confere os documentos e avisa você no app. Enquanto isso, {{name}} continua no ar como está.',
    button: 'Ir para o painel',
  },
  suggest: {
    title: 'Já está no guia?',
    action: 'É o meu',
    hint: 'Se for o seu, assuma o anúncio em vez de criar outro. Se não for, siga o cadastro normalmente.',
  },
  panel: {
    pending: 'Em análise',
    pendingText: 'Pedido para assumir o anúncio · enviado em {{date}}',
    pendingHint:
      'Quando for aprovado, o anúncio aparece no Catálogo e o guia de passos mostra o que falta para vender.',
    rejected: 'Recusado',
    rejectedText: 'Motivo: {{reason}}',
    resend: 'Enviar de novo',
    approved: 'Aprovado',
    approvedText: '{{name}} agora é seu. As fotos, as avaliações e a nota continuam.',
  },
  admin: {
    tag: 'Assumir anúncio',
    place: '{{category}} · {{city}} · anúncio do Use Guide',
    sentBy: 'Enviado por {{name}} · {{date}}',
    holder: { owner: 'Titular, sócio ou administrador', representative: 'Representante' },
    other: 'Outro pedido para este lugar: {{name}}, {{role}}, enviado em {{date}}.',
    open: 'Abrir: {{file}}',
    approve: 'Aprovar',
    reject: 'Recusar',
    confirmTitle: 'Passar o anúncio para {{name}}?',
    confirmText:
      'Confira o Cartão CNPJ na Receita, o vínculo da pessoa com a empresa (QSA ou MEI) e a identidade. {{listing}} passa para essa conta com fotos, avaliações e nota, e fica verificado. Os outros pedidos para este lugar são recusados com o motivo "Outro pedido foi aprovado".',
    return: 'Devolver ao Use Guide',
    returnConfirm:
      'Devolver {{listing}} ao Use Guide? O anúncio sai da conta de {{name}} e a verificação é desfeita.',
    returned: 'Devolvido ao Use Guide',
    approvedToast: 'Anúncio passado para a conta.',
    rejectedToast: 'Pedido recusado.',
    returnedToast: 'Anúncio devolvido ao Use Guide.',
    empty: 'Nenhum pedido para assumir anúncio.',
  },
  errors: {
    EMAIL_NOT_VERIFIED: 'Confirme seu e-mail antes de enviar o pedido.',
    TERMS_REQUIRED: 'Para continuar, aceite os Termos do parceiro.',
    LISTING_NOT_CLAIMABLE: 'Este anúncio não pode mais ser assumido pelo app.',
    ALREADY_APPROVED: 'Este anúncio já é seu.',
    DOCUMENT_IN_USE: 'Este documento já está em outra conta.',
    CNPJ_ALREADY_USED: 'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.',
    LISTING_IN_USE:
      'O anúncio já tem reservas, eventos ou plano do novo dono. Resolva com ele pelo suporte.',
    NOT_PENDING: 'Este pedido já foi revisado.',
    failed: 'Não foi possível enviar agora. Tente de novo.',
  },
};
