# Proposta v2: Use Guide na hora certa, a viagem inteira (2026-11-25)

Pedido do responsável do produto em 2026-11-25: aprofundar a pesquisa em fontes acadêmicas e institucionais sobre o que faz as pessoas consumirem em plataformas digitais, e ir além da vitrine, com um app intuitivo, que envolva quem usa e tenha **conceito próprio**.

**Relação com a v1:** a v1 (`explorar-vitrine.md`) continua como está. A v2 parte dela e mantém o cartão de vitrine, as categorias, os espaços de publicidade e as regras de anúncio. O que a v2 acrescenta:
- um conceito de produto;
- uma Explorar que muda conforme o momento da viagem;
- a aba "Minha viagem";
- a parte de depois da viagem.

A barra inferior da v2 substitui a da v1 (seção 9).

**Estado:** em aberto. Nada é implementado antes das decisões da seção 11.

Prints (protótipo com os tokens, as fontes, os ícones e os componentes do app; **nomes, preços, horários, notas e fotos são ilustrativos**) em `explorar-v2-hora-certa/`:

| Prancha | Momento | Telas |
|---|---|---|
| `1-antes-da-viagem.jpg` | sonhando e escolhendo | Explorar sem datas; coleção "Dias de vento"; interesses (claro) |
| `2-viagem-marcada.jpg` | planejando | Explorar com datas (vento previsto, nos seus dias, reserve antes); Minha viagem |
| `3-em-jeri.jpg` | vivendo | Hoje em Jeri: próxima reserva com QR, agora (vento, maré, pôr do sol), bom para agora, aberto perto; claro e francês |
| `4-depois.jpg` | lembrando | Como foi; resumo da viagem; avaliação verificada; Minha viagem em francês |

---

## 1. O que a pesquisa mostra

### 1.1. Por que as pessoas compram numa plataforma

| Achado | Fonte | O que significa para o Use Guide |
|---|---|---|
| A intenção de comprar online depende tanto da **confiança** no vendedor quanto da utilidade e da facilidade do site. Para quem ainda não comprou, **só a confiança pesou** | Gefen, Karahanna e Straub, *MIS Quarterly* 27(1), 2003; estudo irmão no *IEEE Trans. Eng. Management*, 2003 | o turista de primeira vez decide pela confiança: selo, avaliação verificada, preço total, cancelamento e foto real vêm antes de tudo |
| Em consumo, além de utilidade e facilidade, pesam **prazer de usar, valor percebido pelo preço e hábito**; o modelo passou de 56% para 74% da intenção explicada | Venkatesh, Thong e Xu, *MIS Quarterly* 36(1), 2012 (UTAUT2) | o app precisa ser gostoso de usar (fotos, ritmo), mostrar valor claro e criar o hábito de abrir durante a viagem |
| Um comportamento acontece quando **motivação, capacidade e um gatilho** se encontram no mesmo momento | Fogg, Stanford Behavior Design Lab (Modelo Fogg, 2009) | o gatilho certo é o do lugar: "maré baixa até 13:10" ou "22 nós hoje", que chega quando a pessoa está em Jeri e pode ir |
| Turistas passam por momentos de **sonhar, planejar, reservar e viver** a viagem, cada um com necessidades diferentes | Google, *Think with Google*, micro-momentos de viagem | a Explorar muda conforme o momento: sem datas, com datas, em Jeri e depois |
| O celular **muda o comportamento no destino**: resolve problemas na hora, guarda memórias e leva a refazer planos ali mesmo | Wang, Park e Fesenmaier, *Journal of Travel Research* 51(4), 2012; Wang et al., PolyU | durante a viagem, o app vira companheiro do dia, e não só catálogo |
| O tempo (clima) **muda as atividades escolhidas no destino**, mais do que a decisão de viajar | estudos de turismo e clima (Becken e Wilson, *Tourism Geographies*, 2013; revisão de 2021) | "Bom para agora" sugere pelo vento, pela maré e pela hora |

### 1.2. Por que confiam e como escolhem

