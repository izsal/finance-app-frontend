# Build stage
FROM node:20-alpine as build-stage

# Install additional dependencies to fix rollup issue
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Remove existing node_modules and lock file to avoid platform issues
RUN rm -rf node_modules package-lock.json

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Force reinstall rollup to fix platform issue
RUN npm install --save-dev @rollup/rollup-linux-x64-musl

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy built files from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]