# Prompt A7 — AGENTS.md (S18 e §7.8) e decisões D20 e D21

> Lote 18, gerado dos commits de referência `a94137d..fef8a57` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A7 — AGENTS.md (S18 e §7.8) e decisões D20 e D21

S18 aprovada em 2026-10-30; mudança do §7.8 autorizada no mesmo período; D20 e D21 aprovadas até 2026-10-31. Substitui a versão anterior do A7, que ainda não tinha sido enviada. Aplique antes dos prompts 21.x.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S18 e §7.8). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: as regras são implementadas pelos prompts 21.1 a 21.7d.

O QUE MUDA:
1) AGENTS.md §7.7 (S18): exceção ao mínimo de 128 bits para o código curto de check-in (6 caracteres nas reservas; 8 no ingresso e na entrada de atração, junto do QR).
2) AGENTS.md §7.8: a chave do QR do ingresso passa a ser TICKET_QR_PRIVATE_KEY_PEM (Ed25519), sem OFFLINE_CHECKIN_*.
3) docs/arquitetura/decisoes.md: D20 (check-in de reservas e ingressos por código e QR, repasse com prova do serviço) e D21 (@usuário, transferência pelo @ e por link, "Problema com o QR Code?", fim das vendas, lista sem internet, modo portaria).
4) docs/arquitetura/solicitacoes-agents.md: S18.
5) docs/arquitetura/debitos.md: B35 e B36 (registrados e resolvidos).

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -400,6 +400,7 @@ Todo campo novo DEVE ser classificado antes de ser persistido. A classe define o
 |---|---|---|
 | Senhas de usuário | Firebase Auth (o backend nunca recebe nem guarda senha) | qualquer armazenamento próprio de senha |
 | Tokens opacos (QR de ingresso, convite, link de transferência, reset) | gerar com `crypto.randomBytes(≥ 16)` (≥ 128 bits); guardar só `HMAC-SHA-256` com chave do Secret Manager | guardar o token em texto puro; `Math.random()`; UUID como segredo |
+| Código curto de check-in (exceção ao mínimo de 128 bits, D20) | derivado por `HMAC-SHA-256` com chave do Secret Manager (o segredo anterior vale durante a rotação, §7.8), nunca gravado: 6 caracteres a partir do ID da reserva (passeio, aluguel, translado) ou 8 a partir do ID e da versão do ingresso (ingresso de evento e entrada de atração, junto do QR); válido só para quem gerencia a oferta ou o evento, autenticado, na janela do serviço; reserva: no máximo 5 erros por horário a cada 15 min; ingresso: 5 por pessoa da equipe a cada 15 min e 50 por sessão | usar o código fora dessa janela ou sem login; aceitá-lo por canal que não seja o painel do prestador; usar o código curto no lugar da assinatura do QR para validar sem internet |
 | Assinatura offline (check-in) | RSA-PSS SHA-256 com chave ≥ 3072 bits **ou** Ed25519; `kid` no token para rotação | RSA PKCS#1 v1.5 em código novo; chave privada no frontend |
 | Comparar segredos | `crypto.timingSafeEqual` sobre buffers de mesmo tamanho | `===` em segredos |
 | Integridade de webhook | verificação do SDK do provedor (`stripe.webhooks.constructEvent`) | verificação manual sem tolerância de tempo |
@@ -416,7 +417,7 @@ Todo campo novo DEVE ser classificado antes de ser persistido. A classe define o
 | `STRIPE_SECRET_KEY` | Secret Manager | ao suspeitar de vazamento e na troca de responsável | preferir **restricted key** com permissões mínimas |
 | `STRIPE_WEBHOOK_SECRET` | Secret Manager | a cada 12 meses (o Stripe permite período de sobreposição de até 24 h) | um segredo por endpoint |
 | `TICKET_QR_SECRET` (HMAC) | Secret Manager | a cada 12 meses, com `kid` | manter a versão anterior ativa até expirarem os ingressos emitidos com ela |
-| `OFFLINE_CHECKIN_PRIVATE_KEY_PEM` / `TICKET_QR_PRIVATE_KEY_PEM` | Secret Manager | a cada 12 meses, com `OFFLINE_CHECKIN_KEY_ID` novo | a chave pública anterior continua aceita até o fim dos eventos |
+| `TICKET_QR_PRIVATE_KEY_PEM` (Ed25519) | Secret Manager | a cada 12 meses, com `TICKET_QR_KEY_ID` novo | a chave pública anterior continua aceita até o fim dos eventos |
 | `PII_BLIND_INDEX_KEY` (HMAC) | Secret Manager | só com reindexação planejada | trocar exige recalcular todos os índices |
 | KEK de campo | Cloud KMS | automática a cada 90 dias | versões antigas ficam ativas para descriptografia |
 | Chave de job interno (legado) | Secret Manager | a cada 90 dias até migrar para OIDC (§7.9) | ≥ 32 bytes aleatórios |

