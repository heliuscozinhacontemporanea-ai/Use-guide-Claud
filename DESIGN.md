# DESIGN.md — Design System do Use Guide

> Versão 1.0 · aprovado pelo responsável do produto em 2026-11-13 (solicitação S19, decisão D32). Substitui o antigo §11 do AGENTS.md.
> Legenda: **✅** = regra que já valia antes deste documento (AGENTS.md §11 ou decisões D17, D19, D21, D26, painel por segmento) · **P#** = regra aprovada com este documento, em 2026-11-13 · **D33** = linguagem de movimento, gestos e folha do perfil, aprovados em 2026-11-14 a partir do vídeo de referência · **⚠️** = o código ainda diverge da regra; a correção está no débito indicado (`docs/arquitetura/debitos.md`) e acontece ao tocar o arquivo ou no item de trabalho próprio.
> Palavras-chave **DEVE / NÃO DEVE / DEVERIA / PODE** como no AGENTS.md (RFC 2119).

---

## 0. Como usar este documento

* **O que é:** a fonte única das regras visuais e de interação do Use Guide (app do comprador, painel do parceiro, painel do admin, modo portaria, e-mails e páginas de SEO).
* **Relação com o AGENTS.md:** o AGENTS.md rege arquitetura, segurança, dinheiro e i18n; este documento rege aparência, movimento, interação e fluidez. Em conflito, vale a ordem do AGENTS.md §0.1 (segurança e dinheiro sempre vencem a aparência).
* **Onde fica:** `DESIGN.md` na raiz, nas três branches (`main`, `claude/agents/useguide`, `claude/agents/documentacao`), como o AGENTS.md. Prints e vídeos de referência ficam em `docs/design/` na branch de documentação.
* **Quem altera:** só com autorização do responsável do produto, como o AGENTS.md (§15). Tela nova ou mudança visível vai em print para aprovação antes do código.
* **Código de referência:** tokens em `src/index.css`; componentes em `src/ui/`; classes de controle em `src/ui/styles/controls.ts`; z-index em `src/shared/constants/zIndex.ts`.

---

## 1. Princípios ✅

1. **App nativo, não site.** Toque responde na hora, telas entram como num app (página da direita, folha de baixo) e nada pisca.
2. **Fundo neutro e superfícies sólidas.** O conteúdo é a cor; o app não disputa atenção com ele (D17).
3. **Cor só com significado.** Verde = ação; amarelo = pendente; menta = concluído; vermelho = perigo; ciano = informação; roxo = área do parceiro.
4. **Menos informação por vez.** O cartão diz o que é e quando, e numa linha o que a pessoa precisa saber ou fazer agora. Detalhes ao tocar (folha).
5. **Uma ação principal por tela.** Botão cheio só nela; as demais em texto.
6. **Mobile-first.** O celular é o layout de referência; o desktop se adapta sem perder nada.
7. **Os dois temas são de primeira classe.** O escuro é o padrão de design; o claro é bege, nunca branco puro.
8. **Acessível por padrão.** Contraste AA, toque de 44 px, foco visível, leitor de tela e "reduzir movimento".
9. **Texto de quem usa o app.** Sem termos técnicos, tom neutro e de confiança, nos três idiomas.

---

## 2. Cores

### 2.1. Tokens de tema ✅

Sempre pelos tokens (`bg-app`, `text-ink`, `bg-surface`, `border-line`…). Nunca cor fixa em superfície que muda com o tema.

| Token (classe) | Uso | Escuro | Claro |
|---|---|---|---|
| `app` (`bg-app`) | fundo da tela | `#0d0e10` | `#f3eee4` |
| `ink` (`text-ink`) | texto principal | `#ffffff` | `#231d16` |
| `surface` (`bg-surface`) | cartão | `#1e2024` | `#faf6ee` (97%) |
| `surface-solid` | cartão sem transparência | `#1e2024` | `#faf6ee` |
| `sheet` | fundo da folha | `#1e2024` | `#f3eee4` |
| `sheet-card` / `sheet-card-line` | bloco dentro da folha | branco 4%, sem borda | `#faf6ee` com borda 12% |
| `line` (`border-line`) | borda e divisória | branco 8% | tinta 12% |
| `scrim` | véu atrás de folhas | preto 70% | tinta 35% |
| `recede` | véu do que fica para trás numa troca de tela (fundo que vira cartão, página anterior) | **clareia**: branco 10% | **escurece**: preto 12% |
| `on-fill` | texto sobre botão colorido | `#fff8f0` | `#fff8f0` |

