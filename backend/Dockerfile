FROM node:18-slim

WORKDIR /app

# OpenSSL required by Prisma on Debian/slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Build context = backend/ (set Root Directory to "backend" in Railway service settings)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]
