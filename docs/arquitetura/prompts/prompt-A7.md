# Prompt A7 — AGENTS.md: código curto de check-in (S18) e decisão D20

> Lote 18, gerado dos commits de referência `2809f57`, `c24a606`, `8bcd09c` e `024bf5f` da branch `claude/agents-md-v2` (só AGENTS.md e docs). Aplique depois do 20.6. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A7 — AGENTS.md §7.7 (S18) e D20

S18 aprovada pelo responsável do produto em 2026-10-30, com a extensão ao ingresso e à entrada aprovada no mesmo dia. Junta numa só as mudanças do AGENTS.md e da D20.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S18, aprovada em 2026-10-30). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: o check-in por código é implementado pelos prompts 21.x.

O QUE MUDA:
1) AGENTS.md §7.7 (S18): linha nova na tabela de hash, tokens e assinaturas, com a exceção ao mínimo de 128 bits para o código curto de check-in (6 caracteres nas reservas; 8 no ingresso de evento e na entrada de atração, junto do QR), derivado por HMAC e nunca gravado, válido só para quem gerencia, na janela do serviço e com limite de erros.
2) docs/arquitetura/decisoes.md: decisão D20 (check-in de reservas por código, repasse com prova do serviço, código curto junto do QR e prefixos na tela).
3) docs/arquitetura/solicitacoes-agents.md: S18.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
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

=== docs/arquitetura/decisoes.md — diff ===
@@ -285,3 +285,26 @@ Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e
 * **Denúncia de resposta:** motivos fechados (ofensiva ou desrespeitosa, fraude ou golpe, expõe dados pessoais, outro) e texto opcional; o estabelecimento não sabe quem denunciou; prazo de análise exibido: 3 dias. Aceita pelo admin, a resposta é removida e o caso fica registrado; se indicar fraude, serve de base para o admin suspender o estabelecimento. A fila fica numa aba nova **Moderação** no painel do admin.
 * **Prompts:** 20.4 (perfil, Configurações e Minhas avaliações) e 20.5 (denúncia e Moderação).
 
