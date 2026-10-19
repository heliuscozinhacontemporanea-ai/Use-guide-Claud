# Prompt A4 — AGENTS.md: tradução automática do conteúdo (S11)

> Lote 12, gerado do intervalo `9fcc0bb..bbd1741` da branch `claude/agents-md-v2`. Aplique depois do 18.2.3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A4 — AGENTS.md §12.6 (S11 aprovada, decisão D5)

D5 e S11 aprovadas pelo responsável do produto em 2026-10-19: tradução automática do conteúdo com Google Cloud Translation, sem tradução à mão, edição no idioma escolhido.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S11, aprovada em 2026-10-19). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO implemente nada da tradução agora: o código vem nos prompts 19.x.

O QUE MUDA:
1) AGENTS.md §12.6 reescrito:
   - novo formato de LocalizedText (source + translations com sourceHash);
   - Google Cloud Translation só no backend, no domínio translation;
   - sem tradução feita à mão;
   - edição no idioma ativo (salvar faz do campo o novo original);
   - tradução em segundo plano pela outbox;
   - avaliações com "Ver tradução" sob demanda e cache;
   - política de cancelamento traduzida com aviso, valendo o original.
2) docs/arquitetura/decisoes.md: D5 aprovada (antes em aberto); D8 e D9 entram na tabela-resumo.
3) docs/arquitetura/solicitacoes-agents.md: S11 registrada e aprovada.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -742,11 +742,13 @@ Regras:
 
 ### 12.6. Conteúdo cadastrado (itens, eventos, passeios, dicas)
 
-* Campos traduzíveis (título, descrição, regras, política de cancelamento) usam o tipo `LocalizedText = { 'pt-BR': string; en?: string; fr?: string }`. Campos não traduzíveis (preço, endereço, telefone) continuam simples.
-* Ordem de fallback na exibição: idioma ativo → `pt-BR`. A UI indica quando mostra o texto original por falta de tradução.
-* **Tradução automática** de conteúdo de parceiros (ex: com Gemini via `@google/genai`, já presente no projeto) é decisão de produto (§15): custo, qualidade e responsabilidade. Se adotada, roda **só no backend**, grava `translationSource: 'human' | 'machine'` por idioma, permite revisão pelo parceiro e a UI informa "traduzido automaticamente".
-* Avaliações ficam no idioma original; tradução, se existir, é opção do leitor ("ver tradução").
-* Política de cancelamento e termos de compra exibidos antes do pagamento DEVEM existir no idioma do comprador ou em pt-BR com aviso claro.
+* Campos traduzíveis (título, descrição, regras, política de cancelamento, dicas) usam o tipo `LocalizedText = { source: { locale: Locale; text: string; hash: string }; translations: Partial<Record<Locale, { text: string; sourceHash: string; updatedAt: string }>> }`, com `hash` = SHA-256 do texto normalizado. Campos não traduzíveis (nome do estabelecimento e de pessoas, preço, endereço, telefone, horários e opções fixas como categoria e comodidades) continuam simples e iguais em todos os idiomas.
+* **Tradução automática** com Google Cloud Translation (decisão D5), **só no backend**, atrás de `MachineTranslationPort` no domínio `translation` (folha: não importa nenhum domínio). Não há tradução feita à mão nem revisão pelo parceiro. A UI informa "Traduzido automaticamente pelo Google · Ver original".
+* **Edição no idioma ativo:** o editor mostra cada campo no idioma escolhido em Configurações e indica qual versão está sendo editada. Salvar um campo nesse idioma faz dele o novo `source` daquele campo, e as outras versões são traduzidas de novo a partir dele; o editor avisa antes de salvar.
+* A tradução roda **fora da requisição de salvamento**: o backend grava o `source` e um evento na outbox na mesma transação (§5.6), e o job traduz só os campos em que `sourceHash` difere do `hash` atual, descartando o trabalho se o texto mudou de novo. Enquanto não há tradução, a UI mostra o original com aviso.
+* Ordem de fallback na exibição: idioma ativo → `source`.
+* **Avaliações** ficam no idioma original, com o idioma detectado gravado. A tradução é pedida pelo leitor ("Ver tradução"), inclusive por visitante sem conta, com rate limit por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache do domínio `translation`, indexado pelo hash do texto e pelo idioma, e é reaproveitado para todos os leitores. Excluir a avaliação ou a conta apaga as entradas desse texto no cache (§7.5).
+* Política de cancelamento e termos de compra exibidos antes do pagamento aparecem no idioma do comprador, por tradução automática com aviso, e com link para o original, que é o texto que vale.
 
 ### 12.7. SEO multilíngue

