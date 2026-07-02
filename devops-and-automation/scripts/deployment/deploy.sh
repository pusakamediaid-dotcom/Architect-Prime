#!/bin/bash

set -e

echo "=========================================="
echo "  Architect-Prime Deployment Script"
echo "=========================================="

ENV=${1:-staging}
REGION=${2:-ap-southeast-1}
DB_HOST=${3:-localhost}

echo "Environment: $ENV"
echo "Region: $REGION"
echo "DB Host: $DB_HOST"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    commands=("docker" "docker-compose" "git" "curl" "jq")
    
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed"
            exit 1
        fi
    done
    
    log_info "All prerequisites met"
}

# Backup database
backup_database() {
    log_info "Backing up database..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/tmp/architect-backup-$TIMESTAMP"
    mkdir -p $BACKUP_DIR
    
    case $DB_HOST in
        *postgres*|*5432*)
            pg_dump -h $DB_HOST -U postgres -d architect_prime > "$BACKUP_DIR/postgres.sql"
            log_info "PostgreSQL backup created"
            ;;
        *mysql*|*3306*)
            mysqldump -h $DB_HOST -u root -p architect_prime > "$BACKUP_DIR/mysql.sql"
            log_info "MySQL backup created"
            ;;
        *mongo*|*27017*)
            mongodump --host $DB_HOST --db architect_prime --out "$BACKUP_DIR/mongo"
            log_info "MongoDB backup created"
            ;;
    esac
    
    echo "$BACKUP_DIR"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    docker-compose -f docker-compose.yml build --parallel
    
    log_info "Docker images built successfully"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    case $ENV in
        production)
            log_warn "Deploying to PRODUCTION!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                log_error "Deployment cancelled"
                exit 1
            fi
            docker-compose -f docker-compose.yml up -d --force-recreate
            ;;
        staging)
            docker-compose -f docker-compose.yml up -d
            ;;
        local)
            docker-compose -f docker-compose.yml up -d
            ;;
    esac
    
    log_info "Services deployed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose exec -T api-gateway npm run migrate
    
    log_info "Migrations completed"
}

# Seed database
seed_database() {
    log_info "Seeding database..."
    
    if [ "$ENV" != "production" ]; then
        docker-compose exec -T api-gateway npm run seed
        log_info "Database seeded"
    else
        log_warn "Skipping seed in production"
    fi
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    SERVICES=("api-gateway:8080" "user-service:3001" "order-service:3002" "payment-service:3003")
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -ra parts <<< "$service"
        name="${parts[0]}"
        port="${parts[1]}"
        
        for i in {1..10}; do
            if curl -f "http://localhost:$port/health" &> /dev/null; then
                log_info "$name is healthy"
                break
            fi
            
            if [ $i -eq 10 ]; then
                log_error "$name health check failed"
            fi
            
            sleep 2
        done
    done
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    
    docker-compose -f docker-compose.yml down
    
    BACKUP_DIR=$(ls -td /tmp/architect-backup-* | head -1)
    if [ -d "$BACKUP_DIR" ]; then
        log_info "Restoring from backup: $BACKUP_DIR"
        
        case $DB_HOST in
            *postgres*)
                psql -h $DB_HOST -U postgres -d architect_prime < "$BACKUP_DIR/postgres.sql"
                ;;
            *mysql*)
                mysql -h $DB_HOST -u root -p architect_prime < "$BACKUP_DIR/mysql.sql"
                ;;
        esac
    fi
    
    log_info "Rollback completed"
}

# Main execution
main() {
    check_prerequisites
    
    BACKUP_PATH=""
    
    if [ "$ENV" == "production" ]; then
        BACKUP_PATH=$(backup_database)
    fi
    
    build_images
    
    deploy_services
    
    run_migrations
    
    seed_database
    
    health_check
    
    log_info "=========================================="
    log_info "  Deployment completed successfully!"
    log_info "=========================================="
    
    if [ -n "$BACKUP_PATH" ]; then
        log_info "Backup stored at: $BACKUP_PATH"
    fi
}

# Handle script arguments
case "${1:-}" in
    rollback)
        rollback
        ;;
    backup)
        backup_database
        ;;
    health)
        health_check
        ;;
    *)
        main
        ;;
esac