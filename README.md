# Use Guide

## 1. Visão Geral
O **Use Guide** é uma solução completa e robusta desenvolvida em arquitetura full-stack (React + Express) que fornece um guia turístico e comercial inteligente, integrando dados em tempo real, pagamentos transparentes, e previsões meteorológicas. O projeto utiliza o **Google AI Studio** e é projetado para operar com alta confiabilidade e segurança, empregando conceitos modernos de engenharia de software como a Arquitetura Hexagonal (Ports & Adapters) e Inversão de Dependência (DIP).

---

## 2. Arquitetura
O sistema é estruturado seguindo rigorosamente os padrões de **Ports & Adapters (Hexagonal Architecture)** e o **Princípio de Inversão de Dependência (DIP)**. 

### Princípios de Isolamento
1. **Core Isolado (Lógica de Negócio):** Componentes de interface do usuário, casos de uso, controladores de rotas e serviços centrais são totalmente desacoplados de qualquer SDK de terceiros (ex: Firebase, Stripe).
2. **Ports (Contratos/Interfaces):** Definições puramente TypeScript contendo tipos de dados de domínio neutros. Nenhuma dependência externa vaza através dos contratos das portas.
3. **Adapters (Implementações de Infraestrutura):** Arquivos concretos que implementam as portas e se acoplam aos SDKs externos. A substituição de qualquer infraestrutura (ex: trocar Firebase por PostgreSQL/Cloud SQL) requer apenas a criação de um novo Adapter, mantendo a lógica de negócios inalterada.
4. **Composição via Factories:** As instâncias de serviços recebem os adaptadores ativos na inicialização usando padrões de fábrica estáticos localizados nas pastas `factory.ts`.

---

## 3. Módulos do Sistema

### Backend (`server/domain/`)
- **Payment:** Stripe (PaymentIntents, Stripe Connect Express, webhooks).
- **ClimaWind:** Roteamento e proxies climatológicos para obter dados em tempo real com segurança sem expor chaves sensíveis ao cliente.
- **Notifications:** Canal de comunicação interna, alertas e painel de controle.

### Frontend (`src/domain/`)
- **Admin:** Painel administrativo para gestão e controle operacional do guia.
- **Auth:** Mecanismos de sessão e autenticação de usuários baseados em interfaces limpas.
- **ClimaWind:** Visualização interativa das condições meteorológicas locais.
- **Database:** Camada neutra de persistência local e remota.
- **Guide:** Módulo central do guia comercial e turístico (pesquisa, exibição e detalhes).
- **Media:** Upload e manipulação de arquivos estáticos.
- **Notifications:** Central de notificações em tempo real.
- **Partners:** Gestão de anunciantes e parceiros cadastrados.
- **Payment:** Stripe Payment Element e Connect embedded components.

---

## 4. Estrutura de Diretórios
```
.
├── .env.example                 # Exemplo de configuração de variáveis de ambiente
├── tsconfig.json                # Configuração TypeScript de alto rigor de tipagem
├── server.ts                    # Ponto de entrada do servidor Express full-stack
├── server/                      # Infraestrutura e domínios do Backend
│   ├── domain/                  # Lógica de negócio e contratos de rotas (Hexagonal)
│   │   ├── climawind/
│   │   ├── notifications/
│   │   └── payment/
│   └── infrastructure/          # Adaptadores e ferramentas compartilhadas
├── src/                         # Código fonte do Frontend (React + Vite)
│   ├── app/                     # Provedores e inicialização global do app
│   ├── domain/                  # Módulos e subdomínios do Frontend (Hexagonal)
│   │   ├── admin/ | auth/ | climawind/ | database/ | guide/ | ...
│   ├── shared/                  # Utilitários, constantes e configurações comuns
│   ├── ui/                      # Componentes gráficos de UI polidos e reutilizáveis
│   └── main.tsx                 # Entrada principal de renderização React
└── dist/                        # Arquivos estáticos e servidor compilados para produção
```

---

## 5. Variáveis de Ambiente
As configurações do sistema são mantidas de forma segura. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Google Gemini API
GEMINI_API_KEY="seu_gemini_api_key"

# Google Maps Platform Keys
GOOGLE_MAPS_PLATFORM_KEY="chave_de_servico_backend"
VITE_GOOGLE_MAPS_API_KEY="chave_publica_frontend"

# URL da Aplicação
APP_URL="http://localhost:3000"

# Stripe API Config
STRIPE_SECRET_KEY="sua_chave_secreta_stripe"
STRIPE_WEBHOOK_SECRET="seu_webhook_secret_stripe"
VITE_STRIPE_PUBLISHABLE_KEY="sua_chave_publicavel_stripe"
USE_GUIDE_PLATFORM_FEE_PERCENT="10"

