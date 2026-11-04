# Proposta — Painel do parceiro, lista de convidados e divulgadores (2026-11-03)

Status: **em aberto** (decisões de 2026-11-04 na seção 6; aguarda aprovação dos desenhos e das seções 7 a 9).
Desenhos: `docs/arquitetura/propostas/painel-parceiro/` (p01 a p35, índice na seção 11; verde da D26).

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

## 3. Painel do parceiro (p01, p02)

Barra inferior com cinco abas, como o app do anfitrião do Airbnb:

1. **Início** — "Resolva agora" (prazos: ausência em 2 h, reclamação, força maior, verificação, plano), **Hoje** (horários de reserva e sessões do dia, com atalho para a portaria) e dois números: vendas de hoje e próximo repasse.
2. **Agenda** — calendário com horários de reserva e sessões de evento; remarcar, cancelar e portaria saem daqui.
3. **Anúncios** — estabelecimentos, eventos, passeios, aluguéis e translados (editor atual).
4. **Ganhos** — Recebimentos, extrato, dívidas e relatórios/métricas.
5. **Mais** — perfil do produtor, documentos e verificação, planos e selo, contas de recebimento, notificações e ajuda.

Cada evento abre uma página própria com abas **Vendas · Convidados · Divulgadores**.

## 4. Lista de convidados (p13, p14, p15)

- O parceiro busca o **@** da pessoa, escolhe quantos ingressos e envia. O ingresso de cortesia cai direto na carteira, com aviso no sininho e push ("Você ganhou um ingresso").
- **Ocupa lugar** na capacidade da sessão; preço e taxa zero; sem repasse nem taxa da plataforma.
- **Limite de cortesias por evento**, definido pelo parceiro no cadastro do evento (sugestão: até 10% da capacidade, ajustável pelo admin).
- Cortesia é **nominal e não pode ser transferida nem vendida** (evita revenda). O parceiro pode cancelar até a pessoa entrar.
- Na portaria aparece "Convidado" junto do nome.
- Quem ainda não tem conta: link de convite (como o link de transferência), válido por **7 dias** e uso único.
- Depois: importar lista por planilha (Shotgun aceita CSV).

## 5. Divulgadores (p16, p17, p26, p27)

- O parceiro adiciona pelo **@**; a pessoa recebe um convite e **aceita** (vê quanto ganha e os termos). Sem aceite, nada de link.
- Cada divulgador ganha **um link por evento** (`useguide.com.br/e/<evento>?d=<código>`). A venda é atribuída ao último link usado, guardado por 7 dias no aparelho.
- **Quanto ganha**, por divulgador:
  - **Comissão**: % sobre o preço do ingresso (sem a taxa de serviço);
  - **Valor por ingresso**: R$ fixo por ingresso vendido pelo link.
- Conta só venda que **aconteceu e não foi reembolsada**, depois do fim do evento + 48 h (a mesma janela do repasse, D14).
- O divulgador não ganha comprando pelo próprio link.
- O parceiro vê vendas, valor e quanto deve a cada divulgador; o divulgador vê, em **Menu › Divulgação**, os eventos, o link para compartilhar, as vendas e quanto tem a receber.

## 6. Respostas do responsável do produto (2026-11-04) e o que mudou

1. **Painel:** sem barra inferior. Atalhos em **quadrados levemente arredondados com ícone e nome dentro**, logo abaixo da saudação (referência: a linha de atalhos do app Telefone do iPhone): Agenda, Anúncios, Ganhos e Mais. A tela Início continua com "Resolva agora", "Hoje" e os números (p01, p02).
2. **Divulgador:** opção **A** — o parceiro paga direto; o Use Guide calcula e mostra.
3. **Cortesias:** **sem limite por evento**, **uma por pessoa**. Proteções contra usar a cortesia para tirar a venda da plataforma (seção 7).
4. **Cortesia intransferível:** sim.
5. **Quem não tem conta:** ver seção 8 (recomendação: link pessoal de convite).
6. **Divulgador aceita o convite:** sim.
7. **Cachê fixo pelo evento:** entra como terceira opção (p17).
8. **Oferta aberta:** não agora; talvez no futuro.

### 6.1. Início com cartões personalizáveis (pedido de 2026-11-04; p01 a p04)

- **Cinco atalhos no topo**, em quadrados levemente arredondados com ícone e nome: Início (marcado), Agenda, Anúncios, Ganhos e Mais.
- **"Resolva agora" fixo no topo**, fora da personalização (prazos não podem sumir).
- Abaixo, **cartões em grade de duas colunas**, pequenos (meia largura) ou grandes (largura inteira). Tocar num cartão abre a aba certa (Hoje → Agenda, Vendas e repasse → Ganhos, evento → página do evento, Avaliações → avaliações).
- **"Personalizar início"** abre o modo de edição: arrastar para mudar a ordem, "−" para tirar e "Adicionar cartão" para escolher numa galeria com descrição e tamanho; "Concluir" salva.
- **Cartões disponíveis:** Hoje, Vendas de hoje, Próximo repasse, Próximo evento (vendidos, convidados, divulgadores), Avaliações, Reservas da semana, Convidados, Divulgadores, Plano e selo, Ocupação da semana e Vendas do mês. Os seis primeiros vêm por padrão.
- A escolha fica salva na conta (vale em qualquer aparelho). Cartão sem dado (ex.: parceiro sem evento) não aparece na galeria.
- Referências: Stripe (adicionar e tirar widgets do início), Cloudscape/AWS (painel configurável: reordenar, adicionar, tirar e tamanho), widgets do iPhone (modo de edição com "−", galeria e tamanhos), Nubank ("Organizar atalhos"), apps com cartões de início que se arrastam e se escondem.

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

