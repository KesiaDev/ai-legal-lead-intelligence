FROM node:18-slim

WORKDIR /app

# OpenSSL required by Prisma on Debian/slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Build context = repo root (Railway default)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci

COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]
