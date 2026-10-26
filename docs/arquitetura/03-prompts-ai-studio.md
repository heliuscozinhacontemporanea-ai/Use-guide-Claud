# Prompts para o AI Studio — Lote 7 (Prompts 14.1 e 15) ✅ aplicado (zip 2026-10-14)

> **Gerados a partir dos commits de referência** da branch `claude/agents-md-v2` (veja `docs/PROCESSO.md`). Cada prompt contém o diff exato do commit; o resultado esperado no AI Studio é idêntico ao commit.
>
> Ponto de partida: o zip de 2026-10-12, após o lote 6 (código idêntico à referência + três correções do AI Studio, mantidas), importado na `main`.
>
> Um prompt por arquivo em `docs/arquitetura/prompts/`. Cole **um por vez, na ordem**, espere o agente terminar e confira se ele rodou a verificação. Depois do lote, exporte o zip e envie para comparação.
>
> - **Nenhum prompt deste lote altera o AGENTS.md.** A S9 (texto do §13) foi aprovada em 2026-10-12 e é aplicada pelo prompt A2, no lote 8.
> - Sem código de compatibilidade ou transição.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-14.1.md` | Cloud Functions: segredo `INTERNAL_JOB_KEY` declarado e URLs como parâmetros; `checkExpiringPlans` preguiçoso; `.env.example` só como modelo | `9368be2` |
| 2 | `prompts/prompt-15.md` | Um UseCase por arquivo: fim dos 9 agregadores (sem mudança de comportamento) | `f565f7b` |

## Verificação esperada ao fim do lote

| Gate | Resultado na referência (`f565f7b`) |
|---|---|
| `npm run typecheck` e `npx tsc -p functions/tsconfig.json --noEmit` | ✅ sem erros |
| `npx biome lint .` | ✅ 0 erros |
| `npm test` | ✅ 120 arquivos, 730 testes |
| `npm run build` | ✅ |
| `find src server -name "*UseCases.ts" -not -name "*.test.ts"` | ✅ nenhum arquivo |

---

# Lote 8 (Prompts 16 e A2) ✅ aplicado (zip 2026-10-14)

> Pedido do responsável do produto (2026-10-12): a interface deve refletir corretamente as funções de cada usuário e seguir uma lógica coerente (ex.: favoritos do menu abria uma página solta).

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-16.md` | Favoritos e reservas dentro do menu (sub-tela na URL), menu como composição em `src/app/menu`, rotas `/favoritos` e `/reservas` removidas, correções de fluxo (painel do parceiro, portal sem login, idioma no voltar, exclusão de conta com Google, recuperação de senha, botões sem ação) e traduções | `2ab647c` |
| 2 | `prompts/prompt-A2.md` | AGENTS.md §13: um UseCase por arquivo, sem agregadores (S9 aprovada em 2026-10-12) | `ec5533f` |

| Gate | Resultado na referência (`2ab647c`) |
|---|---|
| `npm run typecheck` | ✅ sem erros |
| `npx biome lint .` | ✅ 0 erros |
| `npm test` | ✅ 124 arquivos, 743 testes |
| `npm run build` | ✅ |

---

# Lote 9 (Prompts 16.1, 17, 17.1 e 17.2) ⚠️ aplicado em parte (zip 2026-10-18) → completado pelo 17.3

