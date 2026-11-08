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
      'O Use Guide reúne informações, mapas e recomendações de destinos turísticos no Brasil e vende ingressos, passeios, aluguéis, traslados e entradas de organizadores e estabelecimentos cadastrados.',
      'Você deve informar dados verdadeiros e manter suas credenciais em sigilo. A conta é pessoal e intransferível.',
      'É proibido usar o aplicativo para atividades ilegais, copiar ou distribuir o conteúdo sem autorização e tentar acessar áreas restritas.',
      'As informações de rotas, trilhas e condições do tempo são orientativas. Avalie os riscos antes de seguir uma rota sugerida.',
      'O aplicativo usa serviços de terceiros, como Google Maps, Firebase e Stripe, sujeitos às regras desses serviços.',
      'Mudanças nestes termos: quando a mudança for importante, avisamos pelo aplicativo com 15 dias de antecedência. Continuar usando o Use Guide depois da data de vigência vale como aceite da versão nova.',
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
      'Cortesias: você pode enviar cortesias pelo @ ou por link pessoal, uma por pessoa por evento. A cortesia ocupa um lugar na sessão, não tem preço, taxa nem repasse, e não pode ser reembolsada, transferida nem vendida. Não é permitido dar cortesia a quem comprou, cancelou ou teve reembolso de ingresso do mesmo evento.',
      'Divulgadores: o combinado com cada divulgador (comissão, valor por ingresso ou cachê fixo) é pago por você, diretamente, depois do evento. O Use Guide calcula e mostra os valores, mas não faz nem garante esse pagamento.',
      'Venda fora da plataforma: é proibido vender ou cobrar fora do Use Guide por ingresso, cortesia, link de convite, reserva ou serviço anunciado aqui, e pedir ao cliente que cancele a compra para pagar por fora. A quebra desta regra leva à suspensão das vendas do CNPJ e pode levar ao encerramento da conta de parceiro.',
      'Mudanças nestes termos: quando a mudança for importante, avisamos pelo aplicativo com 15 dias de antecedência. Continuar vendendo depois da data de vigência vale como aceite da versão nova; o aceite também pode ser registrado em Ganhos › Contas de recebimento.',
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
      'Se você ativar as notificações, guardamos um identificador do aparelho para enviá-las. Você pode desativar a qualquer momento em Configurações › Notificações ou no navegador; o identificador é apagado quando você sair da conta neste aparelho ou excluir a conta.',
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
      'Leia e aceite as regras de taxa, repasse, cancelamento, multa, cortesias, divulgadores e venda fora da plataforma.',
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
      'Use Guide brings together information, maps and tips about travel destinations in Brazil and sells tickets, tours, rentals, transfers and entries from registered organizers and businesses.',
      'You must provide true information and keep your credentials secret. Your account is personal and non-transferable.',
      'You may not use the app for illegal activities, copy or distribute its content without permission, or try to access restricted areas.',
      'Route, trail and weather information is for guidance only. Assess the risks before following a suggested route.',
      'The app uses third-party services such as Google Maps, Firebase and Stripe, subject to their own rules.',
      'Changes to these terms: when the change is important, we notify you in the app 15 days in advance. Continuing to use Use Guide after the effective date counts as acceptance of the new version.',
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
      'Complimentary tickets: you can send complimentary tickets by @ or by personal link, one per person per event. A complimentary ticket takes a spot in the session, has no price, fee or payout, and cannot be refunded, transferred or sold. You may not give a complimentary ticket to anyone who bought, canceled or was refunded a ticket for the same event.',
      'Promoters: the deal with each promoter (commission, amount per ticket or flat fee) is paid by you, directly, after the event. Use Guide calculates and shows the amounts, but does not make or guarantee this payment.',
      'Selling outside the platform: you may not sell or charge outside Use Guide for a ticket, complimentary ticket, invite link, booking or service listed here, nor ask a customer to cancel a purchase to pay outside. Breaking this rule suspends the sales of the CNPJ and may lead to the closing of the partner account.',
      'Changes to these terms: when the change is important, we notify you in the app 15 days in advance. Continuing to sell after the effective date counts as acceptance of the new version; acceptance can also be recorded in Earnings › Payout accounts.',
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
      'If you turn on notifications, we store an identifier for the device to send them. You can turn them off at any time in Settings › Notifications or in your browser; the identifier is deleted when you sign out on this device or delete your account.',
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
      'Read and accept the rules on fees, payouts, cancellations, penalties, complimentary tickets, promoters and selling outside the platform.',
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
      'Use Guide rassemble des informations, des cartes et des conseils sur des destinations touristiques au Brésil et vend des billets, des excursions, des locations, des transferts et des entrées d’organisateurs et d’établissements inscrits.',
      'Vous devez fournir des informations exactes et garder vos identifiants secrets. Le compte est personnel et non transférable.',
      'Il est interdit d’utiliser l’application pour des activités illégales, de copier ou diffuser son contenu sans autorisation et de tenter d’accéder à des zones restreintes.',
      'Les informations sur les itinéraires, les sentiers et la météo sont indicatives. Évaluez les risques avant de suivre un itinéraire proposé.',
      'L’application utilise des services tiers, comme Google Maps, Firebase et Stripe, soumis à leurs propres règles.',
      'Changements de ces conditions : quand le changement est important, nous prévenons dans l’application 15 jours à l’avance. Continuer à utiliser Use Guide après la date d’entrée en vigueur vaut acceptation de la nouvelle version.',
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
      'Billets offerts : vous pouvez envoyer des billets offerts par @ ou par lien personnel, un par personne et par événement. Le billet offert occupe une place dans la séance, n’a ni prix, ni frais, ni reversement, et ne peut être ni remboursé, ni transféré, ni vendu. Il est interdit d’offrir un billet à une personne qui a acheté, annulé ou été remboursée d’un billet du même événement.',
      'Promoteurs : l’accord avec chaque promoteur (commission, montant par billet ou forfait) est payé par vous, directement, après l’événement. Use Guide calcule et affiche les montants, mais n’effectue ni ne garantit ce paiement.',
      'Vente hors de la plateforme : il est interdit de vendre ou de faire payer hors d’Use Guide un billet, un billet offert, un lien d’invitation, une réservation ou un service proposé ici, ainsi que de demander à un client d’annuler son achat pour payer en dehors. Le non-respect de cette règle suspend les ventes du CNPJ et peut entraîner la fermeture du compte partenaire.',
      'Changements de ces conditions : quand le changement est important, nous prévenons dans l’application 15 jours à l’avance. Continuer à vendre après la date d’entrée en vigueur vaut acceptation de la nouvelle version ; l’acceptation peut aussi être enregistrée dans Gains › Comptes de versement.',
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
      'Si vous activez les notifications, nous conservons un identifiant de l’appareil pour les envoyer. Vous pouvez les désactiver à tout moment dans Paramètres › Notifications ou dans votre navigateur ; l’identifiant est supprimé lorsque vous vous déconnectez sur cet appareil ou supprimez votre compte.',
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
      'Lisez et acceptez les règles sur les commissions, versements, annulations, pénalités, billets offerts, promoteurs et ventes hors de la plateforme.',
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
