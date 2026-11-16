# Imagem do servidor no Cloud Run (D23). O build (`npm run build`) roda antes, no GitHub Actions, e o
# mesmo `dist` vai para o Hosting; aqui entram só o `dist` e as dependências de produção.
FROM node:26-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
# Só as bibliotecas que o servidor carrega (B41): as do navegador já estão dentro do dist.
COPY dist/server.cjs ./dist/server.cjs
COPY scripts/ops/keepServerDependencies.mjs ./
RUN node keepServerDependencies.mjs && npm prune --omit=dev --no-audit --no-fund

FROM node:26-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY dist ./dist
USER node
# O mapa de código deixa a pilha de erro apontar a linha do código-fonte nos logs e alertas.
CMD ["node", "--enable-source-maps", "dist/server.cjs"]
