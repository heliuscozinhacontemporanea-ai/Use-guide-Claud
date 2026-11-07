# Etapa 6 — Funções e configurações fora das telas do painel (2026-11-07)

Levantamento depois das etapas 1 a 5 (D27). Para cada item: onde estava, como está hoje e a sugestão.
Nada aqui foi apagado; a decisão de cada linha é do responsável do produto.

## A. Existiam no painel antigo e hoje só o admin alcança

O gerenciador de ingressos antigo (`PartnerEventTicketingManager`) tinha seis abas. No painel novo o
Editar evento usa só a aba de lotes (`lotsOnly`); as outras cinco continuam só no painel do admin.

| # | Função | Hoje no painel do parceiro | Sugestão |
|---|---|---|---|
| A1 | Participantes com busca por nome ou pedido (aba Participantes) | Página do evento mostra os 100 pedidos mais recentes, sem busca (débito B38) | Resolver o B38: busca e paginação em Pedidos, na aba Vendas |
| A2 | Histórico de check-ins (quem entrou e quando) | Só o número "Entraram" na folha da sessão e na portaria | Linha "Entradas" na folha da sessão abrindo a lista, com horário |
| A3 | Lista de reembolsos do evento | A situação aparece dentro da folha de cada pedido | Filtro "Com reembolso" em Pedidos (junto do B38) |
| A4 | Resumo financeiro do evento: bruto, descontos, taxa da plataforma, taxa de pagamento | Vendido e Você recebe (líquido), sem a abertura das taxas | Folha "Como chegamos a esse valor" ao tocar em "Você recebe" |
| A5 | Aba Vendas (análise por lote e por dia) | Relatórios (p23) mostra por período e por item, não por lote | Linha "Por lote" na página do evento, ou aceitar Relatórios como substituto |

## B. Existem no servidor e nunca tiveram tela

| # | Função | Situação | Sugestão |
|---|---|---|---|
| B1 | Cupons de desconto do evento (`POST /api/ticketing/promo-codes`; o checkout aceita cupom) | O parceiro não tem onde criar nem ver cupons | Seção "Cupons" em Editar evento, perto de Ingressos e lotes |
| B2 | Lista de espera de sessão esgotada (`POST /api/ticketing/waitlist`) | Nem o comprador nem o parceiro têm tela | Decidir se entra (comprador: "Avise-me" no esgotado; parceiro: número na sessão) ou se sai do servidor |

## C. Combinados, ainda sem tela ou sem efeito

| # | Item | Situação |
|---|---|---|
| C1 | Equipe da portaria (outros aparelhos no modo portaria, p24) | Em aberto na D27 (a desenhar) |
| C2 | Falar com o comprador e contatos nos anúncios | Espera o B37 |
| C3 | Relatório e alerta de cortesias para o admin | Sugestões entregues; esperando sinais, limites e forma de alerta |
| C4 | "Iniciar serviço" (Agora) | Só tira o cartão do aparelho; não grava no servidor |
| C5 | Lista sem internet: estado "ainda não baixada" | O painel não sabe se a lista já foi baixada no aparelho |
| C6 | Endereço curto do link do divulgador (`/e/<nome>`) | O link usa a página do evento com `?d=` |
| C7 | Cartão "Convidados": quem já entrou no próximo evento | Mostra a contagem de cortesias, não as entradas |

## D. Código sem uso (candidatos a remoção, sem efeito para o usuário)

| Arquivo | Observação |
|---|---|
| `src/domain/partners/components/panel/PartnerTodayList.tsx` | Substituído pelos cartões do Início |
| `src/domain/partners/components/PartnerItemForms.tsx` | Formulário antigo, não importado |
| `src/domain/events/application/usecases/createPartnerEventListingUseCase.ts`, `updatePartnerEventListingUseCase.ts`, `deletePartnerEventListingUseCase.ts` | O painel usa outro caminho para criar, editar e excluir |
| `src/domain/events/application/usecases/archiveAdminEventListingUseCase.ts`, `cancelAdminEventListingUseCase.ts` | Sem tela que chame |
| `src/domain/reviews/application/usecases/getAllReviewsUseCase.ts`, `src/domain/search/application/usecases/filterItemsUseCase.ts`, `src/domain/guide/application/usecases/getGuideCatalogUseCase.ts` | Sem uso |

## E. Tour na primeira abertura (proposta)

Passos em sequência, com destaque no elemento e um balão curto (Próximo, Voltar, Pular):

1. **Atalhos do topo:** Início, Agenda, Catálogo, Ganhos e Mais.
2. **Nome do estabelecimento:** só com dois ou mais; "Toque para filtrar por estabelecimento".
3. **Resolva agora:** prazos que não podem esperar.
4. **Cartões do Início** e **Personalizar início**.
5. **Agora:** só quando houver serviço na hora; explica que os cartões aparecem e somem sozinhos.
6. **Catálogo:** criar e abrir estabelecimentos, eventos e passeios.
7. **Ganhos:** repasses, contas de recebimento e termos.

No último passo: "Concluir" e a caixa "Não mostrar novamente". Passo cujo elemento não está na tela é
pulado. "Ver o tour de novo" fica em Mais › Ajuda.