### 2.2. Cores com significado ✅

Cada uma tem texto (`text-x`), fundo suave (`bg-x-soft`) e borda (`border-x-line`).

| Significado | Token | Texto escuro | Texto claro | Onde |
|---|---|---|---|---|
| Ação | `accent` / escala `teal-*` | `#3ee47a` (botão `teal-400` `#11d450`) | `#087a2e` | botão principal, interruptor ligado, opção escolhida, ponto de não lido, link de ação |
| Pendente | `warn` | `#fcd34d` | `#92400e` | aguardando pagamento, prazo, atenção |
| Concluído | `success` | `#6ee7b7` | `#065f46` | pago, confirmado, entrou |
| Informação | `info` | `#a5f3fc` | `#155e75` | avisos neutros |
| Perigo | `danger` | `#fda4af` | `#9f1239` | erro, cancelar, excluir, recusado |
| Selo verificado | `seal` | `#93c5fd` | `#1d4ed8` | estabelecimento verificado |
| Área do parceiro | `partner` (+ `soft`, `line`, `fill`) | `#818cf8` | `#4338ca` | convite "Seja parceiro", apresentação, cadastro, título e ícone do topo do painel; as ações do painel continuam verdes |

**Exceções aprovadas ✅:** estrelas de avaliação amarelas (D19); Stripe usa o verde de ação como `colorPrimary` (D26); modo portaria sempre escuro (`.ug-force-dark`, D21).

**Proibido ✅:** gradiente, padrão ou linha decorativa no fundo; cor só para enfeitar; status como caixa com borda (status é texto com ponto, `StatusText`).

### 2.3. Contraste medido nos tokens atuais

| Texto | Escuro (fundo / cartão) | Claro (fundo / cartão) |
|---|---|---|
| `ink` 100% | 19,3 / 16,3 | 14,4 / 15,5 |
| `ink` 70% | 9,6 / 8,6 | 5,7 / 5,9 |
| `ink` 60% | 7,3 / 6,7 | **4,2 / 4,3 (reprova)** |
| `ink` 50% | 5,4 / 5,1 | **3,1 / 3,2 (reprova)** |
| `ink` 40% | 3,8 / 3,8 (só texto grande) | **2,4 (reprova)** |
| cores de significado | 5,5 a 15,5 | 4,7 a 7,4 |

⚠️ A mesma classe (`text-ink/50`, `text-white/50`) passa no escuro e **reprova no claro**. A regra antiga (AGENTS.md §11.2) só media o escuro.

**P1 — Tokens de texto secundário por tema.** Texto secundário usa `text-ink-muted` (2º nível: escuro 60%, claro 72%) e `text-ink-subtle` (3º nível, só texto grande ou ícone: escuro 45%, claro 58%), cada um calibrado para passar AA no seu tema. Opacidade solta em texto (`text-ink/50`) passa a ser proibida em código novo ou tocado. ⚠️ Os dois tokens ainda serão criados em `src/index.css` (B47).

---

## 3. Tipografia

### 3.1. Fontes ✅

* **Inter** para texto e interface; **Outfit** para títulos de destaque (display). Proibida uma terceira fonte.
* Campos de formulário com 16 px no celular (evita o zoom do iOS) ✅.

**P2 — Menos pesos de fonte.** Hoje são carregados 11 arquivos (Inter 300–800 e Outfit 300–800), por um `@import` dentro do CSS, o que atrasa o texto na primeira abertura. Proposta: Inter 400, 500, 600 e 700; Outfit 600 e 700 (6 arquivos). O link das fontes sai do CSS e vai para o `<head>` com `preconnect`, e `font-display: swap` continua.

### 3.2. Escala de tamanhos

⚠️ Hoje há mais de 20 tamanhos soltos (`text-[13px]` 213 vezes, `text-[15px]` 141, `text-[10px]` 91, e `text-[8px]`/`text-[9px]` em 20 arquivos).

**P3 — Escala fixa, com nome:**

| Classe | Tamanho / altura | Peso | Uso |
|---|---|---|---|
| `text-display` | 28 / 34 | Outfit 700 | número grande, título de destaque |
| `text-heading` | 22 / 28 | Outfit 700 | título da tela |
| `text-title` | 17 / 24 | Inter 600 | título de cartão e de folha |
| `text-body` | 15 / 22 | Inter 400–500 | texto de lista e de conteúdo |
| `text-control` | 14 / 20 | Inter 600 | botões, abas, campos |
| `text-meta` | 13 / 18 | Inter 400–500 | linha de apoio (hora, local, código) |
| `text-caption` | 12 / 16 | Inter 500 | rótulo pequeno, legenda de gráfico |

