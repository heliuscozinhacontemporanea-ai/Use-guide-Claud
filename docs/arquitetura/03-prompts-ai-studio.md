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

# Lote 12 (Prompts 18.2, A3, 18.2.1 e 18.2.2) — aplicar sobre o zip de 2026-10-19 (2º)

> O lote 11 chegou igual à referência. O AI Studio também trocou os ícones de translado e produtor por ícones que existem no `StandardCard`; a troca foi adotada, e o 18.2 acrescenta o do aluguel.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.2.md` | Editor único de cadastro: `ListingEditor` no painel do parceiro e no admin (via `AdminPanelComposition`), dicas e eventos no editor do admin; avisos do lint corrigidos nos arquivos tocados | `fbfbfe9` + `c2658aa` |
| 2 | `prompts/prompt-A3.md` | AGENTS.md §13 e §16.1: arquivo tocado sai sem avisos do lint (S10 aprovada) | `003cc6e` |
| 3 | `prompts/prompt-18.2.1.md` | Sessões do evento no editor (parceiro e admin): `EventSessionsField`, `saveEventSessionsUseCase`, `PartnerEventForm` dividido | `ce7f92a` |
| 4 | `prompts/prompt-18.2.2.md` | Contato do evento só nos campos do topo (B19); `eventsService` dividido em anúncios e sessões | `94a3ad6` |

> **Envie um prompt por mensagem**, nesta ordem.

| Gate | Resultado na referência (`94a3ad6`) |
|---|---|
| `npm run typecheck` | ✅ |
| `npx biome lint .` | ✅ 0 erros |
| `npx biome lint` nos arquivos tocados | ✅ 0 avisos (total do projeto: 313) |
| `npm test` | ✅ 145 arquivos, 804 testes |
| `npm run build` | ✅ |
