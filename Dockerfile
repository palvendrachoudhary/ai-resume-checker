FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend and bundle the server
RUN npm run build

# Expose port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]

