# Fila de trabalho

Tudo o que está aprovado ou pedido pelo responsável do produto e ainda não foi feito, num lugar só. Atualizar a cada entrega: o que for publicado sai da fila (o histórico fica no `decisoes.md` e no `PROCESSO.md`).

## 1 · Trabalho aprovado, na ordem

A ordem abaixo foi proposta em 2026-11-15 e pode ser mudada pelo responsável.

| # | Item | Situação | Decisão |
|---|---|---|---|
| 5b | **Tradução automática** do conteúdo cadastrado (D5): domínio `translation` com Google Cloud Translation, só no backend, `LocalizedText` com `source` e traduções, aviso "Traduzido automaticamente pelo Google · Ver original" | Pendente (responsável, 2026-11-17); serviço pago: proposta antes do código (AGENTS.md §15) | D5, AGENTS.md §12.6 |
| 7 | **D34 · F5**: evento herda contato e local do estabelecimento (D5) | | D34 |
| 8 | **D34 · F6**: o tour sai e entram as dicas de primeira visita (Agenda e Ganhos) | | D34 |
| 8b | **Item 3 da D33**: busca (SearchOverlay) como folha em altura cheia, com os tokens (resolve o B60) | Adiado pelo responsável em 2026-11-16 (pular e começar a F2) | D33 |
| 9 | Resto do **item 5 da D33**: link de cortesia e durações e curvas soltas nos componentes menores (DESIGN.md P10) | | D33 |
| 10 | **Acerto com o divulgador**, fase 1 e fase 2 | Aprovado em 2026-11-12; prints antes do código | `decisoes.md` (Acerto com o divulgador) |

Publicados em 2026-11-24 (PR #32): a **D35** inteira (Termos no cadastro, conta antes do parceiro, nomes reservados no @ e "Sou o dono"), com a limpeza do B76.

Publicados em 2026-11-24 (PRs #30 e #31): a **D34 · F4** (admin no mesmo editor do parceiro, dono Use Guide, registro de auditoria), que cobre o "editor do admin" do item 5 da D33, e a correção do B76 (sitemap com todos os anúncios).

Publicados em 2026-11-22 (PR #29): a **D34 · F3** inteira (F3a, F3b com aluguel e translado à venda e horário personalizado, e os ajustes da comparação com os protótipos).

Publicados em 2026-11-16 (PRs #25 a #27): o cartão sai de cena inteiro e a **D34 · F1** (com o item 2 da D33, o B16 do parceiro e o B66).

Itens 1 a 5 da D33, para referência: 1 anúncio (foto sai do cartão e volta) · 2 "Seja parceiro" em páginas empilhadas · 3 busca em folha de altura cheia · 4 editores de anúncio e evento como páginas empilhadas com "Salvar" na barra · 5 link de cortesia, editor do admin e durações soltas. O item 1 foi publicado em 2026-11-15 (PRs #23 e #24).

## 2 · Propostas

Cada proposta é apresentada antes de qualquer código; a implementação só começa com a aprovação.

| Ordem | Proposta | Situação |
|---|---|---|
| 1 | Conta do parceiro em uma tela e guia de passos no painel (levantamento de todos os dados pedidos ao parceiro, duplicações D1 a D8) | Aprovada em 2026-11-15 (D34, https://claude.ai/artifact/QhRCHcvwW8sDF9Phoa5Z7C); implementação na seção 1 |
| 2 | Termos e Política de Privacidade no cadastro comum, e "Sou o dono" para o dono assumir um lugar que já está no guia | Aprovada em 2026-11-23 (D35); implementação no item 6b da seção 1, depois da F4 |
| 3 | **Aluguel e translado à venda** (ponto 2 da F3): regras do anúncio e da oferta, períodos do aluguel, caução, termo de aluguel, CNH, translado privativo e compartilhado, trecho | Decisões completas em 2026-11-17 (`decisoes.md`, Escolhas da F3); implementada como F3b no PR #29 (2026-11-21) |
| 4 | **Texto do termo de aluguel** (padrão da plataforma, com versão, aceito na reserva): uso, danos, CNH, idade, devolução, nos três idiomas | Pedido em 2026-11-17 para depois; o texto passa pela aprovação do responsável. Até ele existir, a reserva de aluguel pede só os termos de compra (resposta 1a, 2026-11-21) |
| 5 | **Caução do aluguel** por pré-autorização de cartão no dia da retirada (D3): cartão salvo no Stripe, só cartão, cobrança por dano e contestação | Fora desta fase (resposta 2, 2026-11-17); proposta própria |

### Proposta 2 · Termos no cadastro comum e "Sou o dono"

Origem: comparação com Airbnb, Booking, Sympla, GetYourGuide, Eventbrite e Tripadvisor (2026-11-15), pontos 3 e 6.

* **Ponto 3 · Termos no cadastro comum.** O cadastro do usuário (e-mail e senha ou Google) não mostra os Termos nem a Política de Privacidade; só o cadastro do parceiro tem aceite. Sugestão de partida: o aviso "Ao criar a conta, você concorda com os Termos e a Política de Privacidade", com links, nos três idiomas.
* **Ponto 6 · "Sou o dono".** O guia tem lugares cadastrados pelo Use Guide (restaurantes, atrações, hospedagens). Hoje o dono não consegue assumir o lugar: cria outro anúncio, com risco de duplicado. Sugestão de partida: um botão "Sou o dono" no anúncio, usando a verificação por documento que já existe (D12), como o "reivindicar" do Tripadvisor.
* **Lembrete ao começar esta proposta:** lembrar o responsável do ponto 7 da comparação: **CPF não vende** (D12), enquanto na Sympla e no Airbnb pessoa física vende. É decisão aprovada, por motivo fiscal e jurídico; o lembrete existe porque o "Sou o dono" passa pela verificação por documento, onde essa regra pesa.

## 3 · A avaliar (sem decisão)

* Abrir o cadastro do Stripe já preenchido com o CNPJ e o nome verificados (D7 da proposta da D34): mexe com dinheiro, precisa de proposta própria.
* Débitos de `debitos.md`: corrigidos quando o arquivo for tocado (AGENTS.md §18) ou em tarefa própria. Os que já têm momento marcado: B60 (item 3 desta fila) e B66 (junto com a F1).
