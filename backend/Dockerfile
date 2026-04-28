FROM node:18-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# Run migrations and start with tsx (no TypeScript compilation needed)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx src/server.ts"]
