FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/shared-types/tsconfig.json ./packages/shared-types/

RUN npm install

COPY packages/shared-types/ ./packages/shared-types/
COPY apps/api/ ./apps/api/

RUN npm run build --workspace=@yaharika/shared-types
RUN npm run build --workspace=@yaharika/api

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "apps/api/dist/server.js"]