> Os lotes 7 e 8 chegaram no zip de 2026-10-14. A padronização das Functions feita pelo AI Studio foi adotada; o 16.1 corrige o que saiu do escopo. A referência foi refeita sobre esse zip, então os diffs abaixo aplicam direto no código atual do AI Studio.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-16.1.md` | Ajustes do lote 7/8: `solicitacoes-agents.md` restaurado, `firebase-admin` de volta nas Functions, taxa da plataforma em um só lugar, fachada de `payment` sem ports, `FavoritesList` sem `any` | `6022c0b` |
| 2 | `prompts/prompt-17.md` | Correções urgentes: checkout do plano, relatórios, rolagem do portal, sessões de evento, suspender, selo sem mexer no plano, avisos | `d8125a7` |
| 3 | `prompts/prompt-17.1.md` | Preço dos planos em centavos | `f036c3e` |
| 4 | `prompts/prompt-17.2.md` | Oferta só com Stripe pronto; parceiro suspenso não vende | `5d66eea` |

| Gate | Resultado na referência (`5d66eea`) |
|---|---|
| `npm run typecheck` | ✅ |
| `npx biome lint .` | ✅ 0 erros |
| `npm test` | ✅ 136 arquivos, 776 testes |
| `npm run build` | ✅ |

**Ação manual depois do 17.1:** digitar de novo o preço de cada plano no painel admin (o preço passa a ser gravado em centavos).

**Ação manual depois do 16.1:** configurar o parâmetro `PARTNERS_EXPIRING_PLANS_JOB_URL` das Functions (`https://<serviço>/internal/partners/check-expiring-plans`), como os outros jobs.

---

# Lote 10 (Prompts 17.3, 18 e 18.1) ⚠️ aplicado em parte (zip 2026-10-19) → completado pelo lote 11

---

# Lote 11 (Prompts 18.0.1 e 18.1) ✅ aplicado (zip 2026-10-19, 2º)

> Comparação do zip de 2026-10-19:
> - o 17.3 veio correto;
> - o 18 veio só em parte: a conta do parceiro voltou a ter categoria, a inscrição é recusada pelo servidor e o perfil do parceiro não carrega;
> - o 18.1 não foi aplicado.
>
> O AI Studio também corrigiu uma falha da referência: o parceiro não podia criar passeio, translado, aluguel nem perfil de produtor. A correção foi adotada, junto com as seções da Explore, os filtros e o menu.
>
> **Envie o 18.1 sozinho, numa mensagem separada do 18.0.1.** O prompt é grande (cerca de 120 KB) e, no lote 10, foi ignorado.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.0.1.md` | Completa o 18: conta sem categoria (inscrição e perfil voltam a funcionar), `whatsappLink` removido, rótulos e títulos das categorias, chaves do menu | `64b792a` |
| 2 | `prompts/prompt-18.1.md` | Inscrição e editor do parceiro com os campos de passeio, translado e aluguel; editor sem CPF/CNPJ e com categoria travada | `1c15de9` |

| Gate | Resultado na referência (`1c15de9`) |
|---|---|
| `npm run typecheck` | ✅ |
| `npx biome lint .` | ✅ 0 erros |
| `npm test` | ✅ 139 arquivos, 786 testes |
| `npm run build` | ✅ |

**Ação manual:** configure `VITE_SUPPORT_WHATSAPP` (E.164) nos Secrets do AI Studio e no build de produção, se ainda não fez.

---

# Lote 12 (Prompts 18.2, A3, 18.2.1, 18.2.2, 18.2.3 e 18.2.4) — aplicar sobre o zip de 2026-10-19 (2º)

> O lote 11 chegou igual à referência. O AI Studio também trocou os ícones de translado e produtor por ícones que existem no `StandardCard`; a troca foi adotada, e o 18.2 acrescenta o do aluguel.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.2.md` | Editor único de cadastro: `ListingEditor` no painel do parceiro e no admin (via `AdminPanelComposition`), dicas e eventos no editor do admin; avisos do lint corrigidos nos arquivos tocados | `fbfbfe9` + `c2658aa` |
| 2 | `prompts/prompt-A3.md` | AGENTS.md (só documentação): §13 e §16.1, arquivo tocado sem avisos do lint (S10); §12.6, tradução automática (S11/D5); §12.1 e §12.7, idioma da primeira visita (S12/D10). Junta os antigos A3, A4 e A5 | `003cc6e~1..41190ee` |
| 3 | `prompts/prompt-18.2.1.md` | Sessões do evento no editor (parceiro e admin): `EventSessionsField`, `saveEventSessionsUseCase`, `PartnerEventForm` dividido | `ce7f92a` |
| 4 | `prompts/prompt-18.2.2.md` | Contato do evento só nos campos do topo (B19); `eventsService` dividido em anúncios e sessões | `94a3ad6` |
| 5 | `prompts/prompt-18.2.3.md` | Visualizações de visitantes nos insights (erro do modal de detalhe), relatório com total e divisão em percentual, métricas com checagem de dono no backend, `trust proxy` por `TRUST_PROXY_HOPS` | `45b17ec` |
| 6 | `prompts/prompt-18.2.4.md` | Idioma do navegador na primeira visita (D10): home redireciona para /en ou /fr, aviso nas páginas em português, idioma gravado só por escolha, `preferredLocale` na conta | `93c6c9b` |

