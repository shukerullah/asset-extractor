#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the Docker image
echo "🏗️  Building Docker image..."
docker build -t asset-extractor:latest .

# Stop and remove existing container if it exists
echo "🔄 Stopping existing container..."
docker stop asset-extractor 2>/dev/null || true
docker rm asset-extractor 2>/dev/null || true

# Run the new container
echo "🏃 Starting new container..."
docker run -d \
  --name asset-extractor \
  -p 3000:3000 \
  --restart unless-stopped \
  asset-extractor:latest

# Wait a moment for the container to start
sleep 5

# Check if the container is running
if docker ps | grep -q asset-extractor; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at http://localhost:3000"
    echo "📊 Check container logs: docker logs asset-extractor"
    echo "🔧 Stop container: docker stop asset-extractor"
else
    echo "❌ Deployment failed. Check logs:"
    docker logs asset-extractor
    exit 1
fi