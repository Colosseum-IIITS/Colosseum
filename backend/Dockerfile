FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install Dockerize
ENV DOCKERIZE_VERSION v0.7.0
RUN apt-get update && apt-get install -y wget && \
    wget -O dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize.tar.gz && \
    rm dockerize.tar.gz && \
    apt-get autoremove -y wget && apt-get clean

# Copy app source
COPY . .

# Environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
