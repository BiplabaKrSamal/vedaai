FROM node:20-alpine AS base
RUN npm install -g pnpm@9.14.2
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
COPY turbo.json ./
ARG NEXT_PUBLIC_API_URL=https://vedaai-api.onrender.com
ARG NEXT_PUBLIC_WS_URL=wss://vedaai-api.onrender.com/ws
ARG ANTHROPIC_API_KEY=demo
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
RUN pnpm --filter @vedaai/web build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install -g pnpm@9.14.2 && pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
ENV NODE_ENV=production
ENV PORT=10000
WORKDIR /app/apps/web
EXPOSE 10000
CMD ["node_modules/.bin/next", "start"]
