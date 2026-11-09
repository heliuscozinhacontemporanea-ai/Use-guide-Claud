# Fluxo 1 — parceiro recém-cadastrado (2026-11-09)

Percorrido nos emuladores (`npm run dev:emulators`, `npm run dev:seed`), iPhone 13, tema escuro:
login → escolher o @ → "Seja parceiro" → apresentação → cadastro em 5 passos (passeio) → painel pela
primeira vez → tour → Início, Agenda, Catálogo, Ganhos, Mais (cada item) → página do estabelecimento.

## Corrigidos (commits na claude/agents/useguide)

| # | Achado | Efeito | Correção |
|---|---|---|---|
| E2 | `partnerContentSchema` sem `state`/`city` (esquecido na F1 do fuso) | 400 ao cadastrar ou editar estabelecimento pelo painel | campos aceitos, com teste |
| E3 | `FirestoreGuideAdapter.createItem` gravava `id: undefined` | 500 ao criar estabelecimento | `id` fora do documento |
| E4 | Mais › Ajuda para parceiros abria a central do comprador | prometia ajuda de parceiro | abre em "Para parceiros" |
| E5 | Ganhos com nenhuma conta: "0 CNPJ · tudo certo" | dizia que estava tudo certo sem conta | "Nenhuma conta ainda" |
| E6 | Restos de UTC−3 fixo (Agora: véspera; Visitas do mês) | errado fora de UTC−3 | hora do lugar / Brasília |

E1 (virar parceiro sem `users/{uid}`) era efeito do seed: o app cria o perfil no cadastro; o seed passou a fazer o mesmo.

## Para aprovação

| # | Achado | Proposta |
|---|---|---|
| V1 | Apresentação "Parceiros Use Guide": roxo/índigo, gradiente, maiúsculas, textos de 9–11 px, branco fixo (quebra no tema claro), sem tradução; promete "Link direto para seu WhatsApp" e "Cadastro 100% gratuito" (há planos pagos e a venda é pela plataforma) e fala só do "litoral cearense" | refazer no padrão do app (folha, tokens, Inter/Outfit, verde só na ação), textos traduzidos e verdadeiros |
| V2 | Cadastro (5 passos) no mesmo estilo antigo; validações em português fixo; "Sua nova pousada" para qualquer categoria; "Finalizar" desativado sem dizer que falta foto; sem `role="dialog"` | refazer no padrão, com aviso "Adicione ao menos 1 foto" perto do botão |
| P2 | Primeira abertura: "Resolva agora — Nada pendente. Tudo em dia." sem verificação, conta de recebimento nem plano | "Primeiros passos" no Resolva agora: verificar o estabelecimento, conta de recebimento, criar a primeira oferta, plano |
| P3 | Mais › "Perfil de produtor" (Nome, foto e descrição) abre o cadastro genérico com todas as categorias | abrir o cadastro já em "Eventos (sou produtor)" ou esconder para quem não organiza eventos |
| P4 | Plural do zero: "0 venda", "0 próximo", "0 salvo" | chaves `_zero` ("Nenhuma venda", "Nenhum próximo") |
| P5 | Mais › "Estabelecimentos e documentos" abre o Catálogo; os documentos ficam dentro de cada estabelecimento | renomear para "Estabelecimentos" ou abrir direto a lista de verificações |

## Observações sem ação

* Página do estabelecimento, Ganhos, Relatórios, Cupons (vazio), Notificações e Termos estão no padrão.
* As métricas do estabelecimento sem plano respondem 403 `LISTING_PLAN_REQUIRED` de propósito (a tela usa o código para mostrar "Disponível com o plano").
