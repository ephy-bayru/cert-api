# ===========================
# Stage 1: Builder
# ===========================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies with a frozen lockfile for deterministic builds
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build the application
COPY . .
RUN yarn build

# Optionally, run production install at this stage (if you prefer copying node_modules later)
# RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline && yarn cache clean

# ===========================
# Stage 2: Production Image
# ===========================
FROM node:22-alpine

WORKDIR /usr/src/app

# Create a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json and yarn.lock for production install
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./

# Install only production dependencies as root, then adjust ownership
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline && \
    yarn cache clean && \
    chown -R appuser:appgroup /usr/src/app

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Switch to non-root user
USER appuser

# Set environment variables
ARG USE_HTTPS
ENV USE_HTTPS=${USE_HTTPS}
ENV NODE_ENV=production

# Handle SSL certificates if USE_HTTPS is enabled
RUN if [ "$USE_HTTPS" = "true" ]; then \
    mkdir -p /usr/src/app/certs && \
    cp /usr/src/app/dist/certs/* /usr/src/app/certs/; \
    fi

# Expose application port
EXPOSE 3000

# Add a health check to ensure the container is responding
# The `health` endpoint should return a 200 status if healthy.
# Adjust the endpoint as needed for your application.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Optionally, consider using tini or another init system for better signal handling:
# RUN apk add --no-cache tini
# ENTRYPOINT ["/sbin/tini", "--"]

# Final command to run your app
# To name the resulting image 'cert-api', run: 
# docker build -t cert-api .
CMD ["node", "dist/src/main"]
