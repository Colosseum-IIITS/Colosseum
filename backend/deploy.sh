#!/bin/bash
# Deployment script for Colosseum Backend

# Exit on any error
set -e

echo "Starting Colosseum backend deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests (optional, can be disabled in production)
if [ "$1" != "--skip-tests" ]; then
    echo "Running tests..."
    npm test
fi

# Build for production if needed
echo "Building for production..."
# Add build steps here if needed

# Apply database migrations if needed
# echo "Applying database migrations..."
# Add migration command here if you have one

# Start application
echo "Starting the application..."
if [ "$NODE_ENV" = "production" ]; then
    # In production, use a process manager like PM2
    echo "Starting with PM2..."
    pm2 delete colosseum-backend || true
    pm2 start app.js --name colosseum-backend
else
    # For development or testing
    echo "Starting with Node..."
    node app.js
fi

echo "Deployment completed successfully!"
