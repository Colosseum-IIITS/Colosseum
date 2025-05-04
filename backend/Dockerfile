FROM node:18-alpine

WORKDIR /app

# Install dependencies required for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ gcc

# Copy package.json and package-lock.json
COPY package*.json ./

# Configure npm for higher network resilience and install dependencies
RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 5 \
    && npm install --no-fund --prefer-offline --network-timeout=300000

# Copy the rest of the backend code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "app.js"]
