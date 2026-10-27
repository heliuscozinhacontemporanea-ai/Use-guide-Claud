# Prompt A6 — AGENTS.md: fundo neutro e superfícies sólidas (S16) + limite de tamanho só para código (S17)

> Lote 17, gerado dos commits de referência `d1359f3` e `e9a1771` da branch `claude/agents-md-v2`. Aplique depois do 18.4f.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A6 — AGENTS.md §11.1 (S16) e §13 (S17)

S16 e S17 aprovadas pelo responsável do produto em 2026-10-27 (decisão D17).

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S16 e S17, aprovadas em 2026-10-27). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: o visual novo é implementado pelos prompts 20.0 e 20.1, logo depois deste.

O QUE MUDA:
1) AGENTS.md §11.1 (S16): fundo neutro e liso (grafite #0d0e10 no escuro, bege #f3eee4 no claro), cartões sólidos (#1e2024 e #faf6ee), sem gradientes, padrões nem linhas no fundo; vidro só em barras fixas e folhas; cor só com significado; uma ação principal por tela. O GlassCard passa a ser sólido.
2) AGENTS.md §13 (S17): o limite de 400 linhas vale só para código com mais de uma responsabilidade; conteúdo (traduções, textos legais e institucionais, testes, schemas, mappers) não tem limite; textos legais e institucionais ficam nos arquivos de tradução.
3) docs/arquitetura/decisoes.md: decisão D17. docs/arquitetura/solicitacoes-agents.md: S16 e S17.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -614,10 +614,10 @@ Passeios, aluguéis, translados e entradas de atrações privadas compartilham o
 
 ### 11.1. Identidade visual
 
-* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
+* **Estilo:** superfícies sólidas e discretas sobre fundo neutro e liso: grafite no escuro (fundo `#0d0e10`, cartão `#1e2024`) e bege no claro (fundo `#f3eee4`, cartão `#faf6ee`). Sem gradientes, padrões nem linhas decorativas no fundo. Vidro (desfoque) só em barras fixas e folhas sobre o conteúdo. Cor só com significado: verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Uma ação principal por tela; as demais como texto. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
 * **Accent:** teal (`teal-400`/`teal-500`); emerald = sucesso; cyan = informação.
 * **Tipografia:** Inter (texto/UI) e Outfit (display). Proibida uma terceira fonte.
-* **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).
+* **Superfície elevada:** cartão sólido do design system (`GlassCard` passa a ser sólido, sem desfoque).
 
 ### 11.2. Contraste (WCAG 2.2 AA)
 
@@ -783,7 +783,8 @@ Regras:
 
 * Cada arquivo tem uma razão para mudar. Componentes que misturam formulário + lista + filtros + métricas DEVEM ser divididos; o container só orquestra.
 * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
-* Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
+* Referência de tamanho (vale só para código: componentes, hooks, services, controllers, adapters): arquivo acima de **~200 linhas** DEVE ser avaliado para divisão. Acima de **400 linhas**, DEVE ser dividido ao tocar quando tiver mais de uma responsabilidade; se tiver uma só, PODE ficar, e a entrega registra em uma linha qual é a responsabilidade e por que não divide.
+* Conteúdo não tem limite de linhas: traduções (`src/shared/i18n/`), textos legais e institucionais (termos, políticas, Sobre), testes, schemas e mappers declarativos. Textos legais e institucionais DEVEM ficar como conteúdo nos arquivos de tradução, por idioma, e não escritos dentro de componentes.
 * Arquivo tocado DEVE sair sem avisos do lint (`npx biome lint <arquivo>`) e formatado (`npx biome format --write <arquivo>`). Aviso que não puder ser corrigido sem mudar comportamento recebe `biome-ignore` com justificativa ou vai para `docs/arquitetura/debitos.md`.
 * Hooks com estados não relacionados DEVEM ser divididos em hooks compostos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -26,6 +26,7 @@
 | D14 | Repasse por documento, retenção até o serviço, taxas e cancelamentos | ✅ Aprovada | 2026-10-24 |
 | D15 | Termos com aceite registrado e idioma do editor de conteúdo | ✅ Aprovada | 2026-10-25 |
 | D16 | Dívidas, reclamações, força maior e reagendamento | ✅ Aprovada | 2026-10-25 |
