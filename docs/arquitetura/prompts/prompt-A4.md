# Prompt A4 — AGENTS.md: tradução automática (S11) e idioma da primeira visita (S12)

> Lote 12, gerado do intervalo `9fcc0bb..173c42e` da branch `claude/agents-md-v2`. Aplique depois do 18.2.3. Inclui o A5 (S12), a pedido do responsável do produto. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A4 — AGENTS.md §12.1, §12.6 e §12.7 (S11 e S12 aprovadas; decisões D5 e D10)

S11, S12, D5 e D10 aprovadas pelo responsável do produto em 2026-10-19.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S11 e S12, aprovadas em 2026-10-19). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO implemente código agora: a D10 vem no prompt 18.2.4 e a tradução nos prompts 19.x.

O QUE MUDA:
1) AGENTS.md §12.6 reescrito (S11, decisão D5):
   - novo formato de LocalizedText (source + translations com sourceHash);
   - Google Cloud Translation só no backend, no domínio translation;
   - sem tradução feita à mão;
   - edição no idioma ativo (salvar faz do campo o novo original);
   - tradução em segundo plano pela outbox;
   - avaliações com "Ver tradução" sob demanda e cache;
   - política de cancelamento traduzida com aviso, valendo o original.
2) AGENTS.md §12.1 e §12.7 (S12, decisão D10):
   - detecção do idioma: URL com prefixo → escolha salva → navegador → pt-BR;
   - o idioma só é gravado por escolha explícita;
   - a home / redireciona para /en ou /fr conforme a preferência (robôs nunca);
   - as outras páginas em português mostram aviso para trocar.
3) docs/arquitetura/decisoes.md: D5 e D10 aprovadas; D8 e D9 entram na tabela-resumo.
4) docs/arquitetura/solicitacoes-agents.md: S11 e S12 registradas e aprovadas.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -683,9 +683,9 @@ Idiomas suportados: **`pt-BR` (padrão e fonte da verdade)**, **`en`**, **`fr`**
 |---|---|---|
 | Biblioteca | `i18next` + `react-i18next` | `src/shared/i18n/config.ts` |
 | Idiomas | `SUPPORTED_LOCALES = ['pt-BR', 'en', 'fr']`, `DEFAULT_LOCALE = 'pt-BR'` | `src/shared/i18n/locale.ts` |
-| Detecção do idioma inicial | 1º `localStorage['useguide.locale']` → 2º `navigator.languages` → 3º `pt-BR` | `resolveInitialLocale()` |
+| Detecção do idioma inicial | 1º idioma da URL (`/en`, `/fr`) → 2º escolha explícita (`users/{uid}.preferredLocale` ou `localStorage['useguide.locale']`) → 3º `navigator.languages` → 4º `pt-BR` (decisão D10) | `resolveInitialLocale()` |
 | Normalização | `pt`, `pt-*` → `pt-BR`; `en-*` → `en`; `fr-*` → `fr`; outros → ignorado | `normalizeLocale()` |
-| Persistência e `<html lang>` | atualizados no evento `languageChanged` | `config.ts` |
+| Persistência e `<html lang>` | o idioma só é gravado quando a pessoa escolhe (Configurações ou aviso de idioma); mudança causada pela URL não é gravada. `<html lang>` acompanha o idioma ativo | `config.ts` |
 | Fallback | `fallbackLng: 'pt-BR'`, `load: 'currentOnly'`, `useSuspense: false` | `config.ts` |
 | Traduções | um único namespace `translation`, os 3 idiomas no mesmo arquivo, tipados por `TranslationResource` | `src/shared/i18n/resources.ts` |
 
@@ -742,15 +742,17 @@ Regras:
 
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
 
