FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY tsconfig.json ./
COPY apps/web/tsconfig.json ./apps/web/
COPY packages/shared-types/tsconfig.json ./packages/shared-types/

RUN npm install

COPY packages/shared-types/ ./packages/shared-types/
COPY apps/web/ ./apps/web/

RUN npm run build --workspace=@yaharika/shared-types
RUN npm run build --workspace=@yaharika/web

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npx", "next", "start", "apps/web"]
