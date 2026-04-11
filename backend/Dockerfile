FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies - using legacy-peer-deps for consistency
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Backend port
EXPOSE 5001

# Run development server with nodemon
CMD ["npm", "run", "dev"]
