# Prompt A9 — AGENTS.md §11.1 (verde de ação) e decisão D26

> Lote 19, gerado dos commits de referência `3a7e901..e95c5c9` da branch `claude/agents-md-v2`. Aplique depois do 23.4, nesta ordem: A9 e 23.5. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A9 — AGENTS.md §11.1 (verde de ação) e decisão D26

Mudança do AGENTS.md autorizada pelo responsável do produto em 2026-11-03.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto. Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: a cor é aplicada pelo prompt 23.5.

O QUE MUDA:
1) AGENTS.md §11.1: verde #11D450 para ação (no lugar do verde-água), verde-menta para concluído; accent nas classes teal-* redefinidas em src/index.css; texto de ação #087A2E no tema claro.
2) docs/arquitetura/decisoes.md: D26 (verde de ação, concluído em menta, folhas no tema claro, interruptor branco).

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/decisoes.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -615,8 +615,8 @@ Passeios, aluguéis, translados e entradas de atrações privadas compartilham o
 
 ### 11.1. Identidade visual
 
-* **Estilo:** superfícies sólidas e discretas sobre fundo neutro e liso: grafite no escuro (fundo `#0d0e10`, cartão `#1e2024`) e bege no claro (fundo `#f3eee4`, cartão `#faf6ee`). Sem gradientes, padrões nem linhas decorativas no fundo. Vidro (desfoque) só em barras fixas e folhas sobre o conteúdo. Cor só com significado: verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Uma ação principal por tela; as demais como texto. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
-* **Accent:** teal (`teal-400`/`teal-500`); emerald = sucesso; cyan = informação.
+* **Estilo:** superfícies sólidas e discretas sobre fundo neutro e liso: grafite no escuro (fundo `#0d0e10`, cartão `#1e2024`) e bege no claro (fundo `#f3eee4`, cartão `#faf6ee`). Sem gradientes, padrões nem linhas decorativas no fundo. Vidro (desfoque) só em barras fixas e folhas sobre o conteúdo. Cor só com significado: verde (#11D450) para ação, amarelo para pendente, verde-menta para concluído, vermelho para perigo. Uma ação principal por tela; as demais como texto. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
+* **Accent:** verde #11D450, nas classes `teal-*` (o 400 é o tom principal, redefinido em `src/index.css`); menta = sucesso; ciano = informação. No tema claro, texto de ação #087A2E.
 * **Tipografia:** Inter (texto/UI) e Outfit (display). Proibida uma terceira fonte.
 * **Superfície elevada:** cartão sólido do design system (`GlassCard` passa a ser sólido, sem desfoque).

=== docs/arquitetura/decisoes.md — diff ===
@@ -369,3 +369,13 @@ Aprovada pelo responsável do produto em 2026-11-03 (proposta em `docs/arquitetu
 * **Revisão das telas (aprovada em 2026-11-03, substitui os interruptores por categoria, o silêncio noturno e o resumo diário como interruptor):** avisos que evitam perder um serviço, um prazo ou dinheiro chegam sempre, sem interruptor — compras e pagamentos, ingressos e reservas, conta e, para o parceiro, cancelamentos, reclamações, avaliações dos clientes, repasses e cadastro. A pessoa escolhe só **Pedidos de avaliação** (ligado) e **Novidades e ofertas** (desligado); o parceiro escolhe **aviso a cada venda** ou **resumo no fim do dia**. Avisos opcionais nunca chegam das 23h30 às 5h30 (Fortaleza; ajustado em 2026-11-03 a pedido do responsável do produto). Central com filtro "Não lidas / Tudo", menu "…" (Configurações, marcar todas como lidas) e "Você está em dia". Suporte como central de ajuda (saudação com busca, compras, assuntos, perguntas mais lidas, contato). Textos para quem usa o app, sem termos técnicos; visual da base D17 (ícones neutros, cor só com significado). Referências: Airbnb, Tripadvisor, Apple HIG.
 * **Adiado (2026-11-03):** aviso de evento novo para quem favoritou o lugar ou o organizador. O evento não aponta para um lugar do guia; a forma (pelo dono, pelo lugar escolhido no cadastro do evento ou "seguir o organizador") fica para decisão futura. Quando vier, entra como aviso opcional de Novidades.
 * **Avisos implementados (23.2 a 23.3):** 36 tipos gravados como tipo + dados, traduzidos no app e no push (textos espelhados com teste de paridade); fila de envio (outbox) com job a cada minuto, lembretes a cada 15 min (véspera e 2 h antes), resumo de vendas às 20h e convite para avaliar (único opcional hoje). Troca de senha e confirmação de e-mail não geram aviso (acontecem no Firebase Auth, sem passar pelo backend).
+
+## D26 — Verde forte para ação e folhas no tema claro (2026-11-03)
+
+Aprovada pelo responsável do produto em 2026-11-03.
+
+* **Cor de ação:** verde #11D450 (entre #21C063 e #01E93E), no lugar do verde-água. Fica na escala `teal-*` redefinida em `src/index.css` (o 400 é o tom principal), sem trocar as classes dos componentes; tokens `accent`: #3EE47A no escuro e #087A2E no claro (contraste AA sobre o bege). Stripe usa a mesma cor (`colorPrimary`).
+* **Concluído continua verde-menta** (#6EE7B7 no escuro): status é texto com ponto, nunca botão, então não se confunde com a ação (opção A).
+* **Folhas no tema claro seguem as telas:** fundo bege (#f3eee4) e cartões claros (#faf6ee) com borda (`bg-sheet`, `bg-sheet-card`, `border-sheet-card-line`). No escuro nada muda.
+* **Interruptores:** bolinha sempre branca, nos dois temas.
+* **AGENTS.md §11.1** atualizado com a cor nova (autorizado em 2026-11-03).

VERIFICAÇÃO: nenhum código muda; não precisa rodar testes. Confira só que os dois arquivos ficaram iguais ao diff.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
