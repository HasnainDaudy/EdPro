# Multi-Stage Build for EdPro Production
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build client
COPY . .
RUN npm run build:client

# Production Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create persistent data volume directory
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "src/server/index.js"]