* Mínimo de 12 px em qualquer texto. 11 px só em etiqueta curta em maiúsculas. Abaixo disso é proibido.
* `tracking-tight` só em `heading` e `display`.
* Números que mudam (contadores, valores, horas) com `tabular-nums`.

---

## 4. Espaço, grade e larguras

* **Base de 4 px** ✅ (escala do Tailwind).
* **Largura legível** ✅: telas de conteúdo com `max-w-7xl mx-auto`; folhas e formulários de `max-w-md` a `max-w-lg`.
* **Grade de cartões** ✅: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
* **Safe areas** ✅: `viewport-fit=cover` e `env(safe-area-inset-*)` em barras fixas e folhas; nunca rolagem horizontal.

**P4 — Espaçamentos padrão** (medidos nas telas aprovadas da base D17 e do painel; a primeira tela migrada vem em print para conferir):

| Onde | Valor |
|---|---|
| margem lateral da tela | 16 px no celular, 24 px do `md:` em diante |
| entre cartões de uma lista | 12 px |
| dentro do cartão | 16 px |
| dentro da folha | 24 px |
| entre seções da tela | 24 px, com título de seção em `text-meta` |

---

## 5. Forma, superfícies e elevação

### 5.1. Superfícies ✅

* Cartão sólido (`bg-surface border border-line`), borda e sombra quase invisíveis. No claro, sombra de 1 px.
* **Vidro (desfoque) só em barras fixas e em folhas sobre o conteúdo.** Nunca em cartão de lista.
* Folhas: fundo `bg-sheet` e blocos `bg-sheet-card border border-sheet-card-line` (D26).

### 5.2. Cantos

⚠️ Hoje há 11 valores em uso. O `GlassCard` usa `rounded-[2.5rem]` (40 px), contra os 20 px das telas aprovadas.

**P5 — Quatro raios, com nome:**

| Token | Valor | Uso |
|---|---|---|
| `rounded-control` | 12 px (`xl`) | botão, campo, item de menu |
| `rounded-card` | 20 px | cartão, foto do cartão |
| `rounded-sheet` | 24 px (`3xl`) | folha e diálogo |
| `rounded-full` | pílula | abas, etiqueta, avatar, interruptor |

Saem `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]` e os tokens `--radius-arredondados*`.

### 5.3. Camadas (z-index) ✅

Só pela escala `Z_INDEX` (`base`, `card`, `header`, `bottomNav`, `banner`, `dropdown`, `overlay`, `modal`, `modalNested`, `popover`, `toast`, `criticalAlert`). Proibido número solto (`z-[130]`). Hoje nenhum arquivo usa número solto.

---

## 6. Ícones e imagens

### 6.1. Ícones

* ✅ Só `lucide-react`. Botão só com ícone tem `aria-label` traduzido; ícone decorativo tem `aria-hidden`.

**P6 — Três tamanhos:** 16 px junto de texto `meta`/`control`; 20 px em linhas de lista e botões; 24 px na barra inferior e no topo. 28–32 px só em estado vazio e ilustração. Traço padrão do lucide. Hoje há 8 tamanhos em uso.

### 6.2. Imagens ✅

* Foto do item no cartão sempre que houver; sem foto, ícone do tipo de serviço.
* `width`/`height` ou `aspect-ratio` definidos (nada de pulo de layout); `loading="lazy"` fora da primeira dobra; formatos modernos (WebP), no tamanho em que a imagem é exibida.
* `alt` traduzido; foto decorativa com `alt=""`.

**P7:** a imagem principal da primeira dobra (capa do anúncio, primeiro cartão da Home) usa `fetchpriority="high"` e nunca `lazy`. Proporções fixas: cartão de lista 16:10; capa do anúncio 4:3 no celular; avatar 1:1.

---

## 7. Componentes do design system

Antes de criar um componente visual genérico, o agente DEVE procurar nesta lista. Componente genérico novo nasce em `src/ui/components/` e entra nesta tabela.

