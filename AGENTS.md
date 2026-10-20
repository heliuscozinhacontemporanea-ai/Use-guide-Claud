# AGENTS.md — Use Guide

> Versão 2.0 · Diretrizes obrigatórias para qualquer agente de IA (Gemini no Google AI Studio, Claude, Copilot etc.) e para desenvolvedores humanos.
> Palavras-chave **DEVE / NÃO DEVE / DEVERIA / PODE** seguem a RFC 2119 (DEVE = obrigatório; DEVERIA = obrigatório salvo justificativa registrada; PODE = opcional).

---

## 0. Como ler este documento

### 0.1. Ordem de precedência (resolve qualquer conflito)

Quando duas regras parecerem conflitar, vale a de número menor:

1. **Segurança, criptografia, privacidade (LGPD) e integridade financeira** (§7, §8)
2. **Funcionamento nos dois ambientes — AI Studio e Produção** (§2)
3. **Direção de dependências e comunicação entre domínios** (§3, §4)
4. **Leitura vs. escrita (CQRS)** (§6)
5. **Contratos de API, erros e observabilidade** (§10)
6. **UI/UX, acessibilidade e internacionalização** (§11, §12)
7. **Modularidade, estilo e comentários** (§13, §14)

### 0.2. Escopo

Vale para `src/` (frontend), `server/` + `server.ts` (backend), `functions/` (Cloud Functions), `firestore.rules`, `storage.rules`, `firestore.indexes.json` e `firebase.json`.

---

## 1. Contexto do Produto

O **Use Guide** é um guia turístico e marketplace (referência de mercado: TripAdvisor + Sympla + GetYourGuide), com foco inicial em Jericoacoara, Preá e Barrinha de Baixo (CE).

| Capacidade | Domínio responsável (backend) |
|---|---|
| Catálogo: restaurantes, hospedagens, passeios, atrações públicas e privadas, dicas de viagem | `guide` |
| Eventos (listagem, ocorrências/datas, publicação) | `events` |
| Venda de ingressos, check-in por QR Code, transferência, reembolso, lista de espera | `ticketing` |
| Venda de passeios, aluguel (ex: quadriciclo), translado, entradas de atrações privadas | `bookings` (**novo — ainda não existe**, ver §9.3) |
| Pagamentos, Stripe Connect, repasse ao parceiro, taxa da plataforma | `payment` |
| Parceiros/estabelecimentos (cadastro, verificação, planos) | `partners` |
| Planos de assinatura e administração | `admin` |
| Usuários e perfis públicos | `users` |
| Avaliações (somente após uso verificado, quando aplicável) | `reviews` |
| Favoritos | `favorites` |
| Notificações | `notifications` |
| Métricas de interação | `insights` |
| Condições de vento/clima | `climawind` |
| SEO no servidor (HTML hidratado) | `seo` |

**Fuso horário canônico do negócio:** `America/Fortaleza` (UTC−3, sem horário de verão). Datas DEVEM ser persistidas em UTC (ISO 8601 ou Timestamp) e exibidas no fuso do negócio, ou no fuso do usuário quando ele escolher.

**Moeda:** BRL. Valores monetários DEVEM ser inteiros em centavos (`amountMinor`, tipo `MoneyMinor`). É proibido `number` com casas decimais para dinheiro.

**Idiomas suportados:** `pt-BR` (padrão), `en`, `fr`. Toda configuração e regra de tradução está no §12.

---

## 2. Ambientes: Google AI Studio (Desenvolvimento) e Produção

O código DEVE funcionar **sem alterações** nos dois ambientes. Nenhuma funcionalidade pode depender de um ambiente só, salvo as exceções explícitas desta seção.

### 2.1. Matriz de ambientes

| Aspecto | AI Studio (dev) | Produção |
|---|---|---|
| Processo | `npm run dev` → `tsx server.ts` (Express + Vite em middleware mode) | `npm run build` → `node dist/server.cjs` no Cloud Run (`use-guide`, `us-east1`) |
| `NODE_ENV` | ≠ `production` | `production` |
| Porta | `3000` (única porta exposta pelo proxy do AI Studio) | `process.env.PORT` (definida pelo Cloud Run) |
| Frontend | Servido pelo Vite middleware do mesmo Express | Firebase Hosting (CDN) com rewrite `/api/**` → Cloud Run |
| Firestore | Database ID de `firebase-applet-config.json` / `FIRESTORE_DATABASE_ID` | `FIRESTORE_DATABASE_ID` de produção |
| Segredos | Painel **Secrets** do AI Studio | Secret Manager montado como variável de ambiente no Cloud Run |
| Credenciais Admin SDK | `FIREBASE_SERVICE_ACCOUNT_KEY` (aceito somente em dev) | **ADC** — conta de serviço anexada ao Cloud Run (não usar chave JSON) |
| App Check | `APP_CHECK_REQUIRED=false` permitido | `APP_CHECK_REQUIRED=true` |
| Stripe | Chaves `sk_test_` / `pk_test_` e webhook do Stripe CLI ou endpoint de teste | Chaves `sk_live_` / `pk_live_` e endpoint de webhook live |

### 2.2. Regras obrigatórias

1. Toda configuração DEVE vir de variáveis de ambiente documentadas em `.env.example`. Variável nova sem entrada no `.env.example` = PR incompleto.
2. Variáveis expostas ao navegador DEVEM ter prefixo `VITE_` e conter **somente** valores públicos (chave publicável do Stripe, config do Firebase Web). Segredos NUNCA usam `VITE_`.
3. Detecção de ambiente DEVE ser centralizada (uma função/módulo de config), nunca espalhada com `host.includes(...)` em vários arquivos.
4. Adapters DEVEM inicializar SDKs de forma preguiçosa (*lazy*): a importação de um módulo NÃO DEVE abrir conexões, ler segredos obrigatórios nem lançar exceção. Falta de configuração DEVE falhar na primeira chamada, com mensagem clara.
5. O servidor DEVE subir mesmo sem integrações opcionais configuradas (ex: Stripe ausente no AI Studio). Rotas dependentes DEVEM responder `503` com código de erro estável (§10.2), nunca derrubar o processo.
6. É proibido código que só funciona em produção sem um caminho de teste no AI Studio (ex: modo teste do Stripe, emulador, dados de seed explícitos).
7. Mocks, stubs e fakes são permitidos **somente** em arquivos de teste (`*.test.ts`) ou adapters in-memory usados exclusivamente por testes. É proibido dado fictício no código de produção (ver §11.10).
8. Enquanto o app não for liberado para usuários, NÃO DEVE ser criado código de compatibilidade com dados ou versões anteriores (leitura de formatos antigos, rotas duplicadas, scripts de migração, segredos ou hashes legados). Mudanças de modelo de dados são feitas diretamente, e os dados de teste podem ser recriados. Esta regra deixa de valer na data de liberação, registrada em `docs/arquitetura/decisoes.md`.

### 2.3. Restrições de plataforma que o código DEVE respeitar

* **Firebase Hosting → Cloud Run:** requisições via rewrite têm timeout de **60 s**; operações longas DEVEM virar jobs assíncronos (Cloud Tasks / Cloud Scheduler / Functions).
* **Cookies via Firebase Hosting:** o Hosting remove cookies das requisições, exceto o cookie chamado `__session`. Autenticação DEVE usar `Authorization: Bearer <Firebase ID Token>`.
* **Cloud Run é stateless:** proibido guardar estado em memória entre requisições (sessões, filas, rate limit) sem fallback em armazenamento externo.
* **Desligamento gracioso:** o servidor DEVE tratar `SIGTERM` (já implementado em `server.ts`).
* **Webhooks do Stripe** DEVEM apontar para uma URL HTTPS pública estável; o handler DEVE responder em poucos segundos (§8.6).

---

## 3. Arquitetura: Hexagonal (Ports & Adapters) + DIP + Camadas

### 3.1. Princípios

1. **Núcleo isolado:** services, usecases, types, errors e ports NÃO DEVEM importar SDKs de fornecedores (`firebase`, `firebase-admin`, `stripe`, `@stripe/*`, Cloudinary, APIs de clima etc.).
2. **Ports** são interfaces TypeScript com tipos neutros do domínio. NUNCA expõem tipos do SDK (`DocumentSnapshot`, `Timestamp`, `Stripe.PaymentIntent`…).
3. **Adapters** implementam ports e são os únicos que importam SDKs de fornecedores.
4. **Composição** acontece em `factory.ts` (por domínio) ou na raiz de composição (`server.ts`, `src/app`). Trocar um fornecedor DEVE exigir apenas um adapter novo + uma linha na factory.

