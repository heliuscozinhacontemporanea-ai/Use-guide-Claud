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

# Lote 9 (Prompts 16.1, 17, 17.1 e 17.2) — aplicar sobre o zip de 2026-10-14

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

# Lote 10 (Prompts 18 e 18.1) — aplicar depois do lote 9

> Decisão D9: parceiro com vários cadastros, categorias passeio/translado/aluguel separadas, perfil de produtor, telefone em E.164 e campo de arquivo do cardápio removido.

| Ordem | Arquivo | Tema | Commit de referência |
|---|---|---|---|
| 1 | `prompts/prompt-18.md` | Conta do parceiro sem categoria, categorias `transfer`/`rental`/`producer`, rotas `/translados` e `/alugueis`, telefone em E.164 (`whatsappLink` → `phone`) | `37b8a4b` |
| 2 | `prompts/prompt-18.1.md` | Inscrição e editor do parceiro com os campos de passeio, translado e aluguel; editor sem CPF/CNPJ e com categoria travada | `ee0ac2d` |

| Gate | Resultado na referência (`ee0ac2d`) |
|---|---|
| `npm run typecheck` | ✅ |
| `npx biome lint .` | ✅ 0 erros |
| `npm test` | ✅ 138 arquivos, 784 testes |
| `npm run build` | ✅ |

**Ação manual depois do 18:** os dados de teste com `whatsappLink` ou com categoria na conta do parceiro podem ser recriados (§2.2 item 8); configure `VITE_SUPPORT_WHATSAPP` (E.164) nos Secrets do AI Studio e no build de produção.