| Componente | Quando usar |
|---|---|
| `BUTTON_PRIMARY` (`controls.ts`) | a ação principal; uma por tela |
| `BUTTON_SECONDARY` / `BUTTON_DANGER` / `BUTTON_POSITIVE` | ação de apoio com caixa, ação destrutiva, aprovar |
| `TextButton` | ações secundárias (tons `ink`, `accent`, `warn`, `danger`) |
| `INPUT` (`controls.ts`), `E164PhoneField`, `PhoneInputField`, `CodeBoxesInput` | campos; telefone em E.164; código de caixas |
| `Switch`, `RadioCardGroup`, `SegmentedControl` | liga/desliga; escolha entre cartões; abas em pílula com a ativa invertida |
| `Dialog` | toda folha ou diálogo: folha de baixo no celular, cartão central do `sm:` em diante |
| `ConfirmDialog` | confirmação; no lugar de `confirm()` |
| `Toast` (`sonner`) | retorno curto; no lugar de `alert()` |
| `DropdownMenu`, `Popover` | menu "…" e conteúdo flutuante |
| `StatusText` | status como texto com ponto colorido |
| `StatTile`, `ShortcutTile`, `ListRows` | número com rótulo; atalho com ícone; lista de linhas tocáveis |
| `Skeleton`, `ListLoading`, `ListEmpty`, `ListError`, `ErrorState` | estados carregando, vazio e erro |
| `MessagePage`, `NotFoundView` | página inteira de mensagem; 404 |
| `BackButton` | voltar, só com o chevron `<` |
| `Header`, `PageLayout`, `SidebarLayout`, `BottomNav` | estrutura das telas |
| `GlassCard` | cartão sólido elevado (o nome é histórico) |
| `VerifiedBadge`, `VerifiedSealButton`, `ShareButton` | selo, botão do selo, compartilhar |
| `GateModeScreen`, `useQrScanner`, `useScreenWakeLock`, `useLowBattery` | modo portaria |
| `TermsAcceptanceField`, `LegalTermsDocument` | aceite e exibição de termos |
| `lazyNamed`, `loadChunk`, `DelayedFallback`, `ScreenFallback` (`src/ui/lazy/`) | tela baixada sob demanda, com recarga única e carregando só depois de 150 ms |

⚠️ **Divergências encontradas:**

* `ModalLayout` abre com mola e escala 0,9: uma segunda linguagem de modal, ao lado do `Dialog`. Está em 3 arquivos.
* `Skeleton` usa `bg-white/5 border-white/5` em vez de tokens.
* Os controles de zoom do mapa usam `bg-white/5 text-white`.
* `.glassmorphism-vibrant` (vidro com brilho) está em 11 arquivos, em lugares que não são barra fixa nem folha.
* `--liquid-gradient`, `--glass-bg` e `--glass-border` sobram no CSS.

**P8:** migrar `ModalLayout` para `Dialog` e apagá-lo; `Skeleton` e mapa com tokens; `.glassmorphism-vibrant` só onde a regra 5.1 permite; apagar as variáveis que sobram.

---

## 8. Padrões de tela ✅

* **Topo:** `BackButton` (chevron) à esquerda, título da tela, no máximo uma ação em ícone à direita. Barra fixa com vidro só quando o conteúdo rola por baixo.
* **Topo de uma folha com várias telas (D33):** barra fixa da folha, fora das páginas: `<` à esquerda em **todas** as telas, na mesma altura (na primeira, fecha a folha), título centralizado em `text-title` (cortado com reticências entre o `<` e a ação da direita) e no máximo uma ação em ícone à direita.
* **Perfil (D33):** o menu do perfil abre como folha de baixo, com o fundo virando cartão (substitui o menu lateral da D19; o conteúdo continua o mesmo). A primeira tela da folha tem o título "Perfil".
* **Cartão:** foto ou ícone, o que é (título), quando (linha `meta`), identificador discreto logo abaixo do nome (ex.: código do pedido), e no máximo uma linha separada por divisória com o que fazer agora.
* **Listas longas e filas:** lista compacta (título, contexto, status, valor); detalhe e decisão na folha.
* **Abas no lugar de listas longas** (ex.: Próximas / Anteriores), com `SegmentedControl`. Trocar de aba não desliza.
* **Formulário:** rótulo acima do campo; erro abaixo, em `text-danger`, traduzido; ação principal no fim ou fixa embaixo no celular.
* **Valores:** moeda, data e número sempre por `Intl`, no idioma ativo e no fuso do estabelecimento (AGENTS.md §12.4). Valor de dinheiro sempre do backend (AGENTS.md §11).
* **Estados obrigatórios** em toda tela com dados (todo hook assíncrono expõe `data`, `loading` e `error`): carregando (skeleton com a forma do conteúdo), vazio (frase e, se houver, a ação para sair do vazio), erro (com "Tentar de novo") e sem internet (`useConnection`).
* **Retorno:** `Toast` para confirmação curta, `ConfirmDialog` para o que não se desfaz. `alert()`, `confirm()` e `prompt()` são proibidos.
* **Dados fictícios:** proibido texto fixo com aparência de dado real (AGENTS.md §2.2.7 e §11.10).

