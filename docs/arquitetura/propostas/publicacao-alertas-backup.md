# Publicação completa, alertas de erro e backup — proposta (2026-11-08)

> **Implementada em 2026-11-08** na `claude/agents/useguide` (seção 6). Falta o responsável dar os papéis, ligar a variável e rodar o script.

Continua a D23 (`sair-do-ai-studio.md`). A D23 publica o Cloud Run e o Hosting no merge para `main`. Esta proposta acrescenta as rules, os índices e as Functions ao mesmo workflow, os alertas de erro e o backup do Firestore.

## 1. Publicar rules, índices e Functions pelo Actions

Hoje essas publicações são à mão (`npm run deploy:*`). Há regras e índices de cupons, cortesias e repasses, e a função `announceTermsUpdates`, esperando publicação.

### Ordem no `deploy.yml`, depois do merge

| # | O quê | Quando roda | Por que nessa ordem |
|---|---|---|---|
| 1 | Índices (`firestore:indexes`) | só se `firestore.indexes.json` mudou | o código novo pode fazer consultas que precisam do índice |
| 2 | Rules (`firestore:rules`, `storage`) | só se `firestore.rules` ou `storage.rules` mudou | o app novo pode ler coleções que só a regra nova libera; os testes das rules já passaram no PR |
| 3 | Functions | só se `functions/` mudou | os jobs chamam rotas do servidor, que precisam existir |
| 4 | Cloud Run | sempre | servidor |
| 5 | Hosting | sempre | por último, para o site novo só chamar um servidor que já está no ar |

* Cada passo só roda se o anterior deu certo. Se um falhar, o site continua na versão anterior e o Actions mostra o erro.
* O índice novo leva alguns minutos para ficar pronto depois de publicado. Antes da liberação isso é aceitável; depois dela, a D23 prevê rever o modelo.
* O índice que existe no console mas não no arquivo **não é apagado** pelo deploy automático (o Firebase só apaga com confirmação). Limpeza de índice fica manual.
* O `firebase.json` não muda: o Actions usa os mesmos alvos (`--only ...`) dos scripts `deploy:*` do `package.json`.

### Papéis a mais para a conta `github-deployer`

| Papel | Para quê |
|---|---|
| `roles/firebaserules.admin` | publicar as rules |
| `roles/datastore.indexAdmin` | publicar os índices |
| `roles/cloudfunctions.developer` | publicar as Functions |
| `roles/cloudscheduler.admin` | as Functions agendadas criam os próprios agendamentos |
| `roles/secretmanager.viewer` | as Functions declaram os segredos que usam; o deploy confere se existem (não lê os valores) |
| `roles/iam.serviceAccountUser` **só na conta que roda as Functions** | publicar a função com a identidade dela |

O primeiro deploy confirma a lista: se faltar algum papel, o erro do Actions diz qual é, e a correção vai no passo a passo.

## 2. Alertas de erro

### O que avisa e como

| Alerta | Fonte | Disparo |
|---|---|---|
| **Erro novo no servidor ou nas Functions** | Error Reporting (agrupa erros iguais) | e-mail no primeiro erro de cada tipo novo e quando um erro antigo volta |
| **Muitos erros 5xx** | métrica do Cloud Run | mais de 5% das requisições com 5xx em 5 minutos |
| **Falha no webhook do Stripe** | métrica de log `stripe_webhook_failed` | 1 ou mais em 10 minutos (o Stripe vai reenviar, mas alguém precisa saber) |
| **Falha ao criar pagamento** | métrica de log `checkout_failed` | 3 ou mais em 10 minutos |
| **Pico de 401/403/429** | métrica do Cloud Run | 5× acima do normal em 15 minutos (§7.10 A09: tentativa de invasão ou bug de login) |
| **Job agendado falhando** | erros das Functions | qualquer falha |
| **Site fora do ar** | verificação de disponibilidade em `https://useguide.com.br` e `/api/health` | 2 falhas seguidas, de 3 regiões |
| **Gasto** | orçamento do faturamento | 50%, 90% e 100% do valor definido |

* Os avisos vão por e-mail e para o app **Google Cloud** no celular (notificação push).
* O código ganha um logger estruturado em `server/infrastructure/logging` (§10.3). Ele grava em JSON com `severity`, `requestId`, `domain`, `operation` e o trace, sem PII, e o erro com a pilha de chamadas, que é o que o Error Reporting precisa para agrupar. Os `console.error` do webhook e do checkout passam a gravar `operation: 'stripe_webhook'` e `outcome: 'failed'`, que é o que as métricas de log contam. Isso resolve o débito do §10.3 e o do handler global, que devolve `err.message` ao cliente (§7.10 A05).
* Os alertas ficam num script versionado (`scripts/ops/setup-monitoring.sh`), rodado uma vez no Cloud Shell e de novo quando mudar. Nada de clicar no console sem registro.

