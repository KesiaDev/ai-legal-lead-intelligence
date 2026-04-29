FROM node:18-slim

WORKDIR /app

# OpenSSL required by Prisma on Debian/slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Build context = backend/ directory
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "echo '=== Running migrations ===' && npx prisma migrate deploy 2>&1 && echo '=== Starting server ===' && ./node_modules/.bin/tsx src/server.ts 2>&1"]