---

## 9. Movimento, gestos e navegação

### 9.1. Linguagem de movimento (aprovada em 2026-11-14, D33)

Medida quadro a quadro no vídeo de referência do responsável do produto (`docs/design/movimento-2026-11/`): abrir página, voltar e abrir a folha seguem a **mola padrão** — criticamente amortecida, sem quique, ω = 18,4/s (`motion`: `stiffness: 340, damping: 37, mass: 1`), metade do caminho em ~75 ms, 90% em ~200 ms e parada em ~350 ms. Em CSS, a mola é a função `linear()` gerada de `src/ui/motion/tokens.ts`, com `cubic-bezier(0.25, 1, 0.5, 1)` em 440 ms como reserva.

| O quê | Como | Tempo |
|---|---|---|
| Abrir página (push) | a nova entra da direita (100% → 0); a anterior recua 26% para a esquerda e recebe o véu `recede` | mola padrão |
| Voltar | o inverso | mola padrão |
| Folha (abrir) | sobe da borda inferior até logo abaixo da área segura; o fundo vira **cartão**: escala 0,9, desce até a área segura, cantos de 12 px (`rounded-control`) e véu `recede`, com preto atrás | mola padrão |
| Folha (fechar) | desce; o fundo volta ao tamanho e perde o véu | mola padrão (pelo arraste, com a velocidade do dedo) |
| Barra do topo da folha | o `<` fica parado, na mesma altura em todas as telas; o título, centralizado (`text-title`), entra e sai junto com a página, no mesmo movimento | o da página |
| Diálogo (do `sm:`) | aparece com escala de 0,96 e fade | 200 ms entrada / 150 ms saída, `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Véu e fade | opacidade | 180 ms entrada / 150 ms saída |
| Trocar de aba | sem deslizar; o conteúdo troca na hora | — |
| Toque | `press`: escala 0,97, sem destaque azul, `touch-action: manipulation` | 150 ms |

Regras ✅:

* Saída pelo `data-state` do Radix.
* **Um efeito por propriedade em cada elemento:** não somar `press` com `whileTap`, `whileHover` ou `active:scale-*`.
* Animar só `scale`, `translate` e `opacity`. Nunca `transform` em elemento já centralizado por `transform`.
* "Reduzir movimento" (D33): `MotionConfig reducedMotion="user"` na raiz (já existe). Com ele ligado, o que é automático (abrir página, voltar, abrir e fechar folha) troca com **esmaecido de 150 ms**, sem deslizar nem mudar de escala; o que a própria pessoa arrasta continua seguindo o dedo e, ao soltar, termina com o esmaecido.
* Sem desfoque atrás das folhas (D33): o véu `scrim` basta e pesa menos no celular.
* Ao abrir um diálogo o foco vai para o diálogo, sem anel num botão que a pessoa não tocou.

**P9 — Animar só o que o navegador compõe barato:** proibido animar `width`, `height`, `top`, `left`, `margin` e `padding`, porque essas animações engasgam no celular. Para expandir e recolher, usar `grid-template-rows` ou o `layout` do motion. ⚠️ A barra do leitor da portaria anima `top`; trocar por `translate`.

**P10 — Movimento num lugar só:** mola, duração e curva vêm de `src/ui/motion/tokens.ts` (`SPRING`, `DURATION`, `EASE`, `RECEDE`), e as peças `PushStack` (páginas com barra do topo fixa) e `StackSheet` (folha com o fundo virando cartão) ficam no design system. Ninguém mais escreve duração ou curva solta. ⚠️ Hoje a entrada de página está copiada em `PartnersModal`, `ListingDetailPage` e `MyBookingsView` (B50).

### 9.2. Gestos

**P18 — Gestos de app nativo.**

* **Folha (D33):** arrastar para baixo de **qualquer ponto da folha**, em qualquer tela da pilha, fecha a folha inteira; na próxima abertura ela começa da primeira tela. O conteúdo que rola tem prioridade: só fecha arrastando quando ele já está no topo. Solta antes de um terço da altura (e devagar), a folha volta; passou disso ou foi um arraste rápido, fecha. Para cima, estica um pouco com resistência.
* **Página aberta por cima (push) (D33):** arrastar da esquerda para a direita volta uma tela, de **qualquer ponto da tela, menos começando em cima de um botão** (ali o arrasto não faz nada: nem volta, nem aciona o botão). A página acompanha o dedo e a anterior aparece por baixo. Solta antes da metade (e devagar), ela volta para o lugar. O que rola para o lado (carrossel, mapa, recorte de foto) tem prioridade sobre o gesto.
* Durante o arraste o véu e a página de trás acompanham a posição do dedo.
* Movimento de mais de 8 px vira arraste e cancela o toque: arrastar nunca aciona o que estava embaixo do dedo.
* No Safari aberto no navegador (fora do app instalado), o arrasto que começa bem na borda é do próprio navegador e vira "voltar" pelo histórico (P19), com o mesmo resultado.
* Com "reduzir movimento" (D33), o gesto continua seguindo o dedo (é a própria pessoa que move); ao soltar, termina com o esmaecido de 150 ms.
* Todo gesto tem alternativa em botão: o `<` em todas as telas volta uma tela e, na primeira, fecha a folha.
* ⚠️ Hoje só o menu lateral fecha arrastando (`useSwipeToClose`); as folhas (`Dialog`) e as páginas não.

**P20 — Mola no que o dedo conduz.** Movimento comandado pelo dedo (arrastar folha, voltar pela borda, puxar para atualizar) termina com mola e herda a velocidade do dedo; pode ser interrompido no meio (tocar de novo segura a página onde está). O que abre por toque segue a tabela 9.1, com a mesma mola padrão.

### 9.3. Navegação e voltar

**P19 — Toda camada no histórico.** Cada página, folha ou diálogo aberto cria uma entrada no histórico do navegador. O botão voltar do Android, o gesto de voltar do iPhone e o voltar do navegador fecham sempre a camada de cima (folha → página → tela anterior), nunca saem do app de uma vez. Fechar pelo `X`, pelo arraste ou pelo `BackButton` também tira a entrada do histórico, para o voltar seguinte não reabrir a camada. Telas que podem ser compartilhadas (anúncio, evento) têm a URL própria; folhas de ação (confirmar, filtros) entram no histórico sem mudar a URL visível. ⚠️ Hoje só o menu lateral e o anúncio estão no histórico; as folhas e as páginas internas do painel abrem só por estado e precisam ser conferidas no teste.

**P23 — Cada aba guarda o seu lugar.** Trocar de aba na barra inferior e voltar mantém a rolagem e a página que estava aberta naquela aba. Tocar na aba já ativa leva ao topo dela e, se houver página aberta, volta à raiz da aba (como no iPhone). Voltar de uma página devolve a rolagem exata de onde a pessoa saiu.

---

## 10. Fluidez e desempenho percebido

### 10.1. Metas ✅

Metas no p75 do celular: **LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1**. Rotas e modais pesados (mapa, gráficos, checkout Stripe) DEVEM carregar sob demanda (`React.lazy`).

⚠️ O arquivo inicial tem 531 KB comprimidos (antes 993 KB); as telas, o menu, o mapa, o gráfico e os idiomas en/fr já são baixados sob demanda. O que sobra é quase todo Firestore, React e Motion (B46).

### 10.2. Regras novas

* **P11 — Divisão por rota (obrigação que já existe, ainda não cumprida).** Ficam no arquivo inicial só tema, idioma, roteador, autenticação, a estrutura (topo e barra inferior) e a Home. Saem para arquivos sob demanda:
  * painel do parceiro;
  * painel do admin;
  * checkout e Connect do Stripe;
  * mapa (Leaflet);
  * gráficos (Recharts);
  * leitor de QR e modo portaria;
  * recorte de imagem;
  * licenças;
  * páginas legais.

  Meta: arquivo inicial abaixo de 450 KB comprimido, revista quando houver medição de celulares reais.
* **P12 — Pré-carregar antes do toque.** O código da próxima tela provável carrega ao tocar (`touchstart`), passar o mouse ou focar no link; os dados entram junto quando a tela já tem leitura em cache do Firestore. Não pré-carregar tudo.
* **P13 — Estrutura antes dos dados.** O topo, a barra inferior e o skeleton aparecem antes de o login ser confirmado ou de o primeiro snapshot chegar. Rotas públicas nunca esperam o login.
* **P14 — Resposta otimista só no que é seguro.** Favoritar, marcar como lida e trocar filtro mudam na tela na hora e desfazem se o servidor recusar. Nunca em dinheiro, estoque, check-in, cancelamento ou reembolso: ali vale o servidor, com o botão em "carregando".
* **P15 — Skeleton só quando demora.** Mostrar o skeleton depois de ~150 ms (o que chega antes não pisca) e com a forma do conteúdo real. Spinner só dentro de botão.
* **P16 — Ícone e cores do app instalado iguais ao tema.** ⚠️ O manifesto PWA usa `theme_color` e `background_color` `#000000`, mas o fundo do app é `#0d0e10`: na abertura do app instalado há uma troca de cor visível. Alinhar com `#0d0e10`.

