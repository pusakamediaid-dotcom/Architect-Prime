# Installation Guide

## Prerequisites

- Git
- Node.js 20+
- npm 10+
- Python 3.11+
- Docker 24+ for Docker validation/demo

## Primary Runnable Demo

```bash
git clone https://github.com/pusakamediaid-dotcom/Architect-Prime.git
cd Architect-Prime
cp .env.example .env
bash setup.sh
cd multi-language-modules/nodejs-typescript
npm run dev
```

Open:

- <http://localhost:3000/health>
- <http://localhost:3000/docs>

## Validation

```bash
make build
make test
```

## Docker Demo Config

```bash
docker compose -f devops-and-automation/docker-compose/docker-compose.demo.yml config
```

## Notes

The Node.js TypeScript API is the primary runnable baseline. Other modules are scaffold/previews unless their module README states otherwise.
