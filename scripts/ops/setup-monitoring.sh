#!/usr/bin/env bash
# Alertas de erro e backup do Use Guide (proposta publicacao-alertas-backup.md, branch de documentação).
# Rodar no Cloud Shell, logado com a conta dona do projeto. Pode rodar de novo: o que já existe é pulado.
#
# Uso:
#   ALERT_EMAIL=voce@exemplo.com bash scripts/ops/setup-monitoring.sh
# Opcional:
#   BILLING_ACCOUNT=XXXXXX-XXXXXX-XXXXXX BUDGET_BRL=300   (alerta de gasto em 50%, 90% e 100%)
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0788355965}"
DATABASE="${FIRESTORE_DATABASE:-ai-studio-3b61db50-1942-4c81-9044-7e5c7c930e12}"
BUCKET="${STORAGE_BUCKET:-gen-lang-client-0788355965.firebasestorage.app}"
SERVICE="${CLOUD_RUN_SERVICE:-use-guide}"
HOST="${SITE_HOST:-useguide.com.br}"
: "${ALERT_EMAIL:?Informe ALERT_EMAIL (e-mail que recebe os alertas)}"

gcloud config set project "$PROJECT_ID" >/dev/null
gcloud services enable monitoring.googleapis.com logging.googleapis.com \
  clouderrorreporting.googleapis.com firestore.googleapis.com >/dev/null
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "== Canal de e-mail"
CHANNEL="$(gcloud beta monitoring channels list \
  --filter="type=email AND labels.email_address=\"$ALERT_EMAIL\"" --format='value(name)' | head -1)"
if [ -z "$CHANNEL" ]; then
  CHANNEL="$(gcloud beta monitoring channels create --type=email \
    --display-name='Use Guide - alertas' --channel-labels="email_address=$ALERT_EMAIL" \
    --format='value(name)')"
fi
echo "$CHANNEL"

echo "== Métricas de log"
metric() { # nome, descrição, filtro
  if gcloud logging metrics describe "$1" >/dev/null 2>&1; then
    gcloud logging metrics update "$1" --description="$2" --log-filter="$3" >/dev/null
  else
    gcloud logging metrics create "$1" --description="$2" --log-filter="$3" >/dev/null
  fi
  echo "$1"
}
RUN_REQ="resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE\" AND log_id(\"run.googleapis.com/requests\")"
metric stripe_webhook_failed 'Webhook do Stripe respondeu 5xx (o Stripe vai reenviar)' \
  "$RUN_REQ AND httpRequest.requestUrl=~\"/api/payment/webhook\" AND httpRequest.status>=500"
metric checkout_failed 'Falha 5xx ao criar pedido, reserva ou pagamento' \
  "$RUN_REQ AND httpRequest.requestUrl=~\"/api/(ticketing/orders|bookings|payment)\" AND NOT httpRequest.requestUrl=~\"/webhook\" AND httpRequest.status>=500"
metric api_denied 'Respostas 401, 403 e 429 da API (login, permissão e limite)' \
  "$RUN_REQ AND httpRequest.requestUrl=~\"/api/\" AND (httpRequest.status=401 OR httpRequest.status=403 OR httpRequest.status=429)"
metric jobs_failed 'Erro nas Cloud Functions (jobs agendados)' \
  "(resource.type=\"cloud_function\" OR (resource.type=\"cloud_run_revision\" AND resource.labels.service_name!=\"$SERVICE\")) AND severity>=ERROR"

echo "== Verificação de disponibilidade"
CHECK_ID="$(gcloud monitoring uptime list-configs --filter="displayName=\"Use Guide - site\"" \
  --format='value(name)' | head -1 | awk -F/ '{print $NF}')"
if [ -z "$CHECK_ID" ]; then
  gcloud monitoring uptime create 'Use Guide - site' --resource-type=uptime-url \
    --resource-labels="host=$HOST,project_id=$PROJECT_ID" --path=/api/health --protocol=https \
    --period=5 --timeout=10 >/dev/null
  CHECK_ID="$(gcloud monitoring uptime list-configs --filter="displayName=\"Use Guide - site\"" \
    --format='value(name)' | head -1 | awk -F/ '{print $NF}')"
