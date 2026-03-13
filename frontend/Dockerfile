# Build stage — node:20-slim provides glibc (required by @tailwindcss/oxide native binary)
# and ships with npm 10 which correctly installs optional platform-specific packages.
# node:18 + npm 9 has a known bug (github.com/npm/cli/issues/4828) silently skipping them.
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files (no package-lock.json — let npm resolve fresh linux-x64-gnu bindings)
COPY package.json ./

# Install deps — node:20-slim + npm 10 correctly resolves @tailwindcss/oxide-linux-x64-gnu
RUN npm install --os=linux --cpu=x64 --libc=glibc

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage — alpine is fine here; no native code runs in the final image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001

# Start Next.js
CMD ["node", "server.js"]
