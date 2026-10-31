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

export const usernameEn: UsernameTranslation = {
  title: 'Username',
  intro: 'Your username identifies you on Use Guide. Other people can use it to find your account.',
  label: 'Your @',
  rules: '3 to 30 letters, numbers, dot or underscore. No spaces or accents.',
  save: 'Save',
  change: 'Change @',
  changeWarning: 'You can change it once every 30 days. Your previous @ stays yours for 14 days.',
  lockedUntil: 'You can change it again from {{date}}.',
  saved: 'Done: you are now @{{username}}.',
  loadError: 'Could not load your username.',
  retry: 'Try again',
  onboardingTitle: 'Choose your username',
  signOut: 'Sign out',
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
    link: {
      title: 'The person has no account yet?',
      hint: 'Send a link: they create an account and accept the ticket. The link is valid for 30 minutes and only once, and the ticket stays with you until someone accepts it.',
      create: 'Create transfer link',
      ready:
        'Link ready. Valid until {{time}} and only once. Anyone with the link can accept the ticket: send it only to the right person.',
      pending:
        'A transfer link is open until {{time}}. The ticket stays with you until someone accepts it.',
      share: 'Share',
      copy: 'Copy link',
      copied: 'Link copied.',
      cancel: 'Cancel link',
      shareText:
        'I have a ticket for you: {{event}}. Open the link, create your Use Guide account and accept it.',
      receiveTitle: 'You received a ticket',
      loginHint: 'Sign in or create your Use Guide account to see and accept the ticket.',
      login: 'Sign in or create account',
      from: 'Sent by {{name}}. The link is valid until {{time}}.',
      accept: 'Accept ticket',
      decline: 'Not now',
      accepted: 'Done: the ticket is in your wallet.',
      seeTickets: 'See my tickets',
      errors: {
        TRANSFER_LINK_INVALID: 'This link is not valid or was already used.',
        TRANSFER_LINK_EXPIRED: 'This link has expired. Ask the sender for a new one.',
        TRANSFER_LINK_OWN: 'This link is yours: send it to the other person.',
        RECIPIENT_NOT_VERIFIED: 'Confirm your email to receive the ticket.',
        RATE_LIMITED: 'Too many attempts in a row. Try again in a few minutes.',
        failed: 'Could not complete. Try again.',
      },
    },
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
    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte.',
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
  onboardingTitle: 'Choisissez votre nom d’utilisateur',
  signOut: 'Se déconnecter',
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
    link: {
      title: 'La personne n’a pas encore de compte ?',
      hint: 'Envoyez un lien : elle crée son compte et accepte le billet. Le lien est valable 30 minutes et une seule fois, et le billet reste à vous jusqu’à l’acceptation.',
      create: 'Créer un lien de transfert',
      ready:
        'Lien prêt. Valable jusqu’à {{time}} et une seule fois. Toute personne ayant le lien peut accepter le billet : envoyez-le seulement à la bonne personne.',
      pending:
        'Un lien de transfert est ouvert jusqu’à {{time}}. Le billet reste à vous jusqu’à l’acceptation.',
      share: 'Partager',
      copy: 'Copier le lien',
      copied: 'Lien copié.',
      cancel: 'Annuler le lien',
      shareText:
        'J’ai un billet pour toi : {{event}}. Ouvre le lien, crée ton compte Use Guide et accepte-le.',
      receiveTitle: 'Vous avez reçu un billet',
      loginHint: 'Connectez-vous ou créez votre compte Use Guide pour voir et accepter le billet.',
      login: 'Se connecter ou créer un compte',
      from: 'Envoyé par {{name}}. Le lien est valable jusqu’à {{time}}.',
      accept: 'Accepter le billet',
      decline: 'Plus tard',
      accepted: 'C’est fait : le billet est dans votre portefeuille.',
      seeTickets: 'Voir mes billets',
      errors: {
        TRANSFER_LINK_INVALID: 'Ce lien n’est pas valable ou a déjà été utilisé.',
        TRANSFER_LINK_EXPIRED: 'Ce lien a expiré. Demandez-en un nouveau à l’expéditeur.',
        TRANSFER_LINK_OWN: 'Ce lien est à vous : envoyez-le à l’autre personne.',
        RECIPIENT_NOT_VERIFIED: 'Confirmez votre e-mail pour recevoir le billet.',
        RATE_LIMITED: 'Trop de tentatives d’affilée. Réessayez dans quelques minutes.',
        failed: 'Impossible de terminer. Réessayez.',
      },
    },
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