+| D17 | Visual: fundo neutro, superfícies sólidas e menos informação por tela | ✅ Aprovada | 2026-10-27 |
 
 ---
 
@@ -245,3 +246,16 @@ Detalha o que a D14 deixou para o 18.4d.
 * **Detalhes de implementação:** multa = 20% do valor vendido sem as taxas de serviço, para baixo; vence 24 h depois do cancelamento; desconto nos repasses começa no vencimento, dos repasses mais antigos primeiro. Contestação perdida com check-in fica com a plataforma (o repasse segue); sem check-in, o proprietário perde o repasse da venda ou, se já recebeu, a parte dele vira dívida. Reembolso depois do repasse vira dívida com prazo de 24 h.
 * **Prompts:** 18.4d.1, 18.4d.2, 18.4d.3.
 
+## D17 — Visual: fundo neutro, superfícies sólidas e menos informação por tela (2026-10-27)
+
+Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e comparadas com Airbnb, Booking, Sympla, Google Travel, Apple Mapas, Uber, Headout, Fever e Dice. O estilo do Airbnb e o modo escuro de Google e Apple foram os aprovados.
+
+* **Fundo:** liso, sem gradiente, padrão ou linhas — grafite `#0d0e10` no escuro e bege `#f3eee4` no claro. Sai o `BackgroundBlobs` com o azul e as linhas de mapa.
+* **Superfícies:** cartões sólidos — `#1e2024` no escuro (um pouco mais claro que a primeira proposta, a pedido) e `#faf6ee` no claro; borda e sombra quase invisíveis. Vidro só em barras fixas e folhas sobre o conteúdo.
+* **Cor com significado:** verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Status como texto com ponto colorido, sem caixa com borda.
+* **Menos informação por vez:** cartão com o que foi comprado e quando, e uma linha com o que a pessoa precisa saber ou fazer agora. Detalhes ao tocar (folha). Abas no lugar de listas longas (ex.: Próximas e Anteriores).
+* **Uma ação principal por tela** (botão cheio); as demais como texto ou ícone.
+* **Foto do item** nos cartões sempre que houver; sem foto, ícone do tipo de serviço.
+* **AGENTS.md §11.1** atualizado pela S16 (prompt A6).
+* **Prompts:** A6 (regra), 20.0 (base visual: tokens, fundo e `GlassCard` sólido) e 20.1 (as três telas das propostas), no fim do lote 17; as demais telas seguem tela a tela, junto com o 19.x.
+

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -6,6 +6,8 @@
 > Resposta de 2026-10-19: aprovadas S10, S11 e S12 (as três no prompt A3).
 > Resposta de 2026-10-24: aprovada S14 (aplicada pelo prompt A5).
 > Resposta de 2026-10-24: aprovada S15 (aplicada pelo prompt A5, junto com a S14).
+> Resposta de 2026-10-27: aprovada S16 (aplicada pelo prompt A6).
+> Resposta de 2026-10-27: aprovada S17 (aplicada pelo prompt A6, junto com a S16).
 
 | # | Seção | Motivo | Status |
 |---|---|---|---|
@@ -24,6 +26,8 @@
 | S13 | §7.7 | O débito de `partnerDocumentKeys` foi resolvido no Prompt 18.3.0b | ✅ Aprovada em 2026-10-19 (prompt A4) |
 | S14 | §11.1 e §11 (nova subseção) | Tema claro sem branco puro e regras de experiência de app nativo | ✅ Aprovada em 2026-10-24 (prompt A5) |
 | S15 | §8.1 e §8.7 | D14: conta por documento, cobrança na plataforma com transferência depois do serviço, taxas por tipo, multa e reagendamento | ✅ Aprovada em 2026-10-24 (prompt A5, junto com a S14) |
