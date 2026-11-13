/** Textos do @usuário e da transferência pelo @ (D21). pt-BR é a fonte. */
export interface UsernameTranslation {
  title: string;
  intro: string;
  label: string;
  rules: string;
  save: string;
  change: string;
  changeWarning: string;
  lockedUntil: string;
  saved: string;
  loadError: string;
  retry: string;
  onboardingTitle: string;
  signOut: string;
  errors: {
    USERNAME_INVALID: string;
    USERNAME_TAKEN: string;
    USERNAME_CHANGE_TOO_SOON: string;
    failed: string;
  };
  transfer: {
    title: string;
    label: string;
    search: string;
    confirmTitle: string;
    confirm: string;
    other: string;
    hint: string;
    done: string;
    returnTitle: string;
    returnHint: string;
    returnConfirm: string;
    returned: string;
    link: {
      title: string;
      hint: string;
      create: string;
      ready: string;
      pending: string;
      share: string;
      copy: string;
      copied: string;
      cancel: string;
      shareText: string;
      receiveTitle: string;
      loginHint: string;
      login: string;
      from: string;
      accept: string;
      decline: string;
      accepted: string;
      seeTickets: string;
      errors: {
        TRANSFER_LINK_INVALID: string;
        TRANSFER_LINK_EXPIRED: string;
        TRANSFER_LINK_OWN: string;
        RECIPIENT_NOT_VERIFIED: string;
        RATE_LIMITED: string;
        failed: string;
      };
    };
    errors: {
      TRANSFER_ONLY_TO_BUYER: string;
      USERNAME_NOT_FOUND: string;
      TRANSFER_TO_SELF: string;
      RECIPIENT_NOT_VERIFIED: string;
      RATE_LIMITED: string;
      failed: string;
    };
  };
}

export const usernamePtBR: UsernameTranslation = {
  title: 'Nome de usuário',
  intro:
    'Seu nome de usuário identifica você no Use Guide. Outras pessoas podem usá-lo para encontrar sua conta.',
  label: 'Seu @',
  rules: 'De 3 a 30 letras, números, ponto ou sublinhado. Sem espaços nem acentos.',
  save: 'Salvar',
  change: 'Trocar @',
  changeWarning:
    'Você pode trocar uma vez a cada 30 dias. O @ anterior fica guardado com você por 14 dias.',
  lockedUntil: 'Você poderá trocar de novo a partir de {{date}}.',
  saved: 'Pronto: agora você é @{{username}}.',
  loadError: 'Não foi possível carregar seu nome de usuário.',
  retry: 'Tentar de novo',
  onboardingTitle: 'Escolha seu nome de usuário',
  signOut: 'Sair da conta',
  errors: {
    USERNAME_INVALID: 'Este @ não é permitido. Use letras, números, ponto ou sublinhado.',
    USERNAME_TAKEN: 'Este @ já está em uso. Escolha outro.',
    USERNAME_CHANGE_TOO_SOON: 'Você trocou de @ há menos de 30 dias.',
    failed: 'Não foi possível salvar. Tente de novo.',
  },
  transfer: {
    title: 'Transferir ingresso',
    label: '@ de quem vai receber',
    search: 'Procurar',
    confirmTitle: 'Confira quem vai receber',
    confirm: 'Transferir para @{{username}}',
    other: 'Procurar outra pessoa',
    hint: 'O ingresso sai da sua carteira, e o QR Code atual deixa de valer.',
    done: 'Ingresso transferido para @{{username}}.',
    returnTitle: 'Devolver ingresso',
    returnHint:
      'Você recebeu este ingresso de {{name}}. Ingresso recebido só pode voltar para quem comprou.',
    returnConfirm: 'Devolver para {{name}}',
    returned: 'Ingresso devolvido para {{name}}.',
    link: {
      title: 'A pessoa ainda não tem conta?',
      hint: 'Envie um link: ela cria a conta e aceita o ingresso. O link vale 30 minutos e uma vez só, e o ingresso continua com você até alguém aceitar.',
      create: 'Gerar link de transferência',
      ready:
        'Link pronto. Vale até {{time}} e só pode ser usado uma vez. Quem tiver o link pode aceitar o ingresso: envie só para a pessoa certa.',
      pending:
        'Há um link de transferência aberto até {{time}}. O ingresso continua com você até alguém aceitar.',
      share: 'Compartilhar',
      copy: 'Copiar link',
      copied: 'Link copiado.',
      cancel: 'Cancelar link',
      shareText:
        'Tenho um ingresso para você: {{event}}. Abra o link, crie sua conta no Use Guide e aceite.',
      receiveTitle: 'Você recebeu um ingresso',
      loginHint: 'Entre ou crie sua conta no Use Guide para ver e aceitar o ingresso.',
      login: 'Entrar ou criar conta',
      from: 'Enviado por {{name}}. O link vale até {{time}}.',
      accept: 'Aceitar ingresso',
      decline: 'Agora não',
      accepted: 'Pronto: o ingresso está na sua carteira.',
      seeTickets: 'Ver meus ingressos',
      errors: {
        TRANSFER_LINK_INVALID: 'Este link não é válido ou já foi usado.',
        TRANSFER_LINK_EXPIRED: 'Este link venceu. Peça um novo para quem enviou.',
        TRANSFER_LINK_OWN: 'Este link é seu: envie para a outra pessoa.',
        RECIPIENT_NOT_VERIFIED: 'Confirme seu e-mail para receber o ingresso.',
        RATE_LIMITED: 'Muitas tentativas seguidas. Tente de novo em alguns minutos.',
        failed: 'Não foi possível concluir. Tente de novo.',
      },
    },
    errors: {
      TRANSFER_ONLY_TO_BUYER: 'Ingresso recebido só pode ser devolvido para quem comprou.',
      USERNAME_NOT_FOUND: 'Nenhuma conta com este @. Peça para a pessoa conferir em Configurações.',
      TRANSFER_TO_SELF: 'Este ingresso já é seu.',
      RECIPIENT_NOT_VERIFIED:
        'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.',
      RATE_LIMITED: 'Muitas buscas seguidas. Tente de novo em alguns minutos.',
      failed: 'Não foi possível transferir. Tente de novo.',
    },
  },
};