-* Cada idioma indexável DEVE ter URL própria (decisão D6): português na raiz, `en` e `fr` em pastas com slugs traduzidos (`/eventos`, `/en/events`, `/fr/evenements`). A fonte única do mapa é `src/shared/i18n/localizedRoutes.ts`, espelhada em `server/shared/kernel/localizedRoutes.ts` com teste de paridade. A URL tem prioridade sobre o idioma salvo no navegador.
+* Cada idioma indexável DEVE ter URL própria (decisão D6): português na raiz, `en` e `fr` em pastas com slugs traduzidos (`/eventos`, `/en/events`, `/fr/evenements`). A fonte única do mapa é `src/shared/i18n/localizedRoutes.ts`, espelhada em `server/shared/kernel/localizedRoutes.ts` com teste de paridade. A URL com prefixo de idioma (`/en`, `/fr`) sempre vale. Na home `/`, quando a preferência (escolha salva → idioma do navegador) não for português, o app redireciona para `/en` ou `/fr` sem criar entrada no histórico; robôs de busca nunca são redirecionados. Nas demais páginas em português, o app mantém o idioma do link e mostra um aviso para trocar ("Esta página está disponível em English — Mudar"); a resposta ao aviso grava a escolha (decisão D10).
 * Obrigatório: `<html lang>`, `<link rel="alternate" hreflang="pt-BR|en|fr|x-default">`, canonical por idioma, `og:locale` e `og:locale:alternate`, sitemap com alternâncias de idioma e JSON-LD com `inLanguage`.
 * O HTML das rotas de conteúdo DEVE passar pelo Cloud Run (`serverSeoService`), com cache na CDN do Hosting (`s-maxage=300`) e `sitemap.xml` dinâmico (decisão D7). A home `/` é servida estática pelo Hosting: seus metadados e `hreflang` ficam no `index.html`.

=== docs/arquitetura/decisoes.md — diff ===
@@ -14,9 +14,12 @@
 | D2 | Planos dos parceiros com Stripe Billing | ✅ Aprovada | 2026-10-09 |
 | D3 | Domínio `bookings` em fases | ✅ Aprovada | 2026-10-09 |
 | D4 | Upload de imagens via backend para Firebase Storage | ✅ Aprovada | 2026-10-09 |
-| D5 | Tradução automática do conteúdo dos parceiros | ⏳ **Em aberto** | — |
+| D5 | Tradução automática do conteúdo (Google Cloud Translation) | ✅ Aprovada | 2026-10-19 |
 | D6 | URLs por idioma | ✅ Aprovada | 2026-10-09 |
 | D7 | SEO em produção via Cloud Run | ✅ Aprovada | 2026-10-09 |
+| D8 | Painel admin: selo, suspensão e planos | ✅ Aprovada | 2026-10-12 |
+| D9 | Parceiros com vários estabelecimentos e novas categorias | ✅ Aprovada | 2026-10-12 |
+| D10 | Idioma na primeira visita (navegador) | ✅ Aprovada | 2026-10-19 |
 
 ---
 
@@ -47,10 +50,17 @@
 * **Processamento:** validação por *magic bytes*, rotação pela orientação EXIF, redimensionamento (máx. 2048 px), conversão para WebP e remoção de todos os metadados (incluindo GPS), com a biblioteca `sharp` (dependência aprovada).
 * **Prompt:** 7.
 
-## D5 — Tradução automática (EM ABERTO)
+## D5 — Tradução automática do conteúdo (2026-10-19)
 
-* Opções: (a) tradução automática com Gemini no backend, marcada como `machine` e editável pelo parceiro; (b) só tradução humana.
-* Até a decisão, o modelo `LocalizedText` (AGENTS.md §12.6) PODE ser preparado, mas nenhuma chamada de tradução automática DEVE ser implementada.
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
 
@@ -96,3 +106,15 @@
 * **Formulário:** campo de arquivo do cardápio removido (fica só o link). **Telefone em E.164**, com o link do WhatsApp montado a partir dele.
 * **Ordem:** Prompt 17.2 (publicar só com Stripe pronto) → Prompt 18 (modelo de categorias + editor único).
 
