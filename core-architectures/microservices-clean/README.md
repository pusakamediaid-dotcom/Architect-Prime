# Microservices Clean Architecture (DDD)

Domain-Driven Design microservices architecture with API Gateway.

## Architecture

```
microservices-clean/
├── api-gateway/           # Central API Gateway
├── services/
│   ├── user-service/      # User management microservice
│   ├── order-service/     # Order processing microservice
│   ├── payment-service/   # Payment processing microservice
│   └── notification-service/
├── shared/                # Shared libraries
├── infrastructure/        # Docker, K8s configs
└── docs/
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Request routing, auth |
| User Service | 3001 | User CRUD operations |
| Order Service | 3002 | Order management |
| Payment Service | 3003 | Payment processing |
| Notification Service | 3004 | Email, SMS, Push |

## Quick Start

```bash
# Start all services
docker-compose up -d

# Or run individually
cd services/user-service && npm run dev
```

## Domain Structure

Each service follows DDD:
- `domain/` - Entities, Value Objects, Aggregates
- `application/` - Use Cases, DTOs
- `infrastructure/` - Repositories, External Services
- `presentation/` - Controllers, Routes

## Communication

- Synchronous: REST/gRPC via API Gateway
- Asynchronous: Message Queue (RabbitMQ/Kafka)
