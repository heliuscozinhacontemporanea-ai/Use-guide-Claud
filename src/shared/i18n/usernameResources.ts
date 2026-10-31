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
    'Seu nome de usuário identifica você no Use Guide. Outras pessoas podem usá-lo para encontrar sua conta, por exemplo ao enviar um ingresso.',
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

export const usernameEn: UsernameTranslation = {
  title: 'Username',
  intro:
    'Your username identifies you on Use Guide. Other people can use it to find your account, for example when sending you a ticket.',
  label: 'Your @',
  rules: '3 to 30 letters, numbers, dot or underscore. No spaces or accents.',
  save: 'Save',
  change: 'Change @',
  changeWarning: 'You can change it once every 30 days. Your previous @ stays yours for 14 days.',
  lockedUntil: 'You can change it again from {{date}}.',
  saved: 'Done: you are now @{{username}}.',
  loadError: 'Could not load your username.',
  retry: 'Try again',
  errors: {
    USERNAME_INVALID: 'This @ is not allowed. Use letters, numbers, dot or underscore.',
    USERNAME_TAKEN: 'This @ is already taken. Choose another one.',
    USERNAME_CHANGE_TOO_SOON: 'You changed your @ less than 30 days ago.',
    failed: 'Could not save. Try again.',
  },
  transfer: {
    title: 'Transfer ticket',
    label: 'Recipient’s @',
    search: 'Search',
    confirmTitle: 'Check who will receive it',
    confirm: 'Transfer to @{{username}}',
    other: 'Search someone else',
    hint: 'The ticket leaves your wallet and the current QR code stops working.',
    done: 'Ticket transferred to @{{username}}.',
    returnTitle: 'Give the ticket back',
    returnHint:
      'You received this ticket from {{name}}. A received ticket can only go back to the buyer.',
    returnConfirm: 'Give back to {{name}}',
    returned: 'Ticket given back to {{name}}.',
    errors: {
      TRANSFER_ONLY_TO_BUYER: 'A received ticket can only be given back to the buyer.',
      USERNAME_NOT_FOUND: 'No account with this @. Ask the person to check it in Settings.',
      TRANSFER_TO_SELF: 'This ticket is already yours.',
      RECIPIENT_NOT_VERIFIED:
        'This account has not confirmed its email and cannot receive tickets.',
      RATE_LIMITED: 'Too many searches in a row. Try again in a few minutes.',
      failed: 'Could not transfer. Try again.',
    },
  },
};

export const usernameFr: UsernameTranslation = {
  title: 'Nom d’utilisateur',
  intro:
    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte, par exemple pour vous envoyer un billet.',
  label: 'Votre @',
  rules: 'De 3 à 30 lettres, chiffres, point ou tiret bas. Sans espaces ni accents.',
  save: 'Enregistrer',
  change: 'Changer de @',
  changeWarning:
    'Vous pouvez le changer une fois tous les 30 jours. L’ancien @ reste à vous pendant 14 jours.',
  lockedUntil: 'Vous pourrez le changer à nouveau à partir du {{date}}.',
  saved: 'C’est fait : vous êtes maintenant @{{username}}.',
  loadError: 'Impossible de charger votre nom d’utilisateur.',
  retry: 'Réessayer',
  errors: {
    USERNAME_INVALID: 'Ce @ n’est pas autorisé. Utilisez lettres, chiffres, point ou tiret bas.',
    USERNAME_TAKEN: 'Ce @ est déjà pris. Choisissez-en un autre.',
    USERNAME_CHANGE_TOO_SOON: 'Vous avez changé de @ il y a moins de 30 jours.',
    failed: 'Impossible d’enregistrer. Réessayez.',
  },
  transfer: {
    title: 'Transférer le billet',
    label: '@ du destinataire',
    search: 'Rechercher',
    confirmTitle: 'Vérifiez qui va le recevoir',
    confirm: 'Transférer à @{{username}}',
    other: 'Chercher une autre personne',
    hint: 'Le billet quitte votre portefeuille et le QR code actuel ne fonctionne plus.',
    done: 'Billet transféré à @{{username}}.',
    returnTitle: 'Rendre le billet',
    returnHint:
      'Vous avez reçu ce billet de {{name}}. Un billet reçu ne peut revenir qu’à la personne qui l’a acheté.',
    returnConfirm: 'Rendre à {{name}}',
    returned: 'Billet rendu à {{name}}.',
    errors: {
      TRANSFER_ONLY_TO_BUYER: 'Un billet reçu ne peut être rendu qu’à la personne qui l’a acheté.',
      USERNAME_NOT_FOUND:
        'Aucun compte avec ce @. Demandez à la personne de le vérifier dans Réglages.',
      TRANSFER_TO_SELF: 'Ce billet est déjà à vous.',
      RECIPIENT_NOT_VERIFIED:
        'Ce compte n’a pas confirmé son e-mail et ne peut pas recevoir de billets.',
      RATE_LIMITED: 'Trop de recherches d’affilée. Réessayez dans quelques minutes.',
      failed: 'Impossible de transférer. Réessayez.',
    },
  },
};
