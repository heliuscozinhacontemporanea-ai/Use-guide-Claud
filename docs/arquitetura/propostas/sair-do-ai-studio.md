# Sair do Google AI Studio — proposta (2026-11-08)

O responsável do produto decidiu abandonar o AI Studio como ambiente de desenvolvimento e de publicação. Esta proposta lista o que no repositório ainda depende dele e o que configurar no GitHub, no Google Cloud, no Firebase e no Stripe.

## 1. O que depende do AI Studio hoje

| Onde | O quê |
|---|---|
| Projeto Google Cloud | `gen-lang-client-0788355965`, criado pelo AI Studio. O Firestore usa o banco `ai-studio-3b61db50-…`, não o `(default)`. |
| Publicação | O Cloud Run `use-guide` (us-east1) é publicado pelo AI Studio. Não há Dockerfile, workflow do GitHub nem script de deploy do servidor no repositório. |
| `metadata.json`, `firebase-applet-config.json` | Arquivos do AI Studio. O segundo duplica a configuração web do Firebase, que já vem das variáveis `VITE_FIREBASE_*`. |
| `server.ts` | Detecção espalhada `host.includes('ais-')` para não redirecionar o domínio `*.run.app` no AI Studio (contra o §2.2 item 3). |
| `server/infrastructure/config/trustProxy.ts` | Em desenvolvimento, confia em 1 proxy "do AI Studio" por padrão. |
| `server/infrastructure/firebase/adminClient.ts` | Aceita `FIREBASE_SERVICE_ACCOUNT_KEY` (chave JSON) fora de produção. |
| `vite.config.ts` | `DISABLE_HMR` do AI Studio. |
| `package.json` | `@google/genai`, sem uso no código. `.env.example` tem `GEMINI_API_KEY`, também sem uso. |
| README, `docs/PROCESSO.md`, `docs/arquitetura/03-prompts-ai-studio.md` | Instruções do AI Studio (porta 3000 do proxy, painel Secrets). |
| AGENTS.md §2 | Todo o capítulo de ambientes é escrito como "AI Studio × Produção". |

## 2. Ambientes propostos

| Ambiente | Onde roda | Dados | Pagamentos |
|---|---|---|---|
| **Local** | `npm run dev` na máquina ou numa sessão do Claude Code, com os **emuladores do Firebase** (Auth, Firestore, Storage, Functions) | dados de seed, apagados quando quiser | Stripe em modo teste + `stripe listen` |
| **Homologação** (staging) | projeto Google Cloud próprio, Cloud Run + Hosting, publicado sozinho a cada junção na `main` | dados de teste | Stripe em modo teste |
| **Produção** | projeto Google Cloud próprio, publicado só com aprovação | dados reais | Stripe live |

Projetos separados isolam permissões, segredos, cotas e faturamento: um erro na homologação não toca a produção (prática recomendada do Firebase para vários ambientes).

## 3. GitHub

1. **Workflow de verificação** (`.github/workflows/ci.yml`), em todo PR e push: `npm ci`, `typecheck`, `lint`, `test`, `build`, `tsc` das functions, testes das rules no emulador e `npm audit --audit-level=high`.
2. **Proteção da `main`**: junção só por PR, com o workflow verde; sem push direto nem force-push.
3. **Workflow de publicação** (`deploy.yml`): `main` → homologação, automático; tag `v*` ou disparo manual → produção, com aprovação no GitHub Environment `production`.
4. **Login sem chave**: o GitHub entra no Google Cloud por **Workload Identity Federation** (`google-github-actions/auth`), restrito a este repositório. Nenhuma chave JSON de conta de serviço no GitHub.
5. **GitHub Environments** `staging` e `production`, só com valores públicos (ID do projeto, região, nome do serviço). Segredos ficam no Secret Manager, nunca no GitHub.
6. **Dependabot** para atualizações de segurança semanais (§7.10 A06).

## 4. Google Cloud (em cada projeto)

1. **APIs**: Cloud Run, Cloud Build, Artifact Registry, Secret Manager, Cloud Scheduler, Cloud KMS, IAM Credentials.
2. **Contas de serviço**:
   * `use-guide-run`: a conta do Cloud Run, com `roles/datastore.user`, acesso ao bucket do Storage, `secretmanager.secretAccessor` **por segredo**, `cloudkms.cryptoKeyEncrypterDecrypter` só na chave de campo e `firebasemessaging` para o push;
   * `github-deployer`: usada pelo GitHub para publicar (Cloud Run, Artifact Registry, Firebase Hosting, Rules, Functions), sem acesso a dados;
   * `scheduler-invoker`: chama `/internal/*` com token OIDC (alvo do §7.9).
