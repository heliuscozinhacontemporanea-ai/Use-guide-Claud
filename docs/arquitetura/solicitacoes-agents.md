# Solicitações de alteração do AGENTS.md

> O AGENTS.md só muda com autorização explícita do responsável do produto. Cada item abaixo diz **o que** mudaria, **por quê** e o texto proposto.
> Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
> Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
> Resposta de 2026-10-19: aprovadas S10, S11 e S12 (as três no prompt A3).
> Resposta de 2026-10-24: aprovada S14 (aplicada pelo prompt A5).
> Resposta de 2026-10-24: aprovada S15 (aplicada pelo prompt A5, junto com a S14).
> Resposta de 2026-10-27: aprovada S16 (aplicada pelo prompt A6).

| # | Seção | Motivo | Status |
|---|---|---|---|
| S1 | §0 ou §15 (nova regra) | Formalizar que o AGENTS.md só muda com sua autorização | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S2 | §2 (nova regra) | Formalizar "sem código legado ou de transição antes do lançamento" | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S3 | §10.1 | Conflita com S2 antes do lançamento | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S4 | §8.2 | Erro factual nos nomes dos planos + decisão D2 | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S5 | §6.1 | Decisão D4 (upload pelo backend) | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S6 | §12.6 | Decisão D5 está em aberto; o texto atual não diz isso | ❌ Não aprovada (2026-10-10) — texto atual mantido |
| S7 | §12.7 | Decisões D6 (URLs por idioma) e D7 (SEO no Cloud Run) | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ✅ Aprovada em 2026-10-12 (prompt A2) |
| S10 | §13 e §16.1 | Formalizar que arquivo tocado sai sem avisos do lint e formatado | ✅ Aprovada em 2026-10-19 (prompt A3) |
| S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A3) |
| S12 | §12.1 e §12.7 | Decisão D10: idioma do navegador na primeira visita, persistência só por escolha explícita | ✅ Aprovada em 2026-10-19 (prompt A3) |
| S13 | §7.7 | O débito de `partnerDocumentKeys` foi resolvido no Prompt 18.3.0b | ✅ Aprovada em 2026-10-19 (prompt A4) |
| S14 | §11.1 e §11 (nova subseção) | Tema claro sem branco puro e regras de experiência de app nativo | ✅ Aprovada em 2026-10-24 (prompt A5) |
| S15 | §8.1 e §8.7 | D14: conta por documento, cobrança na plataforma com transferência depois do serviço, taxas por tipo, multa e reagendamento | ✅ Aprovada em 2026-10-24 (prompt A5, junto com a S14) |
| S16 | §11.1 | D17: fundo neutro e liso, superfícies sólidas, cor só com significado e uma ação principal por tela | ✅ Aprovada em 2026-10-27 (prompt A6) |

---

## S1 — Alterações no AGENTS.md exigem autorização

**Por quê:** você pediu que o AGENTS.md não seja alterado livremente. Hoje essa regra só existe na nossa conversa; o agente do AI Studio não a conhece e pode editar o arquivo ao executar um prompt.

**Texto proposto** (novo item no início do §15):

> * O AGENTS.md NÃO DEVE ser alterado por nenhum agente sem autorização explícita do responsável do produto. Para propor uma mudança, o agente DEVE descrever o texto atual, o texto proposto e o motivo, e aguardar a autorização antes de editar.

## S2 — Sem código legado ou de transição antes do lançamento

**Por quê:** o app está em produção, mas ainda não foi liberado para usuários. Não há dados reais a preservar, então compatibilidade com dados antigos, migrações e caminhos duplicados só aumentam a superfície de erro.

**Texto proposto** (novo item 8 no §2.2):

> 8. Enquanto o app não for liberado para usuários, NÃO DEVE ser criado código de compatibilidade com dados ou versões anteriores (leitura de formatos antigos, rotas duplicadas, scripts de migração, segredos ou hashes legados). Mudanças de modelo de dados são feitas diretamente, e os dados de teste podem ser recriados. Esta regra deixa de valer na data de liberação, registrada em `docs/arquitetura/decisoes.md`.