| Achado | Fonte | O que significa |
|---|---|---|
| Uma estrela a mais no Yelp ≈ **5 a 9% mais receita**, concentrado nos **restaurantes independentes** | Luca, Harvard Business School, "Reviews, Reputation, and Revenue" | os parceiros de Jeri são pequenos e independentes; a avaliação vale ainda mais para eles |
| Com 5 avaliações a chance de compra é 270% maior que sem nenhuma; o efeito pesa mais em itens caros | Spiegel Research Center, Northwestern | pedir avaliação no fim do serviço e ajudar o parceiro novo a chegar às primeiras 5 |
| Onde só quem comprou pode avaliar (Expedia), há **menos manipulação** do que onde qualquer um avalia (TripAdvisor) | Mayzlin, Dover e Chevalier, *American Economic Review* 104(8), 2014 | manter a avaliação só de experiência verificada (AGENTS.md §9.4) e mostrar isso ao leitor |
| A reputação **aumenta a confiança entre pessoas diferentes** e reduz o viés de confiar só em quem é parecido | Abrahao, Parigi, Gupta e Cook (Stanford e Airbnb), *PNAS* 114(37), 2017 | avaliações traduzidas e visíveis ajudam o estrangeiro a confiar no guia local e vice-versa |
| A **foto da pessoa** (anfitrião) muda a confiança e até o preço | Ert, Fleischer e Magen, *Tourism Management* 55, 2016 | sugerir a foto real de quem guia ou atende (fase futura, no anúncio) |
| Opções demais paralisam quando a pessoa **não sabe o que quer** e as opções são complexas | Chernev, Böckenholt e Goodman, *Journal of Consumer Psychology*, 2015 (meta-análise, 99 observações, Kellogg) | coleções com curadoria ("Primeira vez em Jeri", "Dias de vento") para quem chega sem saber o que quer |
| Interfaces boas pedem **reconhecer, não lembrar**, e seguem convenções que as pessoas já conhecem de outros apps | Nielsen Norman Group, 10 heurísticas; Apple, Human Interface Guidelines (barra de abas com o mínimo de abas, de 3 a 5 no iPhone) | barra com 3 abas; padrões conhecidos (♡ salva, QR na reserva) |

### 1.3. Por que voltam e o que lembram

| Achado | Fonte | O que significa |
|---|---|---|
| A lembrança de uma experiência é dominada pelo **pico e pelo fim**, quase sem peso da duração | Kahneman, Fredrickson, Schreiber e Redelmeier, *Psychological Science*, 1993; Redelmeier, Katz e Kahneman, 2003 | o app cuida do fim: avaliação logo depois do serviço, resumo da viagem e "para a próxima vez" |
| Experiência é uma categoria própria de valor; o que fica é a **memória** | Pine e Gilmore, *Harvard Business Review*, 1998 | o produto não é o ingresso, é o dia bom em Jeri; o resumo da viagem é parte do produto |
| Engajamento é **atenção, controle, novidade, retorno e prazer**, num ciclo de entrar, ficar, sair e voltar | O'Brien e Toms, *JASIST* 59(6), 2008 | o "voltar" vem de motivo real (o vento de hoje, a reserva de amanhã), e não de notificação vazia |
| O que prende nos jogos é sentir **autonomia, competência e vínculo** | Ryan, Rigby e Przybylski (Univ. de Rochester), *Motivation and Emotion*, 2006 (teoria da autodeterminação) | autonomia: a pessoa monta o roteiro; competência: ela "acerta a hora"; vínculo: viaja e planeja com quem vai junto |
| Planos com **quando e onde** aumentam muito a chance de a pessoa fazer o que pretendia (d = 0,65, em 94 estudos) | Gollwitzer e Sheeran, meta-análise de 2006 (Univ. de Konstanz e NYU) | "Minha viagem" põe cada experiência num dia e numa hora |
| Quanto **mais perto da meta**, mais a pessoa acelera; o progresso visível ajuda a concluir | Kivetz, Urminsky e Zheng, *Journal of Marketing Research*, 2006 (Columbia) | barra "3 de 5 dias com plano", sempre com o progresso real, nunca inflado |
| Gamificação funciona **só em certos contextos e públicos** | Hamari, Koivisto e Sarsa, HICSS 2014 (revisão de 24 estudos) | nada de pontos, sequências ou medalhas agora; o envolvimento vem da própria viagem |
| Recomendação pessoal é esperada (71%) e a falta dela frustra (76%); personalização costuma trazer 10 a 15% a mais de receita | McKinsey, "Next in Personalization", 2021 | sugerir pelos interesses que a pessoa escolheu e pelo momento, de forma explicada |
| Na Netflix, a recomendação no início do app é onde a maior parte do que se assiste é descoberta | Gomez-Uribe e Hunt, *ACM TMIS* 6(4), 2015 | a Explorar é a vitrine personalizada; a ordem importa |

