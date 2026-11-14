# Movimento — referência e proposta aprovada (D33, 2026-11-14)

| Arquivo | O que é |
|---|---|
| `referencia.mp4` | Vídeo de referência do responsável do produto (só o movimento importa, não o conteúdo) |
| `proposta-lado-a-lado.mp4` | Referência × proposta no Use Guide, tema claro, mesmo trajeto |
| `proposta-claro-e-escuro.mp4` | Proposta nos dois temas |
| `proposta-reduzir-movimento.mp4` | Proposta com "reduzir movimento" |

A proposta foi gravada numa página de demonstração com as telas reais do app (Home, Perfil, Configurações, Idioma) e o movimento aplicado; o código do app não mudou para gravar.

## Medições (quadro a quadro, por comparação de imagem)

| Transição | Resultado |
|---|---|
| Página entrando (push) | 50% do caminho em ~75 ms, 90% em ~200 ms, parada em ~350 ms; sem passar do ponto |
| Página anterior | recua 26% da largura e escurece ~12% |
| Folha abrindo | mesma curva; para a ~6,5% do topo |
| Fundo com a folha aberta | escala ~0,9, cantos arredondados, escurece ~12% (bege 251,242,229 → 222,213,202), preto atrás |
| Folha fechando | pelo arraste: acompanha o dedo e acelera ao soltar |

Ajuste das curvas aos pontos medidos (erro médio):

| Curva | Push | Folha |
|---|---|---|
| `cubic-bezier(0.32, 0.72, 0, 1)` (antiga, 280 ms) | só serve com 595 ms, erro 1,65% | só serve com 595 ms, erro 1,40% |
| `cubic-bezier(0.25, 1, 0.5, 1)` | 440 ms, erro 0,68% | 430 ms, erro 0,39% |
| **Mola criticamente amortecida, ω = 18,4/s** | **erro 0,18%** | **erro 0,10%** |

A mola é a do iOS (resposta ~0,34 s). No `motion`: `stiffness: 340, damping: 37, mass: 1`.

## Ajustes pedidos pelo responsável sobre a referência

- Tema escuro: o que fica para trás **clareia** (branco 10%) em vez de escurecer, para se destacar do preto. No claro, escurece 12% como na referência.
- `<` em todas as telas da folha, inclusive na primeira (fecha a folha), na mesma altura.
- Título centralizado, entrando e saindo junto com a página.
- Arrastar para baixo, em qualquer tela, fecha a folha inteira; arrastar da esquerda para a direita volta uma tela, menos começando em cima de botão.
- Perfil abre como folha de baixo; sem desfoque atrás das folhas; "reduzir movimento" com esmaecido de 150 ms.
