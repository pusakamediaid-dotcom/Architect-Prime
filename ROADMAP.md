# Roadmap

## v0.2.0-beta — Production Baseline

- [x] Replace in-memory Node.js storage with Prisma persistence.
- [x] Add SQLite as default local database.
- [x] Add initial Prisma migration and seed workflow.
- [x] Add PostgreSQL-compatible Prisma schema.
- [x] Add repository layer for database abstraction.
- [x] Add integration tests for register, login, create, get, list, update, delete, and search user flows.
- [x] Add coverage reporting above 80% line coverage.
- [x] Update CI to run Prisma generate/migrate/build/lint/test/audit.
- [x] Add Known Limitations page.

## v0.3.0 — API Hardening

- [ ] Add refresh-token table and token rotation.
- [ ] Add role-based authorization policy tests.
- [ ] Add full OpenAPI schemas and reusable components.
- [ ] Add Postman collection and Newman CI run.
- [ ] Add database transaction tests.

## v0.4.0 — Deployment Baseline

- [ ] Add PostgreSQL Docker Compose profile for Node API.
- [ ] Add production-ready Kubernetes overlay.
- [ ] Add Docker image build validation in CI.
- [ ] Add release artifact packaging.

## v0.5.0 — Multi-Module Stabilization

- [ ] Complete Go service test suite.
- [ ] Convert PHP scaffold into a complete Laravel app shell.
- [ ] Add Python dataset examples and ML walkthrough.
- [ ] Validate AWS Serverless package in CI.
- [ ] Validate Firebase functions build in CI.

## v1.0.0 — General Availability

- [ ] End-to-end microservices runtime profile.
- [ ] Performance benchmark report.
- [ ] Security threat model.
- [ ] Production deployment guide.
- [ ] Full documentation site.
