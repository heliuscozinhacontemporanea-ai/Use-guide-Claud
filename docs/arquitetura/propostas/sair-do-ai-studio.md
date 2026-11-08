# Sair do Google AI Studio — execução da D23 (2026-11-08)

> **Executada em 2026-11-08.** Primeiro deploy pelo GitHub Actions publicado (Cloud Run revisão `use-guide-00056-ljz` e Hosting). Ajustes do caminho na seção 10.

O responsável do produto pediu para abandonar o AI Studio de vez. O plano já foi aprovado em 2026-11-02 (**D23**, `decisoes.md`) e só estava adiado enquanto o plano pago do AI Studio estivesse em vigor. Esta página traz a D23 para a prática: o que muda, o que configurar e em que ordem.

## 1. O que a D23 já decidiu (não muda)

* **Um ambiente só até a liberação:** o projeto atual (`gen-lang-client-0788355965`) e `useguide.com.br`, sem projeto de teste. A prévia é o próprio site no ar, depois do merge.
* **Fluxo:** Claude trabalha numa branch por tarefa (`claude/<tema>`) e abre PR para `main`. O GitHub Actions roda os gates em cada push: typecheck, lint, testes, build e regras no emulador. O responsável aprova fazendo o merge, ou autoriza Claude a fazê-lo. No merge, o Actions publica o Cloud Run e depois o Hosting, sem aprovação extra. Ninguém escreve direto na `main`.
* **Artefato único:** o build roda no Actions. Uma imagem (Dockerfile novo) leva o servidor e o `dist` para o Cloud Run, e o mesmo `dist` vai para o Hosting.
* **Credenciais:** Workload Identity Federation, sem chave JSON; a conta de publicação só tem papéis de publicação e só aceita este repositório e a branch `main`. Os segredos continuam no Secret Manager.
* **Stripe em modo teste** até a liberação. Na data de liberação, rever o modelo de prévia: revisão sem tráfego no Cloud Run e canal de prévia no Hosting, ou projeto de teste separado.
* **Descartada a S19** (deploy pelo AI Studio com gcloud).

## 2. O que muda com o abandono

* **A `main` deixa de ser o espelho do AI Studio** (`docs/PROCESSO.md`) e passa a ser o código publicado. Prompts e zips acabam.
* **A branch `claude/agents-md-v2` é a referência:** tudo que o AI Studio fez certo já foi adotado nela, na conferência de cada zip. O responsável aplicou o C18 e o lote 19 no AI Studio (2026-11-08); o último zip entra na `main` como importação final e é conferido com a referência, como os anteriores.
* **A `main` tem 4 importações de zip** que não estão na branch (2026-10-22 a 10-25). Elas entram por um merge que mantém a versão da referência, como já foi feito no lote 12 (`2de5e07`).
* **O site no ar hoje** roda o código publicado pelo AI Studio, que está atrás da referência. O primeiro deploy pelo Actions publica de uma vez tudo o que ainda não estava lá (lotes 18 e 19, painel, cupons, fuso). Com o Stripe em modo teste, isso não afeta dinheiro real.

## 3. Ordem de execução

| Passo | Quem | O quê |
|---|---|---|
| 1 | Responsável | Configurações do Google Cloud e do GitHub da seção 4 |
| 2 | Claude | PR `claude/agents-md-v2 → main`: merge da `main` mantendo a referência + `Dockerfile`, `.dockerignore`, `.gcloudignore` e os workflows `ci.yml` (gates em todo PR) e `deploy.yml` (publica no merge) |
| 3 | Responsável | Confere o PR com os gates verdes e faz o merge. O primeiro deploy pelo Actions vai ao ar |
| 4 | Claude | PR de limpeza do AI Studio (seção 5) e proposta do novo AGENTS.md §2 e do `PROCESSO.md` (seção 6), com autorização antes de editar |

## 4. Configurações que o responsável faz

### Google Cloud (projeto `gen-lang-client-0788355965`, número `377157973786`)

