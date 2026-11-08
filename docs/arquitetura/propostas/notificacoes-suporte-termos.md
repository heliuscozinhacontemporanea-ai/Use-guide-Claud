# Proposta — Notificações para todos, Suporte e texto novo dos termos (2026-11-03)

Status: **em aberto** (aguarda aprovação do responsável do produto; não implementar antes).

## 1. Notificações push no navegador

| Navegador | Push | Observação |
|---|---|---|
| Chrome, Edge, Opera (computador e Android) | Sim | via Firebase Cloud Messaging (FCM) |
| Samsung Internet (Android) | Sim | |
| Firefox (computador e Android) | Sim | |
| Safari no Mac (macOS 13 Ventura ou mais novo) | Sim | |
| iPhone e iPad (iOS/iPadOS 16.4 ou mais novo) | Só com o app instalado na Tela de Início (PWA) | vale para Safari, Chrome e Edge no iPhone; o pedido de permissão precisa de um toque da pessoa |
| Navegador padrão antigo do Android | Não | |

Requisitos: HTTPS (já temos), service worker (já temos pelo PWA), chave VAPID do Firebase, permissão pedida só depois de um toque (nunca ao abrir o app).

## 2. O que existe hoje

- Avisos gravados no Firestore (`notifications`) por 13 pontos do backend: venda de ingresso, nova reserva, evento cancelado/adiado, ingresso recebido/devolvido/entregue por link, QR trocado, prestador chegou, ausência, reembolso, relato em análise, reclamação, avaliação recebida, plano vencendo, falha na renovação.
- **Só o parceiro vê:** o sininho existe apenas no painel do parceiro. Os avisos gravados para compradores (ingresso recebido, QR trocado, evento adiado/cancelado, prestador chegou, reembolso) nunca aparecem.
- Textos fixos em português no servidor (o AGENTS.md §12.5 pede no idioma de quem recebe); quase todos com o tipo genérico `admin_message`; o domínio `notifications` importa `partners` (deveria ser folha, §5.4).
- Sem push e sem e-mail.

## 3. Catálogo proposto (todas as contas)

Legenda: **H** já gravado hoje · **N** novo · **Obrig.** aparece sempre na central (push pode ser desligado).

**Para quem compra (todas as contas)**
| Categoria | Aviso | |
|---|---|---|
| Compras e pagamentos (Obrig.) | Pagamento confirmado (ingresso ou reserva) | N |
| | Pix aguardando pagamento / reserva expirou sem pagamento | N |
| | Reembolso feito / reembolso parcial | H (parcial) |
| Ingressos | Você recebeu um ingresso (por @ ou link) | H |
| | Ingresso devolvido / link aceito | H |
| | QR trocado pelo titular | H |
| | Evento adiado ou cancelado (com reembolso) | H |
| | Lembrete: amanhã e 2 h antes, com endereço e código INGR liberado | N |
| | Vaga na lista de espera | N |
| Reservas | Reserva confirmada | N |
| | Lembrete na véspera e 2 h antes, com ponto de encontro e código | N |
| | O prestador chegou ("Cheguei") | H |
| | Horário remarcado ou cancelado pelo prestador | H (parcial) |
| | "O serviço aconteceu?" (resposta em 72 h) | N |
| | Andamento da reclamação | H |
| Avaliações | O estabelecimento respondeu sua avaliação | N |
| | Convite para avaliar depois do serviço | N |
| | Resultado da sua denúncia | N |
| Conta e segurança (Obrig.) | E-mail confirmado; @ alterado; senha alterada | N |
| Novidades (opcional, desligado por padrão — LGPD) | Evento novo num lugar favorito; dicas da temporada | N |

