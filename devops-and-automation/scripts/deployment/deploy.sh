#!/bin/bash
# Deployment Script for Local Development

set -e

echo "🚀 Starting deployment..."

# Build Docker images
echo "📦 Building Docker images..."
docker-compose build

# Start services
echo "▶️ Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "📝 Running database migrations..."
docker-compose exec api npm run migrate

# Seed database
echo "🌱 Seeding database..."
docker-compose exec api python scripts/seeder.py

echo ""
echo "✅ Deployment complete!"
echo "📍 Services running at:"
echo "   - API: http://localhost:3000"
echo "   - Frontend: http://localhost"
echo "   - Nginx: http://localhost:8080"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "To stop: docker-compose down"
