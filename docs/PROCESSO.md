# Processo de trabalho: Referência (Claude) × AI Studio (Gemini)

## Branches

| Branch | Conteúdo | Quem atualiza |
|---|---|---|
| `main` | **Espelho do AI Studio.** Cada commit é a importação de um zip exportado do AI Studio. Nunca recebe código escrito à mão. | Claude, ao receber um zip novo |
| `claude/agents-md-v2` | **Implementação de referência.** Um commit por prompt (`Prompt N: …`), com os gates rodados. É o resultado esperado de cada prompt. | Claude |

O PR `claude/agents-md-v2 → main` mostra tudo o que ainda falta o AI Studio implementar.

## Ciclo

1. Claude implementa o prompt N na branch de referência e roda os gates (`typecheck`, `lint`, `test`, `build`).
2. O prompt N é **gerado a partir do diff do commit de referência** e fica em `docs/arquitetura/03-prompts-ai-studio.md` (lote atual). Desde o lote 6, prompts grandes ficam um por arquivo em `docs/arquitetura/prompts/`.
3. Você cola o prompt no agente do AI Studio.
4. Você exporta o zip do AI Studio e envia para o Claude.
5. Claude importa o zip na `main` (commit "Importa zip do AI Studio — após prompt N") e compara com o commit de referência do prompt N:
   * diferenças de **comportamento** (lógica, segurança, contratos de API, regras, testes ausentes) → correção em um prompt complementar `N.1`;
   * diferenças só de **estilo** (nomes, ordem, formatação) que respeitam o AGENTS.md → aceitas.
6. Com o prompt N aprovado, segue-se para o N+1.

### Estado de partida (zip de 2026-10-09, histórico)

| Gate | Resultado |
|---|---|
| `npm run typecheck` | ✅ sem erros |
| `npx biome lint .` | ❌ 4 erros (1 em `paymentController.ts`, 3 em `PartnerEventTicketingManager.tsx`) |
| `npm test` | ❌ 11 arquivos de teste não carregam: `adminClient.ts` e `firebaseApp.ts` exigem variáveis de ambiente no momento do import (bug P0-3) |
| `npm run build` | ✅ |

## Regras permanentes

* **AGENTS.md não é alterado** por nenhum prompt nem pelo Claude sem sua autorização (agora também escrito no §15). Propostas ficam em `docs/arquitetura/solicitacoes-agents.md`.
* **Sem código legado ou de transição** enquanto o app não for liberado para usuários.
* **Prompt para o AI Studio tem no máximo 150 KB** (regra de 2026-10-19). Acima disso, é dividido em partes que compilam sozinhas, e cada parte é enviada numa mensagem separada.
* **No AI Studio, os testes rodam com `npx vitest related --run <arquivos do prompt>`** (decisão de 2026-10-24), com a lista exata gerada pelo gerador de prompts, em vez da suíte inteira. Typecheck, lint e build continuam no projeto todo. A suíte completa roda aqui, na referência antes de gerar o prompt e no zip quando ele volta.
* **Todo prompt termina pedindo a limpeza de `public/assets/aistudio/`** (regra de 2026-10-22). O AI Studio salva ali, como anexo, o texto longo colado no chat (`Paste_<data>_<hash>`), e `public/` vai para o site publicado. Ao conferir um zip, arquivo nessa pasta não conta como divergência; ele só é apagado.
* **Todo prompt termina com a seção "Configurações manuais"** (regra de 2026-10-25), fora do bloco colado no AI Studio: deploy de regras, índices e Functions, parâmetros, segredos, configuração do Stripe e conferências no console, em passos numerados. Sem nada a fazer, a seção diz "Nenhuma.". O gerador recusa um prompt sem essa lista.
* **Arquivo tocado sai sem avisos do lint e formatado** (regra de 2026-10-19; proposta S10 para o AGENTS.md).
* **Tela tocada sai nos dois temas e com cara de app nativo** (regra de 2026-10-24; AGENTS.md §11.1 e §11.11, S14 aplicada pelo prompt A5): cores pelos tokens `--ug-*`; o claro nunca é branco puro (fundo `#f3eee4`, superfícies `#faf6ee`); modal vira folha inferior no celular; botões com `press`; um só efeito de toque por elemento (sem somar `press` a `whileTap`, `whileHover` ou `active:scale`); animações respeitam `prefers-reduced-motion`. A conferência inclui prints no claro e no escuro.

