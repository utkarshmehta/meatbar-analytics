# Stage 1: Build the TypeScript code
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (for caching npm install)
COPY ./server/package*.json ./server/

# Install dependencies (only in the server directory)
RUN cd server && npm install

# Copy source code and config files
COPY ./server/src ./server/src
COPY ./server/tsconfig.json ./server/
COPY ./server/jest.config.js ./server/

# Compile TypeScript into JavaScript
RUN cd server && npm run build

# Stage 2: Create the final, smaller runtime image
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only (from Stage 1)
COPY --from=builder /app/server/package.json ./server/
RUN cd server && npm install --omit=dev


# Copy compiled JavaScript output
COPY --from=builder /app/server/dist ./server/dist

# Copy runtime assets
COPY ./server/data ./server/data
COPY ./server/swagger.yaml ./server/swagger.yaml


# Set environment variable for Express port
ENV PORT=3001

# Expose the port
EXPOSE 3001

# The container entry point: runs the setup script, then starts the server
CMD ["sh", "-c", "node ./server/dist/scripts/setup.js && node ./server/dist/index.js"]