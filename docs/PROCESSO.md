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
| 15 | Um UseCase por arquivo | `f565f7b` | ⏳ enviar (lote 7) | — |
| 16 | UX do menu e dos fluxos do usuário | `2ab647c` | ⏳ enviar (lote 8) | — |
| A2 | AGENTS.md §13 sem agregadores (S9 aprovada) | `ec5533f` | ⏳ enviar (lote 8) | — |

## Gates

| Gate | Zip 2026-10-09 | Zip 2026-10-10 (1º) | Zip 2026-10-10 (2º) | Zip 2026-10-10 (3º) | Zip 2026-10-11 (`main` atual) |
|---|---|---|---|---|---|
| `npm run typecheck` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `npx biome lint .` | ❌ 4 erros | ❌ 3 erros | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros |
| `npm test` | ❌ 11 arquivos não carregam | ❌ 5 arquivos falham | ✅ 86/86 arquivos, 545 testes | ✅ 89/89 arquivos, 550 testes | ✅ 106/106 arquivos, 641 testes |
| `npm run build` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `npm ci` | — | — | — | ❌ lockfile sem o `sharp` (prompt 7.1) | ❌ ainda sem o `sharp` (prompt 10.1) |
