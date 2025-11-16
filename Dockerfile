# Stage 1: Build the TypeScript code
FROM node:18-alpine AS builder

# Set the working directory inside the container
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
# The 'build' script is defined in server/package.json
RUN cd server && npm run build

# Stage 2: Create the final, smaller runtime image
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only (from Stage 1)
COPY --from=builder /app/server/package.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled JavaScript output and other files needed at runtime
COPY --from=builder /app/server/dist ./server/dist
COPY ./server/data ./server/data
COPY ./server/src/database ./server/src/database
COPY ./server/src/scripts ./server/src/scripts
COPY ./server/tsconfig.json ./server/

# Set environment variable for Express port
ENV PORT=3001

# Expose the port
EXPOSE 3001

# The container entry point: runs the setup script, then starts the server
CMD ["sh", "-c", "node ./server/dist/scripts/setup.js && node ./server/dist/index.js"]