No Cloud Shell, conectado ao projeto:

```bash
PROJECT_ID=gen-lang-client-0788355965
PROJECT_NUMBER=377157973786
REPO=heliuscozinhacontemporanea-ai/Use-guide-Claud

# APIs usadas pelo deploy
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  iamcredentials.googleapis.com firebasehosting.googleapis.com --project=$PROJECT_ID

# Repositório de imagens, na região do Cloud Run
gcloud artifacts repositories create use-guide --repository-format=docker \
  --location=us-east1 --project=$PROJECT_ID

# Conta de publicação (só publica; não lê dados)
gcloud iam service-accounts create github-deployer --project=$PROJECT_ID \
  --display-name="Publicação pelo GitHub Actions"
for ROLE in roles/run.admin roles/artifactregistry.writer roles/firebasehosting.admin \
  roles/serviceusage.serviceUsageViewer roles/serviceusage.apiKeysViewer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" --role=$ROLE
done

# Pool e provedor do GitHub: só este repositório e só a main
gcloud iam workload-identity-pools create github --location=global --project=$PROJECT_ID \
  --display-name="GitHub Actions"
gcloud iam workload-identity-pools providers create-oidc use-guide-main --location=global \
  --workload-identity-pool=github --project=$PROJECT_ID \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
  --attribute-condition="assertion.repository=='$REPO' && assertion.ref=='refs/heads/main'"
gcloud iam service-accounts add-iam-policy-binding \
  github-deployer@$PROJECT_ID.iam.gserviceaccount.com --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"
```

Mais um passo: a conta de publicação precisa "agir como" a conta que o Cloud Run usa ao rodar. Veja qual é em Cloud Run → `use-guide` → Segurança → Conta de serviço, e dê à `github-deployer` o papel **Usuário da conta de serviço** (`roles/iam.serviceAccountUser`) **só nessa conta**, não no projeto inteiro.

### GitHub (Settings do repositório)

1. **Branches → regra para `main`:** exigir PR antes do merge e exigir o status `ci` verde; bloquear force-push e exclusão.
2. **Actions → General:** permitir o GitHub Actions neste repositório.
3. **Secrets and variables → Actions → Variables** (não são segredos):
   * `GCP_PROJECT_ID` = `gen-lang-client-0788355965`
   * `GCP_WIF_PROVIDER` = `projects/377157973786/locations/global/workloadIdentityPools/github/providers/use-guide-main`
   * `GCP_DEPLOYER_SA` = `github-deployer@gen-lang-client-0788355965.iam.gserviceaccount.com`
   * mais as `VITE_*` públicas do build (config web do Firebase, chave publicável do Stripe, chave do Maps), copiadas de onde estão hoje no AI Studio.
4. Nenhum segredo vai para o GitHub: o Cloud Run continua lendo do Secret Manager.

### O que se faz uma vez só, antes do primeiro deploy

* Conferir se todos os segredos do `.env.example` que o servidor usa existem no Secret Manager e estão ligados ao Cloud Run. Os que só existiam no painel Secrets do AI Studio precisam ser criados lá.
* No Firebase Auth, tirar os domínios do AI Studio da lista de domínios autorizados (`*.run.app` do AI Studio e os de prévia).

## 5. Limpeza do AI Studio no código (PR do passo 4)

* Apagar `metadata.json`, `firebase-applet-config.json`, a dependência `@google/genai` e `GEMINI_API_KEY` (sem uso).
* `server.ts`: tirar o `host.includes('ais-')` e os testes de host do AI Studio.
* `adminClient.ts`: tirar `FIREBASE_SERVICE_ACCOUNT_KEY`. Em desenvolvimento valem os emuladores ou `gcloud auth application-default login`.
* `trustProxy.ts`: o padrão de 1 proxy "do AI Studio" vira 0 em desenvolvimento.
* `vite.config.ts`: tirar `DISABLE_HMR`.
* README e `PROCESSO.md` sem as instruções do AI Studio; `03-prompts-ai-studio.md` fica como histórico.

