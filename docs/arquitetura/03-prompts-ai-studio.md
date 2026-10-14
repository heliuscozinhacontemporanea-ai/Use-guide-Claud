# Prompts para o AI Studio — Lote 7 (Prompts 14.1 e 15)

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

# Lote 8 (Prompts 16 e A2) — aplicar depois do lote 7

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