=== docs/arquitetura/debitos.md — diff ===
@@ -29,6 +29,7 @@
 
 | ID | Resolução |
 |---|---|
+| B36 | 21.6 (D20): QR do ingresso `UGT1` com Ed25519 e chave própria (`TICKET_QR_PRIVATE_KEY_PEM`), que falha se faltar; o adapter RSA de 2048 bits e o `offlineTicketBundle` sem uso saíram. Assinador e código curto ficaram genéricos em `server/infrastructure/crypto`, usados por reservas e ingressos. A conferência sem internet passou a ler as chaves do manifesto (antes o formato do servidor e o da tela não batiam). |
 | B22 | Prompt 18.4a (D14): cada CNPJ aprovado vende pela própria conta Stripe Express (`paymentAccounts/{accountKey}`, `accountKey` = índice cego do CNPJ); `verificationOwners` e o "documento de vendas da conta" saíram; a conta é criada com o CNPJ da verificação pré-preenchido para o Stripe conferir a empresa |
 | B27 | Prompt 18.4c (D14): a cobrança é feita na plataforma, sem destino (separate charges and transfers); o reembolso sai do saldo da plataforma e o repasse (`payoutEntries`) é recalculado pelo valor que o proprietário fica, com a taxa de serviço fora dele. |
 | B29 | Prompt 18.4d.1 (D16): reembolso depois do repasse vira dívida do CNPJ (`post_release_refund`) pela diferença; contestação perdida sem prova depois do repasse vira dívida (`dispute_lost`). Dívida vencida é descontada dos repasses seguintes e bloqueia novas vendas do CNPJ. |
