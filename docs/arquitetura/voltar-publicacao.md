# Como voltar uma publicação

Quando uma publicação (merge na `main` → `deploy.yml`) quebra o app em produção, este é o caminho para voltar à versão anterior em poucos minutos, sem esperar um PR novo. Depois de voltar, a causa é corrigida com calma, num PR normal.

* **Onde rodar:** Cloud Shell, logado com a conta dona do projeto.
* **Quem decide voltar:** o responsável do produto (ação de produção, AGENTS.md §15). O agente prepara os comandos e confere o resultado.
* **O que volta:** o servidor (Cloud Run) e o site (Firebase Hosting). **O que não volta sozinho:** regras e índices do Firestore, Cloud Functions e dados (passo 5).

---

## Passo 1 · Confirmar o problema e anotar a hora

* Abrir o alerta que chegou por e-mail (Monitoring ou Error Reporting) e anotar a hora em que começou.
* Conferir `https://useguide.com.br/api/health` e a tela que quebrou.
* Anotar o número da publicação (GitHub → Actions → deploy) e o PR que entrou.

## Passo 2 · Voltar o servidor (Cloud Run)

```bash
gcloud config set project gen-lang-client-0788355965
gcloud run revisions list --service=use-guide --region=us-east1 --limit=5 \
  --format="table(metadata.name, metadata.creationTimestamp, status.conditions[0].status)"
```

A primeira linha é a versão nova (com problema); a segunda é a anterior. Mande todo o tráfego para a anterior, trocando o nome:

```bash
gcloud run services update-traffic use-guide --region=us-east1 \
  --to-revisions=NOME-DA-REVISAO-ANTERIOR=100
curl -s https://useguide.com.br/api/health   # deve responder {"status":"ok",...}
```

A próxima publicação volta sozinha para a versão mais nova (`--to-latest` no `deploy.yml`), então não precisa desfazer este passo.

## Passo 3 · Voltar o site (Firebase Hosting)

Servidor e site sobem juntos e precisam combinar (AGENTS.md §10.1). Volte os dois.

1. Console do Firebase → **Hosting** → **Histórico de versões** (Release history).
2. Na versão anterior à de hoje, menu **⋮** → **Reverter** (Rollback).
3. Abra o site numa aba anônima e confira a tela que tinha quebrado.

## Passo 4 · Tirar o código ruim da `main`

Sem isso, a próxima publicação traz o problema de volta.

* O agente abre um PR que desfaz o merge (`git revert -m 1 <commit do merge>`), a partir da `claude/agents/useguide`.
* O PR passa pelo CI como qualquer outro e é publicado com "aprovado, pode publicar".

## Passo 5 · O que não volta com os passos acima

| O quê | Quando importa | Como voltar |
|---|---|---|
| **Regras** do Firestore e do Storage | a publicação mudou `firestore.rules` ou `storage.rules` | o PR do passo 4 publica as regras anteriores; com pressa: `git checkout <commit anterior> -- firestore.rules storage.rules` e `npx firebase deploy --only firestore:rules,storage` |
| **Índices** do Firestore | quase nunca | índice a mais não quebra nada; deixe como está |
| **Cloud Functions** | a publicação mudou `functions/` | o PR do passo 4 publica a versão anterior |
| **Dados** | a publicação rodou um script de uma vez ou gravou dados errados | voltar o banco a um minuto anterior (PITR, até 7 dias) ou restaurar um backup num banco separado e copiar o que precisa, seguindo `restauracoes.md`; nunca sobrescrever produção sem conferir antes |
| **Segredos e variáveis** | a publicação dependia de um segredo novo | voltar o servidor (passo 2) já usa a configuração da revisão anterior |

## Passo 6 · Registrar

Uma linha no `decisoes.md` (na publicação que deu problema): o que quebrou, quando, quanto tempo durou, como voltou e o PR da correção. Se o problema expôs dado pessoal, seguir o AGENTS.md §7.5 (comunicar o responsável na hora; ANPD e titulares conforme a Resolução CD/ANPD nº 15/2024).
