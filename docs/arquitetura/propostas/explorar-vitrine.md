# Proposta: Explorar e categorias como vitrine que vende (2026-11-25)

Pedido do responsável do produto em 2026-11-25: as telas onde o comprador navega (Explorar e as listas de cada categoria) não estão convidativas nem vendáveis. A proposta reformula essas telas com o design system atual, prepara espaços de publicidade paga pelos parceiros e lista o que precisa de decisão (AGENTS.md §15).

**Estado:** em aberto. Nada é implementado antes da aprovação dos prints e das decisões da seção 9.

Prints (protótipo com os tokens, as fontes, os ícones e os componentes do app; **nomes, preços, notas e fotos são ilustrativos**) em `explorar-vitrine/`:

| Prancha | O que mostra |
|---|---|
| `1-antes-depois.jpg` | primeira tela da Explorar hoje × proposta |
| `2-explorar-completa.jpg` | Explorar inteira, escuro e claro |
| `3-temas-idiomas.jpg` | Explorar no claro e em francês |
| `4-categorias.jpg` | Passeios (escuro), Restaurantes (claro), Passeios em francês |
| `5-publicidade.jpg` | folha "Anúncio patrocinado" e a tela "Impulsionar anúncio" do parceiro |

---

## 1. O que está errado hoje

Auditoria de 2026-11-25:
- **Primeira tela sem nenhuma foto de passeio.** Aparecem o título, a busca e "Próximos eventos" vazio, e o primeiro anúncio só surge depois.
- **O cartão não diz o que a pessoa precisa para decidir:** não mostra nota com número de avaliações, preço, duração nem cancelamento.
- **Seção vazia ocupa espaço:** "Nenhum evento agendado" aparece mesmo sem nenhum evento.
- **Vento ocupa meia tela no meio da lista**, com textos de 8 a 10 px e ilegível no tema claro.
- **Barra inferior com 9 categorias** numa pílula que rola de lado: só cerca de 5 aparecem, e Favoritos e Compras ficam escondidos no perfil.
- **Fora das regras:**
  - textos fixos em português (B16, B62);
  - cores fixas (B25);
  - tamanhos e cantos fora da escala (B48);
  - margem de 40 px (P4);
  - "Ver tudo" com 32 px de altura (§11);
  - sem estado de erro na categoria;
  - catálogo lido inteiro (B67).

## 2. O que a pesquisa mostra