### 10.3. Comportamento de app nativo no navegador

**Limites da plataforma web** (o que não dá para fazer e como o app lida):

| Limite | Onde | Como o Use Guide lida |
|---|---|---|
| Sem vibração ao toque | iPhone | vibração só como extra no Android; nenhuma informação depende dela |
| Push só com o app instalado na Tela de Início (iOS 16.4+) | iPhone | P22 ensina a instalar; avisos importantes também aparecem na central de notificações |
| Sem convite automático de instalação | iPhone | P22 |
| Dados guardados podem ser apagados depois de dias sem uso, com o app não instalado | Safari | instalar protege; a lista da portaria avisa quando precisa baixar de novo |
| O gesto de voltar do Safari é do navegador | iPhone no navegador | P19 |
| Sem barra do navegador no app instalado | iPhone e Android | toda tela tem o `BackButton` |
| Teclado cobre o que está fixo embaixo | iPhone e Android | P21 |
| Toque longo abre menu do sistema | iPhone | P24 |
| Sem tarefas com o app fechado | iPhone | sincronizações (lista da portaria, envios pendentes) rodam ao abrir o app |
| Primeira abertura depende de baixar o código | todos | P11, P12 e o service worker |

**P21 — Teclado sem cobrir a ação.** O viewport declara `interactive-widget=resizes-content`, para a tela encolher quando o teclado abre. A ação principal fixa embaixo sobe junto com o teclado e nunca fica escondida; o campo com foco rola até ficar visível acima dele. O botão "Ir/Enviar" do teclado envia o formulário quando é o último campo. ⚠️ Hoje nada trata o teclado.