### 1.4. Limites éticos e legais

| Achado | Fonte | Regra na v2 |
|---|---|---|
| "Padrões obscuros" empurram, enganam ou coagem; são comuns e causam dano ao consumidor | OCDE, *Dark Commercial Patterns*, 2022; Mathur et al. (Princeton), 2019 | sem urgência falsa, sem contador, sem "quase esgotado" inventado, sem dificultar cancelar |
| Esconder taxas até o fim aumenta as vendas, mas engana; os EUA passaram a exigir **preço total** em ingressos e hospedagem (maio de 2025) | Blake, Moshary, Sweeney e Tadelis, *Marketing Science* 40(4), 2021; FTC, Rule on Unfair or Deceptive Fees | o cartão mostra o preço que a pessoa paga, com a taxa de serviço incluída (decisão 7) |
| Publicidade tem que ser reconhecida como tal | CDC art. 36; Código do CONAR art. 28 | "Patrocinado" em todo espaço pago (como na v1) |

### 1.5. Contexto brasileiro

| Dado | Fonte | Uso |
|---|---|---|
| Pix usado por cerca de 148 milhões de pessoas (≈ 86% dos adultos) em dez./2025 | Banco Central (via imprensa); FGV EAESP, "5 anos do Pix" | Pix como forma de pagamento de primeira linha (o app já aceita, com a regra dos 80 dias) |
| Interesse por viagens no maior nível da série, com a busca feita principalmente pelo celular | State of Search Brasil 6 (Hedgehog e Opinion Box), via Panrotas, 2025 | mobile-first, como já é |
| O WhatsApp é o app mais usado na viagem (82%) | MindMiners | "Convidar quem vai junto" e "compartilhar o roteiro" abrem o WhatsApp |

---

## 2. Conceito: o momento certo de cada experiência

Em Jeri, o valor de uma experiência depende da hora:
- O vento é mais forte de agosto a novembro, com janela de julho a janeiro.
- A Pedra Furada se alcança a pé pela praia com a maré baixa.
- O pôr do sol na Duna tem hora marcada, e entre junho e agosto ele se encaixa na Pedra Furada.
- Restaurantes têm horário.
- Os passeios têm saída e vaga.

Hoje isso fica espalhado em blogs, tábuas de maré e conversas. O Use Guide junta tudo, o lugar em tempo real e a compra confiável, num só lugar.

* **Promessa:** "O guia que sabe a hora certa." A assinatura é decisão de marca (decisão 1).
* **Interação central da plataforma** (Parker, Van Alstyne e Choudary, *HBR*, 2016): *um viajante encontra e reserva, com confiança, uma experiência local no momento certo para ela*. Tudo na v2 serve a essa interação, e a curadoria protege a qualidade dela.
* **Por que é difícil de copiar:** junta três coisas:
  - dado do lugar ao vivo (vento, maré, sol);
  - curadoria local (coleções e "bom para agora");
  - compra com confiança (selo, avaliação verificada, preço total).

  Um catálogo nacional não tem o primeiro e o segundo. Um app de clima não tem o terceiro.

### Pilares

