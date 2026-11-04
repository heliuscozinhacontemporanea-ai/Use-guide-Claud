# Proposta — Painel do parceiro, lista de convidados e divulgadores (2026-11-03)

Status: **em aberto** (decisões de 2026-11-04 na seção 6; aguarda aprovação dos desenhos e das seções 7 a 9).
Desenhos: `docs/arquitetura/propostas/painel-parceiro/` (p1 a p9, dois temas, verde da D26).

## 1. Referências

| Plataforma | O que aproveitar |
|---|---|
| Airbnb (anfitrião) | Aba **Hoje** como tela inicial: o que precisa de ação primeiro, depois as reservas do dia; abas Agenda, Anúncios, Mensagens e Menu; ganhos num painel próprio |
| GetYourGuide (fornecedor) | Painel com receita, reservas e notas num lugar só; disponibilidade e chegadas do dia; portal pensado para celular |
| Shotgun | **Convites**: ingresso de graça por pessoa, até 500 por evento, sem passar pelo caixa; separa "convite" (ingresso de verdade) de "lista na porta" (só nome). **Promoters**: um link por evento e promoter, vendas em tempo real; o dinheiro fica com o organizador e a comissão é acertada fora |
| Posh (Kickback) | Comissão automática por **porcentagem ou valor fixo** por ingresso ou pedido; convite para promoters escolhidos ou oferta aberta; faixas comuns de 5–10% (aberta) e 10–25% (escolhidos) |
| Eventbrite | Links de acompanhamento por divulgador com vendas e visitas; relatório de compradores por link |
| Ticket Fairy | Comissão em %, valor por ingresso ou por pedido; equipe de vendas |

Fontes: Airbnb ("Introducing the Today tab", central de recursos), GetYourGuide Supply "Unlocked", Shotgun Pro (Send invitations, Promoters management), Posh (A Guide to Kickback), Eventbrite (Tracking links), Ticket Fairy (Promoters and sales teams).

## 2. O que existe hoje

- Painel com três abas no topo: Estabelecimentos, Eventos e Relatórios; Recebimentos, reservas e plano espalhados dentro delas.
- Ingresso do tipo **cortesia** (preço zero) já existe, mas só é vendido como os outros.
- O pedido guarda um `promoterCode` livre, sem regra nem relatório.

## 3. Painel do parceiro (p1, p2)

Barra inferior com cinco abas, como o app do anfitrião do Airbnb:

1. **Início** — "Precisa de você" (prazos: ausência em 2 h, reclamação, força maior, verificação, plano), **Hoje** (horários de reserva e sessões do dia, com atalho para a portaria) e dois números: vendas de hoje e próximo repasse.
2. **Agenda** — calendário com horários de reserva e sessões de evento; remarcar, cancelar e portaria saem daqui.
3. **Anúncios** — estabelecimentos, eventos, passeios, aluguéis e translados (editor atual).
4. **Ganhos** — Recebimentos, extrato, dívidas e relatórios/métricas.
5. **Mais** — perfil do produtor, documentos e verificação, planos e selo, contas de recebimento, notificações e ajuda.

Cada evento abre uma página própria com abas **Vendas · Convidados · Divulgadores**.

## 4. Lista de convidados (p3, p4)

- O parceiro busca o **@** da pessoa, escolhe quantos ingressos e envia. O ingresso de cortesia cai direto na carteira, com aviso no sininho e push ("Você ganhou um ingresso").
- **Ocupa lugar** na capacidade da sessão; preço e taxa zero; sem repasse nem taxa da plataforma.
- **Limite de cortesias por evento**, definido pelo parceiro no cadastro do evento (sugestão: até 10% da capacidade, ajustável pelo admin).
- Cortesia é **nominal e não pode ser transferida nem vendida** (evita revenda). O parceiro pode cancelar até a pessoa entrar.
- Na portaria aparece "Convidado" junto do nome.
- Quem ainda não tem conta: link de convite (como o link de transferência), válido por **7 dias** e uso único.
- Depois: importar lista por planilha (Shotgun aceita CSV).

## 5. Divulgadores (p5, p6, p7)

- O parceiro adiciona pelo **@**; a pessoa recebe um convite e **aceita** (vê quanto ganha e os termos). Sem aceite, nada de link.
- Cada divulgador ganha **um link por evento** (`useguide.com.br/e/<evento>?d=<código>`). A venda é atribuída ao último link usado, guardado por 7 dias no aparelho.
- **Quanto ganha**, por divulgador:
  - **Comissão**: % sobre o preço do ingresso (sem a taxa de serviço);
  - **Valor por ingresso**: R$ fixo por ingresso vendido pelo link.