## S3 — §10.1: compatibilidade com o frontend publicado

**Por quê:** o texto atual exige manter compatibilidade com o frontend já publicado em toda mudança de contrato. Antes do lançamento isso gera código de transição, o que contradiz a S2.

**Texto atual:**
> * Mudança incompatível de contrato DEVE manter compatibilidade com o frontend publicado até o deploy simultâneo (Hosting e Cloud Run não sobem atomicamente).

**Texto proposto:**
> * Após a liberação para usuários, mudança incompatível de contrato DEVE manter compatibilidade com o frontend publicado até o deploy simultâneo (Hosting e Cloud Run não sobem atomicamente). Antes da liberação, vale o §2.2 item 8.

## S4 — §8.2: planos do parceiro

**Por quê:** o texto atual cita "mensal/trimestral/semestral", mas os planos reais no código são `monthly`, `semi-annual` e `annual` (não existe trimestral). Além disso, a decisão D2 já definiu o modelo.

**Texto atual:**
> | Plano do parceiro (mensal/trimestral/semestral) | **Stripe Billing (Subscriptions)** é o alvo. O pagamento avulso por PaymentIntent atual é débito registrado: não há renovação automática nem cobrança recorrente |

**Texto proposto:**
> | Plano do parceiro (`monthly`, `semi-annual`, `annual`) | **Stripe Billing (Subscriptions)** no cartão, com renovação automática (decisão D2). Alternativa: pagamento único por Pix, sem renovação, concedendo exatamente a duração do plano |

## S5 — §6.1: upload de arquivos

**Por quê:** a decisão D4 definiu o upload pelo backend para o Firebase Storage. O texto atual ainda admite "URL assinada" como alternativa e trata o Cloudinary como débito aceito.

**Texto proposto:**
> * Upload de arquivo também é escrita: DEVE passar pelo backend (`POST /api/media/images`), que valida, remove metadados e grava no Firebase Storage (decisão D4). Upload direto do navegador para qualquer provedor é proibido.

## S6 — §12.6: tradução automática (D5 em aberto)

**Por quê:** a D5 está em aberto, e o texto atual não proíbe a implementação enquanto você não decide. Sem essa linha, o agente do AI Studio pode implementar a tradução por conta própria.

**Texto proposto** (substitui o início do item "Tradução automática"):
> * **Tradução automática** de conteúdo de parceiros (ex: com Gemini via `@google/genai`) é a decisão **D5, em aberto**: até a aprovação, NÃO implementar nenhuma chamada de tradução automática. Se adotada, …(mantém o restante do texto atual)

## S7 — §12.7: URLs por idioma e SEO

**Por quê:** as decisões D6 e D7 foram aprovadas. O texto atual deixa a estratégia de URL "em aberto" e descreve como fato que o SEO do servidor não roda em produção, o que deixará de ser verdade após o prompt 8.

**Texto proposto** (substitui o 1º e o 3º itens do §12.7):
> * Cada idioma indexável DEVE ter URL própria (decisão D6): português na raiz, `en` e `fr` em pastas com slugs traduzidos (`/eventos`, `/en/events`, `/fr/evenements`). A fonte única do mapa é `src/shared/i18n/localizedRoutes.ts`, espelhada em `server/shared/kernel/localizedRoutes.ts` com teste de paridade. A URL tem prioridade sobre o idioma salvo no navegador.
>
> * O HTML das rotas de conteúdo DEVE passar pelo Cloud Run (`serverSeoService`), com cache na CDN do Hosting (`s-maxage=300`) e `sitemap.xml` dinâmico (decisão D7). A home `/` é servida estática pelo Hosting: seus metadados e `hreflang` ficam no `index.html`.

## S8 — §15: registro de decisões

**Por quê:** sem a referência, o agente do AI Studio não sabe que existem decisões já aprovadas (D1–D7) nem que a D5 está em aberto.

**Texto proposto** (novo item no §15):
> * Decisões já aprovadas estão em `docs/arquitetura/decisoes.md` e DEVEM ser seguidas sem nova consulta. Decisão marcada como **em aberto** NÃO pode ser implementada.

