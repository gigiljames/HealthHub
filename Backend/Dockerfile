# 1. BUILD STAGE

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2. RUNNER STAGE

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Create logs directory and assign permissions to the non-root 'node' user
RUN mkdir -p logs && chown -R node:node /app
# Switch to the non-root user for security
USER node
# Declares that the application listens on port 3000 inside the container. It does not make the port accessible from outside.
EXPOSE 3000
# Start the application
CMD ["node", "dist/app.js"]
