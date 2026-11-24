# Teste de restauração do backup

O AGENTS.md (§7.10) pede um teste a cada **3 meses**: restaurar o backup do Firestore num banco separado, conferir que os dados estão lá e apagar o banco de teste. O backup foi ligado pelo `scripts/ops/setup-monitoring.sh` (proposta `propostas/publicacao-alertas-backup.md`). O teste **não mexe no banco de produção**.

* **Onde rodar:** Cloud Shell, logado com a conta dona do projeto.
* **Tempo:** de 20 a 60 minutos, quase todo esperando a restauração.
* **Custo:** centavos. O banco de teste é cobrado pelo tamanho enquanto existir.
* **Cuidado:** o banco restaurado tem os mesmos dados pessoais da produção. O app não sabe o nome dele, mas ele **deve ser apagado no mesmo dia** (passo 6).

---

## Passo 1 · Preparar

Cole no Cloud Shell:

```bash
P=gen-lang-client-0788355965
DB=ai-studio-3b61db50-1942-4c81-9044-7e5c7c930e12
BUCKET=gen-lang-client-0788355965.firebasestorage.app
HOJE=$(TZ=America/Sao_Paulo date +%Y%m%d)
DEST=restore-test-$HOJE
gcloud config set project "$P"
```

## Passo 2 · Ver os backups

```bash
gcloud firestore backups list --filter="database~$DB" \
  --format="table(name.basename(), state, snapshotTime, expireTime)" --sort-by=~snapshotTime
```

Deve aparecer pelo menos um backup com `state` = `READY`. A lista com 7 diários e até 8 semanais aparece depois de algumas semanas ligado.

* **Lista vazia:** o backup não foi ligado. Rode de novo o `setup-monitoring.sh` (ele pula o que já existe) e volte no dia seguinte.

## Passo 3 · Restaurar o backup mais recente num banco novo

```bash
BACKUP=$(gcloud firestore backups list --filter="database~$DB AND state=READY" \
  --sort-by=~snapshotTime --limit=1 --format="value(name)")
echo "Backup usado: $BACKUP"
gcloud firestore databases restore --source-backup="$BACKUP" --destination-database="$DEST"
```

Acompanhe até a operação mostrar `done: true` (repita o comando a cada poucos minutos):

```bash
gcloud firestore operations list --database="$DEST" --format="table(name.basename(), done, error.message)"
```

* **Erro de permissão:** a conta precisa ser dona do projeto (ou ter `roles/datastore.owner`).
* **"already exists":** já houve um teste hoje. Troque o nome, por exemplo `DEST=restore-test-$HOJE-2`.

## Passo 4 · Conferir os dados

Este bloco conta os documentos das coleções principais nos dois bancos, lado a lado. Ele só lê contagens; nenhum dado pessoal aparece na tela.

```bash
TOKEN=$(gcloud auth print-access-token)
contar() { # banco, coleção
  curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "https://firestore.googleapis.com/v1/projects/$P/databases/$1/documents:runAggregationQuery" \
    -d "{\"structuredAggregationQuery\":{\"structuredQuery\":{\"from\":[{\"collectionId\":\"$2\"}]},\"aggregations\":[{\"alias\":\"n\",\"count\":{}}]}}" |
    python3 -c 'import json,sys; r=json.load(sys.stdin); print(r[0]["result"]["aggregateFields"]["n"]["integerValue"] if isinstance(r,list) and "result" in r[0] else "erro")'
}
printf "%-22s %10s %10s\n" coleção produção restaurado
for c in items events eventOccurrences users partners publicProfiles bookableOffers bookings \
         ticketOrders tickets reviews favorites listingPlans listingVerifications listingClaims \
         paymentAccounts payoutEntries subscriptionPlans adminAuditLog; do
  printf "%-22s %10s %10s\n" "$c" "$(contar "$DB" "$c")" "$(contar "$DEST" "$c")"
done
```

**Resultado esperado:** os números são iguais, ou o restaurado é um pouco menor nas coleções que mudaram depois do horário do backup (`snapshotTime` do passo 2). Nenhuma linha deve mostrar `erro` nem um restaurado zerado com produção cheia.

Confira também pelo console: Firestore → no seletor de banco, escolha `restore-test-…` → abra a coleção `items` e um anúncio que você conhece.

* **Diferença grande ou `erro`:** não apague nada; anote a tabela e avise o agente.

## Passo 5 · (Opcional) Voltar no tempo e Storage

**Voltar a um minuto do passado (PITR, até 7 dias):** clona o banco como estava há 1 hora.

```bash
PITR=pitr-test-$HOJE
gcloud firestore databases clone --source-database="projects/$P/databases/$DB" \
  --snapshot-time="$(date -u -d '-1 hour' +%Y-%m-%dT%H:%M:00Z)" --destination-database="$PITR"
gcloud firestore operations list --database="$PITR" --format="table(name.basename(), done, error.message)"
```

Quando terminar, rode o bloco do passo 4 trocando `"$DEST"` por `"$PITR"`.

**Arquivo apagado no Storage (fotos e documentos, 7 dias):** envia um arquivo de teste, apaga e recupera.

```bash
echo "teste de restauração $HOJE" > /tmp/restore-test.txt
gcloud storage cp /tmp/restore-test.txt "gs://$BUCKET/ops/restore-test.txt"
gcloud storage rm "gs://$BUCKET/ops/restore-test.txt"
URL=$(gcloud storage ls --soft-deleted -a "gs://$BUCKET/ops/restore-test.txt" | tail -1)
gcloud storage restore "$URL"
gcloud storage cat "gs://$BUCKET/ops/restore-test.txt"   # deve mostrar "teste de restauração …"
gcloud storage rm "gs://$BUCKET/ops/restore-test.txt"
```

## Passo 6 · Apagar os bancos de teste

```bash
gcloud firestore databases delete --database="$DEST"
gcloud firestore databases delete --database="pitr-test-$HOJE"   # só se fez o passo 5
gcloud firestore databases list --format="value(name.basename())"  # deve sobrar só o banco de produção
```

* **Erro de proteção contra exclusão:** `gcloud firestore databases update --database="$DEST" --no-delete-protection` e apague de novo.

## Passo 7 · Registrar

Acrescente uma linha na tabela abaixo (ou mande os dados ao agente, que registra).

| Data | Backup usado (`snapshotTime`) | Restauração levou | Contagens | PITR / Storage | Bancos de teste apagados | Quem | Observações |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
