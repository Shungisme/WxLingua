#!/bin/bash

# WxLingua Health Check Script
# Usage: ./health-check.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="deployment/docker-compose.${ENVIRONMENT}.yml"

echo "🏥 WxLingua Health Check"
echo "================================"
echo "Environment: $ENVIRONMENT"
echo "================================"

# Load environment variables
if [ -f "deployment/.env.$ENVIRONMENT" ]; then
    source "deployment/.env.$ENVIRONMENT"
fi

# Check if services are running
echo "📊 Checking service status..."
docker-compose -f $COMPOSE_FILE ps

# Check backend health
echo ""
echo "🔍 Checking backend health..."
BACKEND_URL="http://localhost:${BACKEND_PORT:-3000}/health"
if curl -f -s $BACKEND_URL > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend health
echo ""
echo "🔍 Checking frontend health..."
FRONTEND_URL="http://localhost:${FRONTEND_PORT:-3001}"
if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check database connection
echo ""
echo "🔍 Checking database connection..."
CONTAINER_NAME="wxlingua_${ENVIRONMENT}_postgres"
if docker exec $CONTAINER_NAME pg_isready -U ${DB_USER:-postgres} > /dev/null; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check Redis connection
echo ""
echo "🔍 Checking Redis connection..."
CONTAINER_NAME="wxlingua_${ENVIRONMENT}_redis"
if docker exec $CONTAINER_NAME redis-cli ping > /dev/null; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
    exit 1
fi

echo ""
echo "================================"
echo "✅ All health checks passed!"
echo "================================"
