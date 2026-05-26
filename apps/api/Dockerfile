# ─── Base ────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@9.14.2
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ─── Build ────────────────────────────────────────────
FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY turbo.json ./
RUN pnpm --filter @vedaai/api build

# ─── Production ───────────────────────────────────────
FROM node:20-alpine AS production
RUN npm install -g pnpm@9.14.2
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/shared/src ./packages/shared/src

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