| Achado | Fonte | Como entra na proposta |
|---|---|---|
| Foto é decisiva para escolher hospedagem e passeio | [Baymard, informação na lista](https://baymard.com/research-articles/product-listing-information) | foto 16:10 grande em todo cartão; primeira tela com foto |
| Faltar informação no cartão faz a pessoa ignorar opções boas; nota média e número de avaliações devem estar no cartão | [Baymard, informação na lista](https://baymard.com/blog/product-listing-information) | cartão com nota, número de avaliações, duração e preço |
| Com 5 avaliações, a chance de compra é 270% maior que sem nenhuma; o efeito pesa mais em itens caros | [Spiegel Research Center](https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales) | "Mais bem avaliados" pede no mínimo 5 avaliações; sem avaliação aparece "Novo no Use Guide" (nunca 0 estrela) |
| Carrossel que gira sozinho atrapalha; a maioria não vê os últimos itens; precisa de pista de que continua | [Baymard, carrossel](https://baymard.com/blog/homepage-carousel) e [NN/g, carrosséis no celular](https://www.nngroup.com/articles/mobile-carousels/) | carrosséis manuais, com o próximo cartão aparecendo pela metade; no máximo 5 cartões; página rola para baixo |
| Cancelamento claro antes de pagar dá segurança para reservar com antecedência | [GetYourGuide na App Store](https://apps.apple.com/us/app/id705079381) | linha "Cancelamento grátis até 48 h antes" no cartão, só quando a política da oferta garantir |
| Anúncio patrocinado funciona quando é o próprio conteúdo que a pessoa procura e quando a lista continua confiável | [Mercury, monetização de apps de viagem](https://mercurydevelopment.com/what-we-do/all-services/articles/travel-app-monetization-sponsored-listings-2026/) e [Tripadvisor Sponsored Placements](https://www.phocuswire.com/TripAdvisor-sponsored-placements) | anúncio é um cartão igual aos outros, com rótulo; só no contexto certo; limite por tela |
| No Brasil, a publicidade tem que ser reconhecida de imediato como tal | CDC art. 36 e Código do CONAR art. 28 ([MPF, nota técnica](https://midia.mpf.mp.br/pfdc/hotsites/mpdcom/docs/Noticias/nota-tecnica-merchandising.pdf)) | rótulo "Patrocinado" visível em todo espaço pago; tocar explica |
| Urgência e escassez falsas (contador que reinicia, "quase esgotado" inventado) são comuns e enganosas | [Princeton, "Dark Patterns at Scale"](https://arxiv.org/pdf/1907.07032) | nada de contador ou "últimas vagas" sem dado real; CDC art. 37 |
| Lojas grandes vendem anúncio por clique com orçamento diário | [iFood Ads](https://kevel.com/customers/ifood) e [Tripadvisor](https://www.phocuswire.com/TripAdvisor-sponsored-placements) | fica como fase futura; para o tamanho de hoje, venda por dias é mais simples (seção 5) |
| Apps de viagem juntam descoberta numa aba e o que a pessoa comprou em outra | [Airbnb, versão 2025](https://news.airbnb.com/product-releases/airbnb-2025-summer-release/) | barra inferior com Explorar, Favoritos, Compras e Perfil (decisão 2) |

## 3. Princípios da vitrine

1. **A primeira tela vende.** Mostra foto grande e uma oferta antes de rolar.
2. **O cartão responde às perguntas de quem compra:**
   - o que é;
   - se é bom (nota e avaliações);
   - quanto custa;
   - quanto dura ou quando acontece;
   - se dá para desistir.
3. **Contexto do lugar e da hora.** O vento, o tempo e a maré "agora" são o diferencial do Use Guide. Junto vem "Para fazer em Jeri" por dia.
4. **Só verdade.** Todo número vem do catálogo e do backend: preço, nota, vagas, horário de funcionamento e política de cancelamento. Seção sem conteúdo some, em vez de mostrar "vazio".
5. **Anúncio igual ao conteúdo, sempre identificado, sem empurrar o orgânico para fora.**

## 4. O que muda nas telas

### 4.1. Explorar (pranchas 1 a 3)

De cima para baixo:

| Bloco | Conteúdo | Dados |
|---|---|---|
| Topo | destino ("Jericoacoara ▾"), avisos (sino) e busca | o seletor de destino depende do B40 (decisão 8) |
| Atalhos de categoria | pílulas com ícone: Passeios, Eventos, Pousadas, Restaurantes, Translados, Aluguéis, Atrações, Dicas | rotas atuais por idioma (D6) |
| Agora em Jericoacoara | faixa de uma linha: vento (nós e direção), temperatura e maré, com "ao vivo"; tocar abre a folha do vento | `climawind`, como hoje |
| Em destaque | carrossel de cartões grandes, todos **Patrocinado** (seção 5) | espaços pagos |
| Para fazer em Jeri | `SegmentedControl` Hoje / Amanhã / Fim de semana; cartões com data e hora no fuso do lugar, preço ou "Grátis" | eventos publicados; preço "a partir de" do evento (decisão 3) |
| Passeios mais bem avaliados | nota ≥ 4,5 e 5 ou mais avaliações, ordem por nota e número de avaliações | `rating` e `reviewCount` |
| Onde comer | "Aberto agora · fecha às 23:00" calculado no fuso do restaurante | `operatingHours` e `timeZone` (já públicos) |
| Onde ficar | nota, bairro e um benefício (ex.: café da manhã incluso) | `operationalInfo.breakfast` |
| Dicas para sua viagem | lista de dicas do Use Guide (conteúdo `tips`) | catálogo |

Seção sem conteúdo não aparece. Cada seção lê no máximo 10 itens, com `limit()` e índice, e "Ver todos" abre a categoria (resolve o B67 na Explorar).

### 4.2. Categorias (prancha 4)

- **Topo:** `<` (volta para a Explorar), título da categoria e "Ver no mapa" como única ação em ícone.
- **Filtros rápidos em pílulas.** O primeiro abre a folha de filtros e mostra quantos estão ligados. Os demais variam por categoria:
  - Passeios: Hoje, Amanhã, Cancelamento grátis, Até R$ 150, Nota 4,5+;
  - Restaurantes: Aberto agora, tipo de cozinha, Nota 4,5+.
- **Contagem de resultados e ordenação:** Recomendados, Menor preço, Mais bem avaliados.
- **Lista em uma coluna no celular** (2 a partir do `sm:`, 3 do `lg:`), com cartão de vitrine em largura total. Paginação por cursor.
- **Estados:** carregando (skeleton com a forma do cartão), vazio ("Nenhum passeio com esses filtros" e "Limpar filtros"), erro com "Tentar de novo" e sem internet.

### 4.3. Cartão de vitrine (o mesmo nas duas telas)

- Foto 16:10, com favorito (♡, 44 px de toque). Em espaço pago, "Patrocinado" fica no canto da foto.
- Título com até 2 linhas, em `text-title`.
- Nota ★ com o número de avaliações, mais a duração ou o tipo, em `text-meta`. Sem avaliações: "Novo no Use Guide".
- "a partir de **R$ 180** por pessoa", só para o que se compra pelo app, com o preço vindo do backend. Evento gratuito: "Grátis".
- No máximo uma linha de benefício, em menta e com ✓: cancelamento grátis, equipamento incluso, café da manhã incluso ou "Aberto agora".

Primeira foto da tela com `fetchpriority="high"` (P7, resolve o B63).

### 4.4. Barra inferior (decisão 2)

Quatro abas fixas: **Explorar · Favoritos · Compras · Perfil**.
- As categorias saem da barra e viram os atalhos da Explorar.
- Compras reúne ingressos e reservas, com o QR à mão na portaria.
- Perfil abre a folha do perfil, como hoje (D33).
- O anúncio aberto continua sendo página da aba (D33).

### 4.5. Textos e acessibilidade

- Todos os textos por chave de tradução nos 3 idiomas. A prancha 3 mostra o francês, com preço em `Intl` ("180 R$").
- Toque mínimo de 44 px.
- "Ver todos" com nome acessível que inclui a seção (ex.: "Ver todos: Onde comer").
- Cores só por tokens, nos dois temas.

## 5. Publicidade paga pelos parceiros

### 5.1. Espaços

| Espaço | Onde | Vagas | Relação com o que já existe |
|---|---|---|---|
| Em destaque | carrossel no topo da Explorar | até 5 por dia, em rodízio | novo |
| Topo da categoria | primeiras posições de cada lista | 3 por dia, em rodízio | **já existe**: "Destaque" do plano Use Guide Verificado (D11) |
| Na busca | primeiro resultado quando a busca combina com a categoria do anúncio | 1 | novo |
| Dentro das seções | 1 cartão por seção da Explorar (ex.: Onde comer) | 1 por seção | novo |

### 5.2. Regras (propostas)

1. **Identificação:** todo espaço pago mostra "Patrocinado" na foto, no mesmo lugar, nos 3 idiomas (CDC art. 36). Tocar abre a folha "Anúncio patrocinado" (prancha 5), que explica:
   - o parceiro pagou pelo espaço;
   - a ordem dos outros resultados continua a de sempre;
   - pagar não muda nota, avaliações nem preço.
2. **Quem pode anunciar:** anúncio publicado de estabelecimento verificado (D12) e conta não suspensa. Nota abaixo de 4,0, com 5 ou mais avaliações, não entra.
3. **Contexto:** o anúncio só aparece onde combina, com a mesma categoria, data ou busca.
4. **Limite:** no máximo 1 patrocinado a cada 6 cartões de uma lista, nunca dois seguidos, e 1 por seção na Explorar.
5. **Nada inventado:** o cartão patrocinado usa os mesmos dados do anúncio. Proibidos contador, "últimas vagas" sem dado real ou selo que pareça prêmio.
6. **Sem segmentação por dados pessoais:** rodízio igual para todos, como o do D11. Isso evita perfil de usuário e mantém a LGPD simples.
7. **Métricas para o parceiro:** vezes que apareceu, toques, favoritos e compras que vieram do anúncio, no painel (domínio `insights`), sem dado pessoal.

### 5.3. Como o parceiro compra (decisão 5)

| Modelo | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Só o Destaque do plano (D11)** | quem assina o Verificado entra no rodízio das 3 vagas | nada novo para cobrar | pouca receita; não há espaço na Explorar |
| **B. Impulsionar por dias (recomendado agora)** | o parceiro escolhe o espaço e 7, 15 ou 30 dias, e paga um valor fixo por dia, no cartão ou Pix (Stripe), com vagas limitadas por espaço (prancha 5) | simples para negócio pequeno; receita previsível; sem leilão | preço precisa ser calibrado à mão |
| **C. Custo por clique com orçamento diário** | como iFood Ads e Tripadvisor | escala com volume | precisa de leilão, controle de clique falso e cobrança por uso; só faz sentido com muito tráfego |

Recomendação: **B agora e C quando houver volume**, mantendo o Destaque do D11 como benefício do plano. Os preços de cada espaço por dia são decisão de dinheiro (§15) e não aparecem nos prints ("preço a definir").

## 6. Dados e serviços que a proposta pede

| O quê | Por quê | Tipo |
|---|---|---|
| No anúncio publicado: menor preço publicado em centavos, duração da oferta principal e "cancelamento grátis até X h", recalculados pelo backend quando a oferta muda | cartão sem ler todas as ofertas; preço sempre do backend | campos novos na projeção pública (§15.1) |
| No evento publicado: menor preço de ingresso em centavos ou "grátis" | os tipos de ingresso não são públicos | campo novo na projeção pública (§15.1) |
| Leituras por seção com `limit()` e índices (nota, data) | custo e velocidade (B67, §6.4) | índices em `firestore.indexes.json` |
| Campanhas pagas (backend), projeção pública do dia por espaço (como `featuredListings`), pagamento no `payment` e métricas no `insights` | publicidade | coleções novas, só na fase 3 |

Nenhum fornecedor novo: Stripe, Firestore e Open-Meteo, que já são usados.

## 7. Mudanças no DESIGN.md (precisam de autorização, §15)

1. **P4 (espaçamentos), linha "entre seções da tela":**
   - Atual: "24 px, com título de seção em `text-meta`".
   - Proposto: "24 px, com título de seção em `text-meta`; nas vitrines (Explorar e listas de categoria), título de seção em `text-title`".
   - Motivo: em lista de painel o título pequeno basta; numa vitrine, a seção precisa ser lida de longe ao rolar.
2. **§8, novo item "Cartão de vitrine":**
   - Proposto: "Explorar e categorias: foto 16:10 com favorito; título em até 2 linhas; nota com número de avaliações e duração ou tipo; preço 'a partir de' quando vende pelo app; no máximo uma linha de benefício com ✓. Sem avaliações, 'Novo no Use Guide'."
   - Motivo: o cartão de lista atual não tem preço nem prova social, que são as duas informações que mais pesam na compra.
3. **§8, novo item "Espaço pago":**
   - Proposto: "Todo espaço pago mostra 'Patrocinado' no canto da foto, em pílula escura, e tocar abre a explicação. Nunca mais de 1 a cada 6 cartões nem dois seguidos."
   - Motivo: CDC art. 36 e confiança na lista.

## 8. Fases

| Fase | O quê | Depende de |
|---|---|---|
| 1 | Nova Explorar e categorias, cartão de vitrine, barra inferior, textos nos 3 idiomas, tokens, estados, leitura por seção e campos de preço | decisões 1, 2, 3 e 6 |
| 2 | Rótulo "Patrocinado" e folha explicativa nas 3 vagas do Destaque (D11) | decisão 4 |
| 3 | Impulsionar: compra por dias no painel, espaços novos e métricas | decisões 5 e 7 |
| 4 | Custo por clique, se houver volume | decisão futura |

## 9. Decisões pedidas

1. **Layout:** aprovar a Explorar e as categorias como nos prints (ou indicar o que muda).
2. **Barra inferior:**
   - (A) 4 abas fixas (Explorar, Favoritos, Compras, Perfil), com as categorias como atalhos na Explorar (recomendado);
   - (B) manter a barra atual de categorias.
3. **Campos novos na projeção pública** do anúncio e do evento (preço "a partir de", duração, cancelamento grátis).
4. **Rótulo único "Patrocinado"** para toda vaga paga, inclusive as 3 vagas do Destaque da D11, que hoje dizem "Destaque".
5. **Modelo de publicidade:** A, B (recomendado) ou C, e os preços por espaço e por dia.
6. **Mudanças no DESIGN.md** da seção 7.
7. **Regras dos anúncios** da seção 5.2.
8. **Seletor de destino** ("Jericoacoara ▾"): entra junto com o B40 (regiões vindas do catálogo) ou fica fixo em Jericoacoara até lá.

## 10. Créditos das fotos dos prints

Fotos da Wikimedia Commons, usadas só nos prints desta proposta.

| Foto | Arquivo | Autor | Licença |
|---|---|---|---|
| lagoa com rede | [Lagoa do Paraíso Jijoca de Jericoacoara](https://commons.wikimedia.org/wiki/File:Lagoa_do_Para%C3%ADso_Jijoca_de_Jericoacoara.jpg) | C. R. Malaquias | CC BY-SA 4.0 |
| Pedra Furada | [Parque Nacional de Jericoacoara (01)](https://commons.wikimedia.org/wiki/File:Parque_Nacional_de_Jericoacoara_-_Paulo_Reb%C3%AAlo_(01).jpg) | Paulo Rebêlo | CC BY-SA 4.0 |
| buggies | [Buggies (3895024892)](https://commons.wikimedia.org/wiki/File:Buggies_(3895024892).jpg) | Ricardo, Fortaleza/CE | CC BY 2.0 |
| kite no pôr do sol | [Praia Principal, Jericoacoara](https://commons.wikimedia.org/wiki/File:Praia_Principal,Jericoacoara,Cear%C3%A1_-_01_-Helio_Bastos_Salmon.jpg) | Helio Bastos Salmon | CC BY-SA 4.0 |
| kite na praia | [Kitecumbuco](https://commons.wikimedia.org/wiki/File:Kitecumbuco.jpg) | Elissonm | CC BY-SA 3.0 |
| moqueca | [Moqueca](https://commons.wikimedia.org/wiki/File:Moqueca.jpg) | BR | CC BY-SA 4.0 |
| moqueca de peixe | [Moqueca de peixe e camarão](https://commons.wikimedia.org/wiki/File:Moqueca_de_peixe_e_camarao_(7519822014).jpg) | Luca Nebuloni | CC BY 2.0 |
| piscinas de pousada | [Pousada de Santa Luzia](https://commons.wikimedia.org/wiki/File:Piscina_da_Pousada_de_Santa_Luzia.jpg) e [Pousada de S. Bartolomeu](https://commons.wikimedia.org/wiki/File:Piscina_da_Pousada_de_S._Bartolomeu.jpg) | Elisete Reis | CC BY-SA 3.0 |
| jardineira | [4x4 Conexão Jericoacoara-Jijoca-Fortaleza](https://commons.wikimedia.org/wiki/File:4x4_Conex%C3%A7%C3%A3o_Praia_de_Jericoacoara-Jijoca-Fortaleza_-_panoramio.jpg) | Claudio Oliveira Lima | CC BY-SA 3.0 |
| pedra no pôr do sol | [Em baixo da Pedra Furada](https://commons.wikimedia.org/wiki/File:Em_baixo_da_Pedra_Furada_em_Jericoacoara-Jijoca-Cear%C3%A1.jpg) | Idalina de Jesus Albuquerque Costa | CC BY-SA 4.0 |
| farol | [Farol de Jericoacoara](https://commons.wikimedia.org/wiki/File:Farol_de_Jericoacoara_Janeiro-2026.jpg) | Daniel BP BR | CC BY-SA 4.0 |
| cavalo e barcos | [Jericoacoara (38954943922)](https://commons.wikimedia.org/wiki/File:Jericoacoara,_Brazil_-_Brasil,_Cear%C3%A1_(38954943922).jpg) e [(38104927685)](https://commons.wikimedia.org/wiki/File:Jericoacoara,_Brazil_-_Brasil,_Cear%C3%A1_(38104927685).jpg) | Jorge Brazilian | CC BY 2.0 |