=== docs/arquitetura/decisoes.md — diff ===
@@ -14,9 +14,11 @@
 | D2 | Planos dos parceiros com Stripe Billing | ✅ Aprovada | 2026-10-09 |
 | D3 | Domínio `bookings` em fases | ✅ Aprovada | 2026-10-09 |
 | D4 | Upload de imagens via backend para Firebase Storage | ✅ Aprovada | 2026-10-09 |
-| D5 | Tradução automática do conteúdo dos parceiros | ⏳ **Em aberto** | — |
+| D5 | Tradução automática do conteúdo (Google Cloud Translation) | ✅ Aprovada | 2026-10-19 |
 | D6 | URLs por idioma | ✅ Aprovada | 2026-10-09 |
 | D7 | SEO em produção via Cloud Run | ✅ Aprovada | 2026-10-09 |
+| D8 | Painel admin: selo, suspensão e planos | ✅ Aprovada | 2026-10-12 |
+| D9 | Parceiros com vários estabelecimentos e novas categorias | ✅ Aprovada | 2026-10-12 |
 
 ---
 
@@ -47,10 +49,17 @@
 * **Processamento:** validação por *magic bytes*, rotação pela orientação EXIF, redimensionamento (máx. 2048 px), conversão para WebP e remoção de todos os metadados (incluindo GPS), com a biblioteca `sharp` (dependência aprovada).
 * **Prompt:** 7.
 
-## D5 — Tradução automática (EM ABERTO)
-
-* Opções: (a) tradução automática com Gemini no backend, marcada como `machine` e editável pelo parceiro; (b) só tradução humana.
-* Até a decisão, o modelo `LocalizedText` (AGENTS.md §12.6) PODE ser preparado, mas nenhuma chamada de tradução automática DEVE ser implementada.
+## D5 — Tradução automática do conteúdo (2026-10-19)
+
+* **Fornecedor:** Google Cloud Translation, só no backend, atrás de um port (domínio `translation`, folha). Crédito mensal sem custo de 500 mil caracteres; acima disso, US$ 20 por milhão. Conta de serviço do Cloud Run com `roles/cloudtranslate.user` (sem chave nova).
+* **Sem tradução feita à mão** e sem revisão pelo parceiro, por enquanto. Pode entrar quando o app crescer (campo `origin` opcional nas traduções, sem quebrar os dados).
+* **Identificador = hash do texto original** (SHA-256). Quando o parceiro altera um campo, o job traduz só esse campo e grava por cima da versão anterior. Texto igual nunca é traduzido duas vezes.
+* **Edição no idioma escolhido (opção A):** o editor mostra os campos no idioma de Configurações. Salvar um campo em outro idioma faz dele o novo original daquele campo, e as outras versões são traduzidas de novo a partir dele, com aviso antes de salvar. Nome, telefone, endereço, preço, horários e opções fixas são iguais em todos os idiomas.
+* **Tradução em segundo plano:** o salvamento grava o original e um evento na outbox (AGENTS.md §5.6); o job traduz depois. Enquanto não termina, a interface mostra o original com aviso.
+* **Avaliações:** ficam no idioma original. "Ver tradução" sob demanda, **também para visitante sem conta**, com limite de requisições por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache indexado por hash e idioma e é reaproveitado para todos os leitores. Excluir avaliação ou conta apaga as entradas desse texto no cache.
+* **Política de cancelamento e termos:** tradução automática com aviso e link para o original, que é o texto que vale.
+* **Texto fixo da interface** (botões, menus, erros, e-mails) não usa a API: continua nos arquivos de tradução.
+* **Depende de:** S11 (novo texto do AGENTS.md §12.6).
 
 ## D6 — URLs por idioma

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -3,6 +3,7 @@
 > O AGENTS.md só muda com autorização explícita do responsável do produto. Cada item abaixo diz **o que** mudaria, **por quê** e o texto proposto.
 > Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
 > Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
+> Resposta de 2026-10-19: aprovadas S10 (prompt A3) e S11 (prompt A4).
 
 | # | Seção | Motivo | Status |
 |---|---|---|---|