+
+## D20 — Check-in de reservas por código e repasse com prova do serviço (2026-10-30)
+
+Passeio, aluguel e translado ganham código de check-in; entrada de atração privada ganha QR Code como o ingresso. O repasse passa a depender de prova do serviço (check-in ou no-show comprovado). Desenho feito por simulação do passeio de buggy.
+
+* **Código (passeio, aluguel, translado):** 6 caracteres de alfabeto sem ambíguos (sem 0/O, 1/I/L), um por reserva (vale para o grupo), derivado no servidor por HMAC do ID da reserva com `BOOKING_CHECKIN_CODE_SECRET` (`BOOKING_CHECKIN_CODE_SECRET_PREVIOUS` vale durante a rotação, §7.8), nunca gravado. Aparece ao comprador às 00:00 do dia do serviço (`America/Fortaleza`), com o aviso "nunca informe por telefone ou mensagem". Só o dono autenticado da oferta valida, na janela de 2 h antes do início até 12 h depois do fim, com no máximo 5 erros por horário a cada 15 min (contados no Firestore). Exceção ao §7.7 registrada no AGENTS.md (S18).
+* **Entrada de atração privada:** QR Code assinado, verificável offline, como o ingresso de evento. Vale o dia inteiro, até o fechamento.
+* **Código curto junto do QR (2026-10-30):** o ingresso de evento e a entrada de atração privada mostram, embaixo do QR, um código de 8 caracteres do mesmo alfabeto, calculado por HMAC do ID e da versão do ingresso (muda na transferência, como o QR). É diferente do token assinado do QR: o QR valida sem internet; o código é a alternativa quando a leitura falha e é validado no servidor (sem sinal, fica guardado e valida quando a conexão volta). O check-in fica no ingresso: lido pelo QR, o código é recusado, e o contrário. Nos ingressos o limite de erros é por porteiro (5 a cada 15 min) com teto de 50 por sessão. Não há terceiro caminho (lista por nome).
+* **Prefixo na tela:** `INGR` (ingresso), `PASS` (passeio), `ALUG` (aluguel), `TRAN` (translado), `ENTR` (entrada de atração), iguais nos três idiomas. O comprador vê `PASS:7MK3NX`; o prestador vê o prefixo fixo e as caixas do código (6 ou 8), com maiúsculas automáticas, avanço de caixa, colar o código inteiro e recusa dos caracteres fora do alfabeto. O prefixo não é gravado nem enviado ao servidor.
+* **O serviço começa com o código:** o painel só mostra "Iniciar serviço" depois do check-in; começar sem check-in é por conta e risco do prestador (termos do parceiro). O prestador informa quantas pessoas estão presentes; quem faltou conta como no-show, sem reembolso.
+* **Endereço de busca:** o comprador informa onde está (hospedagem ou endereço) na compra. Dado pessoal (Confidencial, §7.6): só o prestador daquela reserva vê, e é apagado depois do serviço.
+* **Aviso ao prestador:** só pelos avisos do app por enquanto; e-mail fica para quando houver provedor (decisão futura, §15).
+* **"Cheguei":** o prestador registra a chegada com hora e localização (permissão do navegador pedida só nesse toque; localização fora dos logs). O comprador recebe "Seu prestador está te esperando".
+* **Comprador não apareceu (no-show):** depois de 30 min de espera desde o "Cheguei" (passeio, aluguel e translado; translado no aeroporto: 60 min depois do pouso, voo informado pelo comprador), o prestador marca "Cliente não apareceu". O comprador tem 24 h para contestar (vai ao admin); sem contestação, o prestador recebe e o comprador não tem reembolso.
+* **Prestador não veio:** 30 min depois do horário, com o código sem uso, o comprador toca "O prestador não veio". O prestador tem 2 h para responder; sem resposta ou admitindo a falta, reembolso integral ao comprador (inclusive a taxa de serviço), sem repasse e multa de 20% da D14; repetição suspende a oferta. Se o prestador disser que foi, o admin decide com o "Cheguei" e a conversa.
+* **Prestador atrasado:** check-in feito depois do pedido de "O prestador não veio" cancela o pedido e o serviço segue normal.
+* **Comprador sem código** (sem celular, sem bateria ou recusa): o prestador toca "Cliente sem código" e segue por conta e risco; o comprador recebe "O serviço aconteceu?". Sim = check-in confirmado; Não = admin. Fraude confirmada: o prestador recebe e a conta do comprador é bloqueada.
+* **Nada registrado** (sem check-in, sem "Cheguei"): o comprador recebe "O serviço aconteceu?". Sim = repasse; Não ou sem resposta em 72 h = reembolso integral ao comprador e o caso vai ao admin.
+* **Sem internet:** o painel guarda o código digitado e valida quando o sinal volta; código errado = caso "Comprador sem código".
+* **Repasse:** só com check-in, check-in confirmado pelo comprador ou no-show sem contestação, sempre 48 h depois do fim (D14). Reclamação (D16) continua retendo o repasse até o admin decidir. Contestação no cartão com check-in: a plataforma arca (igual ao ingresso); sem check-in: dívida do documento (D16).
+* **Avaliação verificada:** o check-in libera o selo "Experiência verificada" nas avaliações de reservas (§9.4).
+* **QR de atração privada não usado até o fechamento:** igual ao ingresso não usado — no-show, sem reembolso, e o prestador recebe (decidido em 2026-10-30). Quem foi barrado na portaria abre reclamação (D16).
+* **Prompts:** A7 (regra do §7.7), 21.1 (código e check-in), 21.2 (Cheguei, no-show, prestador não veio, sem código), 21.3 (repasse com prova, selo verificado, fila do admin), 21.4 (QR e código de 8 caracteres da atração privada), 21.5 (telas, com prints), 21.6 (código de 8 caracteres do ingresso de evento).

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -28,6 +28,7 @@
 | S15 | §8.1 e §8.7 | D14: conta por documento, cobrança na plataforma com transferência depois do serviço, taxas por tipo, multa e reagendamento | ✅ Aprovada em 2026-10-24 (prompt A5, junto com a S14) |
 | S16 | §11.1 | D17: fundo neutro e liso, superfícies sólidas, cor só com significado e uma ação principal por tela | ✅ Aprovada em 2026-10-27 (prompt A6) |
 | S17 | §13 | Limite de 400 linhas só para código com mais de uma responsabilidade; conteúdo (traduções, textos legais) sem limite | ✅ Aprovada em 2026-10-27 (prompt A6, junto com a S16) |
+| S18 | §7.7 | D20: exceção ao mínimo de 128 bits para o código curto de check-in (6 caracteres nas reservas; 8 no ingresso e na entrada de atração, junto do QR), por HMAC, só para quem gerencia, na janela do serviço e com limite de erros | ✅ Aprovada em 2026-10-30 (extensão aos ingressos aprovada no mesmo dia; prompt A7, lote 18) |
 
 ---

VERIFICAÇÃO: confira que o AGENTS.md mudou só no §7.7 (uma linha nova na tabela, logo depois de "Tokens opacos"), com o texto exato do diff. Nenhum código muda neste prompt.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