1. **Confiança antes de tudo** (Gefen; Mayzlin; Abrahao): selo do estabelecimento, avaliação só de quem foi, preço total, cancelamento claro.
2. **Fácil e familiar** (TAM; Nielsen; Apple): 3 abas, padrões conhecidos, Pix, 3 toques do cartão ao pagamento.
3. **Escolher sem cansar** (Chernev et al.): coleções com curadoria, filtros curtos, "bom para agora".
4. **Na hora certa** (Fogg; Google; Wang et al.): o app sugere quando a pessoa pode agir, e o aviso é útil ou não é enviado.
5. **A viagem é sua** (autodeterminação; Gollwitzer): a pessoa monta o roteiro, decide e convida quem vai junto.
6. **Fechar bem** (pico e fim; Pine e Gilmore): avaliação no fim do serviço, resumo da viagem e lembrança.
7. **Ética como marca** (OCDE; FTC; CDC): nada de truque; o anúncio é identificado e a personalização é explicada.

---

## 3. A Explorar muda conforme o momento da viagem

| Momento | Como o app sabe | O que a Explorar mostra (prancha) |
|---|---|---|
| **Sonhando** (sem datas) | sem viagem nem compra | "Quando você vem a Jeri?", coleções "Comece por aqui", agora em Jeri (vento, temperatura, pôr do sol) e Em destaque (1) |
| **Planejando** (viagem marcada) | a pessoa informou as datas ou já comprou algo com data | sua viagem com os dias planejados; vento previsto nos seus dias; eventos nos seus dias; "Reserve antes de chegar" com vaga nas suas datas (2) |
| **Em Jeri** (durante) | hoje está dentro das datas da viagem | Hoje em Jeri: próxima reserva com QR e "como chegar"; agora (vento, maré baixa, pôr do sol); "Bom para agora" com o motivo; aberto agora perto de você (3) |
| **Depois** | a viagem acabou | "Como foi?" com as experiências para avaliar; resumo "Sua viagem em Jeri"; "Para a próxima vez" com os salvos que não visitou (4) |

As seções da v1 (Em destaque, Para fazer em Jeri, Mais bem avaliados, Onde comer, Onde ficar, Dicas) continuam embaixo nos quatro momentos.

### 3.1. Coleções (prancha 1)

Página com foto grande, texto curto da curadoria e as experiências da coleção, com o estado de agora quando faz sentido (ex.: "Hoje: 22 nós em Jeri · bom para kite"). O Use Guide escreve as coleções no admin, nos 3 idiomas. Anúncio pago na coleção segue as regras da v1.

### 3.2. "Bom para agora" (prancha 3)

Lista curta (até 3) de sugestões com o **motivo** escrito:
- "Maré baixa até 13:10";
- "22 nós: bom para quem já começou";
- "Hoje às 17:41 · suba até 17:10".

As regras são da curadoria, por exemplo "Pedra Furada a pé quando a maré baixa durar pelo menos 1 h 30 entre 7h e 16h". Elas usam dado real (vento, maré, sol, horário de funcionamento) e somem quando a condição não vale.

### 3.3. Minha viagem (prancha 2 e 4)

Aba com **Roteiro · Salvos · Compras**:
- **Roteiro:** dias com o que está comprado (com QR) e o que está só salvo, cada um com hora.
- **Dia vazio:** mostra "Nada planejado ainda", com uma sugestão pelo vento previsto e "+ Adicionar ao dia".
- **Progresso real:** "3 de 5 dias com plano".
- **Quem vai junto:** a pessoa convida pelo WhatsApp (link de convite de uso único, AGENTS.md §7.7). Todos veem e editam o roteiro, e cada um compra o seu.
- **O ♡ passa a "salvar na viagem":** os Favoritos de hoje viram os "Salvos".

### 3.4. Depois (prancha 4)

- **Avaliação no fim do serviço**, com aviso opcional uma hora depois do fim: estrelas, o que mais marcou (Guia, Paisagens, Pontualidade…) e texto opcional, com "Avaliação de experiência verificada".
- **Resumo "Sua viagem em Jeri":** dias, experiências e fotos dos anúncios comprados, para compartilhar.
- **"Para a próxima vez":** o que ficou salvo e não foi visitado.

