/**
 * Termos e políticas da plataforma (D15). pt-BR é a fonte e a versão que vale; mudou o texto, muda
 * BUYER_TERMS_VERSION ou PARTNER_TERMS_VERSION. Precisa de validação jurídica antes das chaves live (D14).
 */
interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalTranslation {
  title: string;
  version: string;
  prevailing: string;
  use: LegalSection;
  purchases: LegalSection & {
    policiesTitle: string;
    families: { event: string; booking: string; transfer: string };
  };
  partner: LegalSection & { feesWithValues: string; feesGeneric: string };
  privacy: LegalSection;
  accept: { buyer: string; partner: string; required: string; close: string };
  partnerTerms: {
    title: string;
    description: string;
    button: string;
    accepted: string;
    error: string;
  };
  about: { title: string; back: string; general: string; licenses: string; terms: string };
}

export const legalPtBR: LegalTranslation = {
  title: 'Termos e políticas',
  version: 'Versão de {{date}}',
  prevailing: 'Em caso de divergência entre idiomas, vale a versão em português.',
  use: {
    title: 'Termos de uso',
    paragraphs: [
      'Ao usar o Use Guide, você concorda com estes termos e com a política de privacidade abaixo. Se não concordar, não use o aplicativo.',
      'O Use Guide reúne informações, mapas e recomendações sobre Jericoacoara, Preá e Barrinha de Baixo, e vende ingressos, passeios e entradas de organizadores e estabelecimentos cadastrados.',
      'Você deve informar dados verdadeiros e manter suas credenciais em sigilo. A conta é pessoal e intransferível.',
      'É proibido usar o aplicativo para atividades ilegais, copiar ou distribuir o conteúdo sem autorização e tentar acessar áreas restritas.',
      'As informações de rotas, trilhas e condições do tempo são orientativas. Avalie os riscos antes de seguir uma rota sugerida.',
      'O aplicativo usa serviços de terceiros, como Google Maps, Firebase e Stripe, sujeitos às regras desses serviços.',
      'Estes termos podem mudar. Compras e vendas novas pedem o aceite da versão atual; o seu pedido segue a versão que você aceitou.',
      'Dúvidas: ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Compras, cancelamento e reembolso',
    paragraphs: [
      'Você paga ao Use Guide, que repassa o valor ao organizador depois do serviço.',
      'Antes do pagamento aparecem o total e a taxa de serviço destacada. A taxa de serviço remunera a plataforma.',
      'Cada organizador escolhe uma das políticas de cancelamento da plataforma, listadas abaixo. A política escolhida aparece antes do pagamento e fica gravada no pedido: mudanças posteriores no anúncio não alteram o seu pedido.',
      'Direito de arrependimento (Código de Defesa do Consumidor, art. 49): cancelando em até 7 dias da compra e até 48 horas antes do início, o reembolso é integral, inclusive a taxa de serviço, quando houver.',
      'Fora desse prazo vale a política do pedido, e a taxa de serviço não é devolvida. Depois do início, ou se você não comparecer, não há reembolso.',
      'Cancelamento pelo organizador: reembolso integral, inclusive a taxa de serviço. Em caso de força maior comprovada, o organizador pode oferecer uma nova data; se você não aceitar, recebe o reembolso integral.',
      'O reembolso volta pelo mesmo meio de pagamento usado na compra.',
      'Transferência de ingresso: permitida quando o organizador autoriza, até o prazo informado no pedido.',
      'Se você contestar a compra no cartão, o pedido fica suspenso até a decisão.',
    ],
    policiesTitle: 'Políticas de cancelamento da plataforma',
    families: {
      event: 'Eventos',
      booking: 'Passeios, aluguéis e entradas',
      transfer: 'Translados (Código Civil, art. 740)',
    },
  },
  partner: {
    title: 'Termos do parceiro',
    paragraphs: [
      'Cada CNPJ verificado recebe numa conta própria no Stripe, e cada estabelecimento vende pela conta do seu CNPJ. CPF não vende.',
      'As tarifas do Stripe são pagas pela plataforma. Num reembolso parcial, a taxa da plataforma incide sobre o valor que você fica.',
      'Repasse: o valor de cada venda é transferido 48 horas depois do fim do serviço. Uma reclamação aberta nesse prazo suspende o repasse daquela venda por até 5 dias.',
      'Política de cancelamento: você escolhe uma das opções da plataforma. Depois de publicar, só pode trocar por uma opção mais flexível. O direito de arrependimento do comprador vale sempre.',
      'Cancelamento pelo proprietário: os compradores recebem reembolso integral, inclusive a taxa de serviço, pago pela plataforma antes do repasse. Você paga multa de 20% sobre o valor vendido (sem as taxas de serviço), no cartão ou por Pix, em até 24 horas. Sem pagamento, a multa é descontada dos repasses pendentes e futuros do CNPJ, que fica bloqueado para novas vendas até quitar.',
      'Força maior comprovada: a primeira solução é remarcar. Quem não aceitar a nova data recebe reembolso integral, sem multa para você.',
      'Contestação no cartão: com prova de uso (check-in), a plataforma contesta e arca com o resultado. Sem prova, o valor contestado vira dívida do CNPJ.',
    ],
    feesWithValues:
      'Taxa da plataforma: {{bookings}} nas reservas (passeios, aluguéis, translados e entradas). Nos ingressos, {{tickets}} mais a taxa de serviço de {{serviceFee}} por ingresso pago, cobrada do comprador; ou {{absorbed}} quando você absorve a taxa de serviço.',
    feesGeneric:
      'Taxa da plataforma: os percentuais vigentes aparecem em Recebimentos, no painel do parceiro, antes do aceite destes termos.',
  },
  privacy: {
    title: 'Privacidade de dados',
    paragraphs: [
      'Coletamos só o necessário, como nome, e-mail, localização e dados de uso, com o seu consentimento, para oferecer uma experiência personalizada (Lei 13.709/2018, LGPD).',
      'Usamos os dados para mostrar lugares e produtos, personalizar recomendações, melhorar o desempenho e a segurança e enviar notificações.',
      'Serviços de terceiros, como os do Google e o Stripe, seguem regras de privacidade próprias e compatíveis com a LGPD. Dados de cartão ficam no Stripe e nunca passam pelo Use Guide.',
      'Os dados ficam em servidores protegidos por criptografia e são acessados só por pessoas autorizadas.',
      'Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail ajuda@useguide.com.br. Registros de compra são anonimizados, e não apagados, pelo prazo legal.',
    ],
  },
  accept: {
    buyer: 'Li e aceito os <terms>termos e a política de cancelamento</terms>',
    partner: 'Li e aceito os <terms>termos do parceiro</terms>',
    required: 'Aceite os termos para continuar.',
    close: 'Fechar',
  },
  partnerTerms: {
    title: 'Termos do parceiro',
    description:
      'Antes de cadastrar a conta de recebimento, leia e aceite as regras de taxa, repasse, cancelamento e multa.',
    button: 'Aceitar termos',
    accepted: 'Termos do parceiro aceitos em {{date}}.',
    error: 'Não foi possível registrar o aceite. Tente de novo.',
  },
  about: {
    title: 'Sobre o app',
    back: 'Voltar',
    general: 'Geral',
    licenses: 'Licenças',
    terms: 'Termos',
  },
};

export const legalEn: LegalTranslation = {
  title: 'Terms and policies',
  version: 'Version of {{date}}',
  prevailing: 'If the languages differ, the Portuguese version prevails.',
  use: {
    title: 'Terms of use',
    paragraphs: [
      'By using Use Guide, you agree to these terms and to the privacy policy below. If you do not agree, do not use the app.',
      'Use Guide brings together information, maps and tips about Jericoacoara, Preá and Barrinha de Baixo, and sells tickets, tours and entries from registered organizers and businesses.',
      'You must provide true information and keep your credentials secret. Your account is personal and non-transferable.',
      'You may not use the app for illegal activities, copy or distribute its content without permission, or try to access restricted areas.',
      'Route, trail and weather information is for guidance only. Assess the risks before following a suggested route.',
      'The app uses third-party services such as Google Maps, Firebase and Stripe, subject to their own rules.',
      'These terms may change. New purchases and sales require accepting the current version; your order follows the version you accepted.',
      'Questions: ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Purchases, cancellation and refunds',
    paragraphs: [
      'You pay Use Guide, which passes the amount on to the organizer after the service.',
      'Before payment you see the total with the service fee shown separately. The service fee pays the platform.',
      'Each organizer chooses one of the platform cancellation policies listed below. The chosen policy is shown before payment and saved with the order: later changes to the listing do not affect your order.',
      'Right of withdrawal (Brazilian Consumer Code, art. 49): if you cancel within 7 days of purchase and at least 48 hours before the start, you get a full refund, including any service fee.',
      'Outside that window the order policy applies and the service fee is not refunded. After the start, or if you do not show up, there is no refund.',
      'Cancellation by the organizer: full refund, service fee included. In proven force majeure, the organizer may offer a new date; if you do not accept it, you get a full refund.',
      'Refunds go back to the payment method used for the purchase.',
      'Ticket transfer: allowed when the organizer permits it, up to the deadline shown on the order.',
      'If you dispute the purchase with your card issuer, the order is suspended until the decision.',
    ],
    policiesTitle: 'Platform cancellation policies',
    families: {
      event: 'Events',
      booking: 'Tours, rentals and entries',
      transfer: 'Transfers (Brazilian Civil Code, art. 740)',
    },
  },
  partner: {
    title: 'Partner terms',
    paragraphs: [
      'Each verified CNPJ receives into its own Stripe account, and each business sells through the account of its CNPJ. Individual CPFs do not sell.',
      'Stripe fees are paid by the platform. On a partial refund, the platform fee applies to the amount you keep.',
      'Payouts: the amount of each sale is transferred 48 hours after the service ends. A complaint opened in that window holds that sale’s payout for up to 5 days.',
      'Cancellation policy: you choose one of the platform options. After publishing, you can only switch to a more flexible option. The buyer’s right of withdrawal always applies.',
      'Cancellation by the owner: buyers get a full refund, service fee included, paid by the platform before the payout. You pay a penalty of 20% of the amount sold (excluding service fees), by card or Pix, within 24 hours. If unpaid, the penalty is deducted from the CNPJ’s pending and future payouts, and the CNPJ is blocked from new sales until it is settled.',
      'Proven force majeure: the first solution is rescheduling. Buyers who do not accept the new date get a full refund, with no penalty for you.',
      'Card disputes: with proof of use (check-in), the platform contests and bears the outcome. Without proof, the disputed amount becomes a debt of the CNPJ.',
    ],
    feesWithValues:
      'Platform fee: {{bookings}} on bookings (tours, rentals, transfers and entries). On tickets, {{tickets}} plus a service fee of {{serviceFee}} per paid ticket, charged to the buyer; or {{absorbed}} when you absorb the service fee.',
    feesGeneric:
      'Platform fee: the current rates are shown under Payouts, in the partner panel, before you accept these terms.',
  },
  privacy: {
    title: 'Data privacy',
    paragraphs: [
      'We collect only what is needed, such as name, email, location and usage data, with your consent, to offer a personalized experience (Brazilian Law 13.709/2018, LGPD).',
      'We use the data to show places and products, personalize recommendations, improve performance and security, and send notifications.',
      'Third-party services such as Google and Stripe follow their own privacy rules, compatible with the LGPD. Card data stays with Stripe and never passes through Use Guide.',
      'Data is stored on servers protected by encryption and accessed only by authorized people.',
      'You can request access to, correction of or deletion of your data at ajuda@useguide.com.br. Purchase records are anonymized, not deleted, for the legal period.',
    ],
  },
  accept: {
    buyer: 'I have read and accept the <terms>terms and cancellation policy</terms>',
    partner: 'I have read and accept the <terms>partner terms</terms>',
    required: 'Accept the terms to continue.',
    close: 'Close',
  },
  partnerTerms: {
    title: 'Partner terms',
    description:
      'Before setting up your payout account, read and accept the rules on fees, payouts, cancellations and penalties.',
    button: 'Accept terms',
    accepted: 'Partner terms accepted on {{date}}.',
    error: 'Could not record your acceptance. Try again.',
  },
  about: {
    title: 'About the app',
    back: 'Back',
    general: 'General',
    licenses: 'Licenses',
    terms: 'Terms',
  },
};

export const legalFr: LegalTranslation = {
  title: 'Conditions et politiques',
  version: 'Version du {{date}}',
  prevailing: 'En cas de divergence entre les langues, la version portugaise prévaut.',
  use: {
    title: 'Conditions d’utilisation',
    paragraphs: [
      'En utilisant Use Guide, vous acceptez ces conditions et la politique de confidentialité ci-dessous. Si vous n’êtes pas d’accord, n’utilisez pas l’application.',
      'Use Guide rassemble des informations, des cartes et des conseils sur Jericoacoara, Preá et Barrinha de Baixo, et vend des billets, des excursions et des entrées d’organisateurs et d’établissements inscrits.',
      'Vous devez fournir des informations exactes et garder vos identifiants secrets. Le compte est personnel et non transférable.',
      'Il est interdit d’utiliser l’application pour des activités illégales, de copier ou diffuser son contenu sans autorisation et de tenter d’accéder à des zones restreintes.',
      'Les informations sur les itinéraires, les sentiers et la météo sont indicatives. Évaluez les risques avant de suivre un itinéraire proposé.',
      'L’application utilise des services tiers, comme Google Maps, Firebase et Stripe, soumis à leurs propres règles.',
      'Ces conditions peuvent changer. Les nouveaux achats et ventes demandent l’acceptation de la version actuelle ; votre commande suit la version que vous avez acceptée.',
      'Questions : ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Achats, annulation et remboursement',
    paragraphs: [
      'Vous payez Use Guide, qui reverse le montant à l’organisateur après la prestation.',
      'Avant le paiement, le total s’affiche avec les frais de service séparés. Les frais de service rémunèrent la plateforme.',
      'Chaque organisateur choisit l’une des politiques d’annulation de la plateforme, listées ci-dessous. La politique choisie s’affiche avant le paiement et est enregistrée avec la commande : les modifications ultérieures de l’annonce ne changent pas votre commande.',
      'Droit de rétractation (Code brésilien de la consommation, art. 49) : en annulant dans les 7 jours suivant l’achat et au moins 48 heures avant le début, le remboursement est intégral, frais de service éventuels compris.',
      'En dehors de ce délai, la politique de la commande s’applique et les frais de service ne sont pas remboursés. Après le début, ou en cas d’absence, il n’y a pas de remboursement.',
      'Annulation par l’organisateur : remboursement intégral, frais de service compris. En cas de force majeure prouvée, l’organisateur peut proposer une nouvelle date ; si vous ne l’acceptez pas, vous êtes remboursé intégralement.',
      'Le remboursement est effectué sur le moyen de paiement utilisé pour l’achat.',
      'Transfert de billet : autorisé lorsque l’organisateur le permet, jusqu’au délai indiqué sur la commande.',
      'Si vous contestez l’achat auprès de votre banque, la commande est suspendue jusqu’à la décision.',
    ],
    policiesTitle: 'Politiques d’annulation de la plateforme',
    families: {
      event: 'Événements',
      booking: 'Excursions, locations et entrées',
      transfer: 'Transferts (Code civil brésilien, art. 740)',
    },
  },
  partner: {
    title: 'Conditions du partenaire',
    paragraphs: [
      'Chaque CNPJ vérifié reçoit sur son propre compte Stripe, et chaque établissement vend via le compte de son CNPJ. Les CPF ne vendent pas.',
      'Les frais Stripe sont pris en charge par la plateforme. En cas de remboursement partiel, la commission de la plateforme porte sur le montant que vous conservez.',
      'Versement : le montant de chaque vente est transféré 48 heures après la fin de la prestation. Une réclamation ouverte dans ce délai suspend le versement de cette vente jusqu’à 5 jours.',
      'Politique d’annulation : vous choisissez l’une des options de la plateforme. Après la publication, vous ne pouvez passer qu’à une option plus flexible. Le droit de rétractation de l’acheteur s’applique toujours.',
      'Annulation par le propriétaire : les acheteurs sont remboursés intégralement, frais de service compris, par la plateforme avant le versement. Vous payez une pénalité de 20 % du montant vendu (hors frais de service), par carte ou Pix, sous 24 heures. À défaut, la pénalité est déduite des versements en attente et futurs du CNPJ, qui est bloqué pour de nouvelles ventes jusqu’au paiement.',
      'Force majeure prouvée : la première solution est le report. Les acheteurs qui n’acceptent pas la nouvelle date sont remboursés intégralement, sans pénalité pour vous.',
      'Contestations de carte : avec une preuve d’utilisation (check-in), la plateforme conteste et assume le résultat. Sans preuve, le montant contesté devient une dette du CNPJ.',
    ],
    feesWithValues:
      'Commission de la plateforme : {{bookings}} sur les réservations (excursions, locations, transferts et entrées). Sur les billets, {{tickets}} plus des frais de service de {{serviceFee}} par billet payant, facturés à l’acheteur ; ou {{absorbed}} lorsque vous prenez les frais de service en charge.',
    feesGeneric:
      'Commission de la plateforme : les taux en vigueur s’affichent dans Versements, sur le panneau du partenaire, avant l’acceptation de ces conditions.',
  },
  privacy: {
    title: 'Confidentialité des données',
    paragraphs: [
      'Nous ne collectons que le nécessaire, comme le nom, l’e-mail, la localisation et les données d’utilisation, avec votre consentement, pour offrir une expérience personnalisée (loi brésilienne 13.709/2018, LGPD).',
      'Nous utilisons ces données pour afficher des lieux et des produits, personnaliser les recommandations, améliorer les performances et la sécurité et envoyer des notifications.',
      'Les services tiers, comme Google et Stripe, suivent leurs propres règles de confidentialité, compatibles avec la LGPD. Les données de carte restent chez Stripe et ne passent jamais par Use Guide.',
      'Les données sont stockées sur des serveurs protégés par chiffrement et consultées uniquement par des personnes autorisées.',
      'Vous pouvez demander l’accès, la correction ou la suppression de vos données à ajuda@useguide.com.br. Les données d’achat sont anonymisées, et non supprimées, pendant la durée légale.',
    ],
  },
  accept: {
    buyer: 'J’ai lu et j’accepte les <terms>conditions et la politique d’annulation</terms>',
    partner: 'J’ai lu et j’accepte les <terms>conditions du partenaire</terms>',
    required: 'Acceptez les conditions pour continuer.',
    close: 'Fermer',
  },
  partnerTerms: {
    title: 'Conditions du partenaire',
    description:
      'Avant de configurer votre compte de versement, lisez et acceptez les règles sur les commissions, versements, annulations et pénalités.',
    button: 'Accepter les conditions',
    accepted: 'Conditions du partenaire acceptées le {{date}}.',
    error: 'Impossible d’enregistrer votre acceptation. Réessayez.',
  },
  about: {
    title: 'À propos',
    back: 'Retour',
    general: 'Général',
    licenses: 'Licences',
    terms: 'Conditions',
  },
};
