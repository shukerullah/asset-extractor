# Build stage
FROM node:18-alpine AS base

# Install Python and dependencies
FROM base AS deps
RUN apk add --no-cache python3 py3-pip
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Install Python dependencies
RUN pip3 install --no-cache-dir rembg onnxruntime

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production stage
FROM node:18-alpine AS runner
RUN apk add --no-cache python3 py3-pip
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install Python dependencies
RUN pip3 install --no-cache-dir rembg onnxruntime

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

# Create temp directory with proper permissions
RUN mkdir -p /app/temp && chown nextjs:nodejs /app/temp

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]