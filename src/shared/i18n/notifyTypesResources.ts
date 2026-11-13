/** Textos de cada tipo de aviso (D25). Variantes `Generic` quando o nome não veio; plural pelo i18next. */
export type NotificationTypeTexts = Record<string, Record<string, string>>;

export const notifyTypesPtBR: NotificationTypeTexts = {
  terms_updated_partner: {
    title: 'Os termos do parceiro mudaram',
    body: 'As mudanças passam a valer 15 dias depois deste aviso. Toque para ler e aceitar a versão nova.',
  },
  terms_updated_buyer: {
    title: 'Os termos de uso mudaram',
    body: 'As mudanças passam a valer 15 dias depois deste aviso. Toque para ler.',
  },
  gate_staff_invited: {
    title: 'Convite para a portaria',
    body: '{{business}} convidou você para liberar as entradas de {{event}}.',
    bodyGeneric: 'Você recebeu um convite para a portaria de um evento.',
  },
  promoter_invited: {
    title: 'Convite para divulgar',
    body: '{{business}} quer que você divulgue {{event}}. Veja quanto você ganha.',
    bodyGeneric: 'Você recebeu um convite para divulgar um evento.',
  },
  promoter_accepted: {
    title: 'Divulgador aceitou',
    body: '{{username}} aceitou divulgar {{event}}.',
    bodyGeneric: 'Um divulgador aceitou o seu convite.',
  },
  promoter_declined: {
    title: 'Convite recusado',
    body: '{{username}} recusou divulgar {{event}}.',
    bodyGeneric: 'Um convite para divulgar foi recusado.',
  },
  courtesy_received: {
    title: 'Você ganhou um ingresso',
    body: '{{business}} convidou você para {{event}}. O ingresso está na sua carteira.',
    bodyGeneric: 'Uma cortesia está na sua carteira.',
  },
  courtesy_canceled: {
    title: 'Cortesia cancelada',
    body: 'A cortesia para {{event}} foi cancelada pelo organizador.',
    bodyGeneric: 'Uma cortesia sua foi cancelada pelo organizador.',
  },
  courtesy_link_accepted: {
    title: 'Convite aceito',
    body: '{{username}} recebeu a cortesia do seu link de convite.',
    bodyGeneric: 'A cortesia do seu link de convite foi recebida.',
  },
  ticket_received: {
    title: 'Você recebeu um ingresso',
    body: 'Um ingresso para {{event}} está na sua carteira.',
    bodyGeneric: 'Um ingresso novo está na sua carteira.',
  },
  ticket_returned: {
    title: 'Ingresso devolvido',
    body: 'O ingresso para {{event}} voltou para a sua carteira.',
    bodyGeneric: 'Um ingresso voltou para a sua carteira.',
  },
  ticket_link_accepted: {
    title: 'Ingresso entregue',
    body: '{{username}} recebeu o ingresso que você enviou.',
    bodyGeneric: 'O ingresso que você enviou foi recebido.',
  },
  ticket_qr_replaced: {
    title: 'QR Code trocado',
    body: 'O QR Code e o código anteriores não valem mais. Se não foi você, fale com a gente.',
  },
  event_canceled: {
    title: 'Evento cancelado',
    body: '{{event}} foi cancelado. Já pedimos o seu reembolso.',
    bodyGeneric: 'Um evento seu foi cancelado. Já pedimos o seu reembolso.',
  },
  event_postponed: {
    title: 'Evento com nova data',
    body: '{{event}} passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
    bodyGeneric:
      'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
  },
  booking_provider_arrived: {
    title: '{{business}} chegou',
    titleGeneric: 'Seu guia chegou',
    body: 'Estão esperando você no local combinado. Mostre o seu código.',
  },
  booking_no_show_marked: {
    title: 'Ausência registrada',
    body: '{{business}} registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
    bodyGeneric:
      'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
  },
  booking_absence_in_review: {
    title: 'Estamos analisando',
    body: '{{business}} diz que esteve no local. Respondemos em até 5 dias.',
    bodyGeneric: 'O prestador diz que esteve no local. Respondemos em até 5 dias.',
  },
  booking_absence_refunded_buyer: {
    title: 'Reembolso a caminho',
    body: 'Você recebe de volta o valor pago, com a taxa de serviço.',
  },
  booking_confirmation_asked: {
    title: 'Deu tudo certo?',
    body: 'Conte pra gente em Compras se o serviço aconteceu, em até 72 horas.',
  },
  sale_ticket: {
    title: 'Nova venda',
    body_one: '{{count}} ingresso vendido.',
    body_other: '{{count}} ingressos vendidos.',
  },
  sale_booking: {
    title: 'Nova reserva',
    body_one: '{{offer}} para {{count}} pessoa.',
    body_other: '{{offer}} para {{count}} pessoas.',
  },
  sale_claim_opened: {
    title: 'Cliente abriu uma reclamação',
    body: 'O valor desta venda fica guardado até a decisão, em até 5 dias.',
  },
  booking_absence_reported: {
    title: 'Cliente diz que você não foi',
    body: 'Responda em até 2 horas nas reservas do painel. Sem resposta, o cliente é reembolsado e vale a multa de 20%.',
  },
  booking_absence_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'Não houve resposta no prazo. O cliente foi reembolsado e vale a multa de 20%.',
  },
  booking_confirmation_denied: {
    title: 'Cliente abriu uma reclamação',
    body: 'O cliente disse que o serviço não aconteceu. O valor fica guardado até a decisão, em até 5 dias.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente disse que o serviço não aconteceu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente não respondeu em 72 horas.',
  },
  review_received: {
    title: 'Nova avaliação',
    body_one: '{{user}} deu {{count}} estrela para {{item}}.',
    body_other: '{{user}} deu {{count}} estrelas para {{item}}.',
  },
  review_updated: {
    title: 'Avaliação atualizada',
    body_one: '{{user}} mudou a nota de {{item}} para {{count}} estrela.',
    body_other: '{{user}} mudou a nota de {{item}} para {{count}} estrelas.',
  },
  plan_expiring: {
    title: 'Seu plano está acabando',
    body_one: 'O plano de {{listing}} termina em {{count}} dia. Renove para manter o selo.',
    body_other: 'O plano de {{listing}} termina em {{count}} dias. Renove para manter o selo.',
  },
  plan_renewal_failed: {
    title: 'Não conseguimos renovar seu plano',
    body: 'O cartão não passou. Atualize a forma de pagamento para manter o selo.',
  },
  sale_daily_digest: {
    title: 'Suas vendas de hoje',
    body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
    body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
  },
  purchase_ticket_paid: {
    title: 'Compra confirmada',
    body_one: 'Seu ingresso para {{event}} já está em Ingressos.',
    body_other: 'Seus {{count}} ingressos para {{event}} já estão em Ingressos.',
  },
  purchase_booking_paid: {
    title: 'Reserva confirmada',
    body: '{{offer}}, {{date}}. O seu código aparece no dia.',
  },
  purchase_expired: {
    title: 'Compra não concluída',
    body: 'O pagamento de {{offer}} não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
    bodyGeneric: 'O pagamento não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
  },
  ticket_reminder_day: {
    title: 'Seu evento é amanhã',
    body: '{{event}}, {{date}}. O código do ingresso aparece a partir da meia-noite.',
  },
  ticket_reminder_soon: {
    title: 'Começa daqui a pouco',
    body: '{{event}} começa em menos de 2 horas. Seu ingresso está em Ingressos.',
  },
  booking_reminder_day: {
    title: 'Sua reserva é amanhã',
    body: '{{offer}}, {{date}}. O seu código aparece a partir da meia-noite.',
  },
  booking_reminder_soon: {
    title: 'Falta pouco',
    body: '{{offer}} começa em menos de 2 horas. Seu código está em Reservas.',
  },
  review_request: {
    title: 'Como foi?',
    body: 'Conte como foi {{offer}}. Sua avaliação ajuda outros viajantes.',
    bodyGeneric: 'Conte como foi. Sua avaliação ajuda outros viajantes.',
  },
  review_reply_received: {
    title: 'Responderam sua avaliação',
    body: '{{business}} respondeu o que você escreveu.',
    bodyGeneric: 'O estabelecimento respondeu o que você escreveu.',
  },
  review_report_decided: {
    title: 'Analisamos sua denúncia',
    body: 'Obrigado por avisar. A análise foi concluída.',
  },
  account_username_changed: {
    title: 'Seu @ mudou',
    body: 'Agora você é {{username}}. Se não foi você, fale com a gente.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};
