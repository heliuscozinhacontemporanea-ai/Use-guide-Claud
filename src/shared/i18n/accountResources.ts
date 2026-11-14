/** Textos de Minha conta e Nova senha (menu do perfil). pt-BR é a fonte. */
export interface AccountTranslation {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  save: string;
  saving: string;
  changePassword: string;
  showPassword: string;
  hidePassword: string;
  password: {
    title: string;
    current: string;
    new: string;
    confirm: string;
    requirements: string;
    rules: { upper: string; lower: string; number: string; length: string };
    submit: string;
    saving: string;
  };
  delete: {
    action: string;
    title: string;
    message: string;
    partnerNote: string;
    passwordLabel: string;
    confirm: string;
    deleting: string;
    cancel: string;
  };
  validation: {
    firstNameRequired: string;
    firstNameTooLong: string;
    lastNameRequired: string;
    lastNameTooLong: string;
    phoneInvalid: string;
    currentRequired: string;
    newRules: string;
    confirmRequired: string;
    mismatch: string;
    passwordRequired: string;
  };
  feedback: {
    profileSaved: string;
    profileError: string;
    profileLoadError: string;
    passwordSaved: string;
    passwordError: string;
    wrongPassword: string;
    googleCanceled: string;
    deleteError: string;
    recentLogin: string;
    photoSaved: string;
    photoError: string;
  };
}

export const accountPtBR: AccountTranslation = {
  firstName: 'Nome',
  lastName: 'Sobrenome',
  phone: 'Telefone',
  email: 'E-mail',
  save: 'Salvar alterações',
  saving: 'Salvando…',
  changePassword: 'Alterar senha',
  showPassword: 'Mostrar senha',
  hidePassword: 'Ocultar senha',
  password: {
    title: 'Nova senha',
    current: 'Senha atual',
    new: 'Nova senha',
    confirm: 'Confirmar nova senha',
    requirements: 'A nova senha precisa ter:',
    rules: {
      upper: 'Letra maiúscula',
      lower: 'Letra minúscula',
      number: 'Número',
      length: '8 a 20 caracteres',
    },
    submit: 'Atualizar senha',
    saving: 'Atualizando…',
  },
  delete: {
    action: 'Excluir conta',
    title: 'Excluir sua conta?',
    message: 'A exclusão é definitiva e não pode ser desfeita.',
    partnerNote: 'Seus estabelecimentos e eventos cadastrados também serão excluídos.',
    passwordLabel: 'Para confirmar, digite sua senha',
    confirm: 'Excluir conta',
    deleting: 'Excluindo…',
    cancel: 'Manter conta',
  },
  validation: {
    firstNameRequired: 'Informe o nome.',
    firstNameTooLong: 'O nome pode ter até 50 caracteres.',
    lastNameRequired: 'Informe o sobrenome.',
    lastNameTooLong: 'O sobrenome pode ter até 50 caracteres.',
    phoneInvalid: 'Telefone inválido.',
    currentRequired: 'Informe a senha atual.',
    newRules: 'A senha precisa de 8 a 20 caracteres, com maiúscula, minúscula e número.',
    confirmRequired: 'Confirme a nova senha.',
    mismatch: 'As senhas não são iguais.',
    passwordRequired: 'Informe a senha para confirmar.',
  },
  feedback: {
    profileSaved: 'Dados salvos.',
    profileError: 'Não foi possível salvar. Tente de novo.',
    profileLoadError: 'Não foi possível carregar seus dados.',
    passwordSaved: 'Senha atualizada.',
    passwordError: 'Não foi possível atualizar a senha. Tente de novo.',
    wrongPassword: 'Senha incorreta. Confira e tente de novo.',
    googleCanceled: 'Cancelado: confirme com sua conta Google para continuar.',
    deleteError: 'Não foi possível excluir a conta. Confira sua conexão e tente de novo.',
    recentLogin: 'Por segurança, entre de novo na conta antes de excluí-la.',
    photoSaved: 'Foto atualizada.',
    photoError: 'Não foi possível usar esta foto. Tente outra.',
  },
};