### 3.5. Interesses (prancha 1)

Folha opcional "O que você quer viver em Jeri?":
- Opções: Kite e vento, Lagoas e dunas, Praia e descanso, Gastronomia, Vida noturna, Com crianças, Trilhas e natureza, Fotografia.
- A folha diz para que serve: "Usamos isso só para ordenar as sugestões para você. Não vendemos esses dados, e você muda quando quiser em Perfil."
- Pode ser pulada. Sem interesses, a ordem é a da curadoria e das avaliações.

---

## 4. Envolver sem truques

| Fazemos | Não fazemos |
|---|---|
| Avisos de momento, ligados pela pessoa e com motivo ("maré baixa em 30 min", "sua reserva é amanhã às 9:00"), com no máximo 1 aviso por dia fora as reservas | aviso sem motivo, "sentimos sua falta", contagem de dias seguidos |
| Progresso real do plano da viagem | pontos, medalhas, ranking, progresso inflado |
| Sugestão explicada ("por que estou vendo isto") | perfil por rastreamento, venda de dados, segmentação de anúncio por dado pessoal |
| Preço total, cancelamento e anúncio identificados antes de tocar | taxa que aparece só no pagamento, "quase esgotado" sem dado, contador |
| Avaliação de quem foi, no fim do serviço | avaliação comprada, filtro que esconde nota ruim |

O "Passaporte de Jeri" (carimbos por experiência, usando o check-in que já existe) fica **a avaliar** depois da fase C. A pesquisa (Hamari et al.) mostra que o efeito depende do contexto, e ele não pode virar truque.

## 5. O outro lado: os parceiros

A plataforma só fica sólida se os dois lados ganharem (Parker, Van Alstyne e Choudary):
- **Venda mais cedo:** "Nos seus dias" e "Reserve antes de chegar" levam a compra para antes da viagem, com vaga real nas datas da pessoa.
- **Demanda na hora certa:** "Bom para agora" manda gente quando a condição favorece o serviço.
- **Reputação:** a avaliação pedida no fim do serviço ajuda o parceiro novo a chegar às primeiras 5 (Spiegel), e a resposta do parceiro continua liberada.
- **Visibilidade paga:** com as regras da v1. A curadoria das coleções **não se compra**; o anúncio aparece ao lado, identificado.
- **Métricas no painel** (sem dado pessoal): vezes que apareceu, toques, salvos, compras, avaliações. Também quantas vezes o anúncio apareceu em "Bom para agora".

## 6. Como medir

* **Indicador principal:** experiências compradas por viagem (média de compras por viajante com datas).
* **Indicadores de apoio:**
  - quem informa as datas;
  - roteiro com ao menos 1 item;
  - salvos que viram compra;
  - avaliações por serviço concluído;
  - dias com o app aberto durante a estadia;
  - toques em "Bom para agora" que viram compra.
* **Como coletar:** tudo agregado no domínio `insights`, sem dado pessoal em log ou analytics (AGENTS.md §7.5).

## 7. Dados e serviços que a v2 pede (AGENTS.md §15)

| O quê | Classe (§7.6) | Observação |
|---|---|---|
| **Viagem**: datas, dias, itens (anúncio, compra ou dica com hora), membros e convites | Confidencial | escrita só pela API; leitura só dos membros; convite com token opaco de uso único; entra na exclusão e na exportação de conta |
| **Interesses** escolhidos pela pessoa | Confidencial | opcional, editável, apagado com a conta |
| **Coleções** e regras de "Bom para agora" | Pública | conteúdo do admin, nos 3 idiomas (`LocalizedText`) |
| **Horário do pôr do sol** | Pública | mesmo fornecedor de hoje (Open-Meteo, dado diário de nascer e pôr do sol) |
| **Horário da maré** (próxima maré baixa) | Pública | **a confirmar** se o fornecedor atual dá a altura do mar por hora; se não der, um fornecedor de maré novo é decisão (§15.3) |
| **"Tem vaga nas suas datas"** | Pública | projeção pública com as próximas datas com vaga de cada oferta, mantida pelo backend (as vagas hoje são privadas) |
| **"Perto de você"** | Confidencial (localização) | localização do aparelho, pedida só ao tocar; a distância é calculada no aparelho e a localização não vai para o servidor |
| Preço "a partir de" e cancelamento no cartão | Pública | como na v1 (decisão 3 da v1) |
| Novos tipos de aviso | — | desligados por padrão, nas preferências de notificação que já existem |

