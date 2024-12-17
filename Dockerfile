# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies first, leveraging Docker cache
COPY package*.json ./
RUN yarn install

# Copy application source code
COPY . .

# Build the NestJS application
RUN yarn run build

# Stage 2: Production image
FROM node:22-alpine
WORKDIR /usr/src/app

# Switch to a non-root user for better security
USER node

# Copy only the necessary files from builder stage
COPY --from=builder /usr/src/app/package*.json ./
RUN yarn install --production

COPY --from=builder /usr/src/app/dist ./dist
# Adjust if necessary
# COPY --from=builder /usr/src/app/contracts ./contracts

# Optionally copy SSL certificates if USE_HTTPS is true
ARG USE_HTTPS
ENV USE_HTTPS=${USE_HTTPS}
RUN if [ "${USE_HTTPS}" = "true" ]; then \
    mkdir -p /home/node/certs && \
    cp -r path/to/your/certs/* /home/node/certs/; \
    fi

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "dist/main"]
