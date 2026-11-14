// Entrar, criar conta, recuperar e redefinir a senha (folha de acesso e página do link do e-mail).
type PasswordFieldText = { label: string; placeholder: string; show: string; hide: string };

export interface AuthTranslation {
  tabs: { label: string; login: string; register: string };
  email: string;
  loginEmailPlaceholder: string;
  registerEmailPlaceholder: string;
  firstName: string;
  lastName: string;
  phone: string;
  field: { current: PasswordFieldText; new: PasswordFieldText; confirm: PasswordFieldText };
  login: {
    forgot: string;
    submit: string;
    orUse: string;
    google: string;
    googleLogo: string;
    noAccount: string;
    signUp: string;
  };
  register: { submit: string; hasAccount: string; login: string };
  forgot: {
    title: string;
    back: string;
    submit: string;
    sentTitle: string;
    sentText: string;
    backToLogin: string;
  };
  reset: {
    title: string;
    errorTitle: string;
    requestNew: string;
    backHome: string;
    successTitle: string;
    successText: string;
    redirect_one: string;
    redirect_other: string;
    loginNow: string;
    requirements: string;
    save: string;
  };
  requirements: { upper: string; lower: string; number: string; special: string; length: string };
  validation: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    firstNameRequired: string;
    firstNameTooLong: string;
    lastNameRequired: string;
    lastNameTooLong: string;
    phoneRequired: string;
    confirmRequired: string;
    mismatch: string;
    passwordMin: string;
    passwordMax: string;
    passwordUpper: string;
    passwordLower: string;
    passwordNumber: string;
    passwordSpecial: string;
  };
  errors: {
    wrongCredentials: string;
    emailInUse: string;
    weakPassword: string;
    invalidEmail: string;
    tooManyRequests: string;
    popupBlocked: string;
    accountExists: string;
    unauthorizedDomain: string;
    network: string;
    recentLogin: string;
    generic: string;
    recoveryFailed: string;
    invalidLink: string;
    expiredLink: string;
    missingCode: string;
    saveFailed: string;
  };
}

export const authPtBR: AuthTranslation = {
  tabs: { label: 'Entrar ou criar conta', login: 'Entrar', register: 'Criar conta' },
  email: 'E-mail',
  loginEmailPlaceholder: 'Seu e-mail cadastrado',
  registerEmailPlaceholder: 'Seu e-mail',
  firstName: 'Nome',
  lastName: 'Sobrenome',
  phone: 'Telefone / WhatsApp',
  field: {
    current: {
      label: 'Senha',
      placeholder: 'Sua senha',
      show: 'Mostrar senha',
      hide: 'Ocultar senha',
    },
    new: {
      label: 'Nova senha',
      placeholder: 'Nova senha',
      show: 'Mostrar nova senha',
      hide: 'Ocultar nova senha',
    },
    confirm: {
      label: 'Confirmar senha',
      placeholder: 'Confirmar senha',
      show: 'Mostrar confirmação',
      hide: 'Ocultar confirmação',
    },
  },
  login: {
    forgot: 'Esqueceu a senha?',
    submit: 'Entrar',
    orUse: 'ou use',
    google: 'Continuar com Google',
    googleLogo: 'Google',
    noAccount: 'Ainda não tem conta?',
    signUp: 'Cadastre-se',
  },
  register: { submit: 'Cadastrar', hasAccount: 'Já tem conta?', login: 'Entrar' },
  forgot: {
    title: 'Recuperar senha',
    back: 'Voltar para entrar',
    submit: 'Enviar link',
    sentTitle: 'Instruções enviadas',
    sentText:
      'Se este e-mail estiver cadastrado, você vai receber um link para redefinir a senha. Confira a caixa de entrada e o spam.',
    backToLogin: 'Voltar para entrar',
  },
  reset: {
    title: 'Nova senha',
    errorTitle: 'Não deu certo',
    requestNew: 'Pedir novo link',
    backHome: 'Voltar ao início',
    successTitle: 'Senha redefinida',
    successText: 'Sua senha foi redefinida.',
    redirect_one: 'Indo para o acesso em {{count}} segundo…',
    redirect_other: 'Indo para o acesso em {{count}} segundos…',
    loginNow: 'Entrar agora',
    requirements: 'A senha precisa ter',
    save: 'Salvar senha',
  },
  requirements: {
    upper: 'Letra maiúscula',
    lower: 'Letra minúscula',
    number: 'Número',
    special: 'Caractere especial',
    length: 'Pelo menos 8 caracteres',
  },
  validation: {
    emailRequired: 'Informe o e-mail.',
    emailInvalid: 'Confira o formato do e-mail.',
    passwordRequired: 'Informe a senha.',
    firstNameRequired: 'Informe o nome.',
    firstNameTooLong: 'Nome muito longo.',
    lastNameRequired: 'Informe o sobrenome.',
    lastNameTooLong: 'Sobrenome muito longo.',
    phoneRequired: 'Informe o telefone ou WhatsApp.',
    confirmRequired: 'Confirme a senha.',
    mismatch: 'As senhas não são iguais.',
    passwordMin: 'A senha precisa ter pelo menos 8 caracteres.',
    passwordMax: 'A senha pode ter no máximo 100 caracteres.',
    passwordUpper: 'A senha precisa ter uma letra maiúscula.',
    passwordLower: 'A senha precisa ter uma letra minúscula.',
    passwordNumber: 'A senha precisa ter um número.',
    passwordSpecial: 'A senha precisa ter um caractere especial.',
  },
  errors: {
    wrongCredentials: 'E-mail ou senha incorretos.',
    emailInUse: 'Este e-mail já tem cadastro.',
    weakPassword: 'Essa senha é fraca demais.',
    invalidEmail: 'Confira o formato do e-mail.',
    tooManyRequests: 'Muitas tentativas seguidas. Aguarde alguns instantes.',
    popupBlocked: 'O navegador bloqueou a janela do Google. Permita janelas para continuar.',
    accountExists: 'Este e-mail já tem cadastro por outro meio de acesso.',
    unauthorizedDomain: 'Este endereço não está liberado para entrar. Tente pelo app oficial.',
    network: 'Sem conexão. Confira a internet e tente de novo.',
    recentLogin: 'Por segurança, entre de novo para continuar.',
    generic: 'Não foi possível entrar agora. Tente de novo.',
    recoveryFailed: 'Não foi possível enviar o e-mail de recuperação. Tente de novo.',
    invalidLink: 'Link de recuperação inválido.',
    expiredLink: 'Este link expirou ou já foi usado.',
    missingCode: 'Link de recuperação incompleto.',
    saveFailed: 'Não foi possível salvar a nova senha. Tente de novo.',
  },
};