### 3.2. Lista de permissões de bibliotecas (evita a interpretação literal impossível de "nunca importar terceiros")

| Biblioteca | Onde PODE ser importada |
|---|---|
| `zod` | `schemas/` (definição). Demais camadas importam o schema, não o `zod` |
| `express` | `routes/`, `controllers/`, middlewares em `server/infrastructure/http` e `server.ts` |
| `react`, `react-dom`, `react-router-dom`, `motion`, `lucide-react`, `react-hook-form`, `@hookform/resolvers` | `components/`, `hooks/`, `src/app`, `src/ui` |
| `zustand` | `stores/` |
| `date-fns` | qualquer camada (biblioteca pura, sem I/O) |
| `firebase`, `firebase-admin` | somente `adapters/` e `*/infrastructure/firebase/` |
| `stripe` (Node) | somente `server/domain/payment/adapters/` |
| `crypto` (Node), `@google-cloud/kms` | somente `server/infrastructure/crypto/`, `adapters/` e `utils/` de token/assinatura (§7.7) |
| `i18next`, `react-i18next` | `src/shared/i18n/`; componentes e hooks usam `useTranslation`/`<Trans>` (§12) |
| `@stripe/stripe-js`, `@stripe/connect-js` | somente `src/domain/payment/adapters/` |
| `@stripe/react-stripe-js`, `@stripe/react-connect-js` | somente **UI adapters**: `src/domain/payment/adapters/ui/*.tsx` (ver 3.3) |
| `leaflet`, `recharts`, `qrcode`, `react-easy-crop` | componentes do domínio que os usa, encapsulados em um único componente wrapper |

### 3.3. UI Adapters (exceção controlada)

Componentes de SDK que **precisam** ser renderizados em JSX (Stripe Payment Element, Stripe Connect embedded components) são *UI adapters*:

* DEVEM ficar em `src/domain/<dominio>/adapters/ui/`.
* DEVEM expor props neutras (ex: `clientSecret`, `onSucceeded`, `onFailed`) e nunca vazar tipos do SDK.
* O restante da UI consome apenas esses wrappers.

### 3.4. Camadas e Regra de Dependência

As setas indicam "pode importar". Toda seta ao contrário é proibida.

```
Backend
  server.ts (composição raiz)
     │
     ▼
  interfaces HTTP  (routes/, controllers/, middlewares)
     │
     ▼
  server/application/  (Application/Composition UseCases — orquestram ≥ 2 domínios)
     │
     ▼
  server/domain/<X>/usecases  (contrato público do domínio)
     │
     ▼
  services → ports ← adapters → SDKs / Firestore
     │
     ▼
  server/shared/kernel  (tipos transversais neutros: AuthenticatedUserContext, MoneyMinor, Result, erros base)

Frontend
  src/main.tsx → src/app (rotas, providers, compositions)
     │
     ▼
  src/domain/<X>/components → hooks → application/usecases → ports ← adapters
     │
     ▼
  src/ui (design system, sem conhecer domínios)  ·  src/shared (utilitários puros, sem conhecer domínios)
```

Regras:

1. `server/domain/**` NÃO DEVE importar `server/application/**`. Tipos transversais (ex: `AuthenticatedUserContext`) DEVEM morar em `server/shared/kernel/`.
2. Controllers que chamam Application UseCases DEVEM viver na camada de interface HTTP, fora do domínio: `server/interfaces/http/<recurso>/`. Controllers que chamam só o próprio domínio PODEM continuar em `server/domain/<X>/controllers/`.
3. `src/ui/**` e `src/shared/**` NÃO DEVEM importar `src/domain/**`. Quando um layout precisa de dado de domínio (ex: usuário logado no `Header`), o dado entra por props ou por composição em `src/app`.
4. `server/infrastructure/**` contém apenas infraestrutura técnica transversal (cliente Firebase Admin, verificação de token, App Check, logger). Middlewares que precisam de UseCases (ex: `resolveGuideContext`) pertencem à camada de interface HTTP.

---

## 4. Estrutura de Diretórios Canônica

### 4.1. Backend

```
server/
├── shared/kernel/              # Tipos e erros transversais neutros (sem SDK, sem domínio)
├── infrastructure/             # firebase/adminClient, auth (token, App Check), logging, config
├── interfaces/http/            # Controllers/rotas que orquestram Application UseCases
├── application/usecases/       # Application/Composition UseCases (1 arquivo por caso de uso)
├── domain/<dominio>/
│   ├── adapters/               # Firestore (Admin SDK), Stripe, APIs externas
│   ├── controllers/            # HTTP → DTO → UseCase do próprio domínio → resposta
│   ├── dtos/                   # Objetos de entrada sanitizados + mappers de persistência
│   ├── errors/                 # Erros tipados do domínio (com `code` estável)
│   ├── ports/                  # Interfaces neutras
│   ├── routes/                 # Endpoints Express + middlewares (auth, RBAC, rate limit)
│   ├── schemas/                # ÚNICO lugar com schemas Zod de entrada HTTP
│   ├── services/               # Regras de negócio puras (dependem só de ports)
│   ├── types/                  # Entidades e value objects
│   ├── usecases/               # Contrato público: 1 caso de uso por arquivo
│   ├── utils/                  # Funções puras
│   ├── factory.ts              # Composição interna (lazy)
│   └── index.ts                # Fachada pública (Published Language, §5.2)
└── scripts/                    # Scripts operacionais (consomem UseCases públicos)
```

### 4.2. Frontend

```
src/
├── app/                        # Router, providers, compositions (único lugar que monta UI de vários domínios)
├── ui/                         # Design system (GlassCard, Dialog, Toast…), sem domínio
├── shared/                     # constants, i18n, utils puros, infraestrutura firebase client
└── domain/<dominio>/
    ├── adapters/               # HTTP (firebaseApiFetch), Firestore client (somente leitura), SDKs
    │   └── ui/                 # UI adapters de SDK (§3.3)
    ├── application/usecases/   # Casos de uso (sem JSX/DOM) — contrato público do domínio
    ├── components/             # UI declarativa
    ├── hooks/                  # Ligam usecases ao estado React
    ├── ports/  schemas/  types/  stores/  utils/
    ├── factory.ts
    └── index.ts                # Fachada pública
```

---

## 5. Comunicação entre Domínios

### 5.1. Canais permitidos

| De → Para | Canal obrigatório |
|---|---|
| Frontend domínio A → Frontend domínio B | UseCase público de B (via `index.ts` de B) |
| Frontend → Backend | HTTPS `/api/<recurso>` autenticado (`Authorization: Bearer`), via adapter HTTP |
| Backend domínio A → Backend domínio B | UseCase público de B (via `index.ts` de B) |
| Fluxo que envolve ≥ 2 domínios com risco de ciclo | Application/Composition UseCase em `server/application/usecases/` |
| "Algo aconteceu" sem precisar de resposta | Domain/Application Event (§5.6) |
| UI de vários domínios na mesma tela | Composição em `src/app/compositions` (slots/props) |

### 5.2. O que a fachada `index.ts` PODE exportar (Published Language)

Para consumo por outros domínios, o `index.ts` PODE exportar **somente**:

1. UseCases públicos;
2. tipos de entrada/saída desses UseCases (DTOs públicos e entidades read-only);
3. erros públicos do domínio (para `instanceof` e mapeamento HTTP);
4. funções puras de regra de domínio sem I/O (ex: `canTransitionOrderStatus`);
5. no frontend: componentes públicos destinados **exclusivamente** a `src/app/compositions`.

É proibido importar de outro domínio por caminho interno (`../../outroDominio/services/...`, `.../schemas/...`, `.../context/...`, `.../components/...`). Só `index.ts`.

### 5.3. Proibições

Um domínio NÃO DEVE importar de outro: services, repositories, ports internos, adapters, factories, controllers, routes, schemas internos, DTOs internos, contexts React, stores internos, nem acessar coleções do Firestore que pertencem a outro domínio.

### 5.4. Grafo acíclico (DAG) — obrigatório

1. O grafo de dependências entre domínios DEVE ser acíclico, considerando também as camadas (`application`, `ui`, `shared`).
2. Antes de criar `A → B`, o agente DEVE verificar se existe caminho `B → … → A` (consultar `docs/arquitetura/02-grafo-dependencias.md` e reexecutar a análise).
3. Direção-alvo do backend (domínios mais à direita não conhecem os da esquerda):

