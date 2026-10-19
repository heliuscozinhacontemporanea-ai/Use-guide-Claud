# Prompt A3 — AGENTS.md: arquivo tocado sai sem avisos do lint

> Lote 12, gerado do commit de referência `003cc6e` da branch `claude/agents-md-v2`. Aplique depois do 18.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A3 — AGENTS.md §13 e §16.1 (S10 aprovada)

S10 aprovada pelo responsável do produto em 2026-10-19: arquivo tocado sai sem avisos do lint e formatado.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S10, aprovada em 2026-10-19). Aplique EXATAMENTE o diff abaixo e nada mais.

O QUE MUDA:
1) AGENTS.md §13: novo item — arquivo tocado DEVE sair sem avisos do lint e formatado; aviso que não puder ser corrigido sem mudar comportamento recebe biome-ignore com justificativa ou vai para docs/arquitetura/debitos.md.
2) AGENTS.md §16.1: o gate de lint passa a citar a regra.
3) docs/arquitetura/solicitacoes-agents.md: S10 marcada como aprovada.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -770,6 +770,7 @@ Regras:
 * Cada arquivo tem uma razão para mudar. Componentes que misturam formulário + lista + filtros + métricas DEVEM ser divididos; o container só orquestra.
 * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
 * Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
+* Arquivo tocado DEVE sair sem avisos do lint (`npx biome lint <arquivo>`) e formatado (`npx biome format --write <arquivo>`). Aviso que não puder ser corrigido sem mudar comportamento recebe `biome-ignore` com justificativa ou vai para `docs/arquitetura/debitos.md`.
 * Hooks com estados não relacionados DEVEM ser divididos em hooks compostos.
 
 ---
@@ -827,7 +828,7 @@ Em qualquer edição: remover comentários "o quê", blocos `@file` e histórico
 
 ```bash
 npm run typecheck   # tsc --noEmit sem erros
-npm run lint        # biome sem erros
+npm run lint        # biome sem erros; arquivos tocados sem avisos (§13)
 npm test            # vitest verde
 npm run build       # build de produção sem erros
 npm run test:rules  # quando firestore.rules mudar (emulador)

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -15,7 +15,7 @@
 | S7 | §12.7 | Decisões D6 (URLs por idioma) e D7 (SEO no Cloud Run) | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ✅ Aprovada em 2026-10-12 (prompt A2) |
-| S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ⏳ Aguardando autorização |
+| S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ✅ Aprovada em 2026-10-19 (prompt A3) |
 
 ---

VERIFICAÇÃO: nenhum código muda; `npm test` continua com 141 arquivos e 792 testes.
Responda no formato do AGENTS.md §16.3.
~~~~