**P22 — Convite para instalar o app.** No Android, usa o convite do próprio navegador (`beforeinstallprompt`), oferecido num momento útil (depois da primeira compra ou ao ativar avisos), nunca na primeira abertura. No iPhone, uma folha curta mostra os três passos de "Adicionar à Tela de Início", oferecida quando a pessoa tenta ativar avisos, porque sem instalar os avisos não chegam. Recusou, não aparece de novo por 30 dias; com o app já instalado, nunca aparece. Por ser tela nova, vem em print antes do código.

**P24 — Toque longo e seleção.** Botões, cartões, abas, ícones e fotos de cartão não abrem o menu do sistema no toque longo (`-webkit-touch-callout: none`) nem selecionam texto (`select-none`). Texto de conteúdo (descrição, endereço, código do pedido, termos) continua selecionável e copiável. Fotos da galeria do anúncio podem ser salvas.

**Já existe ✅:** tela de ponta a ponta (`viewport-fit=cover`), modo app instalado com barra de status translúcida no iPhone, `theme-color` por tema, service worker, push pelo Firebase, tela acesa na portaria, toque sem atraso, puxar para atualizar no Explorar, folhas que não arrastam a tela de trás (`overscroll-contain`), cache local do Firestore e compartilhar pelo menu do sistema.

---

## 11. Acessibilidade ✅ (WCAG 2.2 AA)

* Contraste: texto normal ≥ 4,5:1; texto grande (≥ 24 px, ou ≥ 18,66 px em negrito) e ícone informativo ≥ 3:1. Medido **nos dois temas** (ver 2.3 e P1). Sobre vidro, medir com a cor efetiva do fundo.
* Área de toque ≥ 44×44 px (`min-h-11`); 48×48 px em ações principais. O ícone pode ser menor; a área não.
* Foco visível: `focus-visible:ring-2 focus-visible:ring-teal-400/50`; proibido `outline-none` sem substituto.
* Botão só com ícone → `aria-label` traduzido; texto escondido por design → `sr-only`.
* Modais: foco preso, `Esc` fecha, foco volta ao gatilho (Radix).
* Cor nunca é a única pista: status tem texto, erro tem mensagem.
* Respeitar "reduzir movimento" (seção 9).
* **P17:** a tela continua usável com o texto do sistema em 200%: nada cortado, sem rolagem horizontal, botões crescem em altura.

