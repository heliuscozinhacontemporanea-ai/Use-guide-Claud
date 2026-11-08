# Prompt A4 — AGENTS.md §7.7: débito de `partnerDocumentKeys` resolvido (S13)

> Lote 13, gerado do commit de referência `e2651db` da branch `claude/agents-md-v2`. Aplique depois do 18.3.0b. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A4 — AGENTS.md §7.7 (S13 aprovada)

S13 aprovada pelo responsável do produto em 2026-10-19.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S13, aprovada em 2026-10-19). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código.

O QUE MUDA:
1) AGENTS.md §7.7: sai a frase "Débito existente: partnerDocumentKeys/{cpfCnpjLimpo} e os campos cpfCnpj/cpfCnpjClean em partners estão em texto puro." O Prompt 18.3.0b removeu a coleção e os campos; a regra (nenhuma PII em IDs, caminhos, URLs e nomes de arquivos) continua.
2) docs/arquitetura/solicitacoes-agents.md: S13 marcada como aprovada.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -392,7 +392,7 @@ Todo campo novo DEVE ser classificado antes de ser persistido. A classe define o
 **Blind index (busca e unicidade sem expor o dado):**
 
 * Para verificar unicidade ou buscar por CPF/CNPJ, gravar `HMAC-SHA-256(PII_BLIND_INDEX_KEY, valorNormalizado)` em vez do valor.
-* IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII. Débito existente: `partnerDocumentKeys/{cpfCnpjLimpo}` e os campos `cpfCnpj`/`cpfCnpjClean` em `partners` estão em texto puro.
+* IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.
 
 **Hash, tokens e assinaturas:**

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -19,6 +19,7 @@
 | S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S12 | §12.1 e §12.7 | Decisão D10: idioma do navegador na primeira visita, persistência só por escolha explícita | ✅ Aprovada em 2026-10-19 (prompt A3) |
+| S13 | §7.7 | O débito de `partnerDocumentKeys` foi resolvido no Prompt 18.3.0b | ✅ Aprovada em 2026-10-19 (prompt A4) |
 
 ---

VERIFICAÇÃO: `git diff` deve mostrar só esses 2 arquivos. Responda no formato do AGENTS.md §16.3.
~~~~
