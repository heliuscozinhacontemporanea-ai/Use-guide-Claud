# Proposta — Painel do parceiro, lista de convidados e divulgadores (2026-11-03)

Status: **em aberto** (aguarda as decisões da seção 6; não implementar antes).
Desenhos: `docs/arquitetura/propostas/painel-parceiro/` (p1 a p7, dois temas, verde da D26).

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

## 6. Decisões (preciso da sua escolha)

1. **Painel:** barra inferior com Início, Agenda, Anúncios, Ganhos e Mais (proposta) ou manter abas no topo com uma tela Início?
2. **Quem paga o divulgador:**
   - **A (recomendado agora):** o parceiro paga direto ao divulgador (Pix); o Use Guide calcula e mostra o valor, como o Shotgun. Sem dinheiro novo passando pela plataforma, sem cadastro fiscal do divulgador.
   - **B:** o Use Guide desconta a comissão do repasse do parceiro e paga o divulgador pelo Stripe (exige conta Stripe do divulgador com CPF, verificação e trato fiscal; mexe na D12 "CPF não vende" e no §15). Pode vir numa fase 2.
3. **Limite de cortesias:** sugestão de até 10% da capacidade (o parceiro escolhe dentro do limite) ou livre?
4. **Cortesia intransferível:** sim (proposta) ou pode transferir como ingresso pago?
5. **Convite para quem não tem conta:** link de 7 dias (proposta) ou só por @?
6. **Divulgador precisa aceitar** o convite (proposta) ou o link já sai ativo?
7. **"Cachê fixo pelo evento"** (valor combinado, independe de vendas) entra também ou só comissão e valor por ingresso?
8. **Oferta aberta** (qualquer comprador vira divulgador com uma comissão menor, como o Kickback público): agora, depois ou nunca?

## 7. Etapas (depois das decisões)

1. Painel: navegação nova e tela Início (sem regra de negócio nova).
2. Convidados: cortesia por @, limite, cancelamento, aviso e portaria.
3. Divulgadores: convite e aceite, link e atribuição, cálculo e relatórios dos dois lados.
4. (Se a decisão 2 for B) pagamento automático aos divulgadores.
