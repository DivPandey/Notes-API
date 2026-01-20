# Multi-stage build for production optimization
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm ci --only=production && npm cache clean --force
COPY . .

# Create logs directory with proper permissions for node user
RUN mkdir -p logs && chown -R node:node /app

EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