- Conta só venda que **aconteceu e não foi reembolsada**, depois do fim do evento + 48 h (a mesma janela do repasse, D14).
- O divulgador não ganha comprando pelo próprio link.
- O parceiro vê vendas, valor e quanto deve a cada divulgador; o divulgador vê, em **Menu › Divulgação**, os eventos, o link para compartilhar, as vendas e quanto tem a receber.

## 6. Respostas do responsável do produto (2026-11-04) e o que mudou

1. **Painel:** sem barra inferior. Atalhos em **quadrados levemente arredondados com ícone e nome dentro**, logo abaixo da saudação (referência: a linha de atalhos do app Telefone do iPhone): Agenda, Anúncios, Ganhos e Mais. A tela Início continua com "Precisa de você", "Hoje" e os números (p1, p2).
2. **Divulgador:** opção **A** — o parceiro paga direto; o Use Guide calcula e mostra.
3. **Cortesias:** **sem limite por evento**, **uma por pessoa**. Proteções contra usar a cortesia para tirar a venda da plataforma (seção 7).
4. **Cortesia intransferível:** sim.
5. **Quem não tem conta:** ver seção 8 (recomendação: link pessoal de convite).
6. **Divulgador aceita o convite:** sim.
7. **Cachê fixo pelo evento:** entra como terceira opção (p6).
8. **Oferta aberta:** não agora; talvez no futuro.

## 7. Proteções da cortesia (proposta)

A pesquisa não achou regra publicada pelas grandes plataformas sobre "cancelar a compra e dar cortesia"; elas tratam o assunto com controle de cortesias por pessoa, cortesia sem reembolso nem troca e termos que proíbem vender por fora. Proposta para o Use Guide:

1. **Uma cortesia por pessoa por evento** (a regra que você pediu).
2. **Sem cortesia para quem comprou este evento:** quem tem ingresso pago, ou teve compra deste evento cancelada ou reembolsada, não pode receber cortesia dele. Fecha o caminho "cancela aqui, paga por fora, ganha cortesia".
3. **Cortesia não tem reembolso, troca nem transferência**, e não gera repasse nem taxa.
4. **Termos do parceiro:** vender ou cobrar por fora um ingresso do Use Guide, ou pedir ao cliente que cancele para pagar por fora, é proibido; quebra leva a suspensão das vendas (texto novo, entra na próxima versão dos termos do parceiro).
5. **Acompanhamento do admin:** relatório de cortesias por evento e alerta quando um evento tem muitas cortesias para pessoas que pediram reembolso.

## 8. Convite para quem não tem conta (pesquisa)

- Tito: convite com **link pessoal**, ou lote de links de uso único; quem abre "trava" o ingresso para si.
- Ticketstripe, Posh, Quicket e outras: cortesia enviada **por e-mail ou telefone** com link para resgatar.
- Shotgun: convite exige e-mail; com conta, o convite aparece também no app.

Recomendação: **link pessoal de convite**, de uso único, válido até o início do evento. O parceiro manda pelo WhatsApp dele; quem abre cria a conta e o ingresso fica preso a ela (vale a regra de uma por pessoa no resgate). Não enviamos e-mail nem SMS (pediria fornecedor novo, §15).

## 9. O que fica na edição do evento e o que sai (p8, p9)

Hoje a edição junta conteúdo e operação (lotes, vendas, participantes, check-in, reembolsos, configurações, financeiro). Proposta:

| Fica em **Editar evento** (o que o evento é) | Vai para a **página do evento** (operação) | Vai para outro lugar |
|---|---|---|
| Informações (nome, descrição, categoria, estabelecimento) | **Vendas:** números, pedidos e reembolsos (cada pedido abre uma folha com reembolso) | **Portaria:** pela sessão do dia na Agenda e no Início, e pela lista de sessões da página do evento |
| Datas e sessões (criar e editar antes de vender) | **Convidados** | **Cancelar ou adiar sessão:** Agenda (é operação, com multa e reembolso) |
| Local | **Divulgadores** | **Financeiro do evento:** resumo em Vendas; extrato completo em Ganhos, com filtro por evento |
| Ingressos e lotes (preço, quantidade, meia) | Participantes: dentro de Vendas (busca por nome ou pedido) | **Conta de recebimento:** em Ganhos › Contas; a edição só mostra em qual CNPJ o evento recebe |
| Regras de venda (cancelamento, taxa de serviço, transferência) | | |
| Fotos e contato | | |

## 10. Etapas (depois da aprovação dos desenhos)

1. Painel: atalhos no topo e tela Início; página do evento separada da edição.
2. Convidados: cortesia por @ e por link pessoal, uma por pessoa, proteções da seção 7, aviso e portaria.
3. Divulgadores: convite e aceite, link e atribuição, três formas de ganho, relatórios dos dois lados.
4. Termos do parceiro: cláusula de venda por fora (nova versão).