@@ -16,6 +17,7 @@
 | S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ✅ Aprovada em 2026-10-12 (prompt A2) |
 | S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ✅ Aprovada em 2026-10-19 (prompt A3) |
+| S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A4) |
 
 ---
 
@@ -111,3 +113,22 @@
 **Texto proposto (§16.1):**
 > npm run lint        # biome sem erros; arquivos tocados sem avisos (§13)
 
+## S11 — §12.6: tradução automática do conteúdo (D5 aprovada)
+
+**Por quê:** a D5 foi aprovada em 2026-10-19. O texto atual define `LocalizedText = { 'pt-BR', en?, fr? }`, cita o Gemini, prevê `translationSource: 'human' | 'machine'` e revisão pelo parceiro. Nada disso vale mais: o fornecedor é o Google Cloud Translation, não há tradução à mão, o original pode estar em qualquer idioma e cada tradução guarda o hash do original de onde saiu.
+
+**Texto atual (§12.6):**
+> * Campos traduzíveis (título, descrição, regras, política de cancelamento) usam o tipo `LocalizedText = { 'pt-BR': string; en?: string; fr?: string }`. Campos não traduzíveis (preço, endereço, telefone) continuam simples.
+> * Ordem de fallback na exibição: idioma ativo → `pt-BR`. A UI indica quando mostra o texto original por falta de tradução.
+> * **Tradução automática** de conteúdo de parceiros (ex: com Gemini via `@google/genai`, já presente no projeto) é decisão de produto (§15): custo, qualidade e responsabilidade. Se adotada, roda **só no backend**, grava `translationSource: 'human' | 'machine'` por idioma, permite revisão pelo parceiro e a UI informa "traduzido automaticamente".
+> * Avaliações ficam no idioma original; tradução, se existir, é opção do leitor ("ver tradução").
+> * Política de cancelamento e termos de compra exibidos antes do pagamento DEVEM existir no idioma do comprador ou em pt-BR com aviso claro.
+
+**Texto proposto (substitui o §12.6 inteiro):**
+> * Campos traduzíveis (título, descrição, regras, política de cancelamento, dicas) usam o tipo `LocalizedText = { source: { locale: Locale; text: string; hash: string }; translations: Partial<Record<Locale, { text: string; sourceHash: string; updatedAt: string }>> }`, com `hash` = SHA-256 do texto normalizado. Campos não traduzíveis (nome do estabelecimento e de pessoas, preço, endereço, telefone, horários e opções fixas como categoria e comodidades) continuam simples e iguais em todos os idiomas.
+> * **Tradução automática** com Google Cloud Translation (decisão D5), **só no backend**, atrás de `MachineTranslationPort` no domínio `translation` (folha: não importa nenhum domínio). Não há tradução feita à mão nem revisão pelo parceiro. A UI informa "Traduzido automaticamente pelo Google · Ver original".
+> * **Edição no idioma ativo:** o editor mostra cada campo no idioma escolhido em Configurações e indica qual versão está sendo editada. Salvar um campo nesse idioma faz dele o novo `source` daquele campo, e as outras versões são traduzidas de novo a partir dele; o editor avisa antes de salvar.
+> * A tradução roda **fora da requisição de salvamento**: o backend grava o `source` e um evento na outbox na mesma transação (§5.6), e o job traduz só os campos em que `sourceHash` difere do `hash` atual, descartando o trabalho se o texto mudou de novo. Enquanto não há tradução, a UI mostra o original com aviso.
+> * Ordem de fallback na exibição: idioma ativo → `source`.
+> * **Avaliações** ficam no idioma original, com o idioma detectado gravado. A tradução é pedida pelo leitor ("Ver tradução"), inclusive por visitante sem conta, com rate limit por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache do domínio `translation`, indexado pelo hash do texto e pelo idioma, e é reaproveitado para todos os leitores. Excluir a avaliação ou a conta apaga as entradas desse texto no cache (§7.5).
+> * Política de cancelamento e termos de compra exibidos antes do pagamento aparecem no idioma do comprador, por tradução automática com aviso, e com link para o original, que é o texto que vale.

VERIFICAÇÃO: nenhum código muda; `npm test` continua com 150 arquivos e 824 testes.
Responda no formato do AGENTS.md §16.3.
~~~~
