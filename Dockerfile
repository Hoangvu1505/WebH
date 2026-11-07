# Base Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm --prefix server install
RUN npm --prefix client install

# Copy source code
COPY . .

# Build React client
RUN npm --prefix client run build

# Expose port (default 4000)
ENV PORT=4000
EXPOSE 4000

# Start production server
CMD ["node", "server/server.js"]