**Para parceiros (além do acima)**
| Categoria | Aviso | |
|---|---|---|
| Vendas | Nova venda de ingresso; nova reserva; cancelamento pelo cliente | H (parcial) |
| Operação (Obrig.) | Cliente diz que você não compareceu (prazo de 2 h); reclamação aberta; contestação no cartão | H (parcial) |
| Financeiro | Repasse liberado; multa ou dívida; conta Stripe com pendência; falha na renovação; plano vencendo | H (parcial) |
| Avaliações | Nova avaliação; resultado de denúncia de resposta | H (parcial) |
| Cadastro | Estabelecimento verificado ou recusado; força maior aceita ou recusada | N |
| Mensagens do Use Guide | Mensagens do admin | H |

## 4. Configurações › Notificações (para todos)

1. **Neste aparelho:** estado (ativadas, bloqueadas no navegador, não suportado, ou "instale na Tela de Início" no iPhone) e botão "Ativar notificações".
2. **Por categoria:** um interruptor de push por categoria; as obrigatórias mostram "sempre na central".
3. **Seção Parceiro** (só parceiros): Vendas, Operação, Financeiro, Avaliações, Cadastro.
4. **Silêncio noturno** (sugestão): das 22h às 8h (horário de Fortaleza), sem push; tudo fica na central. Avisos com prazo (ausência do prestador) furam o silêncio.
5. **Resumo diário para parceiros** (sugestão): uma notificação por dia com vendas e reservas, em vez de uma por venda.

## 5. Central de notificações (para todos)

Sininho no topo do app com contador; lista "Hoje / Antes"; tocar abre o ingresso, a reserva, a avaliação ou o painel certo; "marcar todas como lidas"; avisos apagados depois de 90 dias.

## 6. Arquitetura

- Aviso gravado como **tipo + parâmetros** (sem texto pronto); o app traduz no idioma ativo e o push sai no idioma salvo da pessoa (§12.5).
- **Outbox** (§5.6): o aviso nasce na mesma transação do evento; um job envia o push com idempotência e respeita categoria e silêncio.
- Tokens de push por aparelho em coleção só do backend; apagados na exclusão de conta e quando o FCM recusa.
- `notifications` vira domínio folha (para de importar `partners`).
- E-mail: fora desta fase (pediria fornecedor novo, §15).

## 7. Suporte (reformulação)

Hoje: textos fixos em português, cores fixas do tema escuro, 6 perguntas (nenhuma sobre compra, ingresso ou reembolso), categoria "kitesurf", e-mail `atendimento@` diferente do `ajuda@` dos termos.

Proposta (referência: centrais de ajuda de Airbnb, Tripadvisor e GetYourGuide):
1. Busca "Como podemos ajudar?".
2. Atalhos: "Problema com uma compra" (abre Compras, onde já existe Relatar problema), "Meus ingressos", "Minhas reservas", "Conta e acesso".
3. Temas: Compras e pagamentos · Ingressos e QR Code · Reservas e passeios · Cancelamento e reembolso · Conta e segurança · Para parceiros · App e notificações.
4. Perguntas novas, traduzidas (pt-BR, en, fr), tiradas das regras reais (D14–D22).
5. Contato: WhatsApp e e-mail únicos, com prazo de resposta; "Informar problema no app" já com a versão do app.

## 8. Texto novo dos termos (D15)

Termos de uso, 2º parágrafo:
- **Atual:** "O Use Guide reúne informações, mapas e recomendações sobre Jericoacoara, Preá e Barrinha de Baixo, e vende ingressos, passeios e entradas de organizadores e estabelecimentos cadastrados."
- **Proposto:** "O Use Guide reúne informações, mapas e recomendações de destinos turísticos no Brasil e vende ingressos, passeios, aluguéis, traslados e entradas de organizadores e estabelecimentos cadastrados."

Privacidade, parágrafo novo (por causa do push):
- **Proposto:** "Se você ativar as notificações, guardamos um identificador do aparelho para enviá-las. Você pode desativar a qualquer momento em Configurações › Notificações ou no navegador; o identificador é apagado quando você sair da conta neste aparelho ou excluir a conta."

Efeito: nova versão dos termos de compra (`BUYER_TERMS_VERSION`); compras novas pedem o aceite da versão nova; pedidos antigos seguem a versão aceita.
