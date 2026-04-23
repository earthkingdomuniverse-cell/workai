# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Clean devDependencies to reduce image size
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
