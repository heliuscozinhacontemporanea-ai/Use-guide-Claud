# Proposta v3 (unificada): vitrine padrão, personalização opcional e Perfil como casa de tudo (2026-11-25)

Ideia do responsável do produto em 2026-11-25, para juntar as duas propostas anteriores:
- **A v1 é a vitrine padrão,** para quem ainda está decidindo.
- **A v2 vira uma experiência personalizada,** que a pessoa liga quando quer: diz quando vem (ou que já está na cidade) e o que quer viver.
- **O Perfil guarda tudo o que a pessoa consome no app,** para consultar e editar: ingressos, reservas, compras, roteiro, personalização, avaliações e favoritos.
- **A Explorar tem atalhos para o que acontece agora,** como o "Agora" do Início no painel do parceiro. Assim comprador e parceiro ficam sempre a um toque do momento.

**Relação com as anteriores:** a v1 (`explorar-vitrine.md`) e a v2 (`explorar-v2-hora-certa.md`) não mudam. A pesquisa, as fontes e os detalhes delas continuam valendo. A v3 diz como as duas se encaixam e é a proposta a decidir.

**Estado:** em aberto. Nada é implementado antes das decisões da seção 11.

Prints (protótipo com os tokens, as fontes, os ícones e os componentes do app; **nomes, preços, horários, notas e fotos são ilustrativos**) em `explorar-v3-unificada/`:

| Prancha | O que mostra |
|---|---|
| `1-entrada.jpg` | vitrine padrão com o cartão de entrada; passo 1 (quando vem ou "já estou em Jeri"); passo 2 (o que quer viver) |
| `2-vitrine-personalizada.jpg` | vitrine com viagem marcada; vitrine em Jeri com os atalhos do agora |
| `3-perfil.jpg` | Perfil reorganizado; Minha viagem (roteiro); Perfil no tema claro |
| `4-depois-temas-idiomas.jpg` | depois da viagem; vitrine padrão no claro; em Jeri em francês |
| `5-barra-inferior.jpg` | barra A (Explorar, Mapa, Perfil) × barra B (como hoje) na mesma tela |

---

## 1. Princípios

1. **Vitrine padrão por padrão.** Quem não informou nada vê a vitrine da v1 completa: busca, categorias, agora na cidade, Em destaque, mais bem avaliados, onde comer, onde ficar, dicas.
2. **A pessoa liga a personalização.** São dois passos curtos e opcionais: quando vem e o que quer viver. Sem eles, nada muda.
3. **Pessoal em cima, vitrine embaixo.** A parte pessoal aparece no topo, com o rótulo "Para você · por que estou vendo isto?". Embaixo continua "Explorar tudo em {cidade}", a vitrine completa.
4. **O Perfil é a casa de tudo.** O que a pessoa tem no app (viagem, ingressos, reservas, favoritos, avaliações, compras, personalização) mora no Perfil, para consultar e editar.
5. **A um toque do agora.** O que se usa no momento aparece como atalho na Explorar: a reserva de hoje com o QR, como chegar, vento, maré e pôr do sol. É o mesmo dado do Perfil, sem cópia, como o "Agora" do painel do parceiro.

## 2. Estados da Explorar

| Situação | Como o app sabe | Topo da Explorar | Embaixo |
|---|---|---|---|
| **Sem personalização** | nada informado, nenhuma compra com data | agora na cidade + cartão "Monte sua viagem a {cidade}" (dá para fechar) | vitrine padrão |
| **Viagem marcada** | datas informadas ou compra com data | sua viagem (datas, dias com plano, "Roteiro"); "Para o que você gosta" (coleções pelos interesses); "Nos seus dias" | "Explorar tudo em {cidade}" |
| **Na cidade** | hoje está dentro das datas, ou a pessoa disse "Já estou aqui" | **atalhos do agora**: próxima reserva com "Mostrar QR" e "Como chegar"; vento, maré e pôr do sol; "Bom para agora" | "Explorar tudo em {cidade}" |
| **Depois** | a viagem acabou (até 7 dias depois) | "Como foi?" com as experiências para avaliar; resumo "Sua viagem em {cidade}" | vitrine padrão |

Passados os 7 dias, a Explorar volta à vitrine padrão. Os salvos que a pessoa não visitou ficam no Perfil.

## 3. Como a personalização começa