## 3. Backup e restauração

| O quê | Como | Retenção |
|---|---|---|
| Firestore: voltar no tempo | **PITR** (recuperação a qualquer minuto) ligado | 7 dias |
| Firestore: cópia diária | **backup agendado** do Firestore | 7 dias |
| Firestore: cópia semanal | backup agendado | 8 semanas |
| Storage (fotos e documentos) | **exclusão reversível** (soft delete) do bucket | 7 dias |
| Teste de restauração | restaurar o backup num banco novo e conferir; repetir a cada 3 meses (§7.10) | registro em `docs/arquitetura/restauracoes.md` |

* Os backups ficam no mesmo projeto, sem acesso pelo app. Os documentos de verificação ficam cifrados (§7.7) também no backup.
* Os comandos também ficam no `setup-monitoring.sh`.

## 4. Custos

| Item | Custo |
|---|---|
| GitHub Actions | **grátis:** o repositório é público, e repositório público não paga minutos nos runners padrão do GitHub |
| Error Reporting e verificação de disponibilidade | grátis na cota do Google Cloud |
| Políticas de alerta | cobradas por condição (por volta de US$ 0,10 a US$ 0,35 por mês cada; conferir a tabela atual). Com as 7 da tabela, menos de US$ 3 por mês |
| PITR e backups do Firestore | cobrados pelo tamanho guardado; com o banco de hoje (dados de teste), centavos por mês |
| Logs | 50 GiB por mês grátis; o volume atual fica bem abaixo |

## 5. Ordem de execução

1. Depois do primeiro deploy da D23 (o PR da `claude/agents-md-v2`), um PR com: os passos 1 a 3 no `deploy.yml`, o logger estruturado e o `setup-monitoring.sh`.
2. O responsável dá os papéis da seção 1 à `github-deployer` e roda o `setup-monitoring.sh` no Cloud Shell.
3. Primeiro teste de restauração, registrado.

## 6. Implementação (2026-11-08)

* **Logs:** `server/infrastructure/logging/structuredLog.ts`. Em produção, cada `console.*` vira uma linha JSON com `severity`, `requestId` e `logging.googleapis.com/trace`; `ERROR` leva o tipo `ReportedErrorEvent` e a pilha, então o Error Reporting agrupa os 85 `console.error` existentes sem mudar cada chamada.
* **Alertas sem depender de texto de log:** as métricas de webhook, checkout e 401/403/429 contam as respostas do registro de requisições do Cloud Run (`run.googleapis.com/requests`), por rota e status.
* **Deploy:** passos "Mudanças", "Índices do Firestore", "Rules" e "Cloud Functions" no `deploy.yml`, desligados até `DEPLOY_FIREBASE_BACKEND=true`. Com o disparo manual (Actions → deploy → Run workflow), sobem os três de uma vez: é o jeito de publicar o que hoje está pendente à mão.
* **Script:** `scripts/ops/setup-monitoring.sh` (testado com um `gcloud` simulado; o primeiro uso real pode pedir ajuste).

### Passos do responsável

1. Papéis na `github-deployer` (Cloud Shell):
```bash
P=gen-lang-client-0788355965; SA=github-deployer@$P.iam.gserviceaccount.com
for R in roles/firebaserules.admin roles/datastore.indexAdmin roles/cloudfunctions.developer \
         roles/cloudscheduler.admin roles/secretmanager.viewer; do
  gcloud projects add-iam-policy-binding $P --member=serviceAccount:$SA --role=$R --condition=None
done
gcloud iam service-accounts add-iam-policy-binding 377157973786-compute@developer.gserviceaccount.com \
  --member=serviceAccount:$SA --role=roles/iam.serviceAccountUser
```
2. GitHub → Settings → Secrets and variables → Actions → Variables: `DEPLOY_FIREBASE_BACKEND` = `true`.
3. Actions → deploy → Run workflow (publica índices, rules e Functions pendentes).
4. Cloud Shell, na pasta do repositório: `ALERT_EMAIL=<seu e-mail> bash scripts/ops/setup-monitoring.sh` (opcional: `BILLING_ACCOUNT=… BUDGET_BRL=…`).
5. Console → Error Reporting → Configure notifications → canal "Use Guide - alertas".

