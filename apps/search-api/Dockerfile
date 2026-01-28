# Stage 1: Build the application
FROM node:24 as builder

# Set the working directory
WORKDIR /app

# Copy root dependency files
COPY package.json yarn.lock ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY .yarn ./.yarn

# Install all dependencies (including devDependencies needed for the build)
RUN yarn install --immutable

# Copy the rest of the monorepo source code
COPY . .

# Build the 'search-api' application in production mode
RUN npx nx build search-api

# ---

# Stage 2: Create the final production image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy the bundled application code from the builder stage
COPY --from=builder /app/dist/apps/search-api .

# Expose the port the app runs on
EXPOSE 3003

# Environment variables
ENV NODE_ENV=production
ENV SEARCH_PORT=3003

# The command to start the service
CMD ["node", "main.js"]
