# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy server.js explicitly (in case it's ignored)
COPY server.js ./server.js

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (express is needed for server.js)
RUN npm ci --only=production && npm install express

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Verificar se dist existe e tem conteúdo
RUN ls -la dist/ || echo "dist folder not found"
RUN ls -la dist/index.html || echo "index.html not found"

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