+| S16 | §11.1 | D17: fundo neutro e liso, superfícies sólidas, cor só com significado e uma ação principal por tela | ✅ Aprovada em 2026-10-27 (prompt A6) |
+| S17 | §13 | Limite de 400 linhas só para código com mais de uma responsabilidade; conteúdo (traduções, textos legais) sem limite | ✅ Aprovada em 2026-10-27 (prompt A6, junto com a S16) |
 
 ---
 
@@ -195,3 +199,31 @@
 * **§8.2:** ingressos e reservas com PaymentIntent na plataforma e transferência depois do serviço.
 * **§8.3:** Pix só para serviço até 80 dias depois da compra (reembolso de Pix só em até 90 dias).
 * **§8.7:** políticas de cancelamento da plataforma, gravadas no pedido e só mais flexíveis depois de publicar; arrependimento em 7 dias até 48 h antes do início; no-show sem reembolso; translado com retenção máxima de 5%; cancelamento pelo proprietário com reembolso integral, multa de 20%, compensação em 24 h e bloqueio; reagendamento em força maior; disputa com suspensão do repasse.
+
+## S16 — Fundo neutro e superfícies sólidas (D17)
+
+**Por quê:** o fundo azul com linhas de mapa e o vidro em todos os cartões disputam a atenção com a informação. As referências aprovadas (Airbnb, Google Travel, Apple Mapas) usam fundo liso, cartões sólidos e cor só no que tem significado. Propostas das telas aprovadas por prints em 2026-10-27.
+
+**Texto atual (§11.1):**
+
+> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; (…)
+> * **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).
+
+**Texto aprovado:**
+
+> * **Estilo:** superfícies sólidas e discretas sobre fundo neutro e liso: grafite no escuro (fundo `#0d0e10`, cartão `#1e2024`) e bege no claro (fundo `#f3eee4`, cartão `#faf6ee`). Sem gradientes, padrões nem linhas decorativas no fundo. Vidro (desfoque) só em barras fixas e folhas sobre o conteúdo. Cor só com significado: verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Uma ação principal por tela; as demais como texto. Tema **dark é o padrão de design**; (…o resto igual)
+> * **Superfície elevada:** cartão sólido do design system (`GlassCard` passa a ser sólido, sem desfoque).
+
+## S17 — Limite de tamanho só para código (§13)
+
+**Por quê:** quem decide a divisão é a responsabilidade do arquivo, não o número de linhas. Textos longos (termos, políticas, Sobre, traduções) têm um motivo só para mudar e não ficam melhores divididos. O número continua como alarme para código, e quem mantém um arquivo grande registra o motivo.
+
+**Texto atual (§13):**
+
+> * Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
+
+**Texto aprovado:**
+
+> * Referência de tamanho (vale só para código: componentes, hooks, services, controllers, adapters): arquivo acima de **~200 linhas** DEVE ser avaliado para divisão. Acima de **400 linhas**, DEVE ser dividido ao tocar quando tiver mais de uma responsabilidade; se tiver uma só, PODE ficar, e a entrega registra em uma linha qual é a responsabilidade e por que não divide.
+> * Conteúdo não tem limite de linhas: traduções (`src/shared/i18n/`), textos legais e institucionais (termos, políticas, Sobre), testes, schemas e mappers declarativos. Textos legais e institucionais DEVEM ficar como conteúdo nos arquivos de tradução, por idioma, e não escritos dentro de componentes.
+

VERIFICAÇÃO: confira que o AGENTS.md mudou só no §11.1 e no §13, com o texto exato do diff. Nenhum código muda neste prompt.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
