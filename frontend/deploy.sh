#!/bin/bash
# Deployment script for Colosseum Frontend

# Exit on any error
set -e

echo "Starting Colosseum frontend deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests if they exist
if [ "$1" != "--skip-tests" ] && grep -q "\"test\":" package.json; then
    echo "Running tests..."
    npm test
fi

# Build for production
echo "Building for production..."
npm run build

if [ "$1" == "--docker" ]; then
    # Build and run Docker container
    echo "Building Docker image..."
    docker build -t colosseum-frontend:latest .
    
    echo "Running Docker container..."
    docker run -d -p 3000:3000 --env-file .env --name colosseum-frontend colosseum-frontend:latest
    
    echo "Frontend container is running at http://localhost:3000"
else
    # Start the production server
    echo "Starting production server..."
    npm start
fi

echo "Deployment completed successfully!"