## 8. O que muda em relação à v1

| Item | v1 | v2 |
|---|---|---|
| Barra inferior | Explorar · Favoritos · Compras · Perfil | **Explorar · Minha viagem · Perfil** (Favoritos e Compras dentro de Minha viagem; a reserva do dia fica também em "Hoje") |
| Explorar | vitrine fixa | vitrine que muda conforme o momento da viagem |
| Escolha | categorias e destaques | + coleções com curadoria e "Bom para agora" |
| Personalização | nenhuma | interesses escolhidos e momento da viagem, sempre explicados |
| Pós-compra | — | avaliação no fim do serviço, resumo e "para a próxima vez" |
| Cartão, categorias, publicidade, regras de anúncio, mudanças no DESIGN.md | — | iguais à v1 |

## 9. Fases

| Fase | O quê | Depende de |
|---|---|---|
| A | Fundação da v1: vitrine, cartão, categorias, textos nos 3 idiomas, tokens, estados, barra com 3 abas | decisões da v1 (1, 3, 6) e decisão 2 |
| B | Na hora certa: "agora" completo (vento, maré, sol), "Bom para agora" e coleções | decisões 4 e 5 |
| C | Minha viagem: datas, roteiro, salvos, compras e convite | decisão 3 |
| D | Depois: avaliação no fim do serviço, resumo e interesses | decisões 6 e 8 |
| E | Publicidade (fases 2 e 3 da v1) | decisões 4, 5 e 7 da v1 |

## 10. Riscos

* **Catálogo pequeno no começo:** com poucos anúncios, a vitrine fica vazia. As coleções e "Bom para agora" usam também atrações públicas e dicas (sem venda), que o Use Guide já cadastra.
* **Dado do lugar errado** (maré, vento): sempre com a hora da atualização e a fonte. Sem dado, a sugestão some, em vez de chutar.
* **Excesso de avisos:** limite de frequência e desligados por padrão.

## 11. Decisões pedidas

1. **Conceito** "o momento certo de cada experiência" como identidade do produto, e a assinatura ("O guia que sabe a hora certa" ou outra).
2. **Explorar por momento da viagem** (sem datas, planejando, em Jeri, depois) e **barra com 3 abas**: Explorar · Minha viagem · Perfil (substitui a barra da v1).
3. **Minha viagem**: modelo de dados novo (viagem, dias, itens, membros e convites), com os Favoritos virando "Salvos".
4. **Curadoria**: coleções e regras de "Bom para agora" escritas pelo Use Guide no admin.
5. **Dados do lugar**: pôr do sol pelo fornecedor atual; maré só se o fornecedor atual der a altura por hora; senão, escolher fornecedor (§15.3).
6. **Avisos de momento** (reserva, maré, pôr do sol, avaliação), desligados por padrão e com limite de 1 por dia fora as reservas.
7. **Preço total no cartão**: mostrar o valor com a taxa de serviço do ingresso incluída (D14) desde o cartão, como pede a regra da FTC e o CDC, em vez de "a partir de" sem a taxa.
8. **Interesses** opcionais para ordenar as sugestões (dado pessoal; LGPD).
9. **"Passaporte de Jeri"**: fica para avaliar depois da fase C, ou descartado.

As decisões da v1 (seção 9 de `explorar-vitrine.md`) continuam valendo para o que a v2 mantém.

---

## 12. Fontes