> **Envie um prompt por mensagem**, nesta ordem.

| Gate | Resultado na referência (`3cc54e6`) |
|---|---|
| `npm run typecheck` | ✅ |
| `npx biome lint .` | ✅ 0 erros |
| `npx biome lint` nos arquivos tocados | ✅ 0 avisos (total do projeto: 290) |
| `npm test` | ✅ 160 arquivos, 888 testes |
| `npm run test:rules` | ✅ 4 arquivos, 61 testes |
| `npm run build` | ✅ |

> **Antes do 18.2.3**, no painel Secrets do AI Studio: `INSIGHTS_VIEWER_KEY` (32 caracteres aleatórios ou mais). Em produção: o mesmo segredo no Secret Manager (com valor diferente) e `TRUST_PROXY_HOPS` no Cloud Run; o TTL de `interactionGuards.expiresAt` sobe com `firebase deploy --only firestore:indexes`.

> **Resultado (zip de 2026-10-19, 3º, `main` `fada927`):**
> - **Aplicados corretamente:** A3, 18.2.2, 18.2.3 e 18.2.4. Todos os arquivos novos do lote vieram iguais à referência.
> - **Partes não aplicadas:**
>   - 18.2: `usePartnerProfile.ts` antigo, "Nova dica" do admin, `ListingEditorProps`;
>   - 18.2.1: `usePartnerContentActions.ts` antigo, então as sessões editadas não eram gravadas.
> - **Reescritas próprias do AI Studio:** `PartnerPortalComposition`, `AdminPanel`, `AdminEditorModal`, `AdminEditorEventFields`, `PartnerPanel`, `adminPlanSchema` e outros 3 arquivos. Todas descartadas: regressões sem ganho, com 4 testes falhando.
> - **Correção:** Prompt 18.2.5 (lote 13).

---

# Lote 13 (Prompts 18.2.5, 18.3.0a, 18.3.0b, A4 e 18.3.0c) — aplicar sobre o zip de 2026-10-19 (3º)

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.2.5.md` | Correção do lote 12: completa o 18.2 e o 18.2.1 e desfaz as reescritas | `fada927..345ccbb` (= `93c6c9b`) |
| 2 | `prompts/prompt-18.3.0a.md` | Verificação por estabelecimento no backend (D12): criptografia de campo com Cloud KMS, índice cego, documentos privados, fila do admin, venda bloqueada sem verificação | `3cc54e6` |
| 3 | `prompts/prompt-18.3.0b.md` | Conta do parceiro sem CPF/CNPJ e sem status pendente (D12, P0); inscrição dividida em peças menores | `46236f5` |
| 4 | `prompts/prompt-A4.md` | AGENTS.md §7.7: tira o débito de `partnerDocumentKeys`, já resolvido (S13) | `e2651db` |
| 5 | `prompts/prompt-18.3.0c.md` | Telas de verificação por estabelecimento (D12): selo e envio no painel do parceiro, fila do admin, textos nos 3 idiomas; ajustes do preview | `3e75156` + `3406b93` |

> **Envie um prompt por mensagem**, nesta ordem. **Antes do 18.3.0a**, no painel Secrets do AI Studio: `FIELD_ENCRYPTION_DEV_KEY` (32 bytes em base64) e `PII_BLIND_INDEX_KEY` (32 caracteres ou mais).

# Lote 13b (Prompt 18.3.0d) — aplicar sobre o zip de 2026-10-22

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.3.0d.md` | Correção do lote 13: painéis do parceiro e do admin de volta à referência, D11 e D12 no `decisoes.md`, prompts colados fora de `public/` | `467cd02..996437c` |