```
reviews ─┐
favorites┤
insights ┼──► guide · events ◄── ticketing ◄── (application) ──► payment
partners ┘                                     bookings (novo) ──► payment
notifications  (folha: não importa nenhum domínio; recebe dados por parâmetro)
users · admin · climawind · seo  (folhas)
```

4. `payment` é folha de negócio: NÃO DEVE conhecer `ticketing`, `bookings`, `partners` ou `admin`. Quem conhece "pedido de ingresso" ou "plano" é o Application UseCase que chama `payment`.

### 5.5. Dependência bidirecional

Proibido `A → B` e `B → A`. Resolver, nesta ordem de preferência: (1) mover a regra para o domínio correto; (2) Application/Composition UseCase; (3) Domain Event. Proibido criar módulo `shared` só para esconder o ciclo.

### 5.6. Domain/Application Events

* Contrato: `EventPublisherPort` com eventos tipados (ex: `ReviewCreated`, `TicketOrderPaid`, `BookingConfirmed`).
* Implementação PODE ser in-process síncrona (MVP). Para efeitos colaterais que não podem ser perdidos (e-mail, notificação de venda, repasse), DEVE ser usado **Transactional Outbox**: gravar o evento no Firestore na mesma transação da mudança de estado e processá-lo por Cloud Function/Cloud Tasks com idempotência.
* O produtor NÃO DEVE importar os consumidores.

### 5.7. Factories e fachadas

* `factory.ts` é composição interna; NÃO DEVE ser importada por outro domínio.
* Factories NÃO DEVEM executar I/O, ler segredos obrigatórios ou lançar exceção na avaliação do módulo (§2.2.4).
* `index.ts` NÃO DEVE reexportar routes/controllers (evita carregar HTTP quando só um UseCase é necessário).

### 5.8. Regra de emergência

Uma dependência fora do padrão só é permitida para restaurar funcionamento crítico, sem comprometer segurança, e DEVE ser registrada em `docs/arquitetura/debitos.md` com: arquivo, motivo, risco, data e correção prevista.

---

## 6. Leitura vs. Escrita (CQRS pragmático)

### 6.1. Escritas — sempre no backend

* O frontend NUNCA chama `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `writeBatch`, `runTransaction` nem `uploadBytes`.
* Toda mutação passa por `POST | PUT | PATCH | DELETE /api/...` → autenticação → autorização → Zod → DTO → UseCase → adapter (Admin SDK).
* Upload de arquivo também é escrita: DEVE passar pelo backend (`POST /api/media/images`), que valida, remove metadados e grava no Firebase Storage (decisão D4). Upload direto do navegador para qualquer provedor é proibido.

### 6.2. Leituras no frontend (Firestore Client SDK)

PERMITIDO ler direto do Firestore (`onSnapshot`, `getDocs`) somente quando **todas** as condições forem verdadeiras:

1. o dado é público (catálogo, eventos publicados, avaliações, perfis públicos) **ou** pertence ao próprio usuário autenticado;
2. a coleção tem regra de leitura explícita em `firestore.rules` com teste em `firestore.rules.*.test.ts`;
3. o documento não contém PII de terceiros, dados financeiros ou segredos.

OBRIGATÓRIO ler via API do backend: pedidos, ingressos, tokens de QR Code, transações, reembolsos, contas Stripe conectadas, relatórios de venda, dados administrativos e qualquer coleção com `allow read: if false`.

### 6.3. Modelagem para leitura pública

Documentos lidos pelo cliente DEVEM ser **projeções públicas** (ex: `publicProfiles`, `publicPartners`) mantidas pelo backend. Nunca expor o documento interno completo para "economizar" uma coleção.

### 6.4. Tempo real e custo

* Toda escuta (`onSnapshot`) DEVE ter `limit()` e ser cancelada no `unmount`.
* Listagens DEVEM ser paginadas por cursor (`startAfter`), nunca por `offset`.
* Toda query composta DEVE ter índice declarado em `firestore.indexes.json`.

---

## 7. Segurança (Zero-Trust, defesa em profundidade)

**Premissa:** o backend nunca confia no frontend.

### 7.1. Camadas — caminho de ESCRITA

```
[Frontend RHF+Zod] → [App Check] → [Auth: verifyIdToken] → [Autorização: RBAC + posse do recurso]
   → [Zod safeParse] → [DTO allowlist] → [Regra de negócio no service] → [Transação Admin SDK]
