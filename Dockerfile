# Multi-stage Dockerfile for Next.js 15 (App Router) optimized for Cloud Run
# Based on official Next.js Docker example with Cloud Run optimizations

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
# NEXT_PUBLIC_* vars must be set at build time
ARG NEXT_PUBLIC_TYPESENSE_HOST
ARG NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_TYPESENSE_HOST=$NEXT_PUBLIC_TYPESENSE_HOST
ENV NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=$NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with Turbopack
RUN npm run build

# Stage 3: Runner (production image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000 (Cloud Run default)
EXPOSE 3000

# Set port environment variable for Cloud Run
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "server.js"]
