FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json ./
COPY Backend/package.json ./Backend/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --workspace=shared --prefix Backend

# Production container
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app /app
COPY Backend/ ./Backend/

EXPOSE 5000

CMD ["node", "Backend/server.js"]