## S9 — §13: agregadores de UseCases já eliminados

**Por quê:** o prompt 15 dividiu todos os arquivos agregadores em um UseCase por arquivo. O §13 ainda diz que `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` existem e são débito. Um agente que leia isso pode procurar esses arquivos ou recriá-los.

**Texto atual:**
> * **Um UseCase por arquivo** (`createBookingUseCase.ts`). Arquivos agregadores existentes (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`) são débito: novos UseCases não entram neles.

**Texto proposto:**
> * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).

## S10 — §13 e §16.1: arquivo tocado sai sem avisos do lint

**Por quê:** regra dada pelo responsável do produto em 2026-10-19: quando uma refatoração toca um arquivo, os problemas presentes nesse arquivo devem ser corrigidos. Hoje o §16.1 só exige "biome sem erros", e o projeto acumula cerca de 320 avisos (`any`, imports sem uso, dependências de efeito). Sem a regra escrita, o agente do AI Studio não a conhece.

**Texto atual (§13, último item da lista de tamanho):**
> * Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).

**Texto proposto (novo item no §13, logo depois):**
> * Arquivo tocado DEVE sair sem avisos do lint (`npx biome lint <arquivo>`) e formatado (`npx biome format --write <arquivo>`). Aviso que não puder ser corrigido sem mudar comportamento recebe `biome-ignore` com justificativa ou vai para `docs/arquitetura/debitos.md`.

**Texto atual (§16.1):**
> npm run lint        # biome sem erros

**Texto proposto (§16.1):**
> npm run lint        # biome sem erros; arquivos tocados sem avisos (§13)

## S11 — §12.6: tradução automática do conteúdo (D5 aprovada)

**Por quê:** a D5 foi aprovada em 2026-10-19. O texto atual define `LocalizedText = { 'pt-BR', en?, fr? }`, cita o Gemini, prevê `translationSource: 'human' | 'machine'` e revisão pelo parceiro. Nada disso vale mais: o fornecedor é o Google Cloud Translation, não há tradução à mão, o original pode estar em qualquer idioma e cada tradução guarda o hash do original de onde saiu.

**Texto atual (§12.6):**
> * Campos traduzíveis (título, descrição, regras, política de cancelamento) usam o tipo `LocalizedText = { 'pt-BR': string; en?: string; fr?: string }`. Campos não traduzíveis (preço, endereço, telefone) continuam simples.
> * Ordem de fallback na exibição: idioma ativo → `pt-BR`. A UI indica quando mostra o texto original por falta de tradução.
> * **Tradução automática** de conteúdo de parceiros (ex: com Gemini via `@google/genai`, já presente no projeto) é decisão de produto (§15): custo, qualidade e responsabilidade. Se adotada, roda **só no backend**, grava `translationSource: 'human' | 'machine'` por idioma, permite revisão pelo parceiro e a UI informa "traduzido automaticamente".
> * Avaliações ficam no idioma original; tradução, se existir, é opção do leitor ("ver tradução").
> * Política de cancelamento e termos de compra exibidos antes do pagamento DEVEM existir no idioma do comprador ou em pt-BR com aviso claro.

**Texto proposto (substitui o §12.6 inteiro):**
> * Campos traduzíveis (título, descrição, regras, política de cancelamento, dicas) usam o tipo `LocalizedText = { source: { locale: Locale; text: string; hash: string }; translations: Partial<Record<Locale, { text: string; sourceHash: string; updatedAt: string }>> }`, com `hash` = SHA-256 do texto normalizado. Campos não traduzíveis (nome do estabelecimento e de pessoas, preço, endereço, telefone, horários e opções fixas como categoria e comodidades) continuam simples e iguais em todos os idiomas.
> * **Tradução automática** com Google Cloud Translation (decisão D5), **só no backend**, atrás de `MachineTranslationPort` no domínio `translation` (folha: não importa nenhum domínio). Não há tradução feita à mão nem revisão pelo parceiro. A UI informa "Traduzido automaticamente pelo Google · Ver original".
> * **Edição no idioma ativo:** o editor mostra cada campo no idioma escolhido em Configurações e indica qual versão está sendo editada. Salvar um campo nesse idioma faz dele o novo `source` daquele campo, e as outras versões são traduzidas de novo a partir dele; o editor avisa antes de salvar.
> * A tradução roda **fora da requisição de salvamento**: o backend grava o `source` e um evento na outbox na mesma transação (§5.6), e o job traduz só os campos em que `sourceHash` difere do `hash` atual, descartando o trabalho se o texto mudou de novo. Enquanto não há tradução, a UI mostra o original com aviso.
> * Ordem de fallback na exibição: idioma ativo → `source`.
> * **Avaliações** ficam no idioma original, com o idioma detectado gravado. A tradução é pedida pelo leitor ("Ver tradução"), inclusive por visitante sem conta, com rate limit por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache do domínio `translation`, indexado pelo hash do texto e pelo idioma, e é reaproveitado para todos os leitores. Excluir a avaliação ou a conta apaga as entradas desse texto no cache (§7.5).
> * Política de cancelamento e termos de compra exibidos antes do pagamento aparecem no idioma do comprador, por tradução automática com aviso, e com link para o original, que é o texto que vale.

## S12 — §12.1 e §12.7: idioma na primeira visita (D10)

**Por quê:** pela regra atual, a URL tem prioridade e o português fica na raiz `/`. Quem tem o navegador em inglês e abre a home recebe português, e o app ainda grava "pt-BR" como preferência. A decisão D10 (opção B) faz o idioma do navegador valer na home, sem prejudicar o SEO nem os links compartilhados.

**Texto atual (§12.1, duas linhas da tabela):**
> | Detecção do idioma inicial | 1º `localStorage['useguide.locale']` → 2º `navigator.languages` → 3º `pt-BR` | `resolveInitialLocale()` |
> | Persistência e `<html lang>` | atualizados no evento `languageChanged` | `config.ts` |

**Texto proposto:**
> | Detecção do idioma inicial | 1º idioma da URL (`/en`, `/fr`) → 2º escolha explícita (`users/{uid}.preferredLocale` ou `localStorage['useguide.locale']`) → 3º `navigator.languages` → 4º `pt-BR` (decisão D10) | `resolveInitialLocale()` |
> | Persistência e `<html lang>` | o idioma só é gravado quando a pessoa escolhe (Configurações ou aviso de idioma); mudança causada pela URL não é gravada. `<html lang>` acompanha o idioma ativo | `config.ts` |

**Texto atual (§12.7, fim do 1º item):**
> A URL tem prioridade sobre o idioma salvo no navegador.

**Texto proposto:**
> A URL com prefixo de idioma (`/en`, `/fr`) sempre vale. Na home `/`, quando a preferência (escolha salva → idioma do navegador) não for português, o app redireciona para `/en` ou `/fr` sem criar entrada no histórico; robôs de busca nunca são redirecionados. Nas demais páginas em português, o app mantém o idioma do link e mostra um aviso para trocar ("Esta página está disponível em English — Mudar"); a resposta ao aviso grava a escolha (decisão D10).

## S13 — §7.7: débito de `partnerDocumentKeys` resolvido (Prompt 18.3.0b)

**Por quê:** o Prompt 18.3.0b tirou o documento da conta do parceiro (D12, P0). `partnerDocumentKeys` e os campos `cpfCnpj`/`cpfCnpjClean` não existem mais; CPF/CNPJ fica só na verificação de cada estabelecimento, cifrado e com índice cego. A frase do §7.7 passou a descrever um débito que não existe.

**Texto atual (§7.7, fim do bloco "Blind index"):**
> * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII. Débito existente: `partnerDocumentKeys/{cpfCnpjLimpo}` e os campos `cpfCnpj`/`cpfCnpjClean` em `partners` estão em texto puro.

**Texto proposto:**
> * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.

## S14 — §11.1 e nova §11.11: tema claro sem branco puro e experiência de app nativo

**Por quê:** pedido de 2026-10-24. O app é web, mas deve se comportar como app nativo, e o claro em branco puro cansa a vista. Hoje o §11.1 só diz que o componente funciona nos dois temas; não fixa a cor do claro nem como transições e toque devem se comportar, e efeitos somados (escala do toque + `whileTap` + transform de centralização) já causaram conflito.

**Texto atual (§11.1, 1º item):**
> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.

**Texto proposto (§11.1, 1º item):**
> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.

**Texto proposto (nova §11.11):**
> ### 11.11. Experiência de app nativo
>
> * Modais e diálogos: folha que sobe da borda inferior no celular (com alça e safe area) e cartão central do `sm:` em diante, pelo `Dialog` do design system.
> * Entrada e saída animadas (fade, escala, folha), com saída pelo `data-state` do Radix; duração de 150–300 ms.
> * Retorno ao toque em todo botão (`press`: escala 0,97, sem destaque azul de toque, `touch-action: manipulation`).
> * **Um efeito por propriedade em cada elemento:** não somar `press` a `whileTap`/`whileHover` do `motion` nem a `active:scale-*`; animações usam as propriedades `scale`/`translate`, nunca `transform` quando o elemento já é centralizado por `transform`.
> * Tudo respeita `prefers-reduced-motion` (`motion-reduce:animate-none` e `MotionConfig reducedMotion="user"`).
> * Ao abrir um diálogo o foco vai para o próprio diálogo, sem anel de foco num botão que a pessoa não tocou.

## S15 — §8.1, §8.2, §8.3 e §8.7: repasse por documento e retenção até o serviço (D14)

**Por quê:** decisão D14. No Brasil o repasse da conta conectada ao banco é sempre automático e diário, então a *destination charge* entrega o dinheiro ao proprietário antes do serviço (no Pix, em 2 dias úteis). Para proteger o consumidor e o proprietário, a cobrança fica na plataforma e a transferência sai 48 h depois do fim do serviço, para a conta do documento do estabelecimento. O texto final é o do AGENTS.md aplicado pelo prompt A5 (junto com a S14):

* **§8.1:** conta Express por documento (CNPJ); cobrança na plataforma com transferência separada 48 h depois do fim do serviço; reclamação suspende por até 5 dias; taxas por tipo de produto (15%; 10% + R$ 3,00 por ingresso ou 12,5% absorvida), sobre o valor que o proprietário fica num reembolso parcial; checagem da conta do documento e do bloqueio por dívida antes de vender.
* **§8.2:** ingressos e reservas com PaymentIntent na plataforma e transferência depois do serviço.
* **§8.3:** Pix só para serviço até 80 dias depois da compra (reembolso de Pix só em até 90 dias).
* **§8.7:** políticas de cancelamento da plataforma, gravadas no pedido e só mais flexíveis depois de publicar; arrependimento em 7 dias até 48 h antes do início; no-show sem reembolso; translado com retenção máxima de 5%; cancelamento pelo proprietário com reembolso integral, multa de 20%, compensação em 24 h e bloqueio; reagendamento em força maior; disputa com suspensão do repasse.

## S16 — Fundo neutro e superfícies sólidas (D17)

**Por quê:** o fundo azul com linhas de mapa e o vidro em todos os cartões disputam a atenção com a informação. As referências aprovadas (Airbnb, Google Travel, Apple Mapas) usam fundo liso, cartões sólidos e cor só no que tem significado. Propostas das telas aprovadas por prints em 2026-10-27.

**Texto atual (§11.1):**

> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; (…)
> * **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).

**Texto aprovado:**

> * **Estilo:** superfícies sólidas e discretas sobre fundo neutro e liso: grafite no escuro (fundo `#0d0e10`, cartão `#1e2024`) e bege no claro (fundo `#f3eee4`, cartão `#faf6ee`). Sem gradientes, padrões nem linhas decorativas no fundo. Vidro (desfoque) só em barras fixas e folhas sobre o conteúdo. Cor só com significado: verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Uma ação principal por tela; as demais como texto. Tema **dark é o padrão de design**; (…o resto igual)
> * **Superfície elevada:** cartão sólido do design system (`GlassCard` passa a ser sólido, sem desfoque).