> O resto do lote 13 voltou igual à referência (backend da verificação, regras, A4 e telas novas de verificação).

# Lote 14 (Prompts 18.3a, 18.3b e 18.3c) — aplicar depois do lote 13b

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.3a.md` | Plano e selo por estabelecimento no backend (D11): `listingPlans`, selo = plano + verificação, trial e selo do admin por estabelecimento, job diário de vencimento | `bd14c0f` |
| 2 | `prompts/prompt-18.3b.md` | Cobrança do plano por estabelecimento: assinatura e Pix com `itemId`, cancelamento nas exclusões | `cd31a44` |
| 3 | `prompts/prompt-18.3c.md` | Métricas exigem o plano do estabelecimento (`403 LISTING_PLAN_REQUIRED`); rodízio diário do "Destaque" em `featuredListings/{lista}` | `f5b42a0` |

> **Envie um prompt por mensagem**, nesta ordem. Até o 18.3.1 (telas), trial, compra de plano e selo do admin pelo painel ficam fora do ar, e as métricas de estabelecimento sem plano mostram erro.

# Lote 17 (Prompts C16, 18.4c, 18.4c.1, 18.4d.1 a 18.4d.3b e 18.4e.1) — aplicar sobre o zip de 2026-10-25

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-C16.md` | Correção do lote 16: o texto da D14 entra no `docs/arquitetura/decisoes.md` (só documentação) | `48a75ac` |
| 2 | `prompts/prompt-18.4c.md` | Cobrança na plataforma e repasse 48 h depois do serviço (D14): `payoutEntries`, job `/internal/payouts/release`, reembolso antes do repasse, contestação segura o repasse, Pix só até 80 dias; resolve B27 | `dc082a9..e80e9b1` |
| 3 | `prompts/prompt-18.4c.1.md` | Agendamento de hora em hora do job de repasse (Cloud Function `releasePayouts`); sem ele nenhum repasse é liberado | `598c7fe..6d8ff33` |
| 4 | `prompts/prompt-18.4d.1.md` | Dívidas do CNPJ (D16), só backend: multa de 20% no cancelamento pelo proprietário, dívida vencida descontada do repasse e bloqueando vendas, contestação perdida com ou sem check-in, reembolso depois do repasse; rotas de dívidas; grava a D16 no `decisoes.md`; resolve B29 | `9e75059..df37496` |
| 5 | `prompts/prompt-18.4d.2.md` | Reclamações do comprador (D16), só backend: `saleClaims` até 48 h depois do fim do serviço, repasse retido até a decisão do admin (liberar, reembolso integral ou parcial, multa no cancelamento silencioso), expiração em 5 dias pelo job; repasse com lista de retenções; débito B30 | `3f43733..a2c644f` |
| 6 | `prompts/prompt-18.4d.3a.md` | Força maior (D16), só backend: declaração com prova privada na multa de cancelamento, multa suspensa até a decisão do admin (aprovada perdoa; recusada vale com 24 h) | `7608424..cd796c0` |
| 7 | `prompts/prompt-18.4d.3b.md` | Reagendamento (D16): ingresso e reserva valem na nova data, reembolso integral com a taxa até 7 dias depois do aviso, remarcação de horário de reserva, repasse acompanha a nova data; adiar a sessão passa a levar sempre os pedidos | `cd796c0..d2f73d8` |
| 8 | `prompts/prompt-18.4e.1.md` | Telas do parceiro (D14, D16): Recebimentos com abas Contas, Extrato e Dívidas, extrato por venda com taxas, pagar dívida no cartão ou Pix, declarar força maior com prova, aviso de vendas pausadas; Payment Element no tema do app (prints aprovados) | `31cdebc..7c2dbc8` |

> Cada prompt termina com **Configurações manuais**: o que você faz fora do AI Studio (deploy de regras e índices, Functions, Stripe Dashboard) depois de aplicá-lo.

> O lote 16 voltou igual à referência em todo o código: as 42 diferenças são só ordem de imports e formatação, sem mudança de lógica. Gates no próprio zip: typecheck, lint (0 erros), 1.004 testes, 64 testes das regras, build e servidor de produção respondendo. Única lacuna: a D14 não estava no `decisoes.md`.

