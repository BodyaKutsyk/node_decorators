FROM node:24 AS base
WORKDIR /app
COPY package*.json ./
RUN npm i

FROM base AS builder
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node --from=base ./app/package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node --from=builder ./app/dist ./dist
CMD ["node", "dist/src/index.js"]