3. **Secret Manager**: um segredo por variável secreta do `.env.example` (Stripe, QR, códigos, chave de job, chave de índice cego, chaves Ed25519), montado como variável no Cloud Run. Valores diferentes entre homologação e produção.
4. **Cloud Run `use-guide`**: imagem construída no CI a partir de um `Dockerfile` novo (Node 22, `npm ci --omit=dev`, `node dist/server.cjs`); `NODE_ENV=production`, `APP_CHECK_REQUIRED=true`, `TRUST_PROXY_HOPS` com o número certo de proxies.
5. **Cloud Scheduler**: os jobs que hoje chamam `*_JOB_URL`, com OIDC da `scheduler-invoker`.
6. **Observabilidade**: alertas no Cloud Monitoring para picos de 5xx, falhas de webhook e de checkout, e picos de 401/403/429 (§7.10 A09); alerta de orçamento no faturamento.
7. **Firestore**: banco `(default)`, PITR ligado e export agendado; um teste de restauração antes do lançamento (§7.10).

## 5. Firebase (em cada projeto)

* Hosting com o domínio `useguide.com.br` na produção e um subdomínio de homologação; os rewrites para o Cloud Run continuam iguais.
* **Domínios autorizados** do Auth: tirar os do AI Studio, deixar o domínio próprio e `localhost`.
* App Check (reCAPTCHA Enterprise) aplicado no Firestore, no Storage e na API em produção.
* Chaves de API do navegador (Firebase e Maps) restritas aos domínios de cada ambiente.
* Rules e índices publicados pelo workflow, não à mão (resolve a lista de publicações pendentes).

## 6. Stripe

* Endpoints de webhook separados para homologação (teste) e produção (live), cada um com o seu `STRIPE_WEBHOOK_SECRET`.
* Connect: URLs de retorno do onboarding apontando para o domínio de cada ambiente.

## 7. Mudanças no código (depois da aprovação)

1. Apagar `metadata.json`, `firebase-applet-config.json`, `@google/genai` e `GEMINI_API_KEY`.
2. `firebase.json` e `.firebaserc`: aliases `staging` e `production` e banco `(default)`.
3. Centralizar a detecção de ambiente em `server/infrastructure/config` (resolve o `host.includes('ais-')`).
4. Desenvolvimento local com credencial do `gcloud auth application-default login` ou com os emuladores; remover `FIREBASE_SERVICE_ACCOUNT_KEY`.
5. `TRUST_PROXY_HOPS` padrão 0 em desenvolvimento (sem proxy na frente).
6. `Dockerfile`, `.dockerignore` e os workflows `ci.yml` e `deploy.yml`.
7. Script de seed para os emuladores e a homologação.
8. Atualizar o README, `docs/PROCESSO.md` e o AGENTS.md §2 (precisa de autorização, §15).

## 8. Mudança no AGENTS.md (§15: precisa de autorização)

* **§2, texto atual:** "Ambientes: Google AI Studio (Desenvolvimento) e Produção", com a matriz AI Studio × Produção e as regras citando o painel Secrets, `FIREBASE_SERVICE_ACCOUNT_KEY` e a porta 3000 do proxy.
* **§2, texto proposto:** "Ambientes: Local, Homologação e Produção". A matriz passa a ter três colunas: local com emuladores e Stripe teste; homologação com projeto próprio e Stripe teste; produção com Stripe live. As credenciais passam a ser ADC em todos os ambientes, sem chave JSON, e os segredos ficam no Secret Manager, mais `.env` local fora do git. A regra "funciona nos dois ambientes" vira "funciona nos três". As menções ao AI Studio nos §2.2, §7.7, §7.8 e §8.8 trocam para "local/homologação".
* **Motivo:** o AI Studio deixa de ser usado. Sem a mudança, o AGENTS.md exigiria compatibilidade com um ambiente que não existe mais.

## 9. Decisões do responsável do produto

1. **Projeto Google Cloud:** (a) criar dois projetos novos (`use-guide-staging` e `use-guide-prod`); (b) **o atual vira homologação e só a produção é nova (recomendado)**; (c) manter o atual para tudo.
2. **Publicação em produção:** (a) **manual com aprovação no GitHub (recomendado)**; (b) automática ao juntar na `main`.
3. **Onde desenvolver:** (a) **emuladores locais e sessões do Claude Code, com a homologação para testar Stripe e push (recomendado)**; (b) direto na homologação, sem emuladores.
