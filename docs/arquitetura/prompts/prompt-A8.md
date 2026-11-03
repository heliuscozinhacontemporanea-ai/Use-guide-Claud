# Prompt A8 — Decisões D23, D24 e D25

> Lote 19, gerado dos commits de referência `08221c2..d324282` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A8 — Decisões D23, D24 e D25

D23 aprovada em 2026-11-01 (execução adiada); D24 e D25 aprovadas até 2026-11-03, com a revisão das telas, o silêncio das 23h30 às 5h30 e o adiamento do aviso de evento para favoritos.

~~~~text
Este prompt só altera documentação. Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: as regras são implementadas pelos prompts 22.1 a 23.3.

O QUE MUDA:
1) docs/arquitetura/decisoes.md: D23 (sair do AI Studio com GitHub Actions, execução adiada), D24 (Sobre o app, versão pelo package.json, Licenças e créditos) e D25 (notificações para todas as contas, central, escolhas, push, Suporte e termos sem região, com a revisão aprovada).
2) docs/arquitetura/propostas/notificacoes-suporte-termos.md: proposta aprovada (arquivo novo).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/propostas/notificacoes-suporte-termos.md (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -334,3 +334,38 @@ Aprovada pelo responsável do produto em 2026-10-31.
 * **Endereço oficial:** o link do e-mail é `https://useguide.com.br/conta/acao?mode=...&oobCode=...` (URL de ação dos modelos no console), o remetente é `noreply@useguide.com.br` (domínio personalizado no console) e o retorno (`continueUrl`) é sempre `https://useguide.com.br`, inclusive no AI Studio; só o teste local (`localhost`) volta para o próprio endereço. A mesma página trata a nova senha (`mode=resetPassword`); `/reset-password` deixa de existir.
 * **Onde exige e-mail confirmado:** comprar ingresso, reservar passeio, aluguel, translado ou entrada, cadastrar-se como parceiro, receber ingresso pelo @ e aceitar link de transferência (AGENTS.md §7.10, A07). O backend recusa com `EMAIL_NOT_VERIFIED` (403); o app abre o aviso. No cadastro de parceiro com conta nova, o cadastro para até a confirmação e continua ao enviar de novo, já logado.
 * **Token:** depois da confirmação o app relê a conta e renova o ID token, porque o backend lê `email_verified` do token. O app também relê ao voltar para a tela (link aberto em outra aba ou no celular).
+
+## D23 — Sair do AI Studio: GitHub Actions publica direto em produção (aprovada em 2026-11-02, execução adiada)
+
+Aprovada pelo responsável do produto em 2026-11-02. **Ainda não implementar:** o AI Studio continua como ambiente de desenvolvimento enquanto o plano pago dele estiver em vigor. Retomar quando o responsável pedir.
+
+* **Um ambiente só (até a liberação):** o projeto atual (`gen-lang-client-0788355965`) e `useguide.com.br`; sem projeto de teste. A prévia é o próprio site no ar, depois do merge.
+* **Fluxo:** Claude escreve numa branch por tarefa (`claude/<tema>`) e abre PR para `main`; o GitHub Actions roda os gates em cada push (typecheck, lint, testes, build, regras no emulador); o responsável aprova fazendo o merge (ou autoriza Claude a fazer); no merge, o Actions publica Cloud Run e depois Hosting, sem aprovação extra. Ninguém escreve direto na `main` (proteção: só por PR com gates verdes).
+* **Artefato único:** build no Actions, imagem com servidor e `dist` (Dockerfile novo) publicada no Cloud Run e o mesmo `dist` no Hosting; `.gcloudignore` sem `.env*`, `node_modules`, `.git`, `dist` e `docs`.
+* **Credenciais:** Workload Identity Federation (sem chave JSON), conta de publicação só com papéis de publicação e acesso restrito a este repositório e à branch `main`. Segredos continuam no Secret Manager.
+* **Condições:** Stripe em modo teste (`sk_test_`) até a liberação; na data de liberação, rever o modelo (prévia por PR com revisão sem tráfego do Cloud Run e canal de prévia do Hosting, ou projeto de teste separado).
+* **Ao executar:** abrir PR da `claude/agents-md-v2` para `main`; depois, PR de limpeza do que é só do AI Studio (testes de host `ais-`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `firebase-applet-config.json`) e proposta de mudança do AGENTS.md §2 e do fluxo de entrega (com autorização antes de editar). Descarta a S19 (deploy pelo AI Studio com gcloud).
+
+## D24 — Sobre o app, versão do app e licenças (2026-11-03)
+
+Aprovada pelo responsável do produto em 2026-11-03.
+
+* **Sobre o app:** uma tela só. Abaixo do ícone, só "Versão X.Y.Z"; descrição neutra dos serviços (sem prender o app a uma região: o plano é cobrir o Ceará e depois o Brasil); itens Termos e políticas (uso, compras e cancelamento, privacidade), Termos do parceiro e Licenças e créditos; © com o ano corrente do aparelho.
+* **Versão:** o campo `version` do `package.json`, alterado à mão a cada lançamento, gravado no build do site (Vite) e do servidor (esbuild). Sem número de build nem revisão do Cloud Run no app; sai a rota `/api/version`, e `/api/health` devolve só `status` e `version`.
+* **Licenças e créditos:** créditos de trabalhos de terceiros (animação do hamster, MIT) e as bibliotecas de produção com o texto da licença, geradas por `npm run licenses` (um teste falha se ficar desatualizado).
+* **Notificações do parceiro:** em Configurações › Notificações, não mais em Sobre o app.
+
+## D25 — Notificações para todas as contas, Suporte e termos sem região (2026-11-03)
+
+Aprovada pelo responsável do produto em 2026-11-03 (proposta em `docs/arquitetura/propostas/notificacoes-suporte-termos.md`, aprovada inteira).
+
+* **Catálogo:** avisos para todas as contas (compras e pagamentos, ingressos, reservas, avaliações, conta e segurança, novidades opcionais) e, para parceiros, vendas, operação, financeiro, avaliações, cadastro e mensagens do Use Guide. Compras e pagamentos, conta e segurança e operação aparecem sempre na central; o push de cada categoria pode ser desligado. Novidades nascem desligadas (LGPD).
+* **Central de notificações** para todas as contas, com contador, "Hoje / Antes", marcar como lidas e link para o ingresso, a reserva ou o painel certo; avisos apagados depois de 90 dias.
+* **Configurações › Notificações** para todas as contas: estado do push no aparelho (ativo, bloqueado, não suportado, "instale na Tela de Início" no iPhone), interruptor por categoria, seção Parceiro, silêncio noturno das 22h às 8h (Fortaleza; avisos com prazo furam o silêncio) e resumo diário de vendas para parceiros.
+* **Push:** Firebase Cloud Messaging (sem fornecedor novo), permissão só depois de um toque; tokens por aparelho só no backend, apagados ao sair da conta neste aparelho, na exclusão de conta e quando o FCM recusar. E-mail fica fora desta fase.
+* **Arquitetura:** aviso gravado como tipo + parâmetros, traduzido no idioma de quem recebe (§12.5); outbox na mesma transação do evento e job de envio idempotente (§5.6); `notifications` vira domínio folha.
+* **Suporte:** busca, atalhos (problema com uma compra, ingressos, reservas, conta), temas, perguntas traduzidas a partir das regras reais, e-mail único `ajuda@useguide.com.br` e WhatsApp.
+* **Termos:** termos de uso sem região ("destinos turísticos no Brasil") e parágrafo de privacidade sobre o identificador do aparelho; versão dos termos de compra 2026-11-03 (compras novas pedem o aceite de novo).
+* **Revisão das telas (aprovada em 2026-11-03, substitui os interruptores por categoria, o silêncio noturno e o resumo diário como interruptor):** avisos que evitam perder um serviço, um prazo ou dinheiro chegam sempre, sem interruptor — compras e pagamentos, ingressos e reservas, conta e, para o parceiro, cancelamentos, reclamações, avaliações dos clientes, repasses e cadastro. A pessoa escolhe só **Pedidos de avaliação** (ligado) e **Novidades e ofertas** (desligado); o parceiro escolhe **aviso a cada venda** ou **resumo no fim do dia**. Avisos opcionais nunca chegam das 23h30 às 5h30 (Fortaleza; ajustado em 2026-11-03 a pedido do responsável do produto). Central com filtro "Não lidas / Tudo", menu "…" (Configurações, marcar todas como lidas) e "Você está em dia". Suporte como central de ajuda (saudação com busca, compras, assuntos, perguntas mais lidas, contato). Textos para quem usa o app, sem termos técnicos; visual da base D17 (ícones neutros, cor só com significado). Referências: Airbnb, Tripadvisor, Apple HIG.
+* **Adiado (2026-11-03):** aviso de evento novo para quem favoritou o lugar ou o organizador. O evento não aponta para um lugar do guia; a forma (pelo dono, pelo lugar escolhido no cadastro do evento ou "seguir o organizador") fica para decisão futura. Quando vier, entra como aviso opcional de Novidades.
+* **Avisos implementados (23.2 a 23.3):** 36 tipos gravados como tipo + dados, traduzidos no app e no push (textos espelhados com teste de paridade); fila de envio (outbox) com job a cada minuto, lembretes a cada 15 min (véspera e 2 h antes), resumo de vendas às 20h e convite para avaliar (único opcional hoje). Troca de senha e confirmação de e-mail não geram aviso (acontecem no Firebase Auth, sem passar pelo backend).

=== docs/arquitetura/propostas/notificacoes-suporte-termos.md — ARQUIVO NOVO, conteúdo completo ===
# Proposta — Notificações para todos, Suporte e texto novo dos termos (2026-11-03)

Status: **em aberto** (aguarda aprovação do responsável do produto; não implementar antes).

## 1. Notificações push no navegador

| Navegador | Push | Observação |
|---|---|---|
| Chrome, Edge, Opera (computador e Android) | Sim | via Firebase Cloud Messaging (FCM) |
| Samsung Internet (Android) | Sim | |
| Firefox (computador e Android) | Sim | |
| Safari no Mac (macOS 13 Ventura ou mais novo) | Sim | |
| iPhone e iPad (iOS/iPadOS 16.4 ou mais novo) | Só com o app instalado na Tela de Início (PWA) | vale para Safari, Chrome e Edge no iPhone; o pedido de permissão precisa de um toque da pessoa |
| Navegador padrão antigo do Android | Não | |

Requisitos: HTTPS (já temos), service worker (já temos pelo PWA), chave VAPID do Firebase, permissão pedida só depois de um toque (nunca ao abrir o app).

## 2. O que existe hoje

- Avisos gravados no Firestore (`notifications`) por 13 pontos do backend: venda de ingresso, nova reserva, evento cancelado/adiado, ingresso recebido/devolvido/entregue por link, QR trocado, prestador chegou, ausência, reembolso, relato em análise, reclamação, avaliação recebida, plano vencendo, falha na renovação.
- **Só o parceiro vê:** o sininho existe apenas no painel do parceiro. Os avisos gravados para compradores (ingresso recebido, QR trocado, evento adiado/cancelado, prestador chegou, reembolso) nunca aparecem.
- Textos fixos em português no servidor (o AGENTS.md §12.5 pede no idioma de quem recebe); quase todos com o tipo genérico `admin_message`; o domínio `notifications` importa `partners` (deveria ser folha, §5.4).
- Sem push e sem e-mail.

## 3. Catálogo proposto (todas as contas)

Legenda: **H** já gravado hoje · **N** novo · **Obrig.** aparece sempre na central (push pode ser desligado).

**Para quem compra (todas as contas)**
| Categoria | Aviso | |
|---|---|---|
| Compras e pagamentos (Obrig.) | Pagamento confirmado (ingresso ou reserva) | N |
| | Pix aguardando pagamento / reserva expirou sem pagamento | N |
| | Reembolso feito / reembolso parcial | H (parcial) |
| Ingressos | Você recebeu um ingresso (por @ ou link) | H |
| | Ingresso devolvido / link aceito | H |
| | QR trocado pelo titular | H |
| | Evento adiado ou cancelado (com reembolso) | H |
| | Lembrete: amanhã e 2 h antes, com endereço e código INGR liberado | N |
| | Vaga na lista de espera | N |
| Reservas | Reserva confirmada | N |
| | Lembrete na véspera e 2 h antes, com ponto de encontro e código | N |
| | O prestador chegou ("Cheguei") | H |
| | Horário remarcado ou cancelado pelo prestador | H (parcial) |
| | "O serviço aconteceu?" (resposta em 72 h) | N |
| | Andamento da reclamação | H |
| Avaliações | O estabelecimento respondeu sua avaliação | N |
| | Convite para avaliar depois do serviço | N |
| | Resultado da sua denúncia | N |
| Conta e segurança (Obrig.) | E-mail confirmado; @ alterado; senha alterada | N |
| Novidades (opcional, desligado por padrão — LGPD) | Evento novo num lugar favorito; dicas da temporada | N |

**Para parceiros (além do acima)**
| Categoria | Aviso | |
|---|---|---|
| Vendas | Nova venda de ingresso; nova reserva; cancelamento pelo cliente | H (parcial) |
| Operação (Obrig.) | Cliente diz que você não compareceu (prazo de 2 h); reclamação aberta; contestação no cartão | H (parcial) |
| Financeiro | Repasse liberado; multa ou dívida; conta Stripe com pendência; falha na renovação; plano vencendo | H (parcial) |
| Avaliações | Nova avaliação; resultado de denúncia de resposta | H (parcial) |
| Cadastro | Estabelecimento verificado ou recusado; força maior aceita ou recusada | N |
| Mensagens do Use Guide | Mensagens do admin | H |

## 4. Configurações › Notificações (para todos)

1. **Neste aparelho:** estado (ativadas, bloqueadas no navegador, não suportado, ou "instale na Tela de Início" no iPhone) e botão "Ativar notificações".
2. **Por categoria:** um interruptor de push por categoria; as obrigatórias mostram "sempre na central".
3. **Seção Parceiro** (só parceiros): Vendas, Operação, Financeiro, Avaliações, Cadastro.
4. **Silêncio noturno** (sugestão): das 22h às 8h (horário de Fortaleza), sem push; tudo fica na central. Avisos com prazo (ausência do prestador) furam o silêncio.
5. **Resumo diário para parceiros** (sugestão): uma notificação por dia com vendas e reservas, em vez de uma por venda.

## 5. Central de notificações (para todos)

Sininho no topo do app com contador; lista "Hoje / Antes"; tocar abre o ingresso, a reserva, a avaliação ou o painel certo; "marcar todas como lidas"; avisos apagados depois de 90 dias.

## 6. Arquitetura

- Aviso gravado como **tipo + parâmetros** (sem texto pronto); o app traduz no idioma ativo e o push sai no idioma salvo da pessoa (§12.5).
- **Outbox** (§5.6): o aviso nasce na mesma transação do evento; um job envia o push com idempotência e respeita categoria e silêncio.
- Tokens de push por aparelho em coleção só do backend; apagados na exclusão de conta e quando o FCM recusa.
- `notifications` vira domínio folha (para de importar `partners`).
- E-mail: fora desta fase (pediria fornecedor novo, §15).

## 7. Suporte (reformulação)

Hoje: textos fixos em português, cores fixas do tema escuro, 6 perguntas (nenhuma sobre compra, ingresso ou reembolso), categoria "kitesurf", e-mail `atendimento@` diferente do `ajuda@` dos termos.

Proposta (referência: centrais de ajuda de Airbnb, Tripadvisor e GetYourGuide):
1. Busca "Como podemos ajudar?".
2. Atalhos: "Problema com uma compra" (abre Compras, onde já existe Relatar problema), "Meus ingressos", "Minhas reservas", "Conta e acesso".
3. Temas: Compras e pagamentos · Ingressos e QR Code · Reservas e passeios · Cancelamento e reembolso · Conta e segurança · Para parceiros · App e notificações.
4. Perguntas novas, traduzidas (pt-BR, en, fr), tiradas das regras reais (D14–D22).
5. Contato: WhatsApp e e-mail únicos, com prazo de resposta; "Informar problema no app" já com a versão do app.

## 8. Texto novo dos termos (D15)

Termos de uso, 2º parágrafo:
- **Atual:** "O Use Guide reúne informações, mapas e recomendações sobre Jericoacoara, Preá e Barrinha de Baixo, e vende ingressos, passeios e entradas de organizadores e estabelecimentos cadastrados."
- **Proposto:** "O Use Guide reúne informações, mapas e recomendações de destinos turísticos no Brasil e vende ingressos, passeios, aluguéis, traslados e entradas de organizadores e estabelecimentos cadastrados."

Privacidade, parágrafo novo (por causa do push):
- **Proposto:** "Se você ativar as notificações, guardamos um identificador do aparelho para enviá-las. Você pode desativar a qualquer momento em Configurações › Notificações ou no navegador; o identificador é apagado quando você sair da conta neste aparelho ou excluir a conta."

Efeito: nova versão dos termos de compra (`BUYER_TERMS_VERSION`); compras novas pedem o aceite da versão nova; pedidos antigos seguem a versão aceita.

VERIFICAÇÃO: nenhum código muda; não precisa rodar testes. Confira só que os dois arquivos ficaram iguais ao diff.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