```

---

## 6. Execução Local
Para iniciar o projeto em seu ambiente local de desenvolvimento, certifique-se de ter o Node.js (versão 22+) instalado.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento full-stack:
   ```bash
   npm run dev
   ```
   *Nota: O servidor roda na porta `3000`, que é a única porta exposta externamente e mapeada pelo proxy reverso do Google AI Studio.*

---

## 7. Build
Para compilar o projeto para produção:
```bash
npm run build
```
O processo de build consiste de duas etapas coordenadas:
1. **Frontend SPA:** Compilado via Vite, gerando os ativos otimizados em `dist/`.
2. **Backend Server:** O arquivo `server.ts` é empacotado por meio do `esbuild` em um único arquivo CommonJS autocontido (`dist/server.cjs`) resolvendo as dependências internas para inicialização ultrarrápida no ambiente de container do Cloud Run.

---

## 8. Deploy
A aplicação foi projetada para ser implantada em containers Docker no **Google Cloud Run**.
- O script `start` em `package.json` inicia o servidor otimizado usando `node dist/server.cjs`.
- O servidor Express serve os arquivos estáticos do frontend localizados em `dist/` de forma nativa quando em `production`.

---

## 9. Integração Firebase (Firestore & Auth)
O Use Guide utiliza o ecossistema do **Firebase** para persistência de dados e autenticação de usuários.
- **Modelagem de Dados:** O arquivo `firebase-blueprint.json` documenta de forma agnóstica o esquema das coleções do Firestore (como `partners`, `notifications`, `users` e `guides`).
- **Segurança de Dados:** O arquivo `firestore.rules` provê um controle rígido baseado em papéis e identidades (ABAC), garantindo que escritas sejam devidamente validadas por esquemas estritos, prevenindo adulterações de identidade e vazamento de informações privadas (PII).
- **Tratamento de Erros:** Todas as operações que geram erros de permissão insuficiente são envelopadas no helper `handleFirestoreError`, que padroniza o erro em formato JSON estruturado, facilitando diagnósticos rápidos no painel do AI Studio.

---

## 10. Integração Stripe
A integração do sistema com o **Stripe** opera no modelo de marketplace com **Stripe Connect Express** e checkout via **Payment Element**:
- **Port de Pagamento:** Define operações neutras de transações (`PaymentIntents`), sessões de onboarding (`Stripe Connect Express`) e reembolsos sem vazar dependências do SDK do Stripe.
- **Adapter de Pagamento:** Localizado isoladamente na camada de infraestrutura (`server/domain/payment/adapters/` no backend e `src/domain/payment/adapters/` para **Stripe Payment Element e Connect embedded components** no frontend), inicializando as chaves do `.env` de maneira preguiçosa (Lazy Loading).
- **Webhook Seguro:** Rota dedicada no Express (`/api/payment/webhook/stripe`) validada com `STRIPE_WEBHOOK_SECRET` para processar eventos de pagamento, repasses e atualizações de contas conectadas de forma idempotente.

---

## 11. Integração Google Maps
Visualização espacial e interativa de pontos de interesse no guia comercial:
- **Frontend Maps:** Utiliza o `@vis.gl/react-google-maps` de maneira declarativa, protegendo chaves de acesso com restrições por origem HTTP.
- **Backend APIs:** Utiliza chaves de plataforma internas para resolver geolocalização e buscas textuais de endereços de anunciantes de forma otimizada.

---

## 12. Convenções do Projeto

### Práticas de UI/UX
- **Visual Dark Estrito:** O sistema possui identidade visual única voltada ao design elegante em Glassmorphism escuro com realces em cor Teal (`#2dd4bf`).
- **Contraste de Texto:** Toda tipografia visível possui opacidade mínima de `/50` sobre o fundo escuro (`text-white/50` a `text-white/90`) para conformidade estrita com as diretrizes de acessibilidade (WCAG).
- **Z-Index Unificado:** Utiliza a escala fixa definida na constante global `Z_INDEX` localizada no compartilhamento de constantes, evitando colisão visual entre modais, toasts e menus suspensos.
- **Áreas de Toque:** Todo componente interativo possui uma área de toque ativa de no mínimo `44x44px` para excelente usabilidade em dispositivos móveis sob luz solar forte.

### Diretrizes de Código Limpo
- **Autoexplicativo:** O código prioriza funções e variáveis descritivas ao invés de comentários óbvios.
- **Comentários de Contexto:** Comente sempre o *porquê* de uma decisão arquitetural ou técnica complexa, nunca o *o quê* o código realiza.
- **JSDoc Enxuto:** Utilizado exclusivamente para documentar assinaturas de contratos de Ports ou interfaces de Adapters.
- **Tipagem Estrita:** Uso obrigatório de `unknown`, tipos genéricos ou interfaces ao invés de `any` explícito.