```

> ⚠️ **As Firestore Security Rules NÃO protegem escritas feitas pelo Admin SDK** — o Admin SDK ignora as rules. No caminho de escrita, a autorização é responsabilidade exclusiva do backend.

### 7.2. Camadas — caminho de LEITURA direta do cliente

```
[Frontend Client SDK] → [Firestore Security Rules] (+ App Check aplicado no Firestore em produção)
```

### 7.3. Regras de cada camada

1. **Frontend:** formulários com React Hook Form + `zodResolver`. É só UX — não é controle de segurança.
2. **App Check:** obrigatório em produção para `/api/*` (exceto webhooks, health e jobs internos autenticados).
3. **Autenticação:** `verifyIdToken` com `checkRevoked: true` em operações sensíveis (pagamento, exclusão de conta, mudança de papel).
4. **Autorização:** papel vindo de **custom claims** ou do documento do usuário lido no servidor; nunca do body. Toda operação em recurso DEVE checar posse (`ownerId === uid`) ou papel `admin`.
5. **Validação:** `schema.safeParse()` em `body`, `params` e `query`; falha → `400` com `VALIDATION_ERROR`.
6. **DTO:** allowlist de campos; campos como `isAdmin`, `isVerified`, `status`, `price`, `ownerId`, `partnerId` NUNCA vêm do cliente sem regra explícita.
7. **Firestore Rules:** `default deny`; cada coleção nova DEVE nascer com regra e teste. Coleções só de backend: `allow read, write: if false`.
8. **Storage Rules:** mesmo princípio; escrita via backend.

### 7.4. Proteções transversais obrigatórias

* **Rate limiting** em rotas públicas e de autenticação/pagamento (por IP + uid), com armazenamento compartilhado (não memória local do Cloud Run).
* **`trust proxy`** DEVE ser configurado com o número exato de proxies, não `true`.
* **Cabeçalhos:** Helmet com CSP (já existe em `server.ts`); toda origem nova (Stripe, mapas, CDN) DEVE ser adicionada explicitamente.
* **Erros:** nunca devolver stack trace, mensagem do SDK ou detalhe interno ao cliente (§10.2).
* **Segredos:** Secret Manager em produção; proibido commitar `.env`, chaves, service accounts ou PEMs.
* **Links externos:** `window.open(url, '_blank', 'noopener,noreferrer')` e `rel="noopener noreferrer"`.
* **Dependências:** `npm audit` sem vulnerabilidade *high/critical* para merge.

### 7.5. Privacidade — LGPD (Lei 13.709/2018)

* Coletar o mínimo necessário; CPF/CNPJ, telefone e documentos só quando exigidos pela regra de negócio.
* PII NUNCA em logs, metadata do Stripe, analytics ou URLs.
* O usuário DEVE conseguir exportar e excluir seus dados (`deleteUserAccountApplicationUseCase` é o ponto de entrada da exclusão e DEVE cobrir todos os domínios).
* Dados financeiros e fiscais têm retenção legal: exclusão de conta DEVE anonimizar (e não apagar) registros de transação.
* Incidente com dado pessoal DEVE ser comunicado ao responsável do produto imediatamente; a comunicação à ANPD e aos titulares segue a Resolução CD/ANPD nº 15/2024.

### 7.6. Classificação de dados

Todo campo novo DEVE ser classificado antes de ser persistido. A classe define onde o dado pode aparecer e como é protegido.

| Classe | Exemplos | Leitura pelo cliente | Proteção obrigatória |
|---|---|---|---|
| **Pública** | nome do estabelecimento, fotos, preço exibido, avaliações, eventos publicados | direto do Firestore (§6.2) | integridade (escrita só pelo backend) |
| **Interna** | contadores, status operacionais, logs de auditoria | só via API (admin/dono) | rules `if false` + autorização no backend |
| **Confidencial (PII)** | e-mail, telefone, nome completo, endereço, data de nascimento, foto de perfil privada | só o próprio titular, via API ou documento próprio com rule | minimização, nunca em logs/metadata, mascaramento na exibição |
| **Restrita (PII sensível)** | CPF, CNPJ de pessoa física (MEI), documentos de identidade, comprovantes de verificação | nunca em texto puro; exibir mascarado (`***.***.***-12`) | **criptografia em nível de campo** + *blind index* (§7.7) |
| **Segredos** | chaves de API, `STRIPE_*`, PEMs, chaves HMAC, tokens de job | nunca | Secret Manager, rotação (§7.8) |
| **Dados de cartão / bancários** | número do cartão, CVV, conta bancária do parceiro | nunca | **proibido armazenar**: ficam no Stripe (Payment Element e Connect onboarding) |

### 7.7. Criptografia

**Em repouso (base, já fornecida pelo Google Cloud):** Firestore, Cloud Storage, Secret Manager e discos do Cloud Run são criptografados por padrão com AES-256. Isso protege contra acesso físico ao disco; **não protege** contra leitura indevida por código, por um usuário com permissão IAM ampla ou por um export do banco. Por isso a classe *Restrita* exige criptografia adicional na aplicação.

**Criptografia em nível de campo (classe Restrita):**

1. Algoritmo: **AES-256-GCM** com IV aleatório de 96 bits por operação (nunca reutilizar IV com a mesma chave) e tag de autenticação de 128 bits.
2. Gestão de chave: **envelope encryption** com **Cloud KMS** — a chave de dados (DEK) é gerada por registro ou por lote e guardada cifrada pela chave mestra do KMS (KEK). A KEK nunca sai do KMS.
3. Formato persistido: `{ v: 1, kid: '<versão da chave>', iv, tag, ct }` em base64url. O `kid` permite rotação sem migração imediata.
4. *Associated data* (AAD) DEVE incluir o ID do documento e o nome do campo, impedindo copiar o valor cifrado para outro registro.
5. Contrato: `FieldEncryptionPort { encrypt(plain, context): Promise<EncryptedField>; decrypt(field, context): Promise<string> }` em `server/shared/kernel`, implementado por `server/infrastructure/crypto/kmsFieldEncryptionAdapter.ts`. Domínios usam o port, nunca o SDK do KMS.
6. Criptografia e descriptografia acontecem **somente no backend**. O frontend nunca recebe chave nem dado Restrito descriptografado, salvo o próprio titular em tela específica e mascarada por padrão.
7. No AI Studio, PODE ser usado um adapter local com chave de teste vinda do painel Secrets (`FIELD_ENCRYPTION_DEV_KEY`, 32 bytes base64). Esse adapter DEVE se recusar a iniciar com `NODE_ENV=production`.

**Blind index (busca e unicidade sem expor o dado):**

* Para verificar unicidade ou buscar por CPF/CNPJ, gravar `HMAC-SHA-256(PII_BLIND_INDEX_KEY, valorNormalizado)` em vez do valor.
* IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.

**Hash, tokens e assinaturas:**

| Uso | Obrigatório | Proibido |
|---|---|---|
| Senhas de usuário | Firebase Auth (o backend nunca recebe nem guarda senha) | qualquer armazenamento próprio de senha |
| Tokens opacos (QR de ingresso, convite, link de transferência, reset) | gerar com `crypto.randomBytes(≥ 16)` (≥ 128 bits); guardar só `HMAC-SHA-256` com chave do Secret Manager | guardar o token em texto puro; `Math.random()`; UUID como segredo |
| Assinatura offline (check-in) | RSA-PSS SHA-256 com chave ≥ 3072 bits **ou** Ed25519; `kid` no token para rotação | RSA PKCS#1 v1.5 em código novo; chave privada no frontend |
| Comparar segredos | `crypto.timingSafeEqual` sobre buffers de mesmo tamanho | `===` em segredos |
| Integridade de webhook | verificação do SDK do provedor (`stripe.webhooks.constructEvent`) | verificação manual sem tolerância de tempo |
| Algoritmos | SHA-256/384/512, HMAC-SHA-256, AES-256-GCM, Ed25519, RSA-PSS | MD5, SHA-1, AES-ECB, AES-CBC sem MAC, DES/3DES, criptografia "caseira" |

**Segredo com fallback fixo é proibido.** Se um segredo obrigatório faltar, o código DEVE falhar na primeira chamada (§2.2.4) e nunca usar um valor padrão escrito no código. Débito existente: `DEFAULT_FALLBACK_QR_SECRET` em `server/domain/ticketing/utils/qrToken.ts`.

**Onde o módulo `crypto` do Node PODE ser importado:** `server/infrastructure/crypto/`, `adapters/` e `utils/` puros de token/assinatura do próprio domínio. Nunca em controllers, componentes ou hooks.

### 7.8. Gestão e rotação de chaves

| Segredo | Armazenamento | Rotação | Observação |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Secret Manager | ao suspeitar de vazamento e na troca de responsável | preferir **restricted key** com permissões mínimas |
| `STRIPE_WEBHOOK_SECRET` | Secret Manager | a cada 12 meses (o Stripe permite período de sobreposição de até 24 h) | um segredo por endpoint |
| `TICKET_QR_SECRET` (HMAC) | Secret Manager | a cada 12 meses, com `kid` | manter a versão anterior ativa até expirarem os ingressos emitidos com ela |
| `OFFLINE_CHECKIN_PRIVATE_KEY_PEM` / `TICKET_QR_PRIVATE_KEY_PEM` | Secret Manager | a cada 12 meses, com `OFFLINE_CHECKIN_KEY_ID` novo | a chave pública anterior continua aceita até o fim dos eventos |
| `PII_BLIND_INDEX_KEY` (HMAC) | Secret Manager | só com reindexação planejada | trocar exige recalcular todos os índices |
| KEK de campo | Cloud KMS | automática a cada 90 dias | versões antigas ficam ativas para descriptografia |
| Chave de job interno (legado) | Secret Manager | a cada 90 dias até migrar para OIDC (§7.9) | ≥ 32 bytes aleatórios |

Regras:

1. Chaves de teste (AI Studio) e de produção são **sempre diferentes**. Nunca copiar segredo de produção para o AI Studio.
2. A conta de serviço do Cloud Run recebe `roles/secretmanager.secretAccessor` **por segredo**, não no projeto inteiro.
3. Rotação de segredo é ação irreversível de alto impacto: o agente DEVE pedir confirmação (§15).
4. Segredo vazado (commit, log, print): revogar imediatamente, rotacionar e registrar o incidente. Apagar o commit não é suficiente.

### 7.9. Segurança na transferência de dados (externa e interna)

**Princípio:** todo canal é cifrado e autenticado. Rede interna do Google não é zona de confiança: o serviço do Cloud Run precisa aceitar invocação pública para funcionar com o rewrite do Firebase Hosting, então **toda** rota se autentica na aplicação.

| Canal | Transporte | Autenticação | Regras |
|---|---|---|---|
| Navegador → Firebase Hosting (site e `/api/**`) | HTTPS, TLS ≥ 1.2, certificado gerenciado | ID Token no header `Authorization` + App Check | HSTS `max-age=63072000; includeSubDomains`; sem conteúdo misto; tokens nunca na URL/query |
| Firebase Hosting → Cloud Run | HTTPS na rede do Google | a mesma da requisição original | o backend revalida tudo; não confiar em headers de proxy além de `X-Forwarded-For` tratado por `trust proxy` |
| Acesso direto `*.run.app` | HTTPS | a mesma | páginas redirecionam para o domínio canônico; `/api` e `/internal` exigem autenticação |
| Navegador → Firestore/Auth/Storage (Client SDK) | HTTPS/WebSocket TLS | ID Token + App Check | só leituras permitidas pelo §6.2 |
| Cloud Run → Firestore/Auth/Storage/KMS/Secret Manager | TLS via SDK | ADC (conta de serviço do Cloud Run) | IAM de menor privilégio: `roles/datastore.user`, acesso ao bucket específico, `secretAccessor` por segredo, `cloudkms.cryptoKeyEncrypterDecrypter` só na chave usada |
| Cloud Run → APIs externas (Stripe, Open-Meteo, MET Norway, Cloudinary) | HTTPS com validação de certificado | chave da API no servidor | timeout obrigatório (`AbortSignal.timeout`); retry com backoff só em operação idempotente; enviar o mínimo de dados e nenhuma PII; `User-Agent` identificável (exigido pela MET Norway) |
| Stripe → Cloud Run (webhook) | HTTPS público | assinatura `Stripe-Signature` + segredo do endpoint | corpo bruto; idempotência em duas fases (§8.6) |
| Cloud Scheduler / Cloud Functions → Cloud Run (`/internal/*`) | HTTPS | **alvo: token OIDC** da conta de serviço do job, validado no backend (audience = URL do serviço, e-mail da conta esperada) | legado: header `X-Internal-Job-Key` com `timingSafeEqual`; rotas internas nunca passam pelo rewrite do Hosting |
| Backend → e-mail/push/WhatsApp | HTTPS do provedor | chave do provedor no servidor | sem dado Restrito no conteúdo; links com token assinado, de uso único e com expiração |

Regras obrigatórias:

1. É proibido desativar validação de certificado (`NODE_TLS_REJECT_UNAUTHORIZED=0`, `rejectUnauthorized: false`) em qualquer ambiente.
2. **SSRF:** o backend NUNCA faz requisição para URL vinda do usuário (ex: "importar foto de link"). Se for necessário, usar allowlist de hosts, bloquear IPs privados/metadata (`169.254.169.254`, `10.0.0.0/8` etc.) e limitar tamanho e tempo.
3. **CORS:** a API é same-origin; NÃO DEVE responder `Access-Control-Allow-Origin: *`. Se for preciso liberar outra origem (ex: domínio do AI Studio), usar allowlist explícita vinda da configuração.
4. **DTO de saída:** respostas da API DEVEM ser montadas por allowlist de campos. É proibido devolver o documento do Firestore inteiro (vaza campos internos e PII).
5. **Exportações e backups** (export do Firestore, relatórios CSV) contêm PII: bucket privado, acesso restrito por IAM, retenção definida e criptografia CMEK quando incluírem dados Restritos.
6. **Logs** são transferência de dados: o §10.3 vale também para Cloud Functions e scripts.

### 7.10. Segurança de aplicação (OWASP Top 10)

| Risco OWASP 2021 | Controle obrigatório no Use Guide |
|---|---|
| A01 Controle de acesso quebrado | checar posse ou papel em **toda** rota; teste de IDOR para cada recurso (usuário A tentando ler/alterar pedido, ingresso, reserva ou item do usuário B → `403`/`404`) |
| A02 Falhas criptográficas | §7.6–§7.9 |
| A03 Injeção / XSS | React escapa por padrão; `dangerouslySetInnerHTML` proibido sem sanitização (DOMPurify); HTML gerado no servidor (`seoService`) DEVE escapar todo valor dinâmico; nunca montar query/caminho do Firestore com string não validada |
| A04 Design inseguro | funcionalidades com dinheiro ou PII DEVEM ter modelagem de ameaças curta no PR (quem ataca, o quê, como bloqueamos) |
| A05 Configuração insegura | CSP sem origens desnecessárias; erros sem `err.message` interno para o cliente (o handler global do `server.ts` hoje devolve `err.message` — débito); nada de rotas de debug em produção |
| A06 Componentes vulneráveis | `npm audit` nos gates; atualizações de segurança semanais; lockfile versionado |
| A07 Falhas de autenticação | e-mail verificado antes de comprar ou virar parceiro; **MFA obrigatório para admin** (Identity Platform); revogar sessões (`revokeRefreshTokens`) ao trocar senha, perder papel ou excluir conta |
| A08 Integridade de dados e software | assinatura de webhooks; builds a partir do lockfile; nenhum script de terceiros fora da CSP |
| A09 Falhas de log e monitoramento | log de auditoria (quem, o quê, quando, de onde) para ações de admin, mudanças de preço, reembolsos e mudanças de papel; alertas para picos de `401/403/429` e falhas de webhook |
| A10 SSRF | §7.9 regra 2 |

**Uploads (foto de perfil, fotos de itens, documentos de verificação):**

* Validar tipo pelo conteúdo (*magic bytes*), não pela extensão; aceitar só JPEG, PNG, WebP (e PDF para documentos).
* SVG proibido em upload de usuário (executa script).
* Limite de tamanho no servidor; reprocessar imagens (redimensionar e regravar) removendo **metadados EXIF, incluindo localização GPS**.
* Nome de arquivo gerado pelo servidor (aleatório); documentos de verificação em caminho privado, nunca públicos.

**Papel de admin:** a custom claim `admin` só é concedida por script operacional auditado ou pelo console, nunca por endpoint da API.

**Continuidade:** Firestore com *point-in-time recovery* ou exportação agendada; restauração testada pelo menos uma vez por trimestre.

---

## 8. Pagamentos — Stripe (fornecedor oficial)

O Stripe é o **único** provedor de pagamentos. Referências a Mercado Pago no código, README ou `.env` são legado e DEVEM ser removidas.

### 8.1. Modelo de marketplace

* **Stripe Connect** com contas conectadas **Express** (`controller.stripe_dashboard.type = 'express'`), país `BR`, uma por parceiro (`paymentConnectedAccounts/{partnerId}`).
* **Onboarding e gestão do parceiro** via Connect embedded components (Account Session gerada no backend).
* **Tipo de cobrança padrão:** *destination charge* (`transfer_data.destination` + `application_fee_amount`). A plataforma é o *merchant of record*.
  * Mudar para `on_behalf_of` (parceiro como merchant of record) é decisão de produto/jurídica (§15) — muda descritor na fatura, taxas, e exige que o parceiro tenha os métodos de pagamento ativos (ex: capability `pix_payments`).
* **Taxa da plataforma:** calculada **somente no backend**, em centavos, a partir de `USE_GUIDE_PLATFORM_FEE_PERCENT` ou da configuração do plano. NUNCA aceitar valor de taxa ou de preço vindo do cliente.
* Antes de criar cobrança para um parceiro, DEVE ser verificado `charges_enabled` e `payouts_enabled` da conta conectada (`assertPartnerReadyForPaidEventUseCase`).

### 8.2. O que se vende e como

| Produto | Fluxo Stripe |
|---|---|
| Ingresso de evento | PaymentIntent (destination charge) vinculado a `ticketOrder` com reserva de estoque |
| Passeio, aluguel (quadriciclo), translado, entrada de atração privada | PaymentIntent (destination charge) vinculado a `booking` com reserva de disponibilidade (domínio `bookings`, §9.3) |
| Plano do parceiro (`monthly`, `semi-annual`, `annual`) | **Stripe Billing (Subscriptions)** no cartão, com renovação automática (decisão D2). Alternativa: pagamento único por Pix, sem renovação, concedendo exatamente a duração do plano |

### 8.3. Métodos de pagamento

* Usar **dynamic payment methods** (`automatic_payment_methods: { enabled: true }`) e habilitar no Dashboard: cartão e **Pix** (Pix é suportado para contas BR e com Connect; valor mínimo de R$ 0,50; reembolso em até 90 dias; manual capture não é suportado no Pix).
* Pix é assíncrono: o pedido só é confirmado pelo webhook `payment_intent.succeeded`. A UI DEVE mostrar o QR Code/instruções e aguardar o status (tempo real ou polling da API).
* Pré-autorização (`capture_method: 'manual'`) só para cartão e somente se o produto exigir (ex: caução de aluguel).

### 8.4. Fronteira frontend × backend

* **Frontend:** só `VITE_STRIPE_PUBLISHABLE_KEY`; usa Payment Element com o `clientSecret` recebido do backend. Dados de cartão nunca tocam nosso servidor (escopo PCI SAQ A).
* **Backend:** cria PaymentIntent, AccountSession, Refund; nunca expõe `sk_*`.
* A confirmação no retorno do cliente (`redirect`/`return_url`) é apenas UX. **A fonte da verdade é o webhook.**

### 8.5. Valor, idempotência e metadata

* Preço DEVE ser recalculado no backend a partir do catálogo/estoque no momento da criação do pedido.
* Toda chamada de escrita ao Stripe DEVE ter `idempotencyKey` determinística (ex: `pi_order_<orderId>`, `refund_<refundId>`).
* `metadata` DEVE conter somente IDs internos (`referenceType`, `referenceId`, `partnerId`, `refundId`) — nunca PII.
* Refunds DEVEM ser criados com `metadata.refundId` para reconciliação pelo webhook.

### 8.6. Webhooks (fonte da verdade)

1. Rota com `express.raw()` **antes** de `express.json()`, fora do App Check, assinatura verificada com `STRIPE_WEBHOOK_SECRET`.
2. **Idempotência em duas fases:** reservar o `event.id` como `processing` (com prazo de expiração) → processar → marcar `processed`. Se o processamento falhar, liberar a reserva e responder `5xx` para o Stripe reenviar. É proibido marcar como processado antes de processar.
3. Responder `2xx` rápido. Processamento pesado DEVE ir para fila (outbox/Cloud Tasks).
4. Não depender da ordem dos eventos; ao receber um evento, consultar o estado atual do objeto quando necessário.
5. Assinar somente os eventos usados. Mínimo: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`, `refund.updated`, `charge.dispute.created`, `charge.dispute.closed`, `account.updated` (+ `invoice.*` e `customer.subscription.*` quando migrar planos para Billing).
6. Status de refund `pending`/`requires_action` NÃO DEVE ser tratado como aprovado.
7. Uma única rota de webhook por endpoint configurado no Stripe (remover rotas duplicadas).

### 8.7. Reembolsos, cancelamentos e disputas

* Política de cancelamento por produto (prazo, % reembolsável) DEVE ser dado do cadastro, exibida antes da compra e aplicada no backend.
* Cancelamento de evento/passeio pelo organizador → reembolso integral com `refund_application_fee: true` e `reverse_transfer: true`.
* Disputa → marcar pedido como `disputed`, bloquear check-in/uso e notificar admin.

### 8.8. Testes de pagamento

* AI Studio/dev usa somente chaves de teste; `stripe listen --forward-to localhost:3000/api/payment/webhook/stripe` para webhooks locais.
* Todo fluxo de pagamento DEVE ter testes unitários do service com gateway fake e teste do handler de webhook (assinatura inválida, evento duplicado, falha no processamento → reenvio).

---

## 9. Regras de Negócio do Marketplace Turístico

### 9.1. Catálogo (`guide`)

* Tipos: restaurante, hospedagem, passeio, atração (pública/privada), dica. Cada tipo tem schema próprio de campos operacionais (horário, faixa de preço, localização).
* Atração **pública** não é vendável. Atração **privada** PODE vender entradas se o parceiro dono tiver conta Stripe habilitada.
* Parceiro só edita itens de que é dono (`ownerId`); verificação (`isVerified`) só por admin.

### 9.2. Eventos e ingressos (`events`, `ticketing`)

* Estoque DEVE ser controlado por transação + reserva com expiração (`inventoryReservations`), liberada por job (`expireTicketingOrders`).
* QR Code de ingresso DEVE ser assinado (RSA-PSS — já implementado) e verificável offline no check-in.

### 9.3. Reservas de serviços (`bookings` — novo domínio)

Passeios, aluguéis, translados e entradas de atrações privadas compartilham o mesmo modelo e NÃO DEVEM ser implementados dentro de `ticketing` nem de `guide`:

* Entidades: `BookableOffer` (vinculada a um item do `guide`), `AvailabilitySlot` (data/hora, capacidade), `Booking` (status: `pending_payment → confirmed → completed | canceled | refunded | no_show`), `BookingParticipant`.
* Reserva de capacidade com expiração, igual a ingressos.
* Translado: origem/destino, data/hora, número de passageiros e bagagem.
* Aluguel: período (início/fim), caução opcional (pré-autorização de cartão), termo de responsabilidade aceito.
* Antes de criar o domínio, o agente DEVE apresentar o desenho para aprovação (§15).

### 9.4. Avaliações (`reviews`)

* Uma avaliação por usuário por item (ID determinístico `buildReviewId`).
* Para itens vendáveis, avaliação DEVERIA exigir compra/uso verificado (`getVerifiedAttendanceForReviewUseCase`), exibindo o selo "experiência verificada".
* Agregados de nota (`rating`, `count`) atualizados em transação no backend; o parceiro NUNCA altera ou apaga avaliações de terceiros (só responde e denuncia).

### 9.5. SEO de conteúdo (diferencial competitivo)

* Toda página indexável DEVE ter título, descrição, canonical, Open Graph e Twitter Card com URL absoluta.
* Páginas de item DEVEM emitir **JSON-LD schema.org** adequado: `Restaurant`, `LodgingBusiness`, `TouristAttraction`, `TouristTrip`, `Event` (com `Offer`), `AggregateRating`/`Review`.
* `sitemap.xml` DEVE ser gerado a partir do catálogo publicado, não mantido à mão.

---

## 10. Contratos de API, Erros e Observabilidade

### 10.1. API

* Recursos no plural: `/api/<recurso>`; verbos HTTP semânticos; `201` em criação, `204` sem corpo.
* Operações de criação com efeito financeiro DEVEM aceitar header `Idempotency-Key`.
* Paginação por cursor: `?limit=&cursor=` → `{ data, nextCursor }`.
* Após a liberação para usuários, mudança incompatível de contrato DEVE manter compatibilidade com o frontend publicado até o deploy simultâneo (Hosting e Cloud Run não sobem atomicamente). Antes da liberação, vale o §2.2 item 8.

### 10.2. Formato único de erro

```json
{ "error": { "code": "TICKET_TYPE_UNAVAILABLE", "message": "Ingresso esgotado.", "requestId": "..." } }
```

* `code` estável em `UPPER_SNAKE_CASE`, mapeado a partir de erros tipados do domínio; `message` segura para o usuário.
* Mapeamento: validação `400`, não autenticado `401`, sem permissão `403`, não encontrado `404`, conflito/estoque `409`, regra de negócio `422`, rate limit `429`, dependência externa indisponível `503`, inesperado `500`.

### 10.3. Logs e rastreio

* Logs estruturados em JSON (Cloud Logging) com `severity`, `requestId`, `uid` (quando houver), `domain`, `operation`.
* Propagar o trace do header `X-Cloud-Trace-Context` no campo `logging.googleapis.com/trace`.
* Proibido logar tokens, PII, `clientSecret`, payload completo de webhook.

---

## 11. UI, UX e Layout

### 11.1. Identidade visual

* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.
* **Accent:** teal (`teal-400`/`teal-500`); emerald = sucesso; cyan = informação.
* **Tipografia:** Inter (texto/UI) e Outfit (display). Proibida uma terceira fonte.
* **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).

### 11.2. Contraste (WCAG 2.2 AA)

* Texto normal ≥ **4.5:1**; texto grande (≥ 24px, ou ≥ 18.66px bold) e ícones informativos ≥ **3:1**.
* Sobre fundo escuro sólido (`#020508`–`#0a0a0f`): `text-white/50` ≈ 5.3:1 (mínimo para texto funcional); `/40` ≈ 3.7:1 (só texto grande); `/30` e `/20` proibidos em texto informativo.
* Sobre vidro (`bg-white/5` + blur) o contraste real é menor: validar com a cor efetiva do fundo.

### 11.3. Responsividade (breakpoints padrão do Tailwind v4)

| Prefixo | Largura mínima | Uso |
|---|---|---|
| (base) | 0 | celular — layout de referência (mobile-first) |
| `sm:` | 640px | celular grande / tablet pequeno |
| `md:` | 768px | tablet |
| `lg:` | 1024px | desktop pequeno |
| `xl:` | 1280px | desktop |

* Telas de conteúdo DEVEM ter largura máxima legível (ex: `max-w-7xl mx-auto`) e se adaptar ao desktop; modais e formulários PODEM usar `max-w-[480px]`–`max-w-lg`.
* Grids de cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (ou equivalente).
* Informação funcional nunca existe só a partir de um breakpoint maior.
* Respeitar safe areas (`viewport-fit=cover`, `env(safe-area-inset-*)`) e não criar scroll horizontal.

### 11.4. Z-index

Usar exclusivamente `Z_INDEX` de `src/shared/constants/zIndex.ts`. Proibido valor numérico solto (`z-[130]`). Legado é migrado quando o arquivo for tocado.

### 11.5. Área de toque

Elemento interativo ≥ **44×44 px** (Apple HIG); DEVERIA chegar a 48×48 px em ações primárias (Material Design). O ícone pode ser menor; a área clicável não.

### 11.6. Feedback

Proibidos `alert()`, `confirm()`, `prompt()`. Usar o toast do design system (`sonner`, encapsulado em `src/ui/components/Toast.tsx`) e `ConfirmDialog` para confirmações.

### 11.7. Acessibilidade

* Botão só com ícone → `aria-label` (traduzido).
* Foco visível: `focus-visible:ring-2 focus-visible:ring-teal-400/50`; proibido `outline-none` sem substituto.
* Texto escondido por design → `sr-only`.
* Modais: foco preso, `Esc` fecha, foco volta ao gatilho (Radix Dialog já faz).
* Respeitar `prefers-reduced-motion` em animações (`motion`).

### 11.8. Estados de dados

Todo hook assíncrono expõe `data`, `loading` e `error`. Toda tela trata: carregando (skeleton), vazio, erro (com ação de tentar novamente) e offline (`useConnection`).

### 11.9. Performance (Core Web Vitals)

* Metas no p75 móvel: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**.
* Rotas e modais pesados (mapa, gráficos, checkout Stripe) DEVEM ser carregados sob demanda (`React.lazy`).
* Imagens com `width`/`height`, `loading="lazy"` fora da dobra e formatos modernos.

### 11.10. Conteúdo dinâmico

Proibido texto fixo com aparência de dado real do item. Valores financeiros (preço, taxa, quantidade) DEVEM vir do backend/cadastro, nunca de constante no componente.

---

## 12. Internacionalização (i18n) e Localização

Idiomas suportados: **`pt-BR` (padrão e fonte da verdade)**, **`en`**, **`fr`**. Adicionar um idioma novo é decisão de produto (§15).

### 12.1. Configuração atual (o que já existe)

| Item | Valor | Arquivo |
|---|---|---|
| Biblioteca | `i18next` + `react-i18next` | `src/shared/i18n/config.ts` |
| Idiomas | `SUPPORTED_LOCALES = ['pt-BR', 'en', 'fr']`, `DEFAULT_LOCALE = 'pt-BR'` | `src/shared/i18n/locale.ts` |
| Detecção do idioma inicial | 1º idioma da URL (`/en`, `/fr`) → 2º escolha explícita (`users/{uid}.preferredLocale` ou `localStorage['useguide.locale']`) → 3º `navigator.languages` → 4º `pt-BR` (decisão D10) | `resolveInitialLocale()` |
| Normalização | `pt`, `pt-*` → `pt-BR`; `en-*` → `en`; `fr-*` → `fr`; outros → ignorado | `normalizeLocale()` |
| Persistência e `<html lang>` | o idioma só é gravado quando a pessoa escolhe (Configurações ou aviso de idioma); mudança causada pela URL não é gravada. `<html lang>` acompanha o idioma ativo | `config.ts` |
| Fallback | `fallbackLng: 'pt-BR'`, `load: 'currentOnly'`, `useSuspense: false` | `config.ts` |
| Traduções | um único namespace `translation`, os 3 idiomas no mesmo arquivo, tipados por `TranslationResource` | `src/shared/i18n/resources.ts` |

**Débito:** só 6 arquivos usam `useTranslation`; a maior parte da UI, as mensagens do backend, os schemas Zod e os toasts têm texto em português fixo no código.

### 12.2. Estrutura alvo

```
src/shared/i18n/
├── config.ts               # init do i18next (mantém as opções do 12.1)
├── locale.ts               # idiomas, normalização, detecção, persistência
├── loadNamespace.ts        # carregamento sob demanda via import() dinâmico
├── i18next.d.ts            # tipagem das chaves (CustomTypeOptions)
└── locales/
    ├── pt-BR/  common.json  navigation.json  errors.json  validation.json
    │           guide.json  events.json  ticketing.json  bookings.json
    │           payment.json  partners.json  reviews.json  user.json  admin.json
    ├── en/     (mesmos arquivos e mesmas chaves)
    └── fr/     (mesmos arquivos e mesmas chaves)
```

Regras:

1. **Um namespace por domínio** + `common`, `navigation`, `errors`, `validation`. Um domínio só usa o próprio namespace e os compartilhados.
2. `pt-BR` é carregado no bundle inicial; `en` e `fr` são carregados sob demanda com `import()` dinâmico do Vite e `i18n.addResourceBundle` (sem dependência nova).
3. **Tipagem obrigatória:** `i18next.d.ts` declara `CustomTypeOptions.resources` a partir dos JSON de `pt-BR`, para que chave inexistente quebre o `npm run typecheck`.
4. Teste automatizado DEVE garantir que `en` e `fr` têm **exatamente o mesmo conjunto de chaves** que `pt-BR` (sem faltar nem sobrar).

### 12.3. Regras de chaves e textos

* Chaves semânticas `namespace:area.elemento` (ex: `ticketing:checkout.payButton`). Proibido usar o texto em português como chave.
* Proibido concatenar frases (`t('a') + nome + t('b')`). Usar interpolação: `t('ticketing:order.confirmed', { orderId })`.
* Plural com as regras do i18next (`_one`, `_other`), que seguem `Intl.PluralRules`. Em francês 0 e 1 são singular; nunca resolver plural com `count === 1 ? ... : ...`.
* `escapeValue: false` está correto porque o React já escapa. Por isso é proibido injetar tradução com `dangerouslySetInnerHTML`; marcação dentro de texto usa o componente `<Trans>`.
* TODO texto visível é traduzido: rótulos, placeholders, `aria-label`, `alt`, `title`, toasts, diálogos, estados vazios e de erro, e-mails, notificações, PDFs e recibos.
* Nomes próprios (Jericoacoara, Preá, nome do estabelecimento) não são traduzidos.
* Francês e inglês podem ficar 20–30% maiores que o português: layouts NÃO DEVEM cortar texto nem depender de largura fixa. Testar telas novas em `fr`.

### 12.4. Formatação regional

* **Moeda:** `new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(amountMinor / 100)`. Proibido montar `'R$ ' + valor`. A moeda continua BRL em todos os idiomas.
* **Data e hora:** `Intl.DateTimeFormat(locale, { timeZone: 'America/Fortaleza', ... })` ou `date-fns` com o locale correspondente (`ptBR`, `enUS`, `fr`). Horário de evento, passeio e translado SEMPRE no fuso do negócio, com o fuso indicado quando o usuário estiver em outro.
* **Números e unidades:** `Intl.NumberFormat`; unidades (km/h, nós, °C) com rótulo traduzido.
* **Telefone:** armazenado em E.164; exibido formatado.
* Máscaras de entrada (`currencyMask`, datas) DEVEM respeitar o idioma ativo.

### 12.5. Camadas: quem traduz

* **UseCases, services e o backend não devolvem texto final para a UI:** devolvem `code` (§10.2). O frontend traduz pela chave `errors:<CODE>`; o `message` em pt-BR do backend é só fallback.
* **Schemas Zod do frontend** usam chaves como mensagem (`'validation:required'`) e o formulário exibe `t(error.message)`.
* **Backend** lê o idioma do usuário em `users/{uid}.preferredLocale` (definido pelo app) ou no header `Accept-Language`, normalizado com as mesmas regras do `normalizeLocale`. A lista de idiomas do backend fica em `server/shared/kernel/locale.ts`, com teste que garante que é igual à do frontend.
* **E-mails, notificações e PDFs** são gerados no idioma preferido do destinatário, não no de quem disparou a ação.
* **Stripe:** passar o idioma ativo para o Payment Element (`locale` em `elements()`), para os Connect embedded components (`locale` em `loadConnectAndInitialize`) e `preferred_locales` no Customer, para recibos e e-mails do Stripe.

### 12.6. Conteúdo cadastrado (itens, eventos, passeios, dicas)

* Campos traduzíveis (título, descrição, regras, política de cancelamento, dicas) usam o tipo `LocalizedText = { source: { locale: Locale; text: string; hash: string }; translations: Partial<Record<Locale, { text: string; sourceHash: string; updatedAt: string }>> }`, com `hash` = SHA-256 do texto normalizado. Campos não traduzíveis (nome do estabelecimento e de pessoas, preço, endereço, telefone, horários e opções fixas como categoria e comodidades) continuam simples e iguais em todos os idiomas.
* **Tradução automática** com Google Cloud Translation (decisão D5), **só no backend**, atrás de `MachineTranslationPort` no domínio `translation` (folha: não importa nenhum domínio). Não há tradução feita à mão nem revisão pelo parceiro. A UI informa "Traduzido automaticamente pelo Google · Ver original".
* **Edição no idioma ativo:** o editor mostra cada campo no idioma escolhido em Configurações e indica qual versão está sendo editada. Salvar um campo nesse idioma faz dele o novo `source` daquele campo, e as outras versões são traduzidas de novo a partir dele; o editor avisa antes de salvar.
* A tradução roda **fora da requisição de salvamento**: o backend grava o `source` e um evento na outbox na mesma transação (§5.6), e o job traduz só os campos em que `sourceHash` difere do `hash` atual, descartando o trabalho se o texto mudou de novo. Enquanto não há tradução, a UI mostra o original com aviso.
* Ordem de fallback na exibição: idioma ativo → `source`.
* **Avaliações** ficam no idioma original, com o idioma detectado gravado. A tradução é pedida pelo leitor ("Ver tradução"), inclusive por visitante sem conta, com rate limit por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache do domínio `translation`, indexado pelo hash do texto e pelo idioma, e é reaproveitado para todos os leitores. Excluir a avaliação ou a conta apaga as entradas desse texto no cache (§7.5).
* Política de cancelamento e termos de compra exibidos antes do pagamento aparecem no idioma do comprador, por tradução automática com aviso, e com link para o original, que é o texto que vale.

### 12.7. SEO multilíngue

* Cada idioma indexável DEVE ter URL própria (decisão D6): português na raiz, `en` e `fr` em pastas com slugs traduzidos (`/eventos`, `/en/events`, `/fr/evenements`). A fonte única do mapa é `src/shared/i18n/localizedRoutes.ts`, espelhada em `server/shared/kernel/localizedRoutes.ts` com teste de paridade. A URL com prefixo de idioma (`/en`, `/fr`) sempre vale. Na home `/`, quando a preferência (escolha salva → idioma do navegador) não for português, o app redireciona para `/en` ou `/fr` sem criar entrada no histórico; robôs de busca nunca são redirecionados. Nas demais páginas em português, o app mantém o idioma do link e mostra um aviso para trocar ("Esta página está disponível em English — Mudar"); a resposta ao aviso grava a escolha (decisão D10).
* Obrigatório: `<html lang>`, `<link rel="alternate" hreflang="pt-BR|en|fr|x-default">`, canonical por idioma, `og:locale` e `og:locale:alternate`, sitemap com alternâncias de idioma e JSON-LD com `inLanguage`.
* O HTML das rotas de conteúdo DEVE passar pelo Cloud Run (`serverSeoService`), com cache na CDN do Hosting (`s-maxage=300`) e `sitemap.xml` dinâmico (decisão D7). A home `/` é servida estática pelo Hosting: seus metadados e `hreflang` ficam no `index.html`.

### 12.8. Checklist de i18n para qualquer tela ou mensagem nova

- [ ] Nenhum texto visível fixo no JSX, hook, schema ou toast
- [ ] Chaves criadas em `pt-BR`, `en` e `fr` (o teste de paridade passa)
- [ ] Plural e interpolação pelo i18next, sem concatenação
- [ ] Moeda, data e número com `Intl`/`date-fns` no idioma ativo e no fuso `America/Fortaleza`
- [ ] Erros do backend traduzidos por `code`
- [ ] Layout verificado em `fr` (texto mais longo)

---

## 13. Modularidade e Responsabilidade Única

* Cada arquivo tem uma razão para mudar. Componentes que misturam formulário + lista + filtros + métricas DEVEM ser divididos; o container só orquestra.
* **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
* Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
* Arquivo tocado DEVE sair sem avisos do lint (`npx biome lint <arquivo>`) e formatado (`npx biome format --write <arquivo>`). Aviso que não puder ser corrigido sem mudar comportamento recebe `biome-ignore` com justificativa ou vai para `docs/arquitetura/debitos.md`.
* Hooks com estados não relacionados DEVEM ser divididos em hooks compostos.

---

## 14. Comentários e Clean Code

**Regra central:** comente o **porquê**, nunca o **o quê**.

* PROIBIDO: comentário que repete o código; blocos `@file`; histórico de migração; JSDoc com `@function`/`@description`/`@param {tipo}` redundantes.
* PERMITIDO: restrição externa não óbvia; decisão de negócio incomum; link para documentação oficial; `TODO:` com contexto e referência ao débito.

```typescript
// ✅ Restrição externa
// Stripe não garante ordem de entrega dos eventos; por isso relemos o PaymentIntent.
// Referência: https://docs.stripe.com/webhooks#event-ordering

// ✅ Decisão de HTTP não óbvia
// 500 de propósito: o Stripe reenvia o evento por até 3 dias em live mode.
return res.status(500).json({ error: { code: 'WEBHOOK_PROCESSING_FAILED' } });

// ❌ Repete o código
// Verifica se o usuário é admin
if (user.admin) { ... }
```

| Camada | JSDoc público | Comentário inline |
|---|---|---|
| ports / adapters / services / usecases / constantes públicas | ✅ enxuto | restrições e referências externas |
| controllers | ❌ | decisões de HTTP |
| hooks / components React | ❌ | só restrições de SDK |

Em qualquer edição: remover comentários "o quê", blocos `@file` e históricos; manter "porquê", referências e TODOs genuínos.

**Tipagem:** `any` é proibido em código novo (usar `unknown` + validação). `@ts-ignore` proibido; `@ts-expect-error` só com justificativa.

---

## 15. Processo de Decisão

* O AGENTS.md NÃO DEVE ser alterado por nenhum agente sem autorização explícita do responsável do produto. Para propor uma mudança, o agente DEVE descrever o texto atual, o texto proposto e o motivo, e aguardar a autorização antes de editar.
* Decisões já aprovadas estão em `docs/arquitetura/decisoes.md` e DEVEM ser seguidas sem nova consulta. Decisão marcada como **em aberto** NÃO pode ser implementada.
* O agente DEVE parar e consultar o usuário, apresentando alternativas com prós/contras, quando a decisão:
  1. mudar modelo de dados persistido ou exigir migração;
  2. afetar dinheiro (preço, taxa, repasse, reembolso, merchant of record), segurança, privacidade ou conformidade;
  3. adicionar dependência, serviço pago ou fornecedor novo;
  4. alterar contrato de API pública ou comportamento visível ao usuário;
  5. for irreversível ou difícil de desfazer (exclusão de dados, deploy, rotação de chaves).
* Para escolhas reversíveis e locais (nome de variável, divisão de arquivo, ordem de imports), o agente DEVE seguir o padrão existente sem perguntar e registrar a escolha no resumo da entrega.

---

## 16. Qualidade, Testes e Entrega

### 16.1. Gates obrigatórios antes de considerar uma tarefa concluída

```bash
npm run typecheck   # tsc --noEmit sem erros
npm run lint        # biome sem erros; arquivos tocados sem avisos (§13)
npm test            # vitest verde
npm run build       # build de produção sem erros
npm run test:rules  # quando firestore.rules mudar (emulador)
```

### 16.2. Testes

* Services e UseCases: testes unitários com adapters fake (sem rede, sem Firestore).
* Schemas Zod: casos válidos e inválidos (inclusive campos extras maliciosos).
* Controllers: status HTTP e formato de erro.
* Firestore Rules: teste para cada coleção legível pelo cliente.
* Segurança: teste de IDOR para cada recurso com dono (§7.10) e teste de que dado Restrito nunca sai em texto puro na resposta (§7.6).
* i18n: teste de paridade de chaves entre `pt-BR`, `en` e `fr` (§12.2).
* Bug corrigido → teste que falhava antes da correção.

### 16.3. Entrega do agente (formato obrigatório da resposta)

1. Resumo do que mudou e por quê;
2. lista de arquivos criados/alterados/removidos;
3. resultado dos gates (§16.1);
4. variáveis de ambiente, índices, regras ou configurações do Stripe/Firebase que o usuário precisa aplicar;
5. débitos criados ou resolvidos (`docs/arquitetura/debitos.md`).

---

## 17. Checklist Rápido do Agente

- [ ] Funciona no AI Studio **e** em produção, sem SDK inicializado na importação (§2)
- [ ] SDK de fornecedor só em `adapters/` (ou `adapters/ui/`) (§3.2)
- [ ] Nenhum `domain → application`, `ui/shared → domain`, nem import interno de outro domínio (§3.4, §5.2)
- [ ] Nenhum ciclo novo no grafo (§5.4)
- [ ] Escrita só via backend; leitura direta só de dado público/do próprio usuário com rule testada (§6)
- [ ] Auth + autorização de posse + Zod + DTO allowlist na rota (§7.3)
- [ ] Campo novo classificado; dado Restrito cifrado (AES-256-GCM/KMS) com blind index; nenhum segredo com fallback fixo (§7.6–§7.8)
- [ ] Canal de dados cifrado e autenticado; sem SSRF, sem CORS aberto, DTO de saída por allowlist (§7.9)
- [ ] Dinheiro em centavos, preço e taxa calculados no backend, idempotência no Stripe, webhook como fonte da verdade (§8)
- [ ] Erro no formato padrão, sem vazar detalhes; logs sem PII (§10)
- [ ] Contraste, toque ≥ 44px, `aria-label`, foco visível, z-index da escala, responsivo, dois temas (§11)
- [ ] Nenhum texto fixo; chaves nos 3 idiomas; moeda/data com `Intl` no fuso do negócio (§12)
- [ ] Um UseCase por arquivo; arquivo grande dividido ao tocar (§13)
- [ ] Gates de qualidade verdes (§16.1)