**Comportamento e adoção**
- Gefen, Karahanna e Straub (2003). *Trust and TAM in Online Shopping: An Integrated Model.* MIS Quarterly 27(1). [PDF (UGA)](https://www.terry.uga.edu/wp-content/uploads/gefen-karahanna-straub-misq-2003.pdf) · [Drexel](https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Inexperience-and-experience-with-online-stores/991014877893504721)
- Venkatesh, Thong e Xu (2012). *Consumer Acceptance and Use of IT (UTAUT2).* MIS Quarterly 36(1). [MISQ](https://misq.org/consumer-acceptance-and-use-of-information-technology-extending-the-unified-theory-of-acceptance-and-use-of-technology.html)
- Fogg, B. J. *Fogg Behavior Model.* Stanford Behavior Design Lab. [behaviormodel.org](https://behaviormodel.org/) · [Stanford](https://behaviordesign.stanford.edu/resources/fogg-behavior-model)
- Google. *Micro-moments of travel.* [Think with Google](https://thinkwithgoogle.com/consumer-insights/consumer-trends/micro-moments-travel-customer-journey)
- Wang, Park e Fesenmaier (2012). *The Role of Smartphones in Mediating the Touristic Experience.* Journal of Travel Research 51(4). [PolyU](https://research.polyu.edu.hk/en/publications/the-role-of-smartphones-in-mediating-the-touristic-experience/)
- Clima e decisão do turista: [Bausch et al., 2021](https://researchonline.ljmu.ac.uk/id/eprint/27962/) · [revisão 2021 (Current Issues in Tourism)](https://econpapers.repec.org/RePEc:taf:rcitxx:v:24:y:2021:i:24:p:3450-3465)

**Confiança, avaliações e escolha**
- Luca, M. *Reviews, Reputation, and Revenue: The Case of Yelp.com.* Harvard Business School. [Harvard Magazine](https://www.harvardmagazine.com/2011/10/hbs-study-finds-positive-yelp-reviews-lead-to-increased-business)
- Spiegel Research Center (Northwestern). *How Online Reviews Influence Sales.* [Spiegel](https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales)
- Mayzlin, Dover e Chevalier (2014). *Promotional Reviews.* American Economic Review 104(8). [NBER](https://www.nber.org/papers/w18340) · [Yale SOM](https://insights.som.yale.edu/insights/can-online-reviews-be-trusted)
- Abrahao, Parigi, Gupta e Cook (2017). *Reputation offsets trust judgments based on social biases among Airbnb users.* PNAS 114(37). [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5603987) · [Stanford News](https://news.stanford.edu/stories/2017/09/reputation-can-offset-social-bias)
- Ert, Fleischer e Magen (2016). *Trust and reputation in the sharing economy: The role of personal photos in Airbnb.* Tourism Management 55. [SSRN](https://papers.ssrn.com/abstract=2624181)
- Chernev, Böckenholt e Goodman (2015). *Choice overload: A conceptual review and meta-analysis.* Journal of Consumer Psychology. [Kellogg](https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual)
- Nielsen Norman Group. *10 Usability Heuristics.* [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/)
- Apple. *Human Interface Guidelines: Tab bars.* [Apple](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

**Engajamento, memória e motivação**
- Kahneman, Fredrickson, Schreiber e Redelmeier (1993). *When More Pain Is Preferred to Less.* Psychological Science. [PDF (UZH)](https://ius.uzh.ch/dam/jcr:5ae9adc9-61ec-4174-b37c-4b752f36c23b/Kahnemann%20et%20al.%20-%20When%20More%20Pain%20is%20Preferred%20to%20Less%20(1993).pdf) · Redelmeier, Katz e Kahneman (2003) [PDF (Stanford SPARQ)](https://sparq.stanford.edu/sites/g/files/sbiybj19021/files/media/file/redelmeier_et_al._2003_-_memories_of_colonoscopy.pdf)
- Pine e Gilmore (1998). *Welcome to the Experience Economy.* Harvard Business Review. [PDF](https://is.muni.cz/el/econ/jaro2020/MKR_PRCR/98252981/Pine_Gilmore_Welcome_to_the_Experience_Economy.pdf)
- O'Brien e Toms (2008). *What is user engagement?* JASIST 59(6). [White Rose](https://eprints.whiterose.ac.uk/78832/)
- Ryan, Rigby e Przybylski (2006). *The Motivational Pull of Video Games.* Motivation and Emotion 30. [Univ. of Rochester](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf)
- Gollwitzer e Sheeran (2006). *Implementation intentions and goal achievement: A meta-analysis.* [Univ. Konstanz](https://www.socmot.uni-konstanz.de/publications/implementation-intentions-and-goal-achievement-meta-analysis-effects-and-processes)
- Kivetz, Urminsky e Zheng (2006). *The Goal-Gradient Hypothesis Resurrected.* Journal of Marketing Research 43. [Columbia](https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal)
- Hamari, Koivisto e Sarsa (2014). *Does Gamification Work?* HICSS. [Aalto](https://research.aalto.fi/fi/publications/does-gamification-work-a-literature-review-of-empirical-studies-o/)
- McKinsey (2021). *The value of getting personalization right—or wrong—is multiplying.* [McKinsey](https://www.mckinsey.com/business-functions/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying)
- Gomez-Uribe e Hunt (2015). *The Netflix Recommender System.* ACM TMIS 6(4). [PDF](https://gwern.net/doc/reinforcement-learning/exploration/2015-gomezuribe.pdf)

**Plataformas**
- Parker, Van Alstyne e Choudary (2016). *Pipelines, Platforms, and the New Rules of Strategy.* Harvard Business Review. [MIT IDE](https://ide.mit.edu/insights/platforms-and-the-new-rules-of-strategy/)

**Ética, preço e lei**
- OCDE (2022). *Dark Commercial Patterns.* OECD Digital Economy Papers 336. [OCDE](https://www.oecd.org/en/publications/dark-commercial-patterns_44f5e846-en.html)
- Mathur et al. (2019). *Dark Patterns at Scale.* Princeton. [arXiv](https://arxiv.org/pdf/1907.07032)
- Blake, Moshary, Sweeney e Tadelis (2021). *Price Salience and Product Choice.* Marketing Science 40(4). [NBER](https://www.nber.org/papers/w25186.pdf) · [Yale Tobin](https://tobin.yale.edu/sites/default/files/2022-11/PriceSalience.pdf)
- FTC (2025). *Rule on Unfair or Deceptive Fees.* [FTC FAQ](https://www.ftc.gov/business-guidance/resources/rule-unfair-or-deceptive-fees-frequently-asked-questions) · [Federal Register](https://www.govinfo.gov/content/pkg/FR-2025-01-10/html/2024-30293.htm)
- MPF. *Nota técnica sobre identificação da publicidade (CDC art. 36, CONAR art. 28).* [MPF](https://midia.mpf.mp.br/pfdc/hotsites/mpdcom/docs/Noticias/nota-tecnica-merchandising.pdf)

**Brasil e destino**
- FGV EAESP (2026). *5 anos do Pix.* [PDF](https://eaesp.fgv.br/sites/default/files/arq-publicacao/2026-08/5-anos-do-pix-10-perguntas-para-entender-como-ele-se-espalhou-pelo-brasil-1.pdf) · usuários do Pix em dez./2025 [Movimento Econômico](https://movimentoeconomico.com.br/?p=125461)
- State of Search Brasil 6 (Hedgehog e Opinion Box). [Panrotas](https://www.panrotas.com.br/mercado/pesquisas-e-estatisticas/2025/12/interesse-por-viagens-aumenta-no-brasil-e-busca-ocorre-mais-pelo-celular-diz-pesquisa_223969.html) · MindMiners [blog](https://mindminers.com/blog/viagens-habitos-do-turista-brasileiro)
- Vento e maré em Jeri: [Viaje na Viagem](https://www.viajenaviagem.com/destino/jericoacoara/quando-ir/) · [360meridianos](https://www.360meridianos.com/quando-ir-a-jericoacoara-melhor-epoca/) · [Melhores Destinos](https://guia.melhoresdestinos.com.br/quando-ir-jericoacoara-melhor-epoca.html)

As fotos dos prints são as mesmas da v1 (Wikimedia Commons; créditos na seção 10 de `explorar-vitrine.md`).
