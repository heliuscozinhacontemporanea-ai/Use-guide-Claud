# Fuso por estabelecimento — proposta (2026-11-08)

Para o lançamento em todo o Brasil. Hoje o app inteiro usa um fuso só, `America/Fortaleza` (UTC−3), como manda o AGENTS.md §1. Num evento em Manaus (UTC−4), a hora digitada pelo parceiro é gravada com 1 hora de diferença, e o comprador vê a hora errada.

## O tamanho da mudança hoje

* **34 arquivos** citam `America/Fortaleza`. No app são 17: datas, agenda, Agora, carteira, notificações, termos e planos. No servidor são 9: dia do negócio, cartões do Início, recorrência de horários, rodízio de destaque, push e textos de notificação. Nas Cloud Functions são 8: jobs de expirar, lembretes, resumo diário, repasses e planos.
* **~60 arquivos do app** usam `shared/utils/businessDateTime` (mostrar data e hora, `datetime-local` dos formulários).
* Avisos "fuso de Fortaleza (UTC−3)" em 3 formulários: horários de passeio, sessões de evento e adiar sessão.
* **Não há dado para descobrir o fuso:** o estabelecimento guarda a região (`location`, ex.: "Jericoacoara") e o endereço em texto; o evento tem nome, endereço e, às vezes, latitude e longitude. Não há UF.
* Tudo já é gravado em UTC (§1). O que muda é **como a hora é digitada, mostrada e agrupada por dia**, não o que está gravado.

## Fusos do Brasil (sem horário de verão desde 2019)

| Fuso | IANA | Onde |
|---|---|---|
| UTC−2 | `America/Noronha` | Fernando de Noronha e ilhas |
| UTC−3 | `America/Sao_Paulo` (Brasília) e equivalentes (`America/Fortaleza`, `America/Recife`, `America/Belem`, `America/Bahia`) | DF, Sul, Sudeste, Nordeste, PA, AP, TO |
| UTC−4 | `America/Manaus`, `America/Cuiaba`, `America/Campo_Grande`, `America/Porto_Velho`, `America/Boa_Vista` | AM (leste), MT, MS, RO, RR |
| UTC−5 | `America/Rio_Branco`, `America/Eirunepe` | AC e oeste do AM |

Guardar o nome IANA, e não um número fixo como "−3", deixa o código pronto se o horário de verão voltar.

## O caso do viajante (definido em 2026-11-08)

Quem mora em Manaus ou em outro país e planeja a viagem para Jericoacoara vê **o horário de Jericoacoara**: o luau "às 20:00" é 20:00 no relógio de quem estiver lá. O responsável do produto confirmou essa regra, que é também a do mercado:

* **Klook** diz na central de ajuda que todos os horários mostrados estão no fuso local de onde a atividade acontece ([Klook](https://www-verify.klook.cn/en-IN/faq/category-61-question-937)).
* **Airbnb:** check-in e check-out são na hora local do anúncio ([Airbnb](https://www.airbnb.com/help/article/2060)); a Guesty mostra a confusão que surge quando uma ferramenta usa a hora do computador ([Guesty](https://help.guesty.com/hc/en-gb/articles/9370043683613-Changing-a-listing-s-check-in-and-check-out-times)).
* **Google Maps:** o horário de funcionamento é guardado com o fuso do lugar (`utc_offset_minutes`), e o fuso sai da posição no mapa ([Google Places](https://developers.google.com/maps/documentation/javascript/place_field_js_migration?authuser=0); [Time Zone API](https://developers.google.com/maps/documentation/timezone/overview?hl=pt-br)).
* **Eventbrite:** relatos de usuários dizem que o único fuso que importa é o do local do evento ([The Events Calendar](https://theeventscalendar.com/support/forums/topic/eventbrite-ticket-time-zones/)).
* **Shopify** é o contrário: a loja escolhe o fuso à mão ([Supermetrics](https://docs.supermetrics.com/v1/docs/about-timezone-setting-discrepancies-in-shopify-data)). Isso serve para loja online, não para serviço com local.

Para o viajante não se confundir, quando o aparelho dele está em outro fuso, a hora vem com o lugar: "20:00 (horário de Jericoacoara)". Quem está no mesmo fuso não vê nada a mais.

## Referências

* **Eventbrite:** cada evento tem o próprio fuso, e os e-mails seguem o fuso do evento, não o do aparelho ([Zoom Community](https://community.zoom.com/t5/Zoom-Events-and-Webinars/Webinar-sent-out-wrong-time/m-p/139483); [The Events Calendar](https://theeventscalendar.com/support/forums/topic/eventbrite-ticket-time-zones/)).
* **Airbnb:** check-in e check-out são na hora local do anúncio; ferramentas que mostram a hora do computador causam confusão ([Guesty](https://help.guesty.com/hc/en-gb/articles/9370043683613-Changing-a-listing-s-check-in-and-check-out-times); [Airbnb](https://www.airbnb.com/help/article/2060)).
* **EventMobi:** mostra os horários no fuso do evento, não no do aparelho ([EventMobi](https://help.eventmobi.com/en/knowledge/what-timezone-will-apply-to-my-virtual-event)).
* **Fusos oficiais:** Lei 12.876/2013 ([Valor Final](https://valorfinal.com.br/guia/fusos-horarios-do-brasil)).

Regra comum: **a hora de um serviço é sempre a hora do lugar onde ele acontece**; o fuso só aparece escrito quando quem vê está em outro.

## Proposta

### 1. Onde o fuso mora

* **Estabelecimento** ganha `timeZone` (IANA), obrigatório, escolhido no cadastro (ver decisão 1).
* **Evento e oferta** copiam o fuso do estabelecimento ao serem criados e o seguem quando ele muda (o parceiro não escolhe fuso por evento). Evento sem estabelecimento (produtor) escolhe o fuso no próprio cadastro.
* **Pedido e reserva** guardam o fuso no resumo (`eventSnapshot`, `offerSnapshot`), para recibos, e-mails e notificações saírem certos mesmo se o anúncio mudar depois.
* Antes da liberação (§2.2.8): os dados de teste ficam com `America/Fortaleza` e não há código de compatibilidade.

### 2. Como a hora aparece

* **Para o comprador:** a hora do serviço, no fuso do serviço. Quando o aparelho está em outro fuso, aparece o fuso ao lado, ex.: "20:00 (horário de Manaus)".
* **No painel:** cada evento ou horário na hora do lugar. "Hoje" e os dias da Agenda seguem o **fuso do painel** (decisão 2); um item de outro fuso mostra o fuso ao lado.
* **Formulários:** o `datetime-local` é lido no fuso do estabelecimento, que aparece escrito uma vez no formulário ("Horários em Manaus, UTC−4") só quando é diferente do aparelho. Os 3 avisos fixos de Fortaleza saem.
* Sem biblioteca nova: `Intl.DateTimeFormat` com `timeZone` resolve mostrar e converter. As funções de `shared/utils/businessDateTime` passam a receber o fuso.

### 3. Contas por dia ou por mês (decisão 3)

| Conta | Fuso proposto |
|---|---|
| Recorrência de horários, lembretes de serviço, janela do código, fim de serviço para repasse | Do estabelecimento (já são do serviço) |
| Relatórios, "Vendas de hoje", "Recebido em <mês>", cartões do Início | Do painel do parceiro |
| Vigência dos termos, resumo diário de notificações, rodízio de destaque, jobs | Brasília (`America/Sao_Paulo`), o fuso da plataforma |

### 4. Etapas

1. **F1 (feita em 2026-11-08):** estado e cidade no cadastro do estabelecimento (obrigatórios, também no perfil de produtor); `timeZone` calculado no servidor e copiado para evento e oferta (ao criar e ao editar); utilitários de fuso em `server/shared/kernel/timeZones.ts` e `src/shared/utils/timeZones.ts`, com teste de paridade; AGENTS.md §1 e §12.4 atualizados. Ainda nada muda na tela de horários: isso é a F2.
2. **F2 (feita em 2026-11-08):** evento e oferta guardam também a cidade do estabelecimento (`city`), o nome mostrado ao lado da hora; mudar o estado ou a cidade do estabelecimento leva o fuso novo para os eventos e ofertas dele; a recorrência de horários é expandida no servidor no fuso da oferta. No app, as sessões do editor (parceiro e admin), os lotes, adiar sessão, criar e remarcar horários de passeio, a semana de horários, a escolha de sessão e de horário do comprador e a data na página do evento usam a hora do lugar. Para quem está em outro fuso aparece "Horários de Jericoacoara (UTC−3)" nos formulários e listas, e "20:00 (horário de Jericoacoara)" numa hora sozinha. Os 3 avisos fixos de Fortaleza saíram. A região do estabelecimento e do evento virou texto livre, com as regiões de Jericoacoara como sugestão. Ficam para a F4: datas dos cupons e o rótulo de sessão em "Vale para".
3. **F3:** compra e reserva (resumos com fuso), carteira, recibos, e-mails, push e PDFs.
4. **F4:** painel ("Hoje", Agenda, Agora, relatórios) e jobs nas Cloud Functions.
5. **F5:** AGENTS.md e `decisoes.md`.

### 5. Mudança no AGENTS.md (§15: precisa de autorização)

* **§1, texto atual:** "**Fuso horário canônico do negócio:** `America/Fortaleza` (UTC−3, sem horário de verão). Datas DEVEM ser persistidas em UTC (ISO 8601 ou Timestamp) e exibidas no fuso do negócio, ou no fuso do usuário quando ele escolher."
* **§1, texto proposto:** "**Fuso horário:** cada estabelecimento tem o seu (`timeZone`, nome IANA), e eventos e ofertas usam o do estabelecimento. Datas DEVEM ser persistidas em UTC (ISO 8601 ou Timestamp). A hora de um serviço é exibida e digitada no fuso do serviço, com o fuso indicado quando o usuário estiver em outro. Contas da plataforma (vigência de termos, jobs, destaques) usam `America/Sao_Paulo`."
* **§12.4, texto atual:** "Horário de evento, passeio e translado SEMPRE no fuso do negócio, com o fuso indicado quando o usuário estiver em outro."
* **§12.4, texto proposto:** "Horário de evento, passeio e translado SEMPRE no fuso do estabelecimento, com o fuso indicado quando o usuário estiver em outro."
* **Motivo:** lançamento em todo o Brasil, que tem 4 fusos.