### 3.1. Portas de entrada

* **Explorar:** cartão compacto "Monte sua viagem a {cidade}", que dá para fechar. Fechado, volta só depois de 30 dias ou por uma das outras portas.
* **Perfil:** a seção "Minha viagem", quando vazia, mostra o mesmo convite.
* **Momentos naturais:**
  - **primeiro ♡:** "Quer montar sua viagem?" (uma vez);
  - **primeira compra com data:** as datas vêm da compra, sem perguntar.

### 3.2. Passos (prancha 1)

1. **"Quando você vem a {cidade}?"**: calendário de ida e volta, e duas saídas:
   * **"Já estou em {cidade}"**: pergunta "Até quando você fica?" e oferece "Mostrar o que está perto de mim".
     - O navegador só pede a localização se a pessoa ligar essa opção.
     - A distância é calculada no aparelho e a localização não vai para o servidor.
   * **"Ainda não sei"**: fecha, e a vitrine continua a padrão.
2. **"O que você quer viver em {cidade}?"**: interesses, com a frase "Usamos isso só para ordenar as sugestões. Não vendemos esses dados e não usamos em anúncios. Você muda quando quiser no Perfil." Pode pular.

Depois disso, a Explorar fica personalizada. Datas, interesses e personalização ligada ou desligada se mudam no Perfil.

### 3.3. "Por que estou vendo isto?"

Toque no rótulo "Para você" abre uma folha curta com o porquê:
- as datas da viagem;
- os interesses escolhidos;
- o momento (o vento de agora, a maré baixa);

e o atalho "Desligar a personalização".

## 4. Atalhos do agora (prancha 2)

Na cidade, o topo da Explorar mostra o que se usa no momento:

* **Próxima reserva ou ingresso:**
  - hora e nome;
  - "Mostrar QR" (a ação principal da tela) e "Como chegar";
  - "em 1 h 10".
* **Agora:**
  - vento e direção;
  - maré baixa (hora e até quando);
  - pôr do sol (hora e lugar).
* **Bom para agora:** até 3 sugestões com o motivo escrito, da curadoria da v2.

É o mesmo dado do Perfil (Ingressos e Reservas), sem cópia: a Explorar só aponta para ele. O princípio é o do "Agora" do painel do parceiro: um toque para o que está acontecendo.

## 5. Perfil reorganizado (prancha 3)

Parte do Perfil atual (D33: avatar, nome, atalhos de Ingressos, Reservas, Favoritos e Avaliações, Minha conta, Meu painel, Sair) e acrescenta:

1. **Minha viagem**, no topo.
   - **Vazia:** o convite "Quando você vem a {cidade}?".
   - **Com datas:**
     - cidade e datas;
     - quem vai junto;
     - dias com plano;
     - interesses;
     - "Ver roteiro".
   - **O roteiro** é uma página com os dias, o que está comprado (com QR), o que é favorito ou dica, sugestão para dia vazio, "Adicionar ao dia" e "Convidar" (pelo WhatsApp).
2. **Atalhos com o estado de agora:** Ingressos "1 hoje", Reservas "2 próximas", Favoritos "6 salvos" e Avaliações "1 para fazer" (em amarelo, o tom de pendente).
3. **Personalização:** ligada ou desligada; datas; interesses; "Apagar meus dados de personalização".
4. **Compras e pagamentos:** recibos e reembolsos.
5. **Minha conta, Meu painel (parceiro) e configurações** (idioma, tema, avisos), como hoje.

O ♡ continua sendo "Favoritos", e o roteiro usa os favoritos como "quero fazer".

## 6. Barra inferior (prancha 5)

| Opção | Como fica | A favor | Contra |
|---|---|---|---|
| **A (recomendada)** | Explorar · Mapa · Perfil | Perfil sempre a um toque, que é o seu modelo "casa de tudo"; categorias nos atalhos da Explorar; Mapa útil na viagem ("perto de você") | o Perfil vira aba em vez de folha (muda a D33); o Mapa é uma tela nova |
| **B** | como hoje: avatar no topo abre o Perfil (folha da D33) e a barra mostra as categorias | sem mudança de navegação | 9 categorias numa barra que rola de lado, com metade escondida; categorias repetidas nos atalhos da Explorar |

Nas duas opções, a navegação é fixa: nenhuma aba aparece ou some conforme o momento.