## Acompanhamento dos prompts

| Prompt | Tema | Referência (commit) | AI Studio | Comparação |
|---|---|---|---|---|
| 1 | Adotar AGENTS.md v2 | — | ✅ zip 2026-10-10 | ✅ AGENTS.md aplicado (versão anterior às decisões; a vigente é a do zip) |
| 2 | P0-1 Webhook Stripe (idempotência em duas fases) | — | ✅ zip 2026-10-10 | ✅ código igual à referência (só formatação) |
| 3 | P0-2 Reembolsos pelo webhook + P0-7 transação de reembolso | — | ✅ zip 2026-10-10 | ✅ correto e **melhor que a referência**: restaura ingressos `refund_pending` quando o reembolso falha (adotado) |
| 4 | P0-3 Inicialização preguiçosa do Firebase | — | ✅ zip 2026-10-10 | ⚠️ código correto; faltaram 2 ajustes de teste (5 arquivos falham) → prompt 4.1 |
| 4.1 | Completa o lote 1 e remove código de transição | `e930d07` | ✅ zip 2026-10-10 (2º) | ✅ idêntico à referência |
| 5 | P0-4 Segredo do QR (sem valor fixo nem hash legado) | `e659cc0` | ✅ zip 2026-10-10 (2º) | ✅ idêntico à referência |
| 6 | P0-5/P0-6 Planos | `fe9460c` | ✅ zip 2026-10-10 (2º) | ✅ idêntico à referência |
| A1 | AGENTS.md: S1–S5, S7, S8 aprovadas + decisoes.md e grafo no AI Studio | `cd30c06` | ✅ zip 2026-10-10 (3º) | ✅ idêntico à referência |
| 7 | D4 Upload pelo backend | `996847e` | ✅ zip 2026-10-10 (3º) | ⚠️ código idêntico; `package-lock.json` sem o `sharp` (`npm ci` falha) → prompt 7.1 |
| 7.1 | Sincroniza o `package-lock.json` | `90f1f0d` | ⚠️ `npm install` não chegou ao zip | ❌ lock ainda sem o `sharp` → prompt 10.1 |
| 8 | D7 SEO no Cloud Run | `759406e` | ✅ zip 2026-10-11 | ✅ idêntico à referência |
| 9 | D2 Stripe Billing | `a55b80f` | ✅ zip 2026-10-11 | ✅ idêntico à referência |
| 10 | D6 URLs por idioma | `31ef739` | ✅ zip 2026-10-11 | ⚠️ código idêntico; veio a pasta `dev-dist/` (gerada) → prompt 10.1 |
| 10.1 | `package-lock.json` + `dev-dist/` | `9c6b986` | ✅ zip 2026-10-12 | ✅ idêntico à referência (`npm ci` volta a funcionar) |
| 11 | D3 bookings — núcleo | `da4738e` | ✅ zip 2026-10-12 | ✅ idêntico à referência |
| 12 | D3 bookings — pagamento, rotas, jobs | `0424bb9` | ✅ zip 2026-10-12 | ✅ idêntico; faltava declarar o segredo nas Functions (erro da referência) → prompt 14.1 |
| 13 | D3 bookings — painel do parceiro | `53b8064` | ✅ zip 2026-10-12 | ✅ idêntico à referência |
| 14 | D3 bookings — compra pelo turista | `d70d0d0` | ✅ zip 2026-10-12 | ✅ idêntico + 3 correções do AI Studio fora do escopo, corretas e adotadas; `.env.example` com valores reais → prompt 14.1 |
| 14.1 | Functions: segredo e parâmetros; `.env.example` | `9368be2` | ⏳ enviar (lote 7) | — |
| 15 | Um UseCase por arquivo | `f565f7b` | ✅ zip 2026-10-14 | ✅ igual à referência |
| 16 | UX do menu e dos fluxos do usuário | `2ab647c` | ✅ zip 2026-10-14 | ⚠️ código igual + mudanças fora do escopo (B15 resolvido com `any`, taxa da plataforma, `solicitacoes-agents.md` reescrito) → prompt 16.1 |
| A2 | AGENTS.md §13 sem agregadores (S9 aprovada) | `ec5533f` | ✅ zip 2026-10-14 | ✅ igual à referência |
| — | Padronização das Functions (feita pelo AI Studio, fora dos prompts) | — | ✅ zip 2026-10-14 | ✅ `checkExpiringPlans` passa a chamar `/internal/partners/check-expiring-plans` como os outros jobs (adotado); `firebase-admin` removido do `functions/package.json` sem atualizar o lock → prompt 16.1 |
| 16.1 | Ajustes do lote 7/8 | `6022c0b` | ✅ zip 2026-10-18 | ✅ igual (taxa com teste independente do ambiente, adotado) |
| 17 | Correções urgentes dos painéis | `d8125a7` | ⚠️ zip 2026-10-18 | ❌ só em parte: admin de parceiros, editor de evento (risco de apagar sessões), avisos, relatórios e selo do parceiro na versão antiga → prompt 17.3 |
| 17.1 | Planos em centavos | `f036c3e` | ⚠️ zip 2026-10-18 | ⚠️ restos do preço em reais, adapter com `price`, data de cobrança sem fuso → prompt 17.3 |
| 17.2 | Oferta só com Stripe pronto | `5d66eea` | ✅ zip 2026-10-18 | ✅ igual + datas no fuso de Fortaleza no gerenciador de ingressos (fora do escopo, correto, adotado) |
| 17.3 | Completa o lote 9 | `3fd9a3f` | ✅ zip 2026-10-19 | ✅ igual à referência |
| 18 | Vários cadastros, categorias novas, telefone E.164 | `78c9c7d` | ⚠️ zip 2026-10-19 | ❌ só em parte: conta com categoria (inscrição recusada, perfil não carrega), `whatsappLink`, rótulos; + correção do AI Studio no `guideService` (adotada) → prompt 18.0.1 |
| 18.0.1 | Completa o 18 | `64b792a` | ✅ zip 2026-10-19 (2º) | ✅ igual à referência |
| 18.1 | Inscrição e editor com passeio/translado/aluguel | `1c15de9` | ✅ zip 2026-10-19 (2º) | ✅ igual + ícones de translado e produtor que existem no `StandardCard` (adotado) |
| 18.2 | Editor único de cadastro (parceiro e admin) + lint dos arquivos tocados | `fbfbfe9` + `c2658aa` | ⚠️ zip 2026-10-19 (3º) | ❌ só em parte: `usePartnerProfile` antigo, sem "Nova dica" → 18.2.5 |
| A3 | AGENTS.md: lint dos arquivos tocados (S10), tradução automática (S11/D5) e idioma da primeira visita (S12/D10) — junta A3, A4 e A5 | `003cc6e~1..41190ee` | ✅ zip 2026-10-19 (3º) | ✅ AGENTS.md igual; textos de `solicitacoes`/`debitos` reescritos → 18.2.5 |
| 18.2.1 | Sessões do evento no editor (parceiro e admin) | `ce7f92a` | ⚠️ zip 2026-10-19 (3º) | ❌ só em parte: sessões não gravadas (`usePartnerContentActions` antigo) → 18.2.5 |
| 18.2.2 | Contato do evento em um só lugar (B19) | `94a3ad6` | ✅ zip 2026-10-19 (3º) | ✅ igual à referência |
| 18.2.3 | Visualizações de visitantes nos insights; relatório com a divisão | `45b17ec` | ✅ zip 2026-10-19 (3º) | ✅ igual à referência |
| 18.2.4 | Idioma do navegador na primeira visita (D10) | `93c6c9b` | ✅ zip 2026-10-19 (3º) | ✅ igual (`resources.ts` só reformatado → 18.2.5) |
| 18.2.5 | Correção do lote 12 | `fada927..345ccbb` | ⚠️ zip 2026-10-22 | ❌ só em parte: `usePartnerProfile`, `usePartnerContentActions`, `AdminEditorModal` e `AdminPanel` reescritos; D11 e D12 fora do `decisoes.md` → 18.3.0d |
| 18.3.0a | Verificação por estabelecimento, backend (D12) | `3cc54e6` | ✅ zip 2026-10-22 | ✅ igual à referência |
| 18.3.0b | Conta do parceiro sem documento nem status pendente (D12, P0) | `46236f5` | ✅ zip 2026-10-22 | ✅ igual, exceto `usePartnerProfile` (→ 18.3.0d) |
| A4 | AGENTS.md §7.7: débito de `partnerDocumentKeys` resolvido (S13) | `e2651db` | ✅ zip 2026-10-22 | ✅ igual à referência |
| 18.3.0c | Telas de verificação por estabelecimento (D12) | `3e75156` + `3406b93` | ⚠️ zip 2026-10-22 | ⚠️ telas novas iguais; `PartnerPanel` e `PartnerPortalComposition` reescritos; prompts colados salvos em `public/assets/aistudio/` → 18.3.0d. Imports sem uso e linha em branco removidos em 3 arquivos (adotado) |
| 18.3.0d | Correção do lote 13 | `467cd02..996437c` | ✅ zip 2026-10-24 | ✅ igual à referência; `public/assets/aistudio/` limpo |
| 18.3a | Plano e selo por estabelecimento, backend (D11) | `bd14c0f` | ✅ zip 2026-10-24 | ✅ igual à referência |
| 18.3b | Cobrança do plano por estabelecimento (D11) | `cd31a44` | ⚠️ zip 2026-10-24 | ⚠️ funciona, mas 17 arquivos reescritos (nomes, comentários do porquê removidos, 5 arquivos fora do formato) → 18.3b.1 |
| 18.3c | Métricas com plano e destaque em rodízio (D11) | `f5b42a0` | ✅ zip 2026-10-24 | ✅ igual à referência |
| 18.3b.1 | Correção do 18.3b | `0fec4b9..faba4ec` | ✅ zip 2026-10-24 (2º) | ✅ igual à referência |
| 18.3b.2 | Troca de período na próxima renovação, backend (D13) | `e261e1d` | ✅ zip 2026-10-24 (2º) | ✅ igual à referência |
| 18.3.1a | Plano e selo por estabelecimento no painel do parceiro (D11, D13) | `4f3fddb` + `cf21b31` | ✅ zip 2026-10-24 (2º) | ✅ igual à referência |
| 18.3.1b | Selo do admin por estabelecimento, explicação do selo e "Destaque" (D11) | `37fe44f` + `55d0cc1` | ✅ zip 2026-10-24 (2º) | ✅ igual à referência |
| 18.3.1c | Telas tocadas nos temas claro e escuro, com toque e transições de app nativo | `52392fe` | ✅ zip 2026-10-24 (2º) | ✅ igual à referência |
| A5 | AGENTS.md §11.1 e §11.11 (S14: tema claro e app nativo) + §8.1, §8.2, §8.3 e §8.7 (S15: repasse por documento e retenção até o serviço) | `52392fe..5573f13` | ✅ zip 2026-10-25 | ⚠️ AGENTS.md igual; a D14 não chegou ao `decisoes.md` (o A5 não levava esse arquivo) → C16 |
| 18.4a.1 | Conta Stripe por CNPJ, backend (D14) | `6946ecf` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4a.2 | Conta Stripe por CNPJ, frontend (D14) | `6946ecf` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4b.0.1 | ticketingService dividido, sem mudar comportamento | `51f5188` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4b.0.2 | Adapter Firestore do ticketing dividido, sem mudar comportamento | `0012702` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4b.1 | Taxas, políticas de cancelamento e arrependimento, backend (D14) | `0012702..9e420df` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4b.2 | Taxas, políticas de cancelamento e arrependimento, frontend (D14) | `0012702..31e0772` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| 18.4b.3 | Termos com aceite registrado (D15) | `d59bcbd..ed7c054` | ✅ zip 2026-10-25 | ✅ igual à referência (só ordem de imports e formatação); `public/assets/aistudio/` limpo |
| C16 | Correção do lote 16: D14 no `decisoes.md` | `48a75ac` | ⏳ enviar (lote 17) | — |
| 18.4c | Cobrança na plataforma e repasse depois do serviço (D14) | `dc082a9..e80e9b1` | ⏳ enviar (lote 17) | — |
| 18.4c.1 | Agendamento do job de repasse (D14) | `598c7fe..6d8ff33` | ⏳ enviar (lote 17) | — |
| 18.4d.1 | Dívidas do CNPJ, multa, desconto no repasse e bloqueio (D16) | `9e75059..df37496` | ⏳ enviar (lote 17) | — |
| 18.4d.2 | Reclamações do comprador (D16) | `3f43733..a2c644f` | ⏳ enviar (lote 17) | — |
| 18.4d.3a | Força maior na multa de cancelamento (D16) | `7608424..cd796c0` | ⏳ enviar (lote 17) | — |
| 18.4d.3b | Reagendamento (D16) | `cd796c0..d2f73d8` | ⏳ enviar (lote 17) | — |
| 18.4e.1 | Extrato e dívidas em Recebimentos (D14, D16) | `31cdebc..7c2dbc8` | ⏳ enviar (lote 17) | — |
| 18.4e.2 | Horários de reserva e conta por estabelecimento (D14, D16) | `58cb9e2..0c60e58` | ⏳ enviar (lote 17) | — |
| 18.4e.3.0 | Painel de ingressos dividido em abas | `11d4e3e..a24f664` | ⏳ enviar (lote 17) | — |
| 18.4e.3 | Adiar e cancelar sessão de evento, conta por evento (D14, D16) | `a24f664..eac047f` | ⏳ enviar (lote 17) | — |
| 18.4f.1 | Relatar problema e aviso de remarcação nas compras (D16) | `42ac907..097336f` | ⏳ enviar (lote 17) | — |
| 18.4f.2 | Filas financeiras do admin (D16) | `231c1ec..5e415b2` | ⏳ enviar (lote 17) | — |

### Revisões futuras (aprovadas para depois)

- **Histórico de compras do comprador** (decidido em 2026-10-26): a aba Pedidos da carteira lista só pedidos de ingresso, com código, valor, data e status. Rever o cartão (nome e data do evento, ingressos e quantidades, taxa de serviço, valor reembolsado, recibo) e se ingressos e reservas viram uma tela única "Minhas compras".

## Gates

| Gate | Zip 2026-10-09 | Zip 2026-10-10 (1º) | Zip 2026-10-10 (2º) | Zip 2026-10-10 (3º) | Zip 2026-10-11 (`main` atual) |
|---|---|---|---|---|---|
| `npm run typecheck` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `npx biome lint .` | ❌ 4 erros | ❌ 3 erros | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros |
| `npm test` | ❌ 11 arquivos não carregam | ❌ 5 arquivos falham | ✅ 86/86 arquivos, 545 testes | ✅ 89/89 arquivos, 550 testes | ✅ 106/106 arquivos, 641 testes |
| `npm run build` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `npm ci` | — | — | — | ❌ lockfile sem o `sharp` (prompt 7.1) | ❌ ainda sem o `sharp` (prompt 10.1) |
