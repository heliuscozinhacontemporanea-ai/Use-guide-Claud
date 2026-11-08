# Prompt A2 — AGENTS.md §13: um UseCase por arquivo, sem agregadores

> Lote 8, gerado do commit de referência `ec5533f` da branch `claude/agents-md-v2`. Aplique depois do Prompt 16. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A2 — AGENTS.md §13: um UseCase por arquivo, sem agregadores

Solicitação S9, aprovada pelo responsável do produto em 2026-10-12. O prompt 15 eliminou os arquivos agregadores de UseCases, mas o §13 ainda os citava como débito existente; um agente que lesse o texto poderia procurá-los ou recriá-los.

~~~~text
Esta é uma alteração do AGENTS.md AUTORIZADA pelo responsável do produto (solicitação S9, aprovada em 2026-10-12). Altere SOMENTE a linha indicada abaixo; não mude nenhum outro trecho do AGENTS.md nem outros arquivos.

O QUE MUDA:
1) AGENTS.md §13: a regra "Um UseCase por arquivo" deixa de citar `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` (já removidos pelo prompt 15) e passa a proibir arquivos agregadores. O nome do arquivo é igual ao da função exportada; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -768,7 +768,7 @@ Regras:
 ## 13. Modularidade e Responsabilidade Única
 
 * Cada arquivo tem uma razão para mudar. Componentes que misturam formulário + lista + filtros + métricas DEVEM ser divididos; o container só orquestra.
-* **Um UseCase por arquivo** (`createBookingUseCase.ts`). Arquivos agregadores existentes (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`) são débito: novos UseCases não entram neles.
+* **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
 * Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
 * Hooks com estados não relacionados DEVEM ser divididos em hooks compostos.

VERIFICAÇÃO (obrigatória):
- `git diff` (ou comparação do arquivo) mostra só esta linha alterada no AGENTS.md.
- `find src server -name "*UseCases.ts" -not -name "*.test.ts"` não encontra nenhum arquivo.

Nenhuma configuração manual. Responda no formato do AGENTS.md §16.3.
~~~~
