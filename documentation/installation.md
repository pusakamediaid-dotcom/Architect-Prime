# Installation Guide

## Prerequisites

- Git
- Node.js 20+
- npm 10+
- Python 3.11+
- Docker 24+ for Docker validation/demo

## Primary Runnable Demo: Node.js + Prisma + SQLite

```bash
git clone https://github.com/pusakamediaid-dotcom/Architect-Prime.git
cd Architect-Prime
cp .env.example .env
bash setup.sh
```

Run the API:

```bash
cd multi-language-modules/nodejs-typescript
npm run dev
```

Open:

- <http://localhost:3000/health>
- <http://localhost:3000/docs>

## Manual Database Setup

```bash
cd multi-language-modules/nodejs-typescript
export DATABASE_URL="file:./dev.db"
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Testing

Tests use a separate SQLite database so the development database is not modified.

```bash
cd multi-language-modules/nodejs-typescript
npm test
```

## PostgreSQL

SQLite is the default. PostgreSQL support is available through the PostgreSQL Prisma schema:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/architect_prime?schema=public"
cd multi-language-modules/nodejs-typescript
npx prisma generate --schema prisma/schema.postgresql.prisma
npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
```

## Docker Demo Config

```bash
docker compose -f devops-and-automation/docker-compose/docker-compose.demo.yml config
```

## Notes

The Node.js TypeScript API is the `v0.2.0-beta` production baseline. Other modules are scaffold/previews unless their module README states otherwise.