## 6. Mudança no AGENTS.md (§15: precisa de autorização)

* **§2, texto atual:** "Ambientes: Google AI Studio (Desenvolvimento) e Produção", com a matriz AI Studio × Produção (painel Secrets, `FIREBASE_SERVICE_ACCOUNT_KEY`, porta 3000 do proxy) e as menções ao AI Studio nos §2.2, §7.7, §7.8 e §8.8.
* **§2, texto proposto:** "Ambientes: desenvolvimento local e produção". Desenvolvimento com `npm run dev`, emuladores do Firebase e Stripe teste; produção publicada pelo GitHub Actions no merge para `main` (D23). Credencial sempre ADC, sem chave JSON. Segredos no Secret Manager e `.env` local fora do git. As menções ao AI Studio passam a dizer "desenvolvimento local".
* **Motivo:** o AI Studio deixa de existir no processo, e a regra "funciona nos dois ambientes" passaria a exigir um ambiente que ninguém usa.

## 7. Depois

Rules, índices e Functions pelo Actions, alertas de erro e backup: `publicacao-alertas-backup.md`.

## 9. Notas da implementação (PR da D23)

* O `firebase.json` não muda. Por isso o deploy do Hosting roda de novo o `predeploy` (`npm run build`), com as mesmas variáveis do primeiro build: o resultado é o mesmo `dist`.
* `npm audit fix` (sem mudar versão principal) e um `overrides` para o `@grpc/grpc-js` do SDK web do Firebase (1.9.16 → 1.14.x, só usado no Node pelos testes das rules) zeraram as vulnerabilidades altas; o CI passa a exigir isso (§7.4). Os 67 testes das rules passam com a versão nova.
* O servidor foi testado como no container: só `dist` e dependências de produção, `NODE_ENV=production`, responde `200` em `/api/health`.

## 10. O que o primeiro deploy pediu (2026-11-08)

| Tentativa | Erro | Correção |
|---|---|---|
| 1 ([run](https://github.com/heliuscozinhacontemporanea-ai/Use-guide-Claud/actions/runs/42497401067)) | `run.googleapis.com/sources`: o serviço publicado pelo AI Studio "a partir do código-fonte" guardava anotações de build | PR #2: o deploy lê o serviço, tira as anotações e aplica com `gcloud run services replace` (`scripts/ops/prepareCloudRunService.py`) |
| 2 ([run](https://github.com/heliuscozinhacontemporanea-ai/Use-guide-Claud/actions/runs/42498116405)) | `runtimeClassName: run.googleapis.com/linux-base-image-update` (atualização automática da imagem base do AI Studio) | PR #3: o script tira esse campo e escreve no log só os nomes de campos e anotações do serviço |
| 3 ([run](https://github.com/heliuscozinhacontemporanea-ai/Use-guide-Claud/actions/runs/42498952702)) | Hosting: `Permission denied to get service [firebasehosting.googleapis.com]` | Papéis só de leitura `roles/serviceusage.serviceUsageViewer` e `roles/serviceusage.apiKeysViewer` na `github-deployer` (já no comando da seção 4); nova tentativa publicou |

## 11. Depois da saída (2026-11-08)

* **CSP:** o teste no navegador do site no ar mostrou bloqueios que já existiam na versão do AI Studio (reCAPTCHA do App Check, Google Analytics e CSS do Leaflet). Corrigido no PR #9; nenhum bloqueio de CSP depois do deploy. O responsável conferiu no celular: o cartão de vento e maré carrega em produção, então o App Check funciona. O 403 do navegador automático na troca do token é o reCAPTCHA recusando robôs.
* **Node 26 e dependências:** D29 e PR #6, publicados.
* **Branches:** D31 (`main`, `claude/agents/useguide`, `claude/agents/documentacao`); as demais foram apagadas pelo responsável.