---

## 12. Responsividade ✅

| Prefixo | A partir de | Uso |
|---|---|---|
| (base) | 0 | celular, layout de referência |
| `sm:` | 640 px | celular grande, tablet pequeno; folhas viram cartão central |
| `md:` | 768 px | tablet |
| `lg:` | 1024 px | desktop pequeno |
| `xl:` | 1280 px | desktop |

* Informação funcional nunca existe só num tamanho maior.
* Francês e inglês ficam até 30% mais longos: nada de largura fixa em texto; testar toda tela nova em `fr` (AGENTS.md §12.3).

---

## 13. Texto na interface

* Toda palavra visível passa pelo i18n nos três idiomas (regras completas no AGENTS.md §12).
* Tom neutro, curto e de confiança; sem jargão técnico ("sessão", "token", "webhook" não aparecem para quem usa o app).
* Botão diz o que acontece ("Pagar R$ 120,00", "Liberar entrada"), não "OK" ou "Enviar".
* Erro diz o que houve e o que fazer.
* Hora de serviço no fuso do estabelecimento, com o fuso indicado quando a pessoa estiver em outro.

---

## 14. Processo

1. Tela nova ou mudança visível: print (celular escuro, celular claro e, quando fizer sentido, desktop e `fr`) aprovado antes do código.
2. A referência aprovada fica em `docs/design/` (hoje `base-d17/` e `painel-segmentos/`).
3. Arquivo tocado sai sem cor fixa, sem tamanho de texto solto e sem raio fora da escala (migração gradual, como o débito B25).
4. Mudança neste documento segue o AGENTS.md §15: texto atual, texto proposto, motivo e autorização.

### 14.1. Checklist de design do PR

- [ ] Tokens de tema; nada de `text-white`, `bg-white/x` ou hex solto
- [ ] Texto secundário com contraste AA nos dois temas
- [ ] Tamanhos da escala; nada abaixo de 12 px
- [ ] Raios da escala; z-index da `Z_INDEX`
- [ ] Componente do design system quando existe
- [ ] Uma ação principal; o resto em texto
- [ ] Estados carregando, vazio, erro e sem internet
- [ ] Toque ≥ 44 px, foco visível, `aria-label`
- [ ] Movimento da tabela 9.1, um efeito por propriedade, "reduzir movimento"
- [ ] Folha fecha arrastando; página volta pela borda; camada nova entra no histórico e o voltar fecha só ela
- [ ] Aba mantém rolagem e página; voltar devolve a rolagem
- [ ] Teclado não cobre a ação principal; toque longo sem menu do sistema em botões e cartões
- [ ] Tela pesada carregada sob demanda; imagem com dimensão
- [ ] Testado em celular, desktop, claro, escuro e `fr`

---

## 15. Débitos de design conhecidos

Registrados em `docs/arquitetura/debitos.md` (branch de documentação).

| Débito | Regras |
|---|---|
| B25 — tema claro por sobrescritas `!important` (430 usos de `text-white`) | 2.1 |
| B31, B32 — abas de ingressos e do admin com cores fixas | 2.1 |
| B46 — arquivo inicial de 531 KB comprimidos (parcial); faltam `zod`, P7 e P13 | P7, P11, P12, P13, P15 |
| B47 — texto secundário reprova AA no tema claro | P1 |
| B48 — fontes, tamanhos de texto, raios e ícones fora da escala | P2, P3, P5, P6 |
| B49 — `ModalLayout`, `Skeleton`, controles do mapa, `glassmorphism-vibrant` e variáveis que sobram | P8 |
| B50 — entrada de página copiada em 3 arquivos; leitor da portaria anima `top` | P9, P10 |
| B51 — manifesto do app instalado com `#000000` | P16 |
| B52 — folhas e páginas sem gesto, fora do histórico; aba não guarda rolagem e página | P18, P19, P20, P23 |
| B53 — teclado sem tratamento; menu do sistema no toque longo | P21, P24 |
| B54 — sem convite de instalação (no iPhone o push não chega sem instalar) | P22 |
