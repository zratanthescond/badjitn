# syntax=docker/dockerfile:1

# Stage 1: Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json yarn.lock ./
COPY .npmrc* ./

# Install dependencies using frozen lockfile
RUN yarn install --frozen-lockfile --network-timeout 600000

# Stage 3: Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js public client bundles
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_FILE_SERVER_URL
ARG NEXT_PUBLIC_WEBHOOK_SECRET

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
    NEXT_PUBLIC_FILE_SERVER_URL=$NEXT_PUBLIC_FILE_SERVER_URL \
    NEXT_PUBLIC_WEBHOOK_SECRET=$NEXT_PUBLIC_WEBHOOK_SECRET \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN yarn build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Prepare public and upload directories with write permissions for nextjs user
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public

# Copy built assets and standalone Next.js server
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/messages ./messages
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set permissions for Next.js prerender cache
RUN mkdir -p .next && chown nextjs:nodejs .next

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]