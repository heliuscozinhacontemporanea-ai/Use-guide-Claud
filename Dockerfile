# Imagem do servidor no Cloud Run (D23). O build (`npm run build`) roda antes, no GitHub Actions, e o
# mesmo `dist` vai para o Hosting; aqui entram só o `dist` e as dependências de produção.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY dist ./dist
USER node
# O mapa de código deixa a pilha de erro apontar a linha do código-fonte nos logs e alertas.
CMD ["node", "--enable-source-maps", "dist/server.cjs"]
