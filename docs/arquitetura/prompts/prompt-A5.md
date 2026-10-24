# Prompt A5 — AGENTS.md §11.1 e §11.11: tema claro sem branco puro e experiência de app nativo (S14)

> Lote 16, gerado do commit de referência `d09bbaf` da branch `claude/agents-md-v2`. Aplique sobre o zip de 2026-10-24 (2º), que já tem o lote 15. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A5 — AGENTS.md §11.1 e §11.11 (S14 aprovada)

S14 aprovada pelo responsável do produto em 2026-10-24.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S14, aprovada em 2026-10-24). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código.

O QUE MUDA:
1) AGENTS.md §11.1, 1º item: todo componente novo ou tocado usa os tokens --ug-* de src/index.css nos dois temas; o tema claro nunca usa branco puro (fundo #f3eee4, superfícies #faf6ee); o tema é aplicado antes da primeira pintura e o theme-color acompanha o tema.
2) AGENTS.md, nova §11.11 "Experiência de app nativo": modal como folha inferior no celular e cartão central do sm em diante; entrada e saída animadas; press em todo botão; um efeito por propriedade em cada elemento; prefers-reduced-motion; foco inicial no próprio diálogo.
3) docs/arquitetura/solicitacoes-agents.md: proposta S14 registrada e marcada como aprovada.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -611,7 +611,7 @@ Passeios, aluguéis, translados e entradas de atrações privadas compartilham o
 
 ### 11.1. Identidade visual
 
-* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.
+* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
 * **Accent:** teal (`teal-400`/`teal-500`); emerald = sucesso; cyan = informação.
 * **Tipografia:** Inter (texto/UI) e Outfit (display). Proibida uma terceira fonte.
 * **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).
@@ -671,6 +671,15 @@ Todo hook assíncrono expõe `data`, `loading` e `error`. Toda tela trata: carre
 
 Proibido texto fixo com aparência de dado real do item. Valores financeiros (preço, taxa, quantidade) DEVEM vir do backend/cadastro, nunca de constante no componente.
 
+### 11.11. Experiência de app nativo
+
+* Modais e diálogos: folha que sobe da borda inferior no celular (com alça e safe area) e cartão central do `sm:` em diante, pelo `Dialog` do design system.
+* Entrada e saída animadas (fade, escala, folha), com saída pelo `data-state` do Radix; duração de 150–300 ms.
+* Retorno ao toque em todo botão (`press`: escala 0,97, sem destaque azul de toque, `touch-action: manipulation`).
+* **Um efeito por propriedade em cada elemento:** não somar `press` a `whileTap`/`whileHover` do `motion` nem a `active:scale-*`; animações usam as propriedades `scale`/`translate`, nunca `transform` quando o elemento já é centralizado por `transform`.
+* Tudo respeita `prefers-reduced-motion` (`motion-reduce:animate-none` e `MotionConfig reducedMotion="user"`).
+* Ao abrir um diálogo o foco vai para o próprio diálogo, sem anel de foco num botão que a pessoa não tocou.
+
 ---
 
 ## 12. Internacionalização (i18n) e Localização

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -4,6 +4,7 @@
 > Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
 > Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
 > Resposta de 2026-10-19: aprovadas S10, S11 e S12 (as três no prompt A3).
+> Resposta de 2026-10-24: aprovada S14 (aplicada pelo prompt A5).
 
 | # | Seção | Motivo | Status |
 |---|---|---|---|
@@ -20,6 +21,7 @@
 | S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S12 | §12.1 e §12.7 | Decisão D10: idioma do navegador na primeira visita, persistência só por escolha explícita | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S13 | §7.7 | O débito de `partnerDocumentKeys` foi resolvido no Prompt 18.3.0b | ✅ Aprovada em 2026-10-19 (prompt A4) |
+| S14 | §11.1 e §11 (nova subseção) | Tema claro sem branco puro e regras de experiência de app nativo | ✅ Aprovada em 2026-10-24 (prompt A5) |
 
 ---
 
@@ -162,3 +164,24 @@
 
 **Texto proposto:**
 > * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.
+
+## S14 — §11.1 e nova §11.11: tema claro sem branco puro e experiência de app nativo
+
+**Por quê:** pedido de 2026-10-24. O app é web, mas deve se comportar como app nativo, e o claro em branco puro cansa a vista. Hoje o §11.1 só diz que o componente funciona nos dois temas; não fixa a cor do claro nem como transições e toque devem se comportar, e efeitos somados (escala do toque + `whileTap` + transform de centralização) já causaram conflito.
+
+**Texto atual (§11.1, 1º item):**
+> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.
+
+**Texto proposto (§11.1, 1º item):**
+> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
+
+**Texto proposto (nova §11.11):**
+> ### 11.11. Experiência de app nativo
+>
+> * Modais e diálogos: folha que sobe da borda inferior no celular (com alça e safe area) e cartão central do `sm:` em diante, pelo `Dialog` do design system.
+> * Entrada e saída animadas (fade, escala, folha), com saída pelo `data-state` do Radix; duração de 150–300 ms.
+> * Retorno ao toque em todo botão (`press`: escala 0,97, sem destaque azul de toque, `touch-action: manipulation`).
+> * **Um efeito por propriedade em cada elemento:** não somar `press` a `whileTap`/`whileHover` do `motion` nem a `active:scale-*`; animações usam as propriedades `scale`/`translate`, nunca `transform` quando o elemento já é centralizado por `transform`.
+> * Tudo respeita `prefers-reduced-motion` (`motion-reduce:animate-none` e `MotionConfig reducedMotion="user"`).
+> * Ao abrir um diálogo o foco vai para o próprio diálogo, sem anel de foco num botão que a pessoa não tocou.
+

VERIFICAÇÃO: `git diff` deve mostrar só esses 2 arquivos. Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
