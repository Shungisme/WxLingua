#!/bin/bash

# WxLingua Deployment Script
# Usage: ./deploy.sh [version] [environment]

set -e

VERSION=${1:-latest}
ENVIRONMENT=${2:-production}
COMPOSE_FILE="deployment/docker-compose.${ENVIRONMENT}.yml"

echo "🚀 WxLingua Deployment Script"
echo "================================"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo "================================"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Load environment variables
if [ -f "deployment/.env.$ENVIRONMENT" ]; then
    echo "📝 Loading environment variables..."
    source "deployment/.env.$ENVIRONMENT"
else
    echo "⚠️  Warning: .env.$ENVIRONMENT not found, using defaults"
fi

# Backup database
echo "💾 Creating database backup..."
./deployment/scripts/backup.sh

# Pull latest code
echo "📥 Pulling latest code..."
git fetch --all
git checkout $VERSION

# Build images
echo "🔨 Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f $COMPOSE_FILE run --rm backend npx prisma migrate deploy

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f $COMPOSE_FILE down

# Start new containers
echo "🚀 Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Health check
echo "🏥 Running health checks..."
./deployment/scripts/health-check.sh

echo "✅ Deployment completed successfully!"
echo "================================"
echo "Services status:"
docker-compose -f $COMPOSE_FILE ps