+## D10 — Idioma na primeira visita (2026-10-19, opção B)
+
+* **Prioridade:**
+  1. URL com prefixo de idioma (`/en/...`, `/fr/...`): vale sempre.
+  2. Escolha explícita: `users/{uid}.preferredLocale` para quem tem conta; `localStorage['useguide.locale']` para visitante.
+  3. Idioma do navegador (`navigator.languages`), se for pt, en ou fr.
+  4. Português.
+* **Home `/`:** quando a preferência dos itens 2–4 não for português, o app redireciona para `/en` ou `/fr` (sem criar entrada no histórico). Robôs de busca nunca são redirecionados.
+* **Outras páginas em português** (links do Google, WhatsApp etc.): o app mantém o idioma do link e mostra um aviso: "Esta página está disponível em English — Mudar". Os dois botões do aviso (mudar ou manter) gravam a escolha, e o aviso não volta.
+* **Persistência só por escolha explícita** (Configurações ou aviso). Mudança causada pela URL não é gravada. Hoje o app grava o idioma da URL, e quem entra por `/` fica preso em português.
+* Escolha feita por quem tem conta vai para `preferredLocale` pela API (escrita no backend, §6.1) e vale em todos os aparelhos e nos e-mails (§12.5).
+* **Depende de:** S12 (AGENTS.md §12.1 e §12.7).

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -3,6 +3,7 @@
 > O AGENTS.md só muda com autorização explícita do responsável do produto. Cada item abaixo diz **o que** mudaria, **por quê** e o texto proposto.
 > Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
 > Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
+> Resposta de 2026-10-19: aprovadas S10 (prompt A3), S11 e S12 (as duas no prompt A4).
 
 | # | Seção | Motivo | Status |
 |---|---|---|---|
@@ -16,6 +17,8 @@
 | S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ✅ Aprovada em 2026-10-12 (prompt A2) |
 | S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ✅ Aprovada em 2026-10-19 (prompt A3) |
+| S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A4) |
+| S12 | §12.1 e §12.7 | Decisão D10: idioma do navegador na primeira visita, persistência só por escolha explícita | ✅ Aprovada em 2026-10-19 (prompt A4, junto com a S11) |
 
 ---
 
@@ -111,3 +114,40 @@
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
+
+## S12 — §12.1 e §12.7: idioma na primeira visita (D10)
+
+**Por quê:** pela regra atual, a URL tem prioridade e o português fica na raiz `/`. Quem tem o navegador em inglês e abre a home recebe português, e o app ainda grava "pt-BR" como preferência. A decisão D10 (opção B) faz o idioma do navegador valer na home, sem prejudicar o SEO nem os links compartilhados.
+
+**Texto atual (§12.1, duas linhas da tabela):**
+> | Detecção do idioma inicial | 1º `localStorage['useguide.locale']` → 2º `navigator.languages` → 3º `pt-BR` | `resolveInitialLocale()` |
+> | Persistência e `<html lang>` | atualizados no evento `languageChanged` | `config.ts` |
+
+**Texto proposto:**
+> | Detecção do idioma inicial | 1º idioma da URL (`/en`, `/fr`) → 2º escolha explícita (`users/{uid}.preferredLocale` ou `localStorage['useguide.locale']`) → 3º `navigator.languages` → 4º `pt-BR` (decisão D10) | `resolveInitialLocale()` |
+> | Persistência e `<html lang>` | o idioma só é gravado quando a pessoa escolhe (Configurações ou aviso de idioma); mudança causada pela URL não é gravada. `<html lang>` acompanha o idioma ativo | `config.ts` |
+
+**Texto atual (§12.7, fim do 1º item):**
+> A URL tem prioridade sobre o idioma salvo no navegador.
+
+**Texto proposto:**
+> A URL com prefixo de idioma (`/en`, `/fr`) sempre vale. Na home `/`, quando a preferência (escolha salva → idioma do navegador) não for português, o app redireciona para `/en` ou `/fr` sem criar entrada no histórico; robôs de busca nunca são redirecionados. Nas demais páginas em português, o app mantém o idioma do link e mostra um aviso para trocar ("Esta página está disponível em English — Mudar"); a resposta ao aviso grava a escolha (decisão D10).

VERIFICAÇÃO: nenhum código muda; `npm test` continua com 150 arquivos e 824 testes.
Responda no formato do AGENTS.md §16.3.
~~~~