## 7. Várias cidades

* **A sequência vale para qualquer cidade:** "Quando você vem a {cidade}?", com a cidade do seletor de destino. Por isso o seletor (B40, decisão 8 da v1) passa a ser necessário.
* **Os interesses são gerais:**
  - Praia, Aventura, Esportes de vento;
  - Gastronomia, Vida noturna;
  - Família, Natureza, Cultura.
* **Coleções e "Bom para agora" são de cada cidade:** a curadoria liga os interesses ao que existe ali.
* **Viagem com mais de uma cidade** fica para depois. A primeira versão é uma cidade por viagem.

## 8. Privacidade, login e anúncios

* **Sem login:** datas, interesses e favoritos ficam no aparelho e passam para a conta ao entrar. Exigir cadastro antes cortaria quem ainda está decidindo.
* **Classificação (§7.6):** datas da viagem, interesses e roteiro são Confidenciais. Ficam fora de log e analytics, e entram na exportação e na exclusão de conta. A localização nunca sai do aparelho.
* **Anúncios:** não usam os interesses. Seguem só o contexto (categoria, coleção, busca), com as regras da v1. Assim a frase da folha de interesses é verdadeira.

## 9. Dados e serviços (resumo da v1 §6 e da v2 §7)

| O quê | Origem |
|---|---|
| Preço "a partir de", duração e cancelamento no cartão (com a taxa de serviço do ingresso incluída, se aprovado) | v1 e v2 |
| Viagem (cidade, datas, dias, itens, quem vai junto, convite) | v2 |
| Interesses | v2 |
| Coleções e regras de "Bom para agora" (admin, 3 idiomas) | v2 |
| Pôr do sol (fornecedor atual) e maré (a confirmar no fornecedor atual) | v2 |
| "Tem vaga nas suas datas" (projeção pública) | v2 |
| Localização só no aparelho | v2 e v3 |
| Avisos de momento (desligados por padrão; no máximo 1 por dia fora as reservas) | v2 |
| Espaços pagos e métricas | v1 |
| Guardar no aparelho sem login e passar para a conta | v3 |

## 10. Fases

| Fase | O quê |
|---|---|
| A | Vitrine padrão (v1), cartão de vitrine, categorias, barra escolhida, Perfil reorganizado, textos nos 3 idiomas, tokens e estados |
| B | Personalização: portas de entrada, passos 1 e 2, "Para você" com o porquê, vitrine personalizada (viagem marcada) |
| C | Atalhos do agora: reserva de hoje com QR, vento, maré e sol, "Bom para agora", coleções |
| D | Minha viagem: roteiro por dia, sugestões, convite |
| E | Depois: avaliação no fim do serviço, resumo da viagem |
| F | Publicidade (fases 2 e 3 da v1) |

## 11. Decisões pedidas

**Telas e navegação**
1. Aprovar o fluxo e as telas da v3 (pranchas 1 a 4).
2. Barra inferior: **A** (Explorar · Mapa · Perfil, com o Perfil virando aba; muda a D33) ou **B** (como hoje).
3. Seletor de destino e várias cidades (B40), necessário para "Quando você vem a {cidade}?".

**Personalização e dados (§15.1)**

4. Personalização **sem login**, guardada no aparelho e passada para a conta ao entrar (proposto: sim).
5. "Minha viagem" (modelo de dados novo) e interesses (dado pessoal).
6. Dados do lugar: pôr do sol pelo fornecedor atual; maré só se o fornecedor atual tiver a altura por hora, senão escolher fornecedor.
7. Avisos de momento, desligados por padrão.

**Dinheiro e anúncios (§15.2)**

8. Preço no cartão: "a partir de", e com a taxa de serviço do ingresso incluída (v1 decisão 3; v2 decisão 7).
9. Anúncios sem usar interesses (proposto: sim); rótulo único "Patrocinado" (v1 decisão 4); modelo e preços (v1 decisão 5); regras (v1 decisão 7).

**Conteúdo, marca e documentos**

10. Curadoria pelo Use Guide no admin: coleções e "Bom para agora".
11. Conceito e assinatura "O guia que sabe a hora certa" (v2 decisão 1).
12. Mudanças no DESIGN.md (v1 seção 7).
13. "Passaporte" de experiências: avaliar depois da fase D, ou descartar.
