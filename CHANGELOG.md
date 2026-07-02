# Changelog

## v0.2.0-beta - Production Baseline & Release Beta

### Added

- Real Prisma persistence for the Node.js TypeScript API.
- SQLite default database with initial Prisma migration.
- PostgreSQL-compatible Prisma schema at `prisma/schema.postgresql.prisma`.
- Repository layer between services and Prisma Client.
- Unit, integration, and API smoke tests using Vitest.
- Coverage reporting with V8 coverage provider.
- Validation screenshots under `assets/validation/`.
- `KNOWN_LIMITATIONS.md` for transparent beta scope.
- Release notes under `releases/v0.2.0-beta.md`.

### Changed

- Node.js API no longer uses in-memory user storage.
- CI now runs npm ci, Prisma generate, Prisma migrate, build, lint, test, coverage, and npm audit.
- README now documents database architecture, Prisma, testing, validation, PostgreSQL support, and beta limitations.
- Dockerfile now generates Prisma Client and applies migrations on container startup.

### Security

- Passwords remain hashed with bcrypt.
- Password hashes are never returned from API responses.
- Production JWT secret fallback remains disabled.
- npm audit reports 0 high/critical vulnerabilities locally.

## 1.0.0 - Stabilization Baseline

- Added runnable Node.js TypeScript API foundation.
- Added Prisma schema and seed scaffold.
- Added Node smoke tests.
- Fixed Python report generator syntax errors.
- Added realistic CI pipeline.
- Added security policy, support guide, roadmap, setup script, Makefile, and `.env.example`.