fi
echo "$CHECK_ID"

echo "== Políticas de alerta"
policy() { # nome de exibição, filtro da métrica, alinhador, janela (s), limite
  local name="$1" filter="$2" aligner="$3" window="$4" threshold="$5"
  if gcloud alpha monitoring policies list --filter="displayName=\"$name\"" --format='value(name)' | grep -q .; then
    echo "já existe: $name"
    return
  fi
  cat > "$TMP/policy.json" <<JSON
{
  "displayName": "$name",
  "combiner": "OR",
  "notificationChannels": ["$CHANNEL"],
  "alertStrategy": { "autoClose": "86400s" },
  "conditions": [{
    "displayName": "$name",
    "conditionThreshold": {
      "filter": $(printf '%s' "$filter" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))'),
      "aggregations": [{ "alignmentPeriod": "${window}s", "perSeriesAligner": "$aligner",
                         "crossSeriesReducer": "REDUCE_SUM" }],
      "comparison": "COMPARISON_GT",
      "thresholdValue": $threshold,
      "duration": "0s",
      "trigger": { "count": 1 }
    }
  }]
}
JSON
  gcloud alpha monitoring policies create --policy-from-file="$TMP/policy.json" >/dev/null
  echo "criada: $name"
}
policy 'Use Guide - erros 5xx no servidor' \
  "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\"" \
  ALIGN_SUM 300 10
policy 'Use Guide - falha no webhook do Stripe' \
  'metric.type="logging.googleapis.com/user/stripe_webhook_failed" AND resource.type="cloud_run_revision"' \
  ALIGN_SUM 600 0
policy 'Use Guide - falha ao criar pagamento' \
  'metric.type="logging.googleapis.com/user/checkout_failed" AND resource.type="cloud_run_revision"' \
  ALIGN_SUM 600 2
policy 'Use Guide - pico de 401/403/429' \
  'metric.type="logging.googleapis.com/user/api_denied" AND resource.type="cloud_run_revision"' \
  ALIGN_SUM 900 150
policy 'Use Guide - job agendado com erro' \
  'metric.type="logging.googleapis.com/user/jobs_failed"' \
  ALIGN_SUM 600 0
policy 'Use Guide - site fora do ar' \
  "resource.type=\"uptime_url\" AND metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id=\"$CHECK_ID\"" \
  ALIGN_COUNT_FALSE 300 1

echo "== Backup do Firestore ($DATABASE)"
gcloud firestore databases update --database="$DATABASE" --enable-pitr >/dev/null && echo "PITR ligado (7 dias)"
if [ -z "$(gcloud firestore backups schedules list --database="$DATABASE" --format='value(name)')" ]; then
  gcloud firestore backups schedules create --database="$DATABASE" --recurrence=daily --retention=7d >/dev/null
  gcloud firestore backups schedules create --database="$DATABASE" --recurrence=weekly \
    --day-of-week=SUN --retention=8w >/dev/null
  echo "backups criados: diário (7 dias) e semanal (8 semanas)"
else
  echo "backups agendados já existem"
fi

echo "== Storage: exclusão reversível de 7 dias"
gcloud storage buckets update "gs://$BUCKET" --soft-delete-duration=7d >/dev/null && echo "ok"

if [ -n "${BILLING_ACCOUNT:-}" ] && [ -n "${BUDGET_BRL:-}" ]; then
  echo "== Orçamento"
  gcloud billing budgets create --billing-account="$BILLING_ACCOUNT" \
    --display-name='Use Guide - orçamento mensal' --budget-amount="${BUDGET_BRL}BRL" \
    --filter-projects="projects/$PROJECT_ID" \
    --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0 >/dev/null
  echo "ok"
fi

cat <<'FIM'

Pronto. Falta um passo no console (não há comando para ele):
  Error Reporting -> "Configure notifications" -> marque o canal "Use Guide - alertas".
Para receber os alertas no celular, instale o app Google Cloud e entre com a mesma conta.
FIM