## 9. O que fica na edição do evento e o que sai (p10, p18)

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

1. Painel: cinco atalhos no topo, Início com cartões personalizáveis e página do evento separada da edição.
2. Convidados: cortesia por @ e por link pessoal, uma por pessoa, proteções da seção 7, aviso e portaria.
3. Divulgadores: convite e aceite, link e atribuição, três formas de ganho, relatórios dos dois lados.
4. Termos do parceiro: cláusula de venda por fora (nova versão).

## 11. Índice dos desenhos (revisão de conteúdo, 2026-11-04)

Atalhos do topo: Início, Agenda, Anúncios, Ganhos e Mais. "Precisa de você" passou a se chamar "Resolva agora" (aprovado em 2026-11-04, D27).

| Nº | Aba | Tela ou folha | Função |
|---|---|---|---|
| p01 | Início | Início (escuro) | "Resolva agora" fixo + cartões que levam à aba de cada assunto |
| p02 | Início | Início (claro) | o mesmo, no tema claro |
| p03 | Início | Personalizar início | arrastar, tirar e adicionar cartões |
| p04 | Início | Folha Adicionar cartão | galeria de cartões disponíveis |
| p05 | Agenda | Agenda | semana e lista do dia (horários de reserva e sessões de evento) |
| p06 | Agenda | Folha do horário de reserva | participantes, quem chegou, confirmar chegada com código, mudar ou cancelar horário |
| p07 | Agenda | Folha da sessão de evento | vendidos, convidados, entradas, abrir portaria, adiar ou cancelar |
| p08 | Agenda | Folha Cancelar a sessão? | reembolso, multa de 20% e pedido de análise de força maior |
| p09 | Anúncios | Anúncios | Lugares, Eventos e Passeios, com status |
| p10 | Anúncios | Página do evento | resumo e entradas para vendas, convidados, divulgadores e edição |
| p11 | Anúncios | Evento · Vendas | vendido, a receber, sessões e pedidos |
| p12 | Anúncios | Folha do pedido | detalhe do pedido e situação do reembolso |
| p13 | Anúncios | Evento · Convidados | lista de cortesias por sessão |
| p14 | Anúncios | Folha Convidar | convite pelo @ ou por link pessoal; "O ingresso vai direto para a carteira da pessoa convidada, sem custos." |
| p15 | Anúncios | Folha Link de convite criado | link de uso único, enviar pelo WhatsApp |
| p16 | Anúncios | Evento · Divulgadores | divulgadores, vendas por link e valor devido |
| p17 | Anúncios | Folha Adicionar divulgador | comissão, valor por ingresso ou cachê fixo |
| p18 | Anúncios | Editar evento | só o que é cadastro: dados, sessões, ingressos, política |
| p19 | Anúncios | Página do estabelecimento | status, plano, números, ofertas e avaliações |
| p20 | Ganhos | Ganhos | a receber, recebido, Repasses, Extrato e Dívidas |
| p21 | Ganhos | Folha do repasse | vendido, taxa, valor líquido e serviços incluídos |
| p22 | Ganhos | Contas de recebimento | uma conta por CNPJ e sua situação |
| p23 | Ganhos | Relatórios | vendas por período e por anúncio |
| p24 | Mais | Mais | perfil, estabelecimentos, planos, contas, equipe, notificações, termos, ajuda |
| p25 | Mais | Planos e selo | plano e selo por estabelecimento |
| p26 | Conta do usuário | Divulgação | eventos que a pessoa divulga, link e resultado |
| p27 | Conta do usuário | Folha Convite para divulgar | aceitar ou recusar, com as regras do ganho |
| p28 | Fora do app | Página do link de cortesia | entrar ou criar conta para receber a cortesia |
| p29 | Início | Início no dia de portaria | cartão "Portaria" no topo, de 2 h antes do início até o fim da sessão, com "Abrir portaria" |
| p30 | Agenda | Folha Portaria | números da sessão, lista para usar sem internet e "Abrir modo portaria" |
| p31 | Portaria | Modo portaria lendo | tela que já existe (D21): câmera aberta, moldura, "Inserir código" |
| p32 | Portaria | Folha Código Token | código de 8 caracteres abaixo do QR, quando a câmera não lê |
| p33 | Portaria | Entrada liberada | verde até tocar em "Próximo" |
| p34 | Portaria | Entrada recusada | vermelho, com o motivo (ex.: já entrou) |
| p35 | Portaria | Atenção | amarelo, ex.: ingresso de outra sessão |

### 11.1. Modo portaria no painel

A portaria (D21, já implementada) entra por três caminhos: o cartão "Portaria" no topo do Início no dia (p29), a sessão na Agenda (p07 → p30) e a página do evento ou da atração. Vale para eventos e para entradas de atrações privadas; reservas de passeio, aluguel e translado usam a confirmação de chegada do horário (p06).

**Pendência (a desenhar):** o parceiro escolher outros aparelhos (equipe) para usar o modo portaria durante o evento ou a atração. Modelo e proposta ainda serão feitos; até lá, o item "Equipe da portaria" em Mais (p24) não entra na implementação.

