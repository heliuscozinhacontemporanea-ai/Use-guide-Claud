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
