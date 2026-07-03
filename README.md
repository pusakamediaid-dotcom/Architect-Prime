# 🏗️ Architect-Prime

> Multi-architecture academic and professional boilerplate ecosystem for Engineering, IT, and Data Science projects.

**Release:** `v0.2.0-beta`<br>
**Primary production baseline:** Node.js TypeScript API + Prisma + SQLite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/pusakamediaid-dotcom/Architect-Prime/ci.yml?label=CI)](https://github.com/pusakamediaid-dotcom/Architect-Prime/actions)

<p align="center">
  <img src="assets/academic-workflow-realistic.png" alt="Architect-Prime academic software development workflow" width="100%">
</p>



## Pusaka Student Hub

Website bonus ringan untuk mahasiswa dan pelajar. Versi live static-first berjalan di Vercel dan dirancang untuk pengguna non-teknis, terutama pengguna HP Android.

Live site:

```text
https://architect-prime-gamma.vercel.app/
```

### Fitur

- Tugas
- Jadwal
- Nilai
- Checklist
- Target
- Catatan
- Template akademik
- Export/import data lokal

### Cara Pakai

Buka website Vercel, lalu mulai isi data. Tidak perlu akun. Data MVP tersimpan di browser pengguna menggunakan `localStorage`, bukan di server.

### Untuk Pembeli Ebook Pusaka Media ID

Pusaka Student Hub dapat diposisikan sebagai bonus praktis untuk membantu pembaca mengatur tugas, jadwal belajar, target semester, progres akademik, dan template pekerjaan kuliah.

Dokumentasi pengguna awam tersedia di [`docs/user-guide/`](docs/user-guide/).


---

## Overview

Architect-Prime is a structured repository for learning, building, and explaining modern software architecture. It preserves the original large vision: multiple architectures, multiple languages, DevOps automation, documentation utilities, academic templates, and cloud/serverless references.

Version `v0.2.0-beta` focuses on making the **Node.js TypeScript API** a real database-backed beta baseline. Other modules remain available as preview/scaffold references and are documented transparently.

---

## Module Status

| Area | Module | Status | Validation Command |
|---|---|---|---|
| Primary API | `multi-language-modules/nodejs-typescript` | Beta baseline | `npm ci && npm run prisma:migrate && npm run build && npm test` |
| Data Science | `multi-language-modules/python-data-science` | Preview | `python -m compileall -q ...` |
| Go Service | `multi-language-modules/go-high-performance` | Preview | `go test ./...` |
| PHP Modern | `multi-language-modules/php-modern` | Laravel-style scaffold | `composer validate` |
| Microservices | `core-architectures/microservices-clean` | Advanced scaffold | Compose profile pending full Dockerfiles |
| Serverless AWS | `core-architectures/serverless-cloud/aws-lambda` | Scaffold | `serverless package` |
| Firebase | `core-architectures/serverless-cloud/firebase-functions` | Scaffold | `npm run build` inside `functions` |
| DevOps | `devops-and-automation/docker-compose/docker-compose.demo.yml` | Config baseline | `docker compose -f ... config` |

---

## Features

- Real Node.js TypeScript API baseline using Express, Prisma, SQLite, JWT, bcrypt, Zod validation, Helmet, and Swagger UI.
- Repository pattern that separates database access from services and controllers.
- Prisma migration and seed workflow.
- Integration, unit, and API smoke tests with coverage reporting.
- SQLite default for zero-config local development.
- PostgreSQL-compatible schema for production-oriented deployments.
- Python academic utilities and data-science pipeline templates.
- Go, PHP, AWS Lambda, Firebase, and microservices scaffolds for future expansion.
- CI pipeline for Python compile checks, Node build/test/audit/coverage, and Docker Compose config validation.

<p align="center">
  <img src="assets/repository-modules-realistic.png" alt="Architect-Prime modular repository organization" width="100%">
</p>

---

## Database Architecture

The primary Node.js module now uses real persistence through Prisma.

```text
Controller → Service → Repository → Prisma Client → SQLite/PostgreSQL
```

### SQLite Default

SQLite is the default database because it works without external services:

```env
DATABASE_URL=file:./dev.db
```

Run migrations:

```bash
cd multi-language-modules/nodejs-typescript
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### PostgreSQL Support

A PostgreSQL-compatible Prisma schema is included:

```text
multi-language-modules/nodejs-typescript/prisma/schema.postgresql.prisma
```

Example production-oriented setup:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/architect_prime?schema=public"
cd multi-language-modules/nodejs-typescript
npx prisma generate --schema prisma/schema.postgresql.prisma
npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
```

> Note: Prisma selects the database provider from the schema file. SQLite remains default; PostgreSQL uses the provided PostgreSQL schema.

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/pusakamediaid-dotcom/Architect-Prime.git
cd Architect-Prime
```

### 2. Setup

```bash
cp .env.example .env
bash setup.sh
```

### 3. Run Primary Node.js API

```bash
cd multi-language-modules/nodejs-typescript
npm run dev
```

Open:

- Health check: <http://localhost:3000/health>
- Swagger UI: <http://localhost:3000/docs>

### 4. Run Validation

```bash
make build
make test
```

<p align="center">
  <img src="assets/devops-demo-realistic.png" alt="Architect-Prime local DevOps demo setup" width="100%">
</p>

---

## Testing & Coverage

The Node.js module includes:

- Unit tests.
- Integration tests against a separate SQLite test database.
- API smoke tests.
- Coverage report using Vitest + V8.

Run:

```bash
cd multi-language-modules/nodejs-typescript
npm test
```

Current local validation target:

```text
11 tests passing
90%+ line coverage
0 high/critical npm audit findings
```

---

## Validation Screenshots

The following validation artifacts were generated from local terminal runs during the `v0.2.0-beta` stabilization.

| Validation | Screenshot |
|---|---|
| npm ci | ![npm ci validation](assets/validation/npm-ci.png) |
| Prisma generate + migrate | ![Prisma validation](assets/validation/prisma-migrate.png) |
| TypeScript build | ![Build validation](assets/validation/npm-build.png) |
| Test + coverage | ![Test coverage validation](assets/validation/npm-test-coverage.png) |
| npm audit | ![npm audit validation](assets/validation/npm-audit.png) |
| GitHub Actions | ![GitHub Actions validation](assets/validation/github-actions.png) |

---

## Architecture

```text
Architect-Prime/
├── .github/workflows/                 # CI and security automation
├── academic-utilities/                # LaTeX, Markdown, chart/report utilities
├── core-architectures/                # MVC, microservices, serverless references
├── devops-and-automation/             # Docker Compose, Kubernetes, scripts
├── documentation/                     # API, ERD, installation docs
├── multi-language-modules/            # Node.js, Python, Go, PHP modules
├── releases/                          # Release notes
├── .env.example                       # Safe local configuration template
├── Makefile                           # Developer commands
├── setup.sh                           # Bootstrap script
└── README.md
```

---

## Examples

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Password123"}'
```

### List Users

```bash
curl http://localhost:3000/api/users
```

---

## Known Limitations

See [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md).

Short version:

- Node.js TypeScript is the current beta baseline.
- Go, PHP, Firebase, AWS Serverless, and Microservices modules are not yet fully production-ready.
- PostgreSQL support uses a dedicated Prisma PostgreSQL schema.
- Full production deployment and performance benchmarks are still pending.

---

## Roadmap

See [`ROADMAP.md`](ROADMAP.md).

---

## Troubleshooting

### `npm ci` fails

Delete `node_modules` in the Node module and retry:

```bash
cd multi-language-modules/nodejs-typescript
rm -rf node_modules
npm ci
```

### SQLite migration fails

```bash
cd multi-language-modules/nodejs-typescript
rm -f prisma/dev.db prisma/test.db
DATABASE_URL=file:./dev.db npm run prisma:migrate
```

### Port 3000 already used

```bash
PORT=3001 npm run dev
```

### Production JWT error

Set a strong secret:

```bash
export JWT_SECRET="replace-with-a-long-random-secret"
```

---

## FAQ

### Is every module production-ready?

No. The primary Node.js module is the current beta baseline. Other modules are preserved and improved as scaffolds/previews for learning and expansion.

### Does the API use a real database?

Yes. The Node.js API uses Prisma with SQLite by default and a separate test database during tests.

### Can I use PostgreSQL?

Yes, use `prisma/schema.postgresql.prisma` and a PostgreSQL `DATABASE_URL`.

### Can this be used commercially?

Yes as a starting foundation, but review [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md), configure production secrets, and complete deployment hardening before production use.

<p align="center">
  <img src="assets/academic-documentation-realistic.png" alt="Architect-Prime academic documentation toolkit" width="100%">
</p>

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SUPPORT.md`](SUPPORT.md).

---

## Security

See [`SECURITY.md`](SECURITY.md).

---

## License

MIT License. See [`LICENSE`](LICENSE).
