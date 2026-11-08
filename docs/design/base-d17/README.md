# Base visual D17 — telas de referência

Prints aprovados em 2026-10-27, tirados do app depois dos prompts 20.0 e 20.1 (reservas e pedidos atualizados com o voltar `<` e o código do pedido). São a referência para levar as demais telas ao visual novo (AGENTS.md §11.1, decisão D17 em `docs/arquitetura/decisoes.md`).

| Arquivo | Tela | Tema |
|---|---|---|
| `dark-1-reservas-proximas.png` | Minhas reservas › Próximas (remarcação e cancelar) | escuro |
| `dark-2-reservas-anteriores.png` | Minhas reservas › Anteriores (relatar, em análise, reembolsado) | escuro |
| `light-2-reservas-anteriores.png` | Minhas reservas › Anteriores | claro |
| `dark-4-pedidos.png` / `light-4-pedidos.png` | Ingressos › Pedidos | escuro / claro |
| `dark-5-admin-reclamacoes.png` | Admin › Financeiro › Reclamações (lista compacta) | escuro |
| `light-6-admin-decidir.png` | Folha de decisão da reclamação | claro |
| `dark-8-admin-forca-maior-folha.png` | Folha da força maior | escuro |
| `dark-9-admin-dividas.png` | Admin › Financeiro › Dívidas | escuro |
| `fr-reservas-anteriores.png` | Minhas reservas em francês | escuro |
| `light-desktop-admin.png` | Financeiro do admin no desktop | claro |

## Padrões que estas telas fixam

- Fundo liso (`bg-app`) e cartões sólidos (`bg-surface`, borda `border-line`, cantos de 20 px).
- Cartão com o que é e quando; uma linha só, separada por divisória, com o que a pessoa precisa saber ou fazer agora.
- Status como texto com ponto colorido (`StatusText`), sem caixa com borda.
- Abas em pílula com a ativa invertida (`SegmentedControl`).
- Ação secundária em texto (`TextButton`); botão cheio só na ação principal da tela.
- Voltar só com o chevron `<` (`BackButton`), sem caixa e sem seta.
- Identificador (código do pedido) logo abaixo do nome, sem destaque: texto a 50% no escuro e 65% no claro (contraste AA).
- Filas e listas longas em lista compacta (título, contexto, status e valor); detalhes e decisão na folha inferior (`Dialog`).

## Onde ficam os reutilizáveis

| O quê | Onde |
|---|---|
| Componentes visuais genéricos (`SegmentedControl`, `StatusText`, `TextButton`, `BackButton`, `ListState`, `Dialog`, `ConfirmDialog`…) | `src/ui/components/` |
| Classes de botão e campo (`BUTTON_PRIMARY`, `BUTTON_SECONDARY`, `BUTTON_DANGER`, `INPUT`) | `src/ui/styles/controls.ts` |
| Funções puras genéricas (datas no fuso do negócio, dinheiro) | `src/shared/utils/` |
| Peças com regra de negócio (ex.: `SaleClaimAction`) | no próprio domínio, exportadas pelo `index.ts` para as composições |
