# Tour do painel do parceiro — proposta 2 (2026-11-07)

O tour entregue no `b13b68c` cobre só o Início. Agenda, Catálogo, Ganhos e Mais aparecem no máximo como "toque aqui", sem explicar o que há dentro de cada uma.

## O que as referências dizem

| Referência | O que tiramos dela |
|---|---|
| NN/g, [Mobile tutorials](https://www.nngroup.com/articles/mobile-tutorials/) e [Mobile app onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) | Num teste com 70 pessoas, quem leu o tutorial de abertura não foi melhor nas tarefas (91% × 94%) e achou o app mais difícil. Em apps complexos, as dicas no contexto funcionam melhor que um tutorial longo, porque ninguém lembra de tudo que viu de uma vez. |
| Apple TipKit ([Tip](https://developer.apple.com/documentation/tipkit/tip.md), [Rule](https://developer.apple.com/documentation/tipkit/tips/rule.md)) | A dica aparece quando a pessoa chega no lugar dela (regra por evento). A frequência é controlada no app todo, e cada dica tem um número máximo de vezes, depois do qual some sozinha. |
| Chameleon, [Contextual guidance vs product tours](https://www.chameleon.io/blog/contextual-in-app-guidance-vs-product-tours-guide) | Um tour linear único só serve quando o produto tem um caminho só. Com várias áreas, quem ainda não precisa de uma delas pula tudo. |
| Flook, [Onboarding tours](https://flook.co/blog/onboarding-tours), e Userpilot, [Onboarding tour](https://userpilot.com/blog/onboarding-tour/) | A recomendação é misturar formatos: dica para tirar uma dúvida, checklist para dar ritmo, e sempre com a opção de pular. |
| Painel de anfitrião do Airbnb ([Exploring your hosting tools](https://www.airbnb.com/resources/hosting-homes/a/exploring-your-hosting-tools-738)) | Usa a mesma divisão que o nosso painel: Hoje, Calendário, Anúncios e Menu (com ganhos). Cada aba é apresentada pelo que se faz nela, não pelos botões. |

Conclusão das referências: tours longos ensinam pouco, e o que ajuda é a explicação no lugar certo.

**Decisão do responsável do produto (2026-11-07): um tour único que passa por todas as abas.** Para reduzir o problema apontado pela NN/g:

* o tour é dividido em capítulos, um por aba, com o nome da aba e o progresso no cartão (ex.: "Agenda · 2 de 3");
* o tour troca de aba sozinho, para que cada explicação apareça em cima do elemento real;
* quem quiser rever uma parte vai direto ao capítulo dela, a partir de Mais.

## Proposta

### 1. Sequência (14 passos; o passo sem elemento na tela é pulado)

| Capítulo | Destaque → texto curto |
|---|---|
| **Início** | 1. Barra de atalhos → "Daqui você vai para Agenda, Catálogo, Ganhos e Mais. Vamos passar por cada uma." · 2. Estabelecimento (só com 2 ou mais) → "Troque o estabelecimento ou veja todos juntos." · 3. Resolva agora → "Pendências que precisam de você: documentos, conta de recebimento, termos." · 4. Agora (só na hora de um serviço) → "Na hora do serviço: código, Cheguei e portaria." · 5. Cartões → "Seus números. Escolha quais aparecem em Personalizar." |
| **Agenda** | 6. Semana e mês → "Mude de semana pelas setas ou arrastando os dias; toque no mês para ver o calendário." · 7. Lista do dia → "Toque num horário ou sessão para ver quem vem, o código e a portaria." |
| **Catálogo** | 8. Estabelecimentos / Eventos / Ofertas → "Seus anúncios, separados por tipo." · 9. Criar → "Crie um evento, uma oferta ou um estabelecimento." · 10. Primeiro item (só se houver) → "Abra um evento para ver vendas, convidados e divulgadores; um estabelecimento, para o plano e o selo." |
| **Ganhos** | 11. A receber / Recebido → "O que ainda vai cair na conta e o que já caiu no mês." · 12. Repasses / Extrato / Dívidas → "Cada repasse, cada venda e o que foi descontado." · 13. Contas e Relatórios → "Onde o dinheiro cai, por CNPJ, e as vendas por período." |
| **Mais** | 14. Lista de Mais → "Estabelecimentos, planos, contas, termos e ajuda. O tour fica aqui, em Ver o tour do painel." (botão **Concluir**) |

* Ao passar de capítulo, o painel troca de aba e o próximo passo espera a aba carregar. Se ela não carregar em 5 s ou der erro, o capítulo é pulado.
* Botões **Voltar** e **Próximo** (Voltar pode voltar para a aba anterior). Fora do primeiro passo, o cartão mostra "Capítulo · n de N".
* O tour abre na primeira entrada no painel, só no Início, e nunca por cima de uma folha ou diálogo aberto.
* Ao terminar, o painel volta para o Início.

### 2. Pular, concluir e não mostrar (decidido)

* **Concluir** marca o tour como visto.
* **Pular** fecha o tour, que volta na próxima entrada no painel uma vez só: no máximo 2 aparições, como o limite de vezes do TipKit. Depois disso, conta como visto.
* **"Não mostrar dicas do painel"** desliga o tour e qualquer outra dica do painel que vier depois.

### 3. Rever

Em Mais, "Ver o tour do painel" abre uma folha com "Do começo" e um atalho para cada capítulo: Início, Agenda, Catálogo, Ganhos e Mais. O tour aberto por esse atalho começa no capítulo escolhido e segue até o fim.

### 4. Dados (muda o modelo, §15)

* Hoje existe `partners/{uid}.panelTourDoneAt`. Passa a ser `partners/{uid}.panelTour: { doneAt: string | null; shown: number; tipsOff: boolean }`.
* Classe Interna. Só o dono, pela API; só o backend grava.
* `PUT /api/partner-home/tour`, com body `{ action: 'shown' | 'done' | 'tips_off' }`, validado por Zod.
* `GET /api/partner-home` devolve `tour: { show: boolean; tipsOff: boolean }`. `show` é falso quando há `doneAt`, quando `tipsOff` está ligado ou quando o tour já apareceu 2 vezes.
* Antes da liberação (§2.2.8), o campo antigo é trocado direto, sem leitura do formato antigo.

## Fora desta proposta (decidido: depois, à parte)

* Checklist "Primeiros passos" no Início: cadastrar o estabelecimento, conta de recebimento pronta e primeiro anúncio publicado.
* Dicas pontuais nas telas internas (portaria, Convidados, Divulgadores), respeitando a mesma caixa "Não mostrar dicas do painel".
