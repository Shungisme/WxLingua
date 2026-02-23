# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:18-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000
EXPOSE 9229

# Run in development mode with hot reload
CMD ["npm", "run", "start:dev"]

# ============================================
# Builder Stage - Build for production
# ============================================
FROM base AS builder

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
	npx prisma generate && \
	npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
	adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
