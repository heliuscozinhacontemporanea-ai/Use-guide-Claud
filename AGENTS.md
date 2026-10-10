# DIRETRIZES DE ARQUITETURA: PORTS & ADAPTERS (HEXAGONAL) E DIP (FULL-STACK)

Para garantir o isolamento completo de serviços externos Ex: (Banco de dados/Firestore, Autenticação/Firebase Auth, Gateways de Pagamento/Mercado Pago, e Upload/Cloudinary), e permitir a troca futura de qualquer provedor sem quebrar a lógica de negócios, o desenvolvimento no Frontend (src/) e no Backend (server/) deve seguir rigorosamente as regras de Inversão de Dependência (DIP) e Arquitetura Hexagonal.

---

## 1. Princípios Fundamentais de Isolamento

1. **Isolamento do Core (Lógica de Negócios):**
    * A lógica de negócios, componentes de UI, controladores de rotas e casos de uso nunca devem importar diretamente SDKs de terceiros, Ex: (como firebase, mercadopago, stripe, cloudinary, etc.).
    * Toda e qualquer comunicação com infraestrutura ou serviços externos deve passar exclusivamente por uma abstração definida internamente (Port / Interface).
2. **Ports (Contratos/Interfaces):**
    * São contratos puramente TypeScript que definem os métodos necessários e os tipos de dados de entrada e saída.
    * **Regra de Ouro:** Os parâmetros e retornos das funções nas Interfaces devem usar tipos de dados neutros definidos pelo nosso domínio. Nunca utilize tipos gerados diretamente pelos SDKs externos (ex: não retorne tipos específicos do Firestore ou do SDK do Mercado Pago).
3. **Adapters (Implementações de Infraestrutura):**
    * São os arquivos e classes concretos que implementam as interfaces (Ports) e traduzem as chamadas do nosso sistema para as APIs dos SDKs externos (ex: MercadoPagoPaymentAdapter implementa PaymentPort).
    * Somente os arquivos dentro de pastas adapters/ (ou explicitamente identificados como tal) podem conter imports diretos de SDKs externos.
4. **Inversão de Dependência (DIP) via Injeção / Fábrica:**
    * Módulos de alto nível (serviços de negócio, controladores) não devem depender de módulos de baixo nível (SDKs de banco, pagamentos, auth). Ambos dependem de interfaces.
    * Use o padrão Factory (Fábrica) ou injeção de dependência na inicialização para instanciar e fornecer o Adapter correto. Para trocar um serviço, o único local modificado no código deve ser a fábrica de instâncias.

---

## 2. Estrutura de Diretórios Padronizada

### 2.1. No Backend (server/)

Toda funcionalidade que integra serviços externos deve ser modularizada por domínios contendo portas e adaptadores: Ex abaixo:

```
server/domain/<modulo ou serviço>/
├── adapters/      # Implementações concretas de infraestrutura (Firestore, Firebase Admin, Stripe, etc.)
├── controllers/   # Recebe req HTTP, chama o DTO/Service e devolve a resposta (200, 400, 500)
├── dtos/          # Constrói objetos de transferência seguros consumindo os schemas do Zod
├── errors/        # Erros tipados e customizados do domínio (ex: ItemNotFoundError)
├── ports/         # Interfaces e contratos TypeScript 100% neutros (sem SDKs externos)
├── routes/        # Mapeamento de endpoints do Express e middlewares de segurança (JWT, RBAC)
├── schemas/       # ÚNICO LUGAR onde os Schemas do Zod são definidos e exportados
├── services/      # Casos de uso e regras de negócio puras (consome apenas as Ports)
├── types/         # Interfaces e tipos de entidades do domínio
├── factory.ts     # Ponto de composição / injeção de dependência (instancia Adapter -> Service -> Controller); não é canal de comunicação entre domínios
└── index.ts       # Fachada pública do módulo; a comunicação entre domínios ocorre somente pelos UseCases públicos
```

### 2.2. No Frontend (src/)

O frontend deve isolar chamadas de API, regras de aplicação, validações e serviços de UI seguindo a estrutura canônica abaixo:

```
src/domain/<modulo ou serviço>/
├── adapters/              # Implementações de comunicação externa (HTTP Fetch, Firestore, SDK Client e etc.)
├── application/usecases/  # Casos de uso puros e comunicação inter-domínios do frontend (sem JSX/DOM)
├── components/            # Componentes visuais puramente declarativos de UI (Tailwind + JSX)
├── hooks/                 # React Hooks de integração (conectam usecases ao estado do React)
├── ports/                 # Interfaces e contratos TypeScript 100% neutros (sem SDKs)
├── schemas/               # Schemas do Zod para validação de formulários (React Hook Form)
├── types/                 # Interfaces e tipos de entidades do domínio
├── factory.ts             # Ponto de composição / injeção de dependência (instancia Adapter -> UseCases)
└── index.ts               # Fachada pública do módulo (exporta componentes, hooks e usecases públicos)
```

---

## 3. Regras de Manutenção e Substituição de Serviços

* **Instalação de Múltiplos SDKs (Frontend + Backend):** Quando um novo serviço exigir SDKs em ambas as camadas (ex: Stripe backend SDK + Stripe frontend Elements), cada biblioteca deve ficar estritamente encapsulada em seu respectivo Adapter local. O componente de UI de checkout ou a rota de API do backend nunca conversam diretamente com as instâncias do Stripe além da camada do Adaptador.
* **Acoplamento Zero:** Se for necessário alterar o banco de dados do Firestore para um banco SQL (PostgreSQL/Cloud SQL), nenhum controlador do backend ou componente do frontend deve ser alterado. A alteração deve se resumir à criação de um novo SqlDatabaseAdapter que implemente as mesmas funções do DatabasePort abstrato.
* **Configuração por Ambiente:** Toda inicialização de chaves de API específicas dos SDKs nos adaptadores deve ser feita de forma preguiçosa (Lazy Loading) e ler as configurações estritamente do arquivo .env.