@@ -50,3 +51,5 @@
 | — | Planos sem renovação automática (pagamento avulso por PaymentIntent): resolvido no prompt 9 (D2) com Stripe Billing no cartão; o pagamento único continua como alternativa |
 | B9 | Metadados das rotas duplicados entre app e servidor: resolvido no prompt 10 (D6) com os textos em `seo.routes` do i18n e teste de paridade com `seo/utils/routeSeo.ts` |
 | — | Arquivos agregadores de UseCases (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`, `marketplaceConnectUseCases.ts`, `ticketingPaymentOrchestrationUseCases.ts`, `eventLifecycleOrchestrationUseCases.ts`, no backend e no frontend): resolvido no prompt 15, um UseCase por arquivo (AGENTS.md §13) |
+| B35 | Exclusão de conta não tratava as reservas, que passaram a guardar o endereço de busca (D20): resolvido no 21.3 com `anonymizeBuyerBookingsUseCase` (tira endereço e nomes dos participantes e mantém o registro financeiro, §7.5) e o apagamento do endereço 7 dias depois do serviço |
+

=== docs/arquitetura/decisoes.md — diff ===
@@ -285,3 +285,43 @@ Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e
 * **Denúncia de resposta:** motivos fechados (ofensiva ou desrespeitosa, fraude ou golpe, expõe dados pessoais, outro) e texto opcional; o estabelecimento não sabe quem denunciou; prazo de análise exibido: 3 dias. Aceita pelo admin, a resposta é removida e o caso fica registrado; se indicar fraude, serve de base para o admin suspender o estabelecimento. A fila fica numa aba nova **Moderação** no painel do admin.
 * **Prompts:** 20.4 (perfil, Configurações e Minhas avaliações) e 20.5 (denúncia e Moderação).
 
+
+## D20 — Check-in de reservas por código e repasse com prova do serviço (2026-10-30)
+
+Passeio, aluguel e translado ganham código de check-in; entrada de atração privada ganha QR Code como o ingresso. O repasse passa a depender de prova do serviço (check-in ou no-show comprovado). Desenho feito por simulação do passeio de buggy.
+
+* **Código (passeio, aluguel, translado):** 6 caracteres de alfabeto sem ambíguos (sem 0/O, 1/I/L), um por reserva (vale para o grupo), derivado no servidor por HMAC do ID da reserva com `BOOKING_CHECKIN_CODE_SECRET` (`BOOKING_CHECKIN_CODE_SECRET_PREVIOUS` vale durante a rotação, §7.8), nunca gravado. Aparece ao comprador às 00:00 do dia do serviço (`America/Fortaleza`), com o aviso "nunca informe por telefone ou mensagem". Só o dono autenticado da oferta valida, na janela de 2 h antes do início até 12 h depois do fim, com no máximo 5 erros por horário a cada 15 min (contados no Firestore). Exceção ao §7.7 registrada no AGENTS.md (S18).
+* **Entrada de atração privada:** QR Code assinado, verificável offline, como o ingresso de evento. Vale o dia inteiro, até o fechamento. Implementação (21.4): QR assinado com Ed25519 (`BOOKING_ENTRY_QR_PRIVATE_KEY_PEM`, com a chave pública anterior aceita na rotação), um por reserva para o grupo, visível a partir das 00:00 do dia; a portaria baixa a chave pública para validar sem internet. Fechamento = fim do horário, ou fim da duração, ou fim do dia em Fortaleza.
+* **Código curto junto do QR (2026-10-30):** o ingresso de evento e a entrada de atração privada mostram, embaixo do QR, um código de 8 caracteres do mesmo alfabeto, calculado por HMAC do ID e da versão do ingresso (muda na transferência, como o QR). É diferente do token assinado do QR: o QR valida sem internet; o código é a alternativa quando a leitura falha e é validado no servidor (sem sinal, fica guardado e valida quando a conexão volta). O check-in fica no ingresso: lido pelo QR, o código é recusado, e o contrário. Nos ingressos o limite de erros é por porteiro (5 a cada 15 min) com teto de 50 por sessão. Não há terceiro caminho (lista por nome).
+* **Prefixo na tela:** `INGR` (ingresso), `PASS` (passeio), `ALUG` (aluguel), `TRAN` (translado), `ENTR` (entrada de atração), iguais nos três idiomas. O comprador vê `PASS:7MK3NX`; o prestador vê o prefixo fixo e as caixas do código (6 ou 8), com maiúsculas automáticas, avanço de caixa, colar o código inteiro e recusa dos caracteres fora do alfabeto. O prefixo não é gravado nem enviado ao servidor.
+* **Unidade de venda (2026-10-30):** o parceiro escolhe no anúncio **por pessoa** (um código ou QR por pessoa, cada um vale uma entrada) ou **por grupo** (um código para o grupo, com o máximo de pessoas definido no anúncio; o cliente decide quem leva). As vagas do horário contam pessoas ou grupos. Entrada de atração é sempre por pessoa. Não há mais "pessoas presentes" no check-in: cada código vale o que foi comprado; unidade não usada é ausência, sem reembolso.
+* **Entrada nominal (opcional, por anúncio):** "Pedir o nome de cada pessoa" continua desligado por padrão. Ligado, o cliente informa o nome de cada pessoa na compra ou depois, até o dia; cada QR mostra o nome e a portaria confere com documento com foto. O nome pode ser trocado uma vez por entrada, até 24 h antes. Nenhum documento é guardado e não se pede CPF (§7.5–§7.7); CPF, se um dia for necessário, é decisão à parte.
+* **Textos neutros:** antes de uma ação, a tela não fala de dinheiro (a pergunta "O serviço aconteceu?" e as confirmações dizem só o que acontece); o resultado vem depois, como aviso. O cliente vê "você" e o nome do estabelecimento, gravado na reserva na compra; o parceiro vê "cliente"; o admin vê "cliente" e "parceiro". Os avisos ao parceiro mantêm a consequência (reembolso e multa), porque é o que o faz responder.
+* **Ingresso de evento (21.6):** QR `UGT1` assinado com Ed25519 e código `INGR` de 8 caracteres derivado do ID e da versão do ingresso (muda na transferência e na reemissão). O código aparece ao comprador a partir de 00:00 do dia da sessão e vale de 6 h antes do início a 6 h depois do fim, igual ao QR e à sessão sem internet. Erros: 5 por pessoa da equipe e 50 por sessão, a cada 15 min. Sem internet, só o QR vale (conferido pela assinatura no aparelho); o código precisa do servidor. Exclusão de conta tira nome e e-mail de pedidos, ingressos e transferências e apaga a lista de espera.
+* **Leitor de QR:** biblioteca `zxing-wasm` (MIT, versão fixa), escolhida por teste de velocidade (18 ms por quadro difícil no celular, 2× mais acertos que a segunda), isolada no leitor `useQrScanner`, com o `.wasm` servido do próprio domínio e carregado só quando a portaria abre o leitor. A CSP ganha `'wasm-unsafe-eval'` em `script-src` (nenhuma origem nova).
+* **O serviço começa com o código:** o painel só mostra "Iniciar serviço" depois do check-in; começar sem check-in é por conta e risco do prestador (termos do parceiro). Cada código vale uma pessoa ou um grupo (unidade de venda, acima); unidade sem check-in conta como ausência, sem reembolso.
+* **Endereço de busca:** o comprador informa onde está (hospedagem ou endereço) na compra. Dado pessoal (Confidencial, §7.6): só o prestador daquela reserva vê, e é apagado depois do serviço.
+* **Aviso ao prestador:** só pelos avisos do app por enquanto; e-mail fica para quando houver provedor (decisão futura, §15).
+* **"Cheguei":** o prestador registra a chegada com hora e localização (permissão do navegador pedida só nesse toque; localização fora dos logs). O comprador recebe "Seu prestador está te esperando".
+* **Comprador não apareceu (no-show):** depois de 30 min de espera desde o "Cheguei" (passeio, aluguel e translado; translado no aeroporto: 60 min depois do pouso, voo informado pelo comprador), o prestador marca "Cliente não apareceu". O comprador contesta pela reclamação da D16 (até 48 h depois do fim do serviço, o que cobre as 24 h previstas) e o caso vai ao admin; sem contestação, o prestador recebe e o comprador não tem reembolso.
+* **Prestador não veio:** 30 min depois do horário, com o código sem uso, o comprador toca "O prestador não veio". O prestador tem 2 h para responder; sem resposta ou admitindo a falta, reembolso integral ao comprador (inclusive a taxa de serviço), sem repasse e multa de 20% da D14; repetição suspende a oferta. Se o prestador disser que foi, o admin decide com o "Cheguei" e a conversa.
+* **Prestador atrasado:** check-in feito depois do pedido de "O prestador não veio" cancela o pedido e o serviço segue normal.
+* **Comprador sem código** (sem celular, sem bateria ou recusa): o prestador toca "Cliente sem código" e segue por conta e risco; o comprador recebe "O serviço aconteceu?". Sim = check-in confirmado; Não = admin; sem resposta em 72 h = reembolso integral, como em "nada registrado" (o prestador seguiu por conta e risco). Fraude confirmada: o prestador recebe e a conta do comprador é bloqueada.
+* **Nada registrado** (sem check-in, sem "Cheguei"): o comprador recebe "O serviço aconteceu?". Sim = repasse; Não ou sem resposta em 72 h = reembolso integral ao comprador, sem multa (o prestador pode só ter esquecido o código), com aviso aos dois; a reclamação decidida fica no histórico do admin.
+* **Sem internet:** o painel guarda o código digitado e valida quando o sinal volta; código errado = caso "Comprador sem código".
+* **Repasse:** só com check-in, check-in confirmado pelo comprador ou no-show sem contestação, sempre 48 h depois do fim (D14). Implementação: o repasse de passeio, aluguel e translado nasce retido (`service_proof`) e é solto pelo check-in com código, pelo "sim" do comprador, pela ausência marcada, pelo cancelamento do comprador com reembolso parcial e pela decisão do admin que não seja reembolso integral. Reclamação (D16) continua retendo o repasse até o admin decidir. Contestação no cartão com check-in: a plataforma arca (igual ao ingresso); sem check-in: dívida do documento (D16).
+* **Avaliação verificada:** o check-in libera o selo "Experiência verificada" nas avaliações de reservas (§9.4).
+* **QR de atração privada não usado até o fechamento:** igual ao ingresso não usado — no-show, sem reembolso, e o prestador recebe (decidido em 2026-10-30). Quem foi barrado na portaria abre reclamação (D16).
+* **Prompts:** A7 (regra do §7.7), 21.1 (código e check-in), 21.2 (Cheguei, no-show, prestador não veio, sem código), 21.3 (repasse com prova, selo verificado, fila do admin), 21.4 (QR e código de 8 caracteres da atração privada), 21.5 (telas, com prints), 21.6 (código de 8 caracteres do ingresso de evento).
+
+## D21 — Transferência pelo @usuário, troca do QR e modo portaria (2026-10-31)
+
+* **@usuário:** toda conta tem um nome de usuário único (dado público, §7.6), com 3 a 30 caracteres `a–z`, `0–9`, `.` e `_`, sem diferença entre maiúsculas e minúsculas, sem começar ou terminar com ponto e com lista de nomes bloqueados (`admin`, `useguide`, `suporte`…). O @ é obrigatório: logo depois de criar a conta (e-mail ou Google), e para contas que ainda não têm, o app pede a escolha antes de seguir, com sugestão a partir do nome; a pessoa troca em Configurações uma vez a cada 30 dias, e o anterior fica reservado por 14 dias antes de ser liberado. A reserva é única por transação em `usernames/{nome}`.
+* **Transferência de ingresso:** só para outra conta, pelo @, nunca por e-mail (buscar por e-mail revelaria quem tem conta, §7.5). O app mostra foto, nome e @ do destinatário para confirmar; o ingresso vai para a carteira dele, que recebe aviso. Destinatário com e-mail verificado, nunca a si mesmo; a busca do @ tem limite por pessoa.
+* **Devolução:** quem recebe um ingresso por transferência só pode devolvê-lo para quem comprou ("Devolver para @…"); só quem comprou transfere para outra pessoa. O ingresso recebido guarda de quem veio (@ e nome públicos).
+* **Link para quem ainda não tem conta:** quando o @ não existe, quem comprou pode gerar um link de transferência. Vale 30 min e uma vez só; o código vai depois do `#` (não chega ao servidor nem a logs), é aleatório de 256 bits e o backend guarda só o HMAC (`TICKET_QR_SECRET`, com rotação). O ingresso continua com quem comprou até a pessoa criar conta, escolher o @, verificar o e-mail e aceitar; quem comprou pode cancelar o link, e gerar outro cancela o anterior. Ingresso recebido não gera link (só volta para quem comprou). Abrir o link pede login; aberturas e aceites têm limite por pessoa (30 a cada 10 min); link inválido, usado ou cancelado tem a mesma resposta.
+* **"Problema com o QR Code?":** o titular troca o QR e o código `INGR` uma vez por ingresso, até a entrada, sem suporte; o antigo deixa de valer e o titular recebe aviso. A transferência também troca, sem contar essa vez. O botão "Novo QR" saiu.
+* **Fim das vendas do evento:** cada sessão tem horário de fim das vendas pelo app, sugerido 2 h antes do início (só eventos; atrações seguem como estão). "Preparar sem internet" só fica disponível depois dele.
+* **Lista sem internet:** com sinal, o aparelho baixa a cada 2 min só o que mudou (trocas, transferências, cancelamentos, entradas). Sem sinal, o QR de versão mais nova que a da lista é aceito (a assinatura prova a origem) e, a partir daí, a versão antiga é recusada naquele aparelho; QR trocado depois da lista aparece como "QR trocado pelo titular — confira o documento" quando houver conflito. Na troca, o titular é avisado de que o QR antigo pode passar numa portaria totalmente sem sinal até ela atualizar.
+* **Modo portaria (eventos e entradas de atração):** câmera aberta o tempo todo; cada QR lido faz o check-in e mostra tela verde ou vermelha até a equipe tocar em "Próximo"; "Inserir código" sempre visível (destacado depois de 8 s sem leitura) abre a folha do código; o mesmo QR relido em até 5 s é ignorado. Tela sempre acesa, vibração (Android), tela escura fixa, lanterna sob demanda e aviso de bateria baixa onde o navegador informa.
+* **Bateria sem perder velocidade:** câmera em 720p e decodificação a cada quadro enquanto há uso; só depois de 10 s sem QR cai para 4 tentativas por segundo, e com 60 s parada a câmera entra em espera ("Toque para continuar"). Só o centro da imagem é decodificado e a câmera desliga quando o app sai da tela.

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -28,6 +28,7 @@
 | S15 | §8.1 e §8.7 | D14: conta por documento, cobrança na plataforma com transferência depois do serviço, taxas por tipo, multa e reagendamento | ✅ Aprovada em 2026-10-24 (prompt A5, junto com a S14) |
 | S16 | §11.1 | D17: fundo neutro e liso, superfícies sólidas, cor só com significado e uma ação principal por tela | ✅ Aprovada em 2026-10-27 (prompt A6) |
 | S17 | §13 | Limite de 400 linhas só para código com mais de uma responsabilidade; conteúdo (traduções, textos legais) sem limite | ✅ Aprovada em 2026-10-27 (prompt A6, junto com a S16) |
+| S18 | §7.7 | D20: exceção ao mínimo de 128 bits para o código curto de check-in (6 caracteres nas reservas; 8 no ingresso e na entrada de atração, junto do QR), por HMAC, só para quem gerencia, na janela do serviço e com limite de erros | ✅ Aprovada em 2026-10-30 (extensão aos ingressos aprovada no mesmo dia; prompt A7, lote 18) |
 
 ---

VERIFICAÇÃO: confira que só esses arquivos mudaram (`git status`). Não há código neste prompt.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