# Lote 16 (Prompts A5, 18.4a.1, 18.4a.2, 18.4b.0.1, 18.4b.0.2, 18.4b.1, 18.4b.2 e 18.4b.3) — aplicar sobre o zip de 2026-10-24 (2º)

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-A5.md` | AGENTS.md §11.1 e nova §11.11 (S14) + §8.1, §8.2, §8.3 e §8.7 (S15: repasse por documento, retenção até o serviço, taxas e cancelamentos) | `52392fe..5573f13` |
| 2 | `prompts/prompt-18.4a.1.md` | Conta Stripe Express por CNPJ (D14), parte 1: backend, regras e testes; sai a trava B22 | `6946ecf` |
| 3 | `prompts/prompt-18.4a.2.md` | Conta Stripe Express por CNPJ (D14), parte 2: portal de recebimentos com um cartão por CNPJ, ticketing e reservas | `6946ecf` |
| 4 | `prompts/prompt-18.4b.0.1.md` | ticketingService (1857 linhas) dividido por responsabilidade, sem mudar comportamento | `51f5188` |
| 5 | `prompts/prompt-18.4b.0.2.md` | Adapter Firestore do ticketing (1559 linhas) dividido em stores, sem mudar comportamento | `0012702` |
| 6 | `prompts/prompt-18.4b.1.md` | Taxas por produto, políticas de cancelamento e arrependimento (D14), parte 1: backend; débito B27 | `0012702..9e420df` |
| 7 | `prompts/prompt-18.4b.2.md` | Taxas por produto, políticas de cancelamento e arrependimento (D14), parte 2: editores, compra de ingresso e carteira divididas e traduzidas | `0012702..31e0772` |
| 8 | `prompts/prompt-18.4b.3.md` | Termos com aceite registrado (D15): termos em Sobre o app, link e caixa de aceite no checkout e em Recebimentos; débito B28 | `d59bcbd..ed7c054` |

> O 18.4a passou de 150 KB e foi dividido. Envie a parte 2 logo depois da parte 1: entre as duas, o painel do parceiro ainda chama as rotas antigas de conta financeira.

> O 18.4b também foi dividido; cada parte compila sozinha. Antes do 18.4b.1, cadastre no painel Secrets do AI Studio `BOOKINGS_PLATFORM_FEE_BPS=1500`, `TICKETS_PLATFORM_FEE_BPS=1000`, `TICKETS_ABSORBED_FEE_BPS=1250` e `TICKET_SERVICE_FEE_MINOR=300`: sem elas, ingressos e reservas respondem "vendas indisponíveis".

> O lote 15 voltou igual à referência (todo o código, byte a byte); nenhuma correção pendente.

# Lote 15 (Prompts 18.3b.1, 18.3b.2, 18.3.1a, 18.3.1b e 18.3.1c) — aplicar sobre o zip de 2026-10-24

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.3b.1.md` | Correção do 18.3b: 17 arquivos da cobrança por estabelecimento de volta à referência | `0fec4b9..faba4ec` |
| 2 | `prompts/prompt-18.3b.2.md` | Troca de período do plano na próxima renovação (D13): subscription schedule do Stripe, sem proração | `e261e1d` |
| 3 | `prompts/prompt-18.3.1a.md` | Painel do parceiro: plano e selo em cada cadastro, teste grátis e compra com `itemId`, troca de período no cartão da assinatura, conta sem selo, aviso de plano nos relatórios | `4f3fddb` + `cf21b31` |
| 4 | `prompts/prompt-18.3.1b.md` | Selo do admin por estabelecimento, explicação do selo ao toque, "Destaque" no topo das listas e ordem orgânica; `ExploreView` dividido | `37fe44f` + `55d0cc1` |
| 5 | `prompts/prompt-18.3.1c.md` | Telas tocadas nos temas claro (off-white bege, sem branco puro) e escuro; modal como folha inferior no celular; toque e transições de app nativo | `52392fe` |

> Os lotes 13b e 14 voltaram iguais à referência, exceto o 18.3b.