---

## 4. Padrão de Comentários e Clean Code

O projeto segue a filosofia de código autoexplicativo: nomes de funções, variáveis e tipos bem escolhidos eliminam a necessidade de comentários. Quando um comentário parece necessário para explicar o quê o código faz, o primeiro impulso deve ser refatorar o código — não escrever o comentário.

### 4.1. Regra Central

> **Comente o PORQUÊ, nunca o O QUÊ.**

O código já diz o que faz. O comentário existe para explicar decisões não óbvias, restrições externas ou contexto que o código sozinho não consegue transmitir.

### 4.2. O que NUNCA fazer

```typescript
// ❌ Comentário que repete o código
// Guarda os últimos 4 dígitos para feedback visual
if (tokenData.last_four_digits) {
  setLastFourDigits(tokenData.last_four_digits);
}

// ❌ JSDoc verboso com @function e @description repetindo o nome
/**
 * @function handleBinChange
 * @description Callback disparado quando o BIN do cartão muda.
 * @param {BinChangeArg} arg Argumento contendo o BIN detectado.
 * @returns {void}
 */
const handleBinChange = (arg: BinChangeArg) => { ... };

// ❌ Histórico de migração no código
// MIGRAÇÃO PARA CORE METHODS: antes usávamos createCardToken manual,
// agora usamos o SDK React que opera sobre os iframes dos Secure Fields...

// ❌ Comentário de bloco óbvio
// Validação de email
if (!emailRegex.test(email)) { ... }
```

### 4.3. O que SEMPRE fazer

```typescript
// ✅ Explica uma restrição externa não óbvia
// MP SDK v2: onBinChange dispara com 8 dígitos (não 6 como na v1)
const handleBinChange = (arg: BinChangeArg) => { ... };

// ✅ Justifica uma decisão de negócio que parece estranha
// Retorna 200 mesmo em erro de infra — evita reenvio em loop pelo Mercado Pago
return res.status(200).json({ status: 'error' });

// ✅ Referência a documentação externa relevante
// Referência: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders
const mapOrderStatus = (rawStatus: string): string => { ... };

// ✅ TODO genuíno com contexto
// TODO: substituir por endpoint da Orders API quando disponível no sandbox BR
```

### 4.4. JSDoc — apenas onde agrega valor real

JSDoc é permitido apenas em métodos públicos de adapters, ports e services — nunca em hooks React, componentes, funções utilitárias internas ou callbacks.

Formato obrigatório: enxuto, sem @function, sem @description repetindo o nome, sem @param para tipos já expressos pelo TypeScript.

```typescript
// ✅ JSDoc correto — só o que TypeScript não consegue expressar
/**
 * Mapeia erros da Orders API para códigos internos em PT-BR.
 * Referência: https://www.mercadopago.com.br/developers/pt/reference
 */
mapMercadoPagoError(orderData: any, statusCode: number): { code: string; message: string }

// ❌ JSDoc incorreto — TypeScript já documenta os tipos
/**
 * @param {any} orderData Corpo do JSON de erro enviado pelo Mercado Pago.
 * @param {number} statusCode Código de status HTTP.
 * @returns {{ code: string; message: string }} Código mapeado e descrição.
 */
```

### 4.5. Regras por camada

| Camada | JSDoc público | Comentário inline | Proibido |
|---|---|---|---|
| ports/ (interfaces) | ✅ Enxuto | Apenas restrições de contrato | Histórico, exemplos óbvios |
| adapters/ | ✅ Enxuto | Workarounds e refs externas | Repetir o nome do método |
| services/ (use cases) | ✅ Enxuto | Regras de negócio não óbvias | Explicar fluxo óbvio |
| controllers/ | ❌ Desnecessário | Decisões de HTTP (ex: 200 em erro) | Bloco de cabeçalho de arquivo |
| hooks/ React | ❌ Desnecessário | Apenas restrições de SDK | JSDoc, histórico de migração |
| components/ React | ❌ Desnecessário | Nunca | Qualquer comentário |

### 4.6. Cabeçalhos de arquivo (@file)

Blocos @file no topo dos arquivos são proibidos. O nome do arquivo, sua pasta e as exportações já comunicam o propósito. Remover em qualquer edição futura.

```typescript
// ❌ Proibido
/**
 * @file usePayment.ts
 * @description Hook customizado para lidar com a lógica do checkout transparente...
 */

// ✅ Correto — arquivo começa direto nos imports
import { useState, useEffect } from 'react';
```

### 4.7. Instrução para o agente

Em qualquer edição de arquivo existente:

* Remover comentários que explicam o quê o código faz
* Remover blocos @file de cabeçalho
* Remover históricos de migração (// MIGRAÇÃO PARA..., // NOTA sobre...)
* Manter comentários que explicam o porquê de uma decisão não óbvia
* Manter referências a documentação externa (// Referência: https://...)
* Manter // TODO: com contexto genuíno
* Nunca adicionar novos comentários que o TypeScript já expressas pelos tipos

---

## 5. Padrão de UI, UX e Layout

Esta seção define as regras obrigatórias de interface para qualquer código novo ou refatoração. O objetivo é impedir a repetição dos problemas já identificados em auditoria (contraste insuficiente, z-index caótico, ausência de responsividade, inconsistência de feedback) e consolidar o design system real do projeto, que hoje existe de forma implícita e não documentada.

### 5.1. Identidade Visual (já estabelecida — não alterar sem decisão explícita)

* **Estilo:** Glassmorphism dark. O app é dark-mode único por design — não é um tema claro invertido, é desenhado nativamente para fundo escuro. Não implementar light mode sem decisão explícita do produto.
* **Cor de destaque (accent) primária:** teal (teal-400/teal-500) — é a cor predominante de CTAs, estados ativos e elementos de destaque em todo o sistema. emerald e cyan aparecem como variações secundárias em contextos específicos (sucesso, informação), não como alternativa aleatória ao teal.
* **Tipografia:** apenas 2 fontes — Inter (corpo de texto, UI) e Outfit (display, títulos). Não introduzir uma terceira fonte.
* **Componente base de card:** GlassCard (src/ui/components/GlassCard.tsx) — toda superfície elevada/destacada do sistema deve reutilizar esse componente ou seguir exatamente seu padrão visual (blur, borda, sombra), nunca recriar glassmorphism do zero em um componente novo.

### 5.2. Contraste de Texto — Regra Obrigatória

**Opacidade mínima de texto sobre fundo escuro: /50.**

As classes text-white/20, text-white/30 e text-white/40 são proibidas em texto que comunica informação (labels, mensagens de estado, descrições, resultados de busca, textos de erro/vazio). Cálculo de contraste real (WCAG, relative luminance) contra o fundo escuro do app:

| Classe | Contraste real | Status |
|---|---|---|
| text-white/20 | 1.77:1 | ❌ Proibido |
| text-white/30 | 2.60:1 | ❌ Proibido |
| text-white/40 | 3.77:1 | ❌ Proibido (só passaria para texto grande 18pt+, que não é o padrão do app) |
| text-white/50 | 5.33:1 | ✅ Mínimo permitido |
| text-white/60 a /90 | 7.3:1+ | ✅ Preferencial para texto de leitura primária |

**Exceção permitida:** opacidades abaixo de /50 só podem ser usadas em elementos puramente decorativos sem função informativa (texturas de fundo, divisores visuais, glow effects) — nunca em texto lido pelo usuário.

```typescript
// ❌ Proibido — mensagem funcional com contraste insuficiente
<p className="text-white/20">Nenhum resultado encontrado</p>

// ✅ Correto
<p className="text-white/50">Nenhum resultado encontrado</p>
```

### 5.3. Responsividade — Obrigatória em Componentes Novos

O app está migrando de mobile-only para responsivo completo. Todo componente novo — e qualquer componente existente que for tocado por outro motivo — deve seguir os breakpoints padrão do mercado:

| Breakpoint | Tailwind | Uso |
|---|---|---|
| Base (< 480px) | sem prefixo | Celular padrão — layout de referência |
| 480px+ | sm: | Celular grande / tablet pequeno |
| 768px+ | md: | Tablet |
| 1024px+ | lg: | Tablet paisagem / desktop pequeno |

**Regras obrigatórias:**

* Todo layout raiz de tela/modal deve ter max-w-[480px] mx-auto (ou valor equivalente) para não esticar indefinidamente em telas largas, a menos que o componente seja explicitamente desenhado para ocupar largura total em breakpoints maiores.
* Informação relevante nunca deve existir apenas a partir de um breakpoint maior (hidden sm:flex escondendo dado funcional) — se a informação importa, ela precisa ter alguma forma de exibição também no breakpoint base.
* Grids de cards (ex: listagem de itens do guia) devem usar grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ou padrão equivalente — nunca fixar 1 coluna incondicionalmente.

### 5.4. Escala de Z-Index — Obrigatória

O projeto hoje usa 15+ valores de z-index diferentes e arbitrários (z-[110] até z-[100000]), sem lógica de camadas clara. A partir desta versão, toda nova UI deve usar exclusivamente a escala fixa abaixo — nunca um valor numérico arbítrio.

Novo arquivo obrigatório: `src/shared/constants/zIndex.ts`

```typescript
/**
 * Escala fixa de z-index do sistema. Nunca usar valores numéricos soltos
 * em componentes — sempre importar destas constantes.
 */
export const Z_INDEX = {
  base: 0,
  card: 10,
  header: 100,
  bottomNav: 110,
  dropdown: 200,
  overlay: 1000,
  modal: 1100,
  modalNested: 1200,   // modais abertos por cima de outro modal (ex: Checkout dentro de um DetailModal)
  toast: 2000,
  criticalAlert: 9999, // reservado para bloqueios de sistema (ex: erro de configuração crítica)
} as const;
```

Uso:

```typescript
// ❌ Proibido
<div className="z-[130]">

// ✅ Correto
import { Z_INDEX } from '../../../shared/constants/zIndex';
<div style={{ zIndex: Z_INDEX.modal }}>
```

Migração do z-index já existente no código legado não é retroativa automaticamente — aplicar a escala fixa em qualquer arquivo que for tocado por outro motivo, e em todo código novo a partir de agora.

### 5.5. Tamanho Mínimo de Área de Toque

Todo elemento interativo (botão, ícone clicável, link) deve ter no mínimo 44×44px de área de toque, seguindo Apple HIG e Material Design. Isso é especialmente importante dado o contexto de uso do produto (praia, sol forte, uso ao ar livre).

```typescript
// ❌ Proibido — abaixo do mínimo
<button className="w-[34px] h-[34px]">

// ✅ Correto — ícone pode manter tamanho visual menor, mas a área de toque (padding) deve atingir o mínimo
<button className="w-11 h-11 flex items-center justify-center">
  <Icon size={20} />
</button>
```

### 5.6. Feedback ao Usuário — alert() Proibido

alert(), confirm() e prompt() nativos do navegador são proibidos em qualquer código novo. Eles quebram a identidade visual do app, são bloqueantes, e têm renderização inconsistente entre navegadores/SO.

Todo feedback de sucesso, erro ou confirmação deve usar um sistema de toast/notificação consistente com o design system (glassmorphism). Se esse sistema ainda não existir centralizado no momento da edição, seguir o padrão já usado em ShareButton.tsx (badge animado local) como referência, e não introduzir um novo alert().

```typescript
// ❌ Proibido
alert('Item salvo com sucesso!');

// ✅ Correto (usando o sistema de toast do projeto, quando disponível)
showToast('Item salvo com sucesso!', 'success');
```

### 5.7. Acessibilidade — Obrigatória em Elementos Interativos

* Todo botão que contém apenas ícone (sem texto visível) deve ter aria-label descritivo.
* Todo elemento interativo deve ter estado de foco visível via focus-visible:ring-2 focus-visible:ring-teal-400/50 (ou equivalente) — nunca outline-none sem substituto.
* Texto de navegação escondido visualmente por design (ex: label de tab inativo) deve permanecer acessível a leitores de tela via sr-only, nunca opacity-0 h-0 overflow-hidden (que remove do fluxo de acessibilidade).

```typescript
// ❌ Proibido
<button onClick={onClose}><X size={20} /></button>

// ✅ Correto
<button onClick={onClose} aria-label="Fechar" className="focus-visible:ring-2 focus-visible:ring-teal-400/50">
  <X size={20} />
</button>
```

### 5.8. Links Externos — Segurança Obrigatória

Todo uso de window.open() para links externos (WhatsApp, Google Maps, redes sociais) deve incluir noopener,noreferrer para prevenir reverse tabnabbing.

```typescript
// ❌ Proibido
window.open(item.whatsappLink, '_blank');

// ✅ Correto
window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
```

### 5.9. Tratamento de Erro — Obrigatório em Hooks de Dados

Todo hook que busca dados assíncronos (Firestore, API externa) deve expor um estado de error além de data/loading. Componentes que consomem esses hooks devem renderizar uma UI de erro amigável quando error estiver presente — nunca deixar a tela em loading infinito ou vazia sem explicação quando a busca falhar.

```typescript
// ❌ Insuficiente
(error) => console.error("Firestore Error:", error)

// ✅ Correto
const [error, setError] = useState<string | null>(null);
(err) => {
  console.error("Firestore Error:", err);
  setError('Não foi possível carregar o conteúdo agora.');
}
```

### 5.10. Conteúdo Dinâmico — Proibido Hardcoding com Aparência de Dado Real

Cards ou seções de UI que visualmente aparentam exibir informação específica e curada de um item (mesmo estilo visual de dados reais como preço, localização, avaliação) nunca devem conter texto fixo idêntico para todos os itens. Se a informação não varia por item, ela deve ou (a) ser removida, ou (b) ser claramente apresentada como informação genérica de categoria, não como atributo específico do item.

Isso vale com atenção redobrada para qualquer valor que alimente uma transação financeira (preço de checkout, quantidade, taxa) — esses valores devem sempre vir do dado real cadastrado (item.operationalInfo.price ou equivalente), nunca de uma constante fixa no componente, mesmo em protótipo — constantes de demonstração devem ser removidas antes de qualquer merge para o branch principal.

### 5.11. Instrução para o Agente

Em qualquer criação de componente novo ou refatoração de componente existente:

* Aplicar a escala de z-index fixa (5.4) — nunca valor numérico solto
* Aplicar contraste mínimo /50 em texto funcional (5.2)
* Aplicar breakpoints responsivos (5.3) — nunca layout fixo sem adaptação
* Aplicar área de toque mínima 44px em elementos interativos (5.5)
* Nunca usar alert()/confirm()/prompt() (5.6)
* Sempre adicionar aria-label em botões de ícone puro (5.7)
* Sempre adicionar noopener,noreferrer em window.open() (5.8)
* Sempre expor estado de erro em hooks de dados assíncronos (5.9)
* Nunca hardcodar valores que aparentam ser dados reais do item, especialmente valores financeiros (5.10)

---

## 6. Comunicação entre Domínios e Camadas de Segurança (Multi-Layer Security)

Para garantir a integridade do sistema, legibilidade do código e proteção contra acessos indevidos, o projeto adota regras estritas de comunicação inter-domínios e uma arquitetura de segurança Zero-Trust em múltiplas camadas.

---

### 6.1. Processos de Comunicação entre Domínios

#### 6.1.1. Regra principal — comunicação síncrona entre domínios

A comunicação síncrona entre diferentes domínios deve ocorrer exclusivamente através de UseCases públicos do domínio de destino.

Essa regra vale tanto para o Frontend quanto para o Backend:

```
Domain A
   │
   │ Public UseCase
   ▼
Domain B
```

O UseCase público é o contrato de aplicação entre os domínios. O domínio consumidor não deve conhecer nem acessar a implementação interna do domínio de destino.

É proibido um domínio importar diretamente de outro domínio:

* Services internos;
* Repositories;
* Ports internos;
* Adapters;
* Factories;
* Controllers;
* Routes;
* Schemas internos;
* DTOs internos;
* infraestrutura;
* SDKs;
* coleções ou documentos do Firestore pertencentes ao outro domínio;
* qualquer implementação privada do domínio de destino.

A existência de uma index.ts, factory.ts ou outro módulo de exportação não transforma seus conteúdos em contratos permitidos para comunicação entre domínios. O contrato permitido é o UseCase público explicitamente exposto para consumo inter-domínio.

#### 6.1.2. Frontend (Domínio ↔ Domínio)

No Frontend (src/domain/<domain_A> para src/domain/<domain_B>), UseCases públicos são o único mecanismo de comunicação síncrona entre domínios.

Hooks React pertencem à camada de integração com a UI e não devem ser utilizados como mecanismo de comunicação entre domínios. Services, Ports, adapters e componentes de outro domínio também não devem ser importados diretamente.

Exemplo permitido:

```
src/domain/reviews
        │
        ▼
Public UseCase de guide
        │
        ▼
src/domain/guide
```

#### 6.1.3. Frontend ↔ Backend (Comunicação Externa)

* O Frontend comunica-se com o Backend estritamente através de APIs HTTP/HTTPS públicas e autenticadas (/api/<domain>/*).
* Requisições que exigem autenticação devem enviar o token JWT do Firebase via header Authorization: Bearer <token>.
* O Frontend nunca interage diretamente com SDKs administrativos do Backend.

#### 6.1.4. Backend (Domínio ↔ Domínio)

No Backend (server/domain/<domain_A> para server/domain/<domain_B>), a comunicação síncrona deve ocorrer exclusivamente através dos UseCases públicos do domínio de destino.

Exemplo permitido:

```
Reviews
   │
   ▼
Guide UseCase público
   │
   ▼
Guide
```

É proibido fazer chamadas HTTP internas entre domínios do mesmo Backend apenas para simular uma comunicação externa.

Também é proibido acessar diretamente repositórios, bancos de dados, adapters ou qualquer infraestrutura pertencente a outro domínio.

#### 6.1.5. Grafo de Dependências entre Domínios — Regra de Aciclicidade

O grafo de dependências entre domínios deve permanecer acíclico (DAG — Directed Acyclic Graph).

Nenhuma nova dependência entre domínios pode criar um ciclo direto ou indireto.

Exemplo proibido:
```
A → B → A
```

Também é proibido:
```
A → B → C → D → A
```

O fato de todas as dependências utilizarem UseCases públicos não torna um ciclo permitido. UseCases públicos resolvem o encapsulamento da comunicação, mas não autorizam dependências circulares.

Antes de introduzir uma nova dependência Domain A → Domain B, o agente deve verificar se existe qualquer caminho de dependência de B de volta para A.

Se existir, a dependência direta não deve ser criada.

#### 6.1.6. Dependência Bidirecional

Não é permitido resolver uma necessidade de comunicação criando simultaneamente:
```
Domain A → Domain B
Domain B → Domain A
```

Quando dois domínios precisarem participar do mesmo fluxo de negócio, deve-se avaliar, conforme o caso:

1. Application/Composition UseCase: quando uma operação precisa coordenar dois ou mais domínios de forma síncrona;
2. Domain/Application Event: quando um domínio precisa comunicar que um fato ocorreu e não necessita conhecer diretamente seus consumidores;
3. Reestruturação da responsabilidade: quando o ciclo indicar que uma regra de negócio está posicionada no domínio incorreto.

Não criar um módulo shared apenas para esconder ou contornar uma dependência circular.

#### 6.1.7. Application/Composition UseCases

Quando um fluxo de negócio precisar coordenar dois ou mais domínios e a comunicação direta criar uma dependência circular, a coordenação deve ocorrer em uma camada de Application/Composition apropriada.

Exemplo:

```
Application/Composition UseCase
        ├──→ Domain A UseCase
        └──→ Domain B UseCase
```

A camada de orquestração coordena os contratos públicos dos domínios, mas não acessa suas implementações internas nem assume regras de negócio que pertencem aos domínios.

Não criar uma camada de Application/Composition apenas para mover imports sem resolver a responsabilidade do fluxo.

#### 6.1.8. Domain/Application Events

Quando um domínio precisar comunicar que um fato ocorreu sem exigir uma resposta síncrona imediata, pode-se utilizar um Domain/Application Event.

Exemplo:

```
ReviewCreated
     │
     ├──→ Notifications
     ├──→ Analytics
     └──→ Insights
```

O domínio produtor do evento não deve importar diretamente os domínios consumidores.

Events não devem ser utilizados apenas para esconder uma dependência síncrona que exige resposta imediata.

#### 6.1.9. Factories e Inicialização de Módulos

factory.ts é um ponto de composição e injeção de dependências do próprio domínio. Não é um mecanismo de comunicação entre domínios.

Factories podem:

* instanciar adapters;
* instanciar services/useCases;
* conectar Ports às suas implementações;
* montar a composição interna do próprio domínio.

Factories não devem:

* ser importadas por outro domínio para obter UseCases ou Services;
* importar routes/controllers de outros domínios;
* executar efeitos colaterais durante a avaliação do módulo;
* criar dependências circulares entre factories;
* depender da inicialização prévia de outra factory para existir.

A comunicação entre domínios deve consumir o UseCase público, não a Factory que o instancia.

#### 6.1.10. Barrels (index.ts) e Fachadas Públicas

index.ts pode funcionar como fachada de exportação do domínio, mas isso não altera a regra de comunicação: entre domínios, somente UseCases públicos são contratos de comunicação síncrona.

Um domínio não deve importar o index.ts de outro domínio para acessar Services, Ports, factories, controllers, routes ou implementações internas.

Barrels também não devem provocar carregamento prematuro de routes, controllers ou infraestrutura durante a inicialização de um domínio quando apenas um UseCase é necessário.

Quando a composição HTTP precisar de routes/controllers, esses módulos devem ser carregados pelo ponto de composição apropriado, sem transformar seus exports em dependências inter-domínio.

#### 6.1.11. Regra de Emergência para Correções de Runtime

Uma dependência temporária fora do padrão pode ser utilizada somente para eliminar uma quebra crítica de inicialização ou runtime quando não houver correção segura imediata, desde que:

1. seja necessária para restaurar o funcionamento;
2. não comprometa segurança ou autorização;
3. seja registrada explicitamente como débito arquitetural;
4. tenha correção definitiva prevista para a refatoração do domínio responsável.

Essa exceção não transforma acesso direto à infraestrutura de outro domínio em padrão arquitetural permitido e não deve ser reproduzida em novas implementações sem análise específica.

---

### 6.2. Arquitetura de Segurança Zero-Trust e Múltiplas Camadas

**Premissa Fundamental:** O Backend NUNCA confia nos dados enviados pelo Frontend. Todas as entradas devem ser higienizadas, tipadas e validadas em cada etapa do fluxo.

O fluxo de dados passa obrigatoriamente pelas seguintes 4 camadas de defesa:

```
[ Frontend ] ──(1. React Hook Form + Zod)──> [ HTTP Request ] ──> [ 2. Zod Backend ] ──> [ 3. DTO Backend ] ──> [ Service / DB ] ──> [ 4. Firestore Rules ]
```

#### Camada 1: Validação no Frontend (React Hook Form + Zod)

* **Objetivo:** Fornecer feedback instantâneo de UX ao usuário, validação declarativa de campos e impedir o envio de requisições malformadas.
* **Implementação:** Todos os formulários e formulários reativos do cliente devem utilizar React Hook Form integrado ao Zod através de @hookform/resolvers/zod (useForm({ resolver: zodResolver(schema) })) antes de disparar chamadas para os Use Cases públicos ou adaptadores HTTP.

#### Camada 2: Validação de Entrada no Backend (Zod)

* **Objetivo:** Garantir a integridade estrutural e de tipos do payload de entrada no nível da API HTTP (req.body, req.params, req.query).
* **Implementação:** Controllers e Middlewares de rota do Express devem validar a requisição com schema.safeParse(). Caso a validação falhe, a requisição é rejeitada imediatamente com status HTTP 400.

#### Camada 3: DTOs no Backend (Data Transfer Objects)

* **Objetivo:** Mapeamento, higienização e prevenção contra contaminação de propriedades (Mass Assignment / Field Pollution).
* **Implementação:** Os dados validados pelo Zod são convertidos em DTOs neutros e imutáveis antes de serem repassados aos Services/Adapters. O DTO garante que campos extras ou maliciosos enviados pelo cliente (ex: isAdmin: true, isVerified: true) sejam descartados e que apenas os campos estritamente permitidos cheguem à camada de negócios.

#### Camada 4: Regras de Segurança do Firestore (Firestore Security Rules)

* **Objetivo:** Proteção em nível de motor de banco de dados e controle de acesso granular para leituras e escritas diretas.
* **Implementação:** Arquivo firestore.rules. Valida autenticação (request.auth != null), autorização/propriedade (request.auth.uid == resource.data.ownerId), campos imutáveis, limite de tamanho de dados e restrições de esquema diretamente nas coleções do Firestore.

---

### 6.3. Checklist Obrigatório para o Agente de IA

Em qualquer nova implementação ou modificação de funcionalidade existente no código fonte, certifique-se de:

1. Garantir que a comunicação síncrona entre domínios no Frontend utilize exclusivamente UseCases públicos do domínio correspondente.
2. Garantir que a comunicação síncrona entre domínios no Backend utilize exclusivamente UseCases públicos do domínio correspondente.
3. Verificar o grafo global de dependências e garantir que a nova dependência não crie ciclo direto ou indireto.
4. Se o fluxo exigir coordenação de múltiplos domínios, avaliar Application/Composition UseCase antes de criar dependência bidirecional.
5. Se o fluxo puder ser desacoplado, avaliar Domain/Application Event antes de criar chamadas diretas entre domínios.
6. Garantir que nenhum domínio importe Services, Ports, Repositories, Adapters, Factories, Controllers, Routes ou infraestrutura de outro domínio.
7. Garantir que o formulário/dados no Frontend possuam validação com React Hook Form + @hookform/resolvers/zod antes do envio.
8. Garantir que a rota do Backend aplique validação com Zod (safeParse).
9. Garantir que os payloads sejam mapeados por DTOs neutros no Backend antes de invocar os serviços de domínio.
10. Manter as firestore.rules sincronizadas e auditadas para a coleção do banco.

---

## 7. Desenvolvimento com Foco Exclusivo no App Web em Produção (Production-First Web App)

Toda nova codificação — seja criação de novas configurações, desenvolvimento de funcionalidades/recursos, criação de rotas ou refatorações de código existente — deve ser realizada exclusivamente com foco e mentalidade voltados para o aplicativo Web em ambiente de Produção.

### 7.1. Princípios e Regras de Produção Obrigatórias

1. **Pronto para Deploy Real (Zero Mocks / Zero Placeholders Descartáveis):**
    * Todo código escrito deve estar pronto para operação real em produção.
    * É proibido introduzir stubs temporários, dados hardcoded mascarados de lógica dinâmica ou soluções provisórias que não sustentem uso por usuários reais.
    * Qualquer funcionalidade que conecte serviços externos (banco de dados, autenticação, pagamentos, previsão meteorológica) deve usar a infraestrutura real configurada e variáveis de ambiente seguras.
2. **Experiência do Usuário (UX/UI) e Responsividade Multi-Dispositivo:**
    * O app web deve funcionar com perfeição em navegadores reais em desktop, tablets e smartphones (Android/iOS, Safari Mobile, Chrome Mobile).
    * Respeitar safe-areas de visualização móvel (viewport-fit=cover), áreas de toque mínimas de 44×44px e densidade visual coerente.
    * Não admitir travamentos de tela, transbordamentos horizontais indesejados (horizontal scrollbars) ou layouts quebrados em nenhuma resolução.
3. **SEO, Compartilhamento Social e Indexabilidade:**
    * Toda nova página, rota ou visualização com conteúdo indexável deve nascer integrada às diretrizes de SEO (useSEO no frontend, rotas estáticas ou hidratação no backend).
    * Garantir tags Open Graph e Twitter Cards com URLs absolutas para compartilhamento rico em redes sociais e mensageiros (WhatsApp, Instagram, Telegram, LinkedIn).
4. **Resiliência, Tolerância a Falhas e Performance:**
    * Nenhuma chamada assíncrona (API, Firestore, serviço de clima) pode deixar a aplicação em estado de carregamento infinito ou causar tela branca (uncaught runtime error).
    * Tratamento obrigatório de erros com feedback visual consistente via componentes do design system (toasts/avisos amigáveis).
    * Manter bundle leve: evitar bibliotecas pesadas redundantes e garantir que o build de produção (npm run build) execute de forma limpa e sem advertências críticas de tipagem.

---

### 7.2. Infraestrutura Híbrida de Produção: Firebase Hosting (Frontend) + Google Cloud Run (Backend)

O projeto opera sob uma arquitetura híbrida de alta performance e segurança no ecossistema Google Cloud:

1. **Frontend no Firebase Hosting:**
    * Distribuição Global: Os artefatos compilados da Single-Page Application (SPA React / Vite em dist/) são servidos pela CDN global do Firebase Hosting com cache otimizado, compressão gzip/brotli e baixa latência.
    * Domínio Canônico: O Firebase Hosting gerencia diretamente os domínios useguide.com.br e www.useguide.com.br com certificados SSL/TLS automáticos.
    * Redirecionamento: Domínios padrão (.web.app e .firebaseapp.com) e o subdomínio www redirecionam via HTTP 301 para o domínio canônico https://useguide.com.br.
2. **Backend no Google Cloud Run:**
    * Execução do Servidor: O backend Node.js / Express (dist/server.cjs) roda como um serviço gerenciado no Cloud Run (use-guide na região us-east1).
    * Segurança de Segredos: Todas as chaves e credenciais sensíveis (ex: FIREBASE_SERVICE_ACCOUNT_KEY, credenciais do Mercado Pago) permanecem restritas ao ambiente do servidor, nunca expostas ao navegador.
    * Proteção de Acesso Direto: Caso a URL direta do Cloud Run (*.run.app) seja acessada no navegador, o servidor emite um redirecionamento HTTP 301 para https://useguide.com.br.
3. **Comunicação Funcional entre Frontend e Backend (Rewrites Transparentes do Firebase Hosting):**
    * Origem Única (Same-Origin): Para o navegador do usuário, Frontend e Backend operam sob o mesmo domínio (https://useguide.com.br). Isso elimina problemas de CORS, simplifica o envio de cookies/headers e previne bloqueios de segurança do navegador.
    * Roteamento de Tráfego (firebase.json):
        * O arquivo de configuração declara a regra de rewrite que conecta os dois serviços:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "use-guide",
          "region": "us-east1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

    * Fluxo Operacional Passo a Passo:
        1. Requisição de Telas e Assets: Quando o usuário navega pelas rotas da aplicação (ex: /, /eventos, /passeios), o Firebase Hosting resolve o caminho estático ou entrega o index.html da CDN instantaneamente.
        2. Chamadas de API e Mutações (/api/*): Quando o Frontend dispara requisições HTTP para a API (ex: fetch('/api/payment/pix', ...) com o header Authorization: Bearer <token>), a CDN do Firebase Hosting identifica o padrão /api/**.
        3. Proxy Reverso Interno: Em vez de responder com o frontend, o Firebase Hosting encaminha a requisição de forma transparente através da rede interna do Google para o container do Cloud Run.
        4. Processamento e Resposta: O Cloud Run processa a lógica de negócio, autentica o usuário via Firebase Admin SDK, interage com o Firestore ou gateways externos e retorna a resposta HTTP. O Firebase Hosting repassa o resultado diretamente ao cliente sob o mesmo domínio.

---

## 8. Arquitetura CQRS / Separação Estrita de Leitura e Escrita (Frontend Reads vs Backend Writes)

### 8.1. FRONTEND: Leituras e Escutas em Tempo Real (Queries / Reads)

* FRONTEND: faz somente Leituras e Escutas em Tempo Real (Queries / Reads), direto do Firestore no Frontend via Client SDK (onSnapshot, getDocs), aproveitando a CDN global do Google, cache offline e zero latência de servidor intermediário.
* O Frontend nunca altera o banco de dados diretamente, sempre usa o backend para isso.

**Comportamento no Frontend (src/)**

No Frontend, mantemos o isolamento via Ports & Adapters:

* Autenticação: O src/domain/auth/ continua usando o Client SDK para login com Google, e-mail/senha e obtenção do token JWT (getIdToken()).
* Consultas e Tempo Real (Hooks): Listagem de estabelecimentos, eventos, condições do vento e notificações continuam usando onSnapshot / databaseAdapter.subscribeCollection(...) para que a tela atualize instantaneamente quando houver novidades.
* Ações de Escrita e Modificação: O Frontend nunca chama setDoc, addDoc, updateDoc ou deleteDoc.
* Quando o usuário clica em “Salvar Item”, “Excluir Item”, “Avaliar”, “Comprar Plano” ou “Atualizar Perfil”, o componente dispara um UseCase que envia um fetch('POST' | 'PUT' | 'DELETE', '/api/...') com o token no header Authorization: Bearer <token>.
* **Regra Central:** O Frontend nunca altera o banco de dados diretamente, sempre usa o backend para isso.

---

### 8.2. BACKEND: Escritas, Mutações e Regras de Negócio (Commands / Writes)

* BACKEND: Escritas, Mutações e Regras de Negócio (Commands / Writes): Passam obrigatoriamente pela API do Backend via Express (firebase-admin), onde passam por autenticação JWT, validação rigorosa com Zod, higienização DTO e transações seguras antes de salvar no Firestore.
* O Backend nunca confia no Frontend.

**Comportamento no Backend (server/)**

O Backend centraliza todo o fluxo transacional:

* Middleware de Autenticação (authMiddleware): Decodifica e valida a assinatura do token JWT do Firebase (admin.auth().verifyIdToken()). Injeta o usuário autenticado em req.user.
* Validação e DTOs (Zod): Higieniza o payload recebido e descarta campos maliciosos ou não autorizados.
* Camada de Negócio e Serviços (server/domain/*/services): Valida regras de negócio (ex: “esse usuário é o dono deste item?”, “o plano do parceiro está ativo?”).
* Persistência via Admin SDK (server/domain/*/adapters): Executa a mutação com adminDb.collection('items').doc(id).update(...) ou transações atômicas adminDb.runTransaction(...).
* **Regra Central:** O Backend nunca confia no Frontend.

---

## 9. Processo de Decisão e Soluções Alternativas (Consulta Obrigatória ao Usuário)

* **Regra Obrigatória:** Sempre que o agente se deparar com duas ou mais abordagens ou soluções válidas para atender a um pedido ou resolver um problema (com diferentes trade-offs técnicos, arquiteturais, de complexidade, segurança, custos ou experiência do usuário), o agente NÃO deve tomar a decisão sozinho ou assumir uma escolha sem consulta prévia.
* **Comportamento Esperado:**
    1. Parar a execução antes de iniciar a modificação ou criação de código.
    2. Apresentar de forma clara, sucinta e objetiva as alternativas identificadas.
    3. Destacar os prós, contras e trade-offs fundamentais de cada opção.
    4. Perguntar explicitamente ao usuário por qual solução ele prefere seguir.
    5. Aguardar a resposta e confirmação do usuário antes de prosseguir com a implementação.

---

## 10. Modularidade Atômica e Princípio da Responsabilidade Única (Anti-God Files)

Para evitar arquivos gigantes, componentes sobrecarregados e “God Hooks/God Components”, todo arquivo no Frontend e no Backend deve ter uma única razão para mudar. É estritamente proibido acumular múltiplas responsabilidades, visualizações distintas ou regras não correlatas no mesmo arquivo.

---

## 10.1. Regras de Ouro de Modularidade

1. **Componentes Visuais Atômicos (components/):**
    * Um componente de UI nunca deve renderizar um formulário, uma lista, um sumário de métricas e um seletor de filtros tudo junto no mesmo arquivo.
    * Cada parte visual distinta deve ser extraída para seu próprio componente independente.
    * O componente pai/container apenas orquestra a disposição desses blocos menores.
2. **Casos de Uso Granulares (usecases/ ou services/):**
    * Cada caso de uso deve residir em seu próprio arquivo dedicado (ex: createItemUseCase.ts, getItemsUseCase.ts).
    * É proibido criar arquivos únicos com dezenas de funções utilitárias misturadas sem coesão.
3. **Hooks Especializados (hooks/):**
    * Hooks do React devem gerenciar um escopo bem delimitado de estado. Se um hook começar a acumular muitas variáveis de estado não relacionadas ou gerenciar fluxos completamente diferentes, ele deve ser desmembrado em hooks menores e compostos.
4. **Limite Saudável de Linhas por Arquivo:**
    * Como referência de boas práticas: arquivos com mais de 150–200 linhas geralmente são um forte sintoma de responsabilidades misturadas e devem ser inspecionados para refatoração e extração de sub-componentes.

---

## 10.2. Exemplo Canônico de Referência: O Domínio <modulo ou serviço>

A estrutura de qualquer domínio deve seguir o padrão de modularidade atômica abaixo:

1. **Divisão Atômica de Componentes (src/domain/<modulo>/components/):**

Em vez de um único arquivo de 600 linhas que acumula toda a interface, cada elemento visual tem seu próprio arquivo focado:

* `ItemRatingWidget.tsx`: Responsável exclusivamente por renderizar o componente interativo de nota/classificação (hover, clique, acessibilidade).
* `ItemSummaryCard.tsx`: Responsável exclusivamente por exibir o resumo métrico e estatísticas consolidadas.
* `ItemListFilter.tsx`: Responsável exclusivamente pelos controles de ordenação, filtros e busca.
* `ItemFormModal.tsx`: Responsável exclusivamente pelo formulário de criação/edição de dados (integrado com React Hook Form + Zod).
* `ItemCard.tsx`: Responsável exclusivamente pela renderização de um único registro e suas ações individuais.
* `ItemList.tsx`: Responsável exclusivamente pela iteração da lista, paginação, scroll infinito e estados vazios (empty state) ou carregamento (skeletons).
* `ItemSectionContainer.tsx`: Atua apenas como o orquestrador declarativo, organizando a montagem e disposição dos subcomponentes acima.

2. **Divisão Granular de Casos de Uso (src/domain/<modulo>/application/usecases/):**

Cada intenção do usuário ou regra de negócio isolada é um arquivo dedicado, viabilizando testes unitários sem acoplamento a frameworks:

* `createItemUseCase.ts` (Criar um novo registro e disparar validações)
* `getItemsUseCase.ts` (Buscar registros paginados e com filtros)
* `getItemByIdUseCase.ts` (Buscar um registro específico por ID)
* `updateItemStatusUseCase.ts` (Atualizar o estado/status de um item)
* `subscribeToItemsUseCase.ts` (Escuta em tempo real de eventos ou atualizações)

3. **Utilitários Puros e Testáveis (src/domain/<modulo>/utils/):**

* `buildDeterministicId.ts`: Função pura para composição de chaves/IDs únicos.
* `formatItemMetadata.ts`: Função pura de higienização, cálculo ou formatação de dados sem efeitos colaterais